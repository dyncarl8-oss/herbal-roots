import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Leaf, PlayCircle, Users, TrendingUp, Sparkles, Loader2 } from "lucide-react";
import { Link } from "wouter";
import headerImage from "@assets/generated_images/serene_caribbean_ocean_header.png";
import { useUser } from "@/context/UserContext";
import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";

interface DashboardStats {
  streakDays: number;
  affiliateEarnings: number;
  communityPosts: number;
  joinedAt: string;
}

interface SavedBlend {
  name: string;
  type: string;
  savedAt: string;
  productId?: string;
}

export default function DashboardHome() {
  const { user } = useUser();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [blends, setBlends] = useState<SavedBlend[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, blendsRes] = await Promise.all([
          fetch('/api/dashboard/stats', { credentials: 'include' }),
          fetch('/api/user/blends', { credentials: 'include' })
        ]);

        if (statsRes.ok) {
          setStats(await statsRes.json());
        }
        if (blendsRes.ok) {
          setBlends(await blendsRes.json());
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      fetchData();
    }
  }, [user]);

  // Loading Skeleton
  if (loading && user) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Welcome Hero */}
      <div className="relative rounded-3xl overflow-hidden shadow-soft group">
        <div className="absolute inset-0 z-0">
          <img
            src={headerImage}
            alt="Ocean Header"
            className="w-full h-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary/40 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>

        <div className="relative z-10 p-8 md:p-12 text-white max-w-2xl">
          <Badge className="bg-white/20 text-white hover:bg-white/30 border-none backdrop-blur-sm mb-4">
            Welcome Back, {user?.name.split(' ')[0] || 'Member'}
          </Badge>
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4 leading-tight">
            Your Wellness Journey Continues
          </h1>
          <p className="text-lg md:text-xl text-white/90 mb-8 font-light max-w-lg">
            Explore new blends, connect with the community, or check your affiliate growth.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/symptom-tool">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90 shadow-lg border-none">
                Find Your Blend
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <Link href="/community">
              <Button size="lg" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 shadow-lg border-none">
                Enter The Circle
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Quick Stat Card */}
        <Card className="bg-white/50 backdrop-blur-sm border-white/20 shadow-sm hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground tracking-wider uppercase">Current Streak</CardTitle>
            <Sparkles className="h-4 w-4 text-accent-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-serif text-primary">
              {stats?.streakDays || 1} Days
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              You're consistent with your rituals!
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/50 backdrop-blur-sm border-white/20 shadow-sm hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground tracking-wider uppercase">Affiliate Earnings</CardTitle>
            <TrendingUp className="h-4 w-4 text-accent-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-serif text-primary">
              ${stats?.affiliateEarnings.toFixed(2) || "0.00"}
            </div>
            <p className="text-xs text-green-600 mt-1 flex items-center">
              Start earning by sharing
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/50 backdrop-blur-sm border-white/20 shadow-sm hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground tracking-wider uppercase">Community</CardTitle>
            <Users className="h-4 w-4 text-accent-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-serif text-primary">
              {stats?.communityPosts || 0} New
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Posts in "Morning Rituals"
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Recommendations */}
        <Card className="bg-white/60 backdrop-blur-md border-white/40 shadow-soft">
          <CardHeader>
            <CardTitle className="font-serif text-2xl text-primary">Your Rituals</CardTitle>
            <CardDescription>Based on your saved blends from symptom checks</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col h-[400px]">
            <div className="flex-grow overflow-y-auto pr-2 space-y-4 custom-scrollbar">
              {blends.length > 0 ? (
                blends.map((item, i) => {
                  const Content = (
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-secondary flex-shrink-0 flex items-center justify-center text-secondary-foreground group-hover:scale-110 transition-transform">
                          <Leaf size={18} />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-medium text-foreground truncate">{item.name}</h4>
                          <p className="text-xs text-muted-foreground truncate">{item.type}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="text-[10px] text-muted-foreground hidden sm:block">
                          {formatDistanceToNow(new Date(item.savedAt), { addSuffix: true })}
                        </span>
                        {item.productId && (
                          <Badge variant="outline" className="border-primary/20 text-primary bg-primary/5 hover:bg-primary/10 whitespace-nowrap">
                            View <ArrowRight className="w-3 h-3 ml-1" />
                          </Badge>
                        )}
                      </div>
                    </div>
                  );

                  return item.productId ? (
                    <Link key={i} href={`/ritual/${item.productId}`} className="block w-full">
                      {Content}
                    </Link>
                  ) : (
                    <div key={i}>{Content}</div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No saved rituals yet. Take the assessment to find one!</p>
                </div>
              )}
            </div>
            <Link href="/symptom-tool" className="block mt-auto pt-6">
              <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-md h-12">
                Take a New Assessment
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Latest Content */}
        <Card className="bg-white/60 backdrop-blur-md border-white/40 shadow-soft">
          <CardHeader>
            <CardTitle className="font-serif text-2xl text-primary">From The Steep Circle</CardTitle>
            <CardDescription>Latest masterclasses and guides</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col h-[400px]">
            <div className="flex-grow overflow-y-auto pr-2 space-y-4 custom-scrollbar">
              {[
                { id: "cold-brew-teas", title: "Mastering Cold Brew Teas", type: "Video Lesson", time: "15 min" },
                { id: "history-of-hibiscus", title: "The History of Hibiscus", type: "Article", time: "5 min read" },
                { id: "gut-health-101", title: "Gut Health 101", type: "Masterclass", time: "45 min" }
              ].map((item, i) => (
                <Link key={i} href={`/masterclass/${item.id}`} className="block">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-white/50 border border-white/40 hover:bg-white/80 transition-colors group cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent-foreground group-hover:scale-110 transition-transform">
                        <PlayCircle size={18} />
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground">{item.title}</h4>
                        <p className="text-xs text-muted-foreground">{item.type}</p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground bg-white/50 px-2 py-1 rounded-full">{item.time}</span>
                  </div>
                </Link>
              ))}
            </div>
            <Link href="/masterclasses" className="block mt-auto pt-6">
              <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-md h-12">
                View All Content
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
