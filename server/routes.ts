import type { Express, Request, Response } from "express";
import { type Server } from "http";
import { connectToDatabase } from "./db";
import { whopAuthMiddleware, adminAuthMiddleware } from "./middleware/auth";
import { getWhopCompanyId, getWhopClient } from "./whop";
import { addSavedBlend, getUserSavedBlends, getAllUsers, updateUserBalance, creditSystemAdmin } from "./models/user";
import { createPost, getAllPosts, toggleLike, addReply, deletePost } from "./models/community";
import { getAdminStats, getAllTransactions, createTransaction } from "./models/transaction";

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

// --- Mock Community Database (Deleted - using MongoDB) ---

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

      const posts = await getAllPosts();

      res.json({
        streakDays: diffDays || 1,
        affiliateEarnings: 0,
        communityPosts: posts.length,
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
   * Returns recent community posts from MongoDB
   */
  app.get('/api/community/posts', whopAuthMiddleware, async (req: Request, res: Response) => {
    try {
      const posts = await getAllPosts();
      res.json(posts);
    } catch (error) {
      console.error('[Routes] Fetch posts error:', error);
      res.status(500).json({ error: 'Failed to fetch posts' });
    }
  });

  /**
   * POST /api/community/posts
   * Create a new community ritual post
   */
  app.post('/api/community/posts', whopAuthMiddleware, async (req: Request, res: Response) => {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });

    const { content } = req.body;
    if (!content) return res.status(400).json({ error: 'Content is required' });

    try {
      const post = await createPost({
        authorWhopId: req.user.whopUserId,
        authorName: req.user.name,
        authorAvatar: req.user.profilePicture,
        authorRole: req.user.accessLevel === 'admin' ? 'Admin' : 'Member',
        content
      });
      res.json(post);
    } catch (error) {
      console.error('[Routes] Create post error:', error);
      res.status(500).json({ error: 'Failed to create post' });
    }
  });

  /**
   * POST /api/community/posts/:id/like
   * Toggle a like on a post
   */
  app.post('/api/community/posts/:id/like', whopAuthMiddleware, async (req: Request, res: Response) => {
    if (!req.whopUserId) return res.status(401).json({ error: 'Not authenticated' });

    try {
      const postId = String(req.params.id);
      const userId = String(req.whopUserId);
      const isLiked = await toggleLike(postId, userId);
      res.json({ liked: isLiked });
    } catch (error) {
      console.error('[Routes] Toggle like error:', error);
      res.status(500).json({ error: 'Failed to update like' });
    }
  });

  /**
   * POST /api/community/posts/:id/replies
   * Add a reply to a post
   */
  app.post('/api/community/posts/:id/replies', whopAuthMiddleware, async (req: Request, res: Response) => {
    if (!req.user || !req.whopUserId) return res.status(401).json({ error: 'Not authenticated' });

    const { content } = req.body;
    if (!content) return res.status(400).json({ error: 'Reply content is required' });

    try {
      const postId = String(req.params.id);
      const reply = await addReply(postId, {
        authorWhopId: String(req.whopUserId),
        authorName: req.user.name,
        authorAvatar: req.user.profilePicture,
        content
      });
      res.json(reply);
    } catch (error) {
      console.error('[Routes] Add reply error:', error);
      res.status(500).json({ error: 'Failed to add reply' });
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

  /**
   * POST /api/purchase/finalize
   * Finalize a ritual purchase and credit 50% commission to admin
   */
  app.post('/api/purchase/finalize', whopAuthMiddleware, async (req: Request, res: Response) => {
    const { productName, price } = req.body;
    if (!productName || price === undefined) return res.status(400).json({ error: 'Missing purchase details' });

    try {
      const commission = price * 0.5;

      // 1. Record the transaction
      await createTransaction({
        type: 'ritual_purchase',
        amount: price,
        commission: commission,
        buyerWhopId: String(req.whopUserId),
        description: `Purchase of ${productName}`
      });

      // 2. Credit the platform admin
      await creditSystemAdmin(commission);

      res.json({ success: true });
    } catch (error) {
      console.error('[Purchase] Finalization error:', error);
      res.status(500).json({ error: 'Failed to finalize purchase' });
    }
  });

  // ============================================
  // Admin Command Center Routes
  // ============================================

  /**
   * GET /api/admin/stats
   * Returns high-level admin dashboard statistics
   */
  app.get('/api/admin/stats', adminAuthMiddleware, async (req: Request, res: Response) => {
    try {
      const stats = await getAdminStats();
      const users = await getAllUsers();

      res.json({
        ...stats,
        memberCount: users.length,
        adminBalance: req.user?.balance || 0
      });
    } catch (error) {
      console.error('[Admin] Stats error:', error);
      res.status(500).json({ error: 'Failed to fetch admin stats' });
    }
  });

  /**
   * GET /api/admin/transactions
   * Returns a list of all financial transactions
   */
  app.get('/api/admin/transactions', adminAuthMiddleware, async (_req: Request, res: Response) => {
    try {
      const transactions = await getAllTransactions();
      res.json(transactions);
    } catch (error) {
      console.error('[Admin] Transactions error:', error);
      res.status(500).json({ error: 'Failed to fetch transactions' });
    }
  });

  /**
   * GET /api/admin/users
   * Returns a list of all registered members/affiliates
   */
  app.get('/api/admin/users', adminAuthMiddleware, async (_req: Request, res: Response) => {
    try {
      const users = await getAllUsers();
      res.json(users);
    } catch (error) {
      console.error('[Admin] Users error:', error);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  });

  /**
   * DELETE /api/admin/posts/:id
   * Moderator: Delete an inappropriate community post
   */
  app.delete('/api/admin/posts/:id', adminAuthMiddleware, async (req: Request, res: Response) => {
    try {
      const postId = String(req.params.id);
      const success = await deletePost(postId);
      if (success) {
        res.json({ success: true });
      } else {
        res.status(404).json({ error: 'Post not found' });
      }
    } catch (error) {
      console.error('[Admin] Delete post error:', error);
      res.status(500).json({ error: 'Failed to delete post' });
    }
  });

  /**
   * POST /api/admin/mock-purchase
   * Trigger the 50% commission logic (Simulation for Testing)
   */
  app.post('/api/admin/mock-purchase', adminAuthMiddleware, async (req: Request, res: Response) => {
    const { productName, price } = req.body;
    if (!productName || price === undefined) return res.status(400).json({ error: 'Missing data' });

    try {
      const commission = price * 0.5;

      // 1. Log the transaction
      await createTransaction({
        type: 'ritual_purchase',
        amount: price,
        commission: commission,
        buyerWhopId: String(req.whopUserId),
        description: `Purchase of ${productName}`
      });

      // 2. Update Admin Balance (We credit the active admin for this test)
      if (req.whopUserId) {
        await updateUserBalance(String(req.whopUserId), commission);
      }

      res.json({ success: true, commissionEarned: commission });
    } catch (error) {
      console.error('[Admin] Mock purchase error:', error);
      res.status(500).json({ error: 'Simulation failed' });
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
