import type { Express, Request, Response } from "express";
import { type Server } from "http";
import { connectToDatabase } from "./db";
import { whopAuthMiddleware } from "./middleware/auth";
import { getWhopCompanyId, getWhopClient } from "./whop";
import { addSavedBlend, getUserSavedBlends } from "./models/user";

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
  // Dashboard & User Data Routes
  // ============================================

  /**
   * GET /api/dashboard/stats
   * Returns user statistics for the dashboard
   */
  app.get('/api/dashboard/stats', whopAuthMiddleware, async (req: Request, res: Response) => {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    try {
      // Calculate streak (days since joined for now)
      const joinDate = new Date(req.user.createdAt);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - joinDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      res.json({
        streakDays: diffDays,
        affiliateEarnings: 0, // Placeholder
        communityPosts: 0,    // Placeholder
        joinedAt: req.user.createdAt
      });
    } catch (error) {
      console.error('[Routes] Stats error:', error);
      res.status(500).json({ error: 'Failed to fetch stats' });
    }
  });

  /**
   * GET /api/user/blends
   * Get user's saved blends/rituals
   */
  app.get('/api/user/blends', whopAuthMiddleware, async (req: Request, res: Response) => {
    if (!req.user || !req.whopUserId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    try {
      const blends = await getUserSavedBlends(req.whopUserId);
      res.json(blends);
    } catch (error) {
      console.error('[Routes] Get blends error:', error);
      res.status(500).json({ error: 'Failed to fetch blends' });
    }
  });

  /**
   * POST /api/user/blends
   * Save a new blend/ritual
   */
  app.post('/api/user/blends', whopAuthMiddleware, async (req: Request, res: Response) => {
    if (!req.user || !req.whopUserId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { name, type, productId } = req.body;
    if (!name || !type) {
      res.status(400).json({ error: 'Name and type are required' });
      return;
    }

    try {
      await addSavedBlend(req.whopUserId, { name, type });
      res.json({ success: true });
    } catch (error) {
      console.error('[Routes] Save blend error:', error);
      res.status(500).json({ error: 'Failed to save blend' });
    }
  });

  /**
   * POST /api/checkout/create
   * Create a Whop checkout session
   */
  app.post('/api/checkout/create', whopAuthMiddleware, async (req: Request, res: Response) => {
    if (!req.user || !req.whopUserId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { name, price } = req.body;
    if (!name || price === undefined) {
      res.status(400).json({ error: 'Name and price are required' });
      return;
    }

    const companyId = getWhopCompanyId();
    if (!companyId) {
      console.error('[Routes] Checkout failed: WHOP_COMPANY_ID not configured');
      res.status(500).json({ error: 'Payments not configured' });
      return;
    }

    try {
      const whopClient = getWhopClient();
      console.log(`[Checkout] Creating session for ${name} ($${price}). Using TEST MODE pricing ($0).`);

      const checkoutConfig = await whopClient.checkoutConfigurations.create({
        plan: {
          initial_price: 0, // FORCE TEST PRICING AS REQUESTED
          plan_type: "one_time",
          currency: "usd",
          company_id: companyId
        } as any,
        metadata: {
          product_name: name,
          user_id: req.whopUserId,
          source: "symptom_tool"
        }
      });

      console.log('[Checkout] Session created:', checkoutConfig.id);
      res.json({ sessionId: checkoutConfig.id });
    } catch (error) {
      console.error('[Routes] Create checkout error:', error);
      res.status(500).json({ error: 'Failed to create checkout session' });
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
