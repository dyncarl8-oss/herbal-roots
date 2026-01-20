import { Request, Response, NextFunction } from 'express';
import { getWhopClient, getWhopCompanyId } from '../whop';
import { upsertUser, User } from '../models/user';

// Extend Express Request type to include user
declare global {
    namespace Express {
        interface Request {
            user?: User;
            whopUserId?: string;
        }
    }
}

export interface WhopUserProfile {
    id: string;
    username: string;
    name: string | null;
    bio: string | null;
    profile_picture?: {
        url: string;
    } | null;
}

/**
 * Authentication middleware that verifies Whop user token
 * and syncs user data to MongoDB
 */
export async function whopAuthMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const userToken = req.headers['x-whop-user-token'] as string | undefined;

        if (!userToken) {
            console.log('[Auth] No x-whop-user-token header present');
            res.status(401).json({ error: 'Authentication required - no Whop user token' });
            return;
        }

        const whopClient = getWhopClient();

        // Verify the user token - extracts userId from the token
        // The SDK's verifyUserToken expects headers object
        let userId: string;
        try {
            // Create a headers-like object for the SDK
            const headersObj = {
                get: (name: string) => req.headers[name.toLowerCase()] as string | undefined
            };
            const verification = await (whopClient as any).verifyUserToken(headersObj);
            userId = verification.userId;
        } catch (verifyError) {
            console.error('[Auth] Token verification failed:', verifyError);
            res.status(401).json({ error: 'Invalid Whop user token' });
            return;
        }

        // Fetch full user profile from Whop API
        let userProfile: WhopUserProfile;
        try {
            userProfile = await whopClient.users.retrieve(userId) as WhopUserProfile;
        } catch (profileError) {
            console.error('[Auth] Failed to retrieve user profile:', profileError);
            res.status(500).json({ error: 'Failed to retrieve user profile' });
            return;
        }

        // Check access level if company ID is configured
        let accessLevel: 'admin' | 'customer' | 'no_access' = 'customer';
        const companyId = getWhopCompanyId();
        if (companyId) {
            try {
                const accessResult = await whopClient.users.checkAccess(
                    companyId,
                    { id: userId }
                );
                accessLevel = accessResult.access_level as 'admin' | 'customer' | 'no_access';
            } catch (accessError) {
                console.warn('[Auth] Access check failed, defaulting to customer:', accessError);
            }
        }

        // Upsert user to MongoDB
        const user = await upsertUser({
            whopUserId: userProfile.id,
            username: userProfile.username,
            name: userProfile.name || userProfile.username,
            profilePicture: userProfile.profile_picture?.url,
            bio: userProfile.bio || undefined,
            accessLevel,
        });

        // Attach user to request
        req.user = user;
        req.whopUserId = userId;

        console.log(`[Auth] User authenticated: ${user.name} (${user.whopUserId}) - ${accessLevel}`);
        next();
    } catch (error) {
        console.error('[Auth] Unexpected error:', error);
        res.status(500).json({ error: 'Authentication failed' });
    }
}

/**
 * Optional middleware - allows unauthenticated requests but attaches user if token present
 */
export async function optionalWhopAuthMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    const userToken = req.headers['x-whop-user-token'] as string | undefined;

    if (!userToken) {
        // No token, but that's okay for optional auth
        next();
        return;
    }

    // If token present, try to authenticate
    try {
        await whopAuthMiddleware(req, res, () => {
            next();
        });
    } catch {
        // Token present but invalid - still allow request
        next();
    }
}
