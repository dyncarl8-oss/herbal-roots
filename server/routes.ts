import type { Express, Request, Response } from "express";
import { type Server } from "http";
import { connectToDatabase } from "./db";
import { whopAuthMiddleware } from "./middleware/auth";
import { getWhopCompanyId, getWhopClient } from "./whop";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Initialize MongoDB connection
  try {
    await connectToDatabase();
    console.log('[Routes] Database connected successfully');
  } catch (error) {
    console.error('[Routes] Failed to connect to database:', error);
  }

  // ============================================
  // Auth Routes
  // ============================================

  /**
   * GET /api/auth/me
   * Returns the current authenticated user's profile
   */
  app.get('/api/auth/me', whopAuthMiddleware, (req: Request, res: Response) => {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    res.json({
      id: req.user.whopUserId,
      username: req.user.username,
      name: req.user.name,
      profilePicture: req.user.profilePicture,
      bio: req.user.bio,
      accessLevel: req.user.accessLevel,
      createdAt: req.user.createdAt,
    });
  });

  /**
   * GET /api/auth/check-access
   * Returns the user's access level for the current resource
   */
  app.get('/api/auth/check-access', whopAuthMiddleware, async (req: Request, res: Response) => {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const companyId = getWhopCompanyId();

    if (!companyId) {
      // No company ID configured, return user's stored access level
      res.json({
        hasAccess: req.user.accessLevel !== 'no_access',
        accessLevel: req.user.accessLevel,
      });
      return;
    }

    try {
      const whopClient = getWhopClient();
      const accessResult = await whopClient.users.checkAccess(
        companyId,
        { id: req.user.whopUserId }
      );

      res.json({
        hasAccess: accessResult.has_access,
        accessLevel: accessResult.access_level,
      });
    } catch (error) {
      console.error('[Routes] Check access error:', error);
      res.status(500).json({ error: 'Failed to check access' });
    }
  });

  // ============================================
  // Health Check
  // ============================================

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  return httpServer;
}
