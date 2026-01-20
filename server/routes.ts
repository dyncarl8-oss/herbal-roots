import type { Express, Request, Response } from "express";
import { type Server } from "http";
import { connectToDatabase } from "./db";
import { whopAuthMiddleware } from "./middleware/auth";
import { getWhopCompanyId, getWhopClient } from "./whop";
import { addSavedBlend, getUserSavedBlends, getAllUsers } from "./models/user";

// --- Functional Masterclasses Database ---
const MASTERCLASSES = [
  {
    id: "cold-brew-teas",
    title: "Mastering Cold Brew Teas",
    type: "Video Lesson",
    duration: "15 min",
    category: "Brewing Techniques",
    thumbnail: "@assets/generated_images/serene_caribbean_ocean_header.png", // Fallback for now
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", // Placeholder video
    description: "Learn how to extract the deepest flavors from Caribbean herbs without the bitterness of high heat.",
    content: "Cold brewing is an art of patience. Unlike traditional steeping, cold water extraction preserves delicate aromatic compounds that are often lost to boiling water. \n\n### Why Cold Brew?\n- **Reduced Bitterness**: Tannins are less soluble in cold water.\n- **Higher Vitamin C**: Heat-sensitive nutrients remain intact.\n- **Refreshing**: Perfect for the Caribbean climate."
  },
  {
    id: "history-of-hibiscus",
    title: "The History of Hibiscus",
    type: "Article",
    duration: "5 min read",
    category: "Herbal History",
    thumbnail: "@assets/generated_images/serene_caribbean_ocean_header.png",
    description: "Discover the journey of the Hibiscus flower from West Africa to the Caribbean tea pot.",
    content: "Hibiscus Sabdariffa, known as Sorrel in the Caribbean, carries a deep history of migration and resilience. Brought by enslaved people from West Africa, it became a staple of Caribbean holiday traditions and daily wellness."
  },
  {
    id: "gut-health-101",
    title: "Gut Health 101",
    type: "Masterclass",
    duration: "45 min",
    category: "Wellness Foundations",
    thumbnail: "@assets/generated_images/serene_caribbean_ocean_header.png",
    description: "An in-depth look at how Caribbean 'bitters' and roots support the second brain.",
    content: "Your gut is your second brain. In Caribbean tradition, 'cleaning the blood' often started with the digestive tract. We explore ingredients like Cerasee, Ginger, and Turmeric."
  }
];

// --- Mock Community Database ---
const COMMUNITY_POSTS = [
  { id: 1, author: "Aries K.", role: "Herbalist", content: "Just brewed a fresh batch of Blue Vervain for the evening. The clarity is unmatched! 🌿", likes: 12, time: "2h ago" },
  { id: 2, author: "Solomon B.", role: "Member", content: "Success! My Cold Brew Sorrel turned out perfectly using the new masterclass technique. No bitterness at all.", likes: 8, time: "5h ago" },
  { id: 3, author: "Luna M.", role: "Admin", content: "Don't forget to steep your roots for at least 30 minutes to get the full potency of the Caribbean 'Fire Cider'. 🔥", likes: 24, time: "1d ago" }
];

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
      const diffTime = Math.abs(new Date().getTime() - joinDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      res.json({
        streakDays: diffDays || 1,
        affiliateEarnings: 0,
        communityPosts: COMMUNITY_POSTS.length, // Real mock count
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
   * GET /api/masterclasses
   * Returns all available masterclasses
   */
  app.get('/api/masterclasses', whopAuthMiddleware, (req: Request, res: Response) => {
    res.json(MASTERCLASSES);
  });

  /**
   * GET /api/masterclasses/:id
   * Returns a specific masterclass
   */
  app.get('/api/masterclasses/:id', whopAuthMiddleware, (req: Request, res: Response) => {
    const item = MASTERCLASSES.find(m => m.id === req.params.id);
    if (!item) return res.status(404).json({ error: "Masterclass not found" });
    res.json(item);
  });

  /**
   * GET /api/community/posts
   * Returns recent community posts
   */
  app.get('/api/community/posts', whopAuthMiddleware, (req: Request, res: Response) => {
    res.json(COMMUNITY_POSTS);
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

    const { name, type, productId, tags } = req.body;
    if (!name) {
      res.status(400).json({ error: 'Name is required' });
      return;
    }

    // Infer type from tags if missing
    let finalType = type;
    if (!finalType && tags?.goal) {
      finalType = Array.isArray(tags.goal) ? tags.goal[0] : tags.goal;
    }
    if (!finalType) finalType = "Herbal Ritual";

    try {
      await addSavedBlend(req.whopUserId, {
        name,
        type: finalType,
        productId
      });
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
