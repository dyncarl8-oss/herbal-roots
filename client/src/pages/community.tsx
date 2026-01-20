import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Heart, PlayCircle, BookOpen, Clock, ArrowRight, Loader2, Plus, RefreshCw } from "lucide-react";
import { Link } from "wouter";
import { useUser } from "@/context/UserContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import headerImage from "@assets/generated_images/serene_caribbean_ocean_header.png";

interface Reply {
  _id: string;
  authorWhopId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  createdAt: string;
}

interface CommunityPost {
  _id: string;
  authorWhopId: string;
  authorName: string;
  authorAvatar?: string;
  authorRole: string;
  content: string;
  likes: string[];
  replies: Reply[];
  createdAt: string;
}

export default function Community() {
  const { user } = useUser();
  const { toast } = useToast();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [newPostContent, setNewPostContent] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Reply State
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [isReplying, setIsReplying] = useState(false);

  const fetchPosts = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const res = await fetch("/api/community/posts");
      if (res.ok) {
        setPosts(await res.json());
      }
    } catch (err) {
      console.error("Failed to fetch posts", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleShareRitual = async () => {
    if (!newPostContent.trim()) return;
    setIsPosting(true);
    try {
      const res = await fetch("/api/community/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newPostContent }),
      });

      if (res.ok) {
        toast({
          title: "Ritual Shared!",
          description: "Your morning ritual is now live in the Circle.",
        });
        setNewPostContent("");
        setIsDialogOpen(false);
        fetchPosts();
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to share ritual. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPosting(false);
    }
  };

  const handleToggleLike = async (postId: string) => {
    if (!user) return;
    try {
      const res = await fetch(`/api/community/posts/${postId}/like`, {
        method: "POST",
      });
      if (res.ok) {
        setPosts(currentPosts =>
          currentPosts.map(p => {
            if (p._id === postId) {
              const hasLiked = p.likes.includes(user.id);
              return {
                ...p,
                likes: hasLiked
                  ? p.likes.filter(id => id !== user.id)
                  : [...p.likes, user.id]
              };
            }
            return p;
          })
        );
      }
    } catch (err) {
      console.error("Failed to toggle like", err);
    }
  };

  const handleReply = async (postId: string) => {
    if (!replyContent.trim()) return;
    setIsReplying(true);
    try {
      const res = await fetch(`/api/community/posts/${postId}/replies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: replyContent }),
      });

      if (res.ok) {
        const newReply = await res.json();
        setPosts(currentPosts =>
          currentPosts.map(p => {
            if (p._id === postId) {
              return {
                ...p,
                replies: [...p.replies, newReply]
              };
            }
            return p;
          })
        );
        setReplyContent("");
        setReplyingTo(null);
        toast({
          title: "Reply Posted!",
          description: "Your voice has been added to the Circle.",
        });
      }
    } catch (err) {
      console.error("Failed to post reply", err);
    } finally {
      setIsReplying(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Community Header ... content same ... */}
      <div className="relative rounded-3xl overflow-hidden h-[300px] shadow-soft flex items-center justify-center text-center px-6">
        <img
          src={headerImage}
          alt="Community Header"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/95 via-primary/60 to-primary/40" />

        <div className="relative z-10 space-y-4 max-w-2xl px-4">
          <Badge className="bg-accent text-accent-foreground border-none hover:bg-accent/80 mb-2">Member Sanctuary</Badge>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-white">The Steep Circle</h1>
          <p className="text-white/80 text-lg font-light">
            Share your daily rituals, learn from master herbalists, and grow together in the Caribbean wellness tradition.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Feed */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-3xl font-serif font-bold text-primary">Morning Rituals</h2>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                className="rounded-full border-primary/10 hover:bg-primary/5 h-10 w-10"
                onClick={() => fetchPosts(true)}
                disabled={refreshing}
              >
                <RefreshCw className={`w-4 h-4 text-primary ${refreshing ? 'animate-spin' : ''}`} />
              </Button>

              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-primary text-primary-foreground rounded-full shadow-lg hover:scale-105 transition-transform h-10 px-6">
                    <Plus className="w-4 h-4 mr-2" /> Share Ritual
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px] rounded-3xl border-none shadow-2xl bg-white/95 backdrop-blur-xl">
                  <DialogHeader>
                    <DialogTitle className="font-serif text-2xl text-primary flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                        <Plus className="w-4 h-4 text-primary" />
                      </div>
                      Share Your Ritual
                    </DialogTitle>
                  </DialogHeader>
                  <div className="py-4">
                    <Textarea
                      placeholder="Tell us about your morning steep... What are you brewing today?"
                      className="min-h-[150px] rounded-2xl border-primary/10 focus-visible:ring-primary/20 bg-primary/5 text-lg placeholder:text-muted-foreground/50"
                      value={newPostContent}
                      onChange={(e) => setNewPostContent(e.target.value)}
                    />
                  </div>
                  <DialogFooter>
                    <Button
                      className="w-full h-12 rounded-xl bg-primary text-lg"
                      onClick={handleShareRitual}
                      disabled={isPosting || !newPostContent.trim()}
                    >
                      {isPosting ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : "Post to The Circle"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {loading && !refreshing ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-12 h-12 animate-spin text-primary opacity-50" />
            </div>
          ) : (
            <div className="space-y-6">
              {posts.map((post) => (
                <Card key={post._id} className="bg-white/80 backdrop-blur-sm border-white/50 shadow-sm hover:shadow-md transition-all group overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-12 w-12 border-2 border-primary/5 shadow-inner">
                        <AvatarImage src={post.authorAvatar} />
                        <AvatarFallback className="bg-secondary text-primary font-bold">
                          {post.authorName ? post.authorName[0] : "M"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-bold text-primary group-hover:text-accent-foreground transition-colors">{post.authorName}</p>
                            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">{post.authorRole}</p>
                          </div>
                          <span className="text-xs text-muted-foreground italic">
                            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-foreground leading-relaxed text-lg font-light">
                          {post.content}
                        </p>

                        <div className="flex items-center gap-6 pt-4 border-t border-primary/5">
                          <button
                            onClick={() => handleToggleLike(post._id)}
                            className={`flex items-center gap-1.5 text-xs transition-all ring-offset-background active:scale-90 ${user && post.likes.includes(user.id)
                                ? 'text-accent-foreground font-bold'
                                : 'text-muted-foreground hover:text-accent-foreground'
                              }`}
                          >
                            <Heart className={`w-4 h-4 ${user && post.likes.includes(user.id) ? 'fill-accent-foreground' : ''}`} />
                            {post.likes.length}
                          </button>
                          <button
                            className={`flex items-center gap-1.5 text-xs transition-colors ${replyingTo === post._id ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}
                            onClick={() => setReplyingTo(replyingTo === post._id ? null : post._id)}
                          >
                            <MessageCircle className="w-4 h-4" />
                            Reply
                          </button>
                        </div>

                        {/* Replies List */}
                        {post.replies && post.replies.length > 0 && (
                          <div className="mt-4 space-y-4 pl-4 border-l-2 border-primary/5">
                            {post.replies.map((reply) => (
                              <div key={reply._id} className="flex items-start gap-3">
                                <Avatar className="h-8 w-8 border border-primary/5 shadow-sm">
                                  <AvatarImage src={reply.authorAvatar} />
                                  <AvatarFallback className="text-[10px] bg-secondary text-primary font-bold">
                                    {reply.authorName ? reply.authorName[0] : "?"}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 bg-primary/5 rounded-2xl p-3">
                                  <div className="flex items-center justify-between mb-1">
                                    <p className="text-xs font-bold text-primary">{reply.authorName}</p>
                                    <span className="text-[10px] text-muted-foreground">
                                      {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
                                    </span>
                                  </div>
                                  <p className="text-sm text-foreground/90 font-light leading-relaxed">
                                    {reply.content}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Reply Input */}
                        {replyingTo === post._id && (
                          <div className="mt-4 flex gap-3 animate-in slide-in-from-top-2 duration-300">
                            <Avatar className="h-8 w-8 border border-primary/5">
                              <AvatarImage src={user?.profilePicture} />
                              <AvatarFallback className="text-[10px] bg-secondary text-primary font-bold">
                                {user?.name ? user.name[0] : "Y"}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-2">
                              <Textarea
                                placeholder="Type your response..."
                                className="min-h-[80px] rounded-xl border-primary/10 bg-primary/5 text-sm focus-visible:ring-primary/20 placeholder:text-muted-foreground/30"
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                              />
                              <div className="flex justify-end gap-2">
                                <Button size="sm" variant="ghost" className="text-xs rounded-lg h-8" onClick={() => setReplyingTo(null)}>
                                  Cancel
                                </Button>
                                <Button
                                  size="sm"
                                  className="text-xs rounded-lg h-8 bg-primary"
                                  disabled={isReplying || !replyContent.trim()}
                                  onClick={() => handleReply(post._id)}
                                >
                                  {isReplying ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : "Reply"}
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {posts.length === 0 && (
                <div className="text-center py-20 bg-white/30 rounded-3xl border-2 border-dashed border-primary/5">
                  <p className="text-muted-foreground italic">The Circle is quiet today. Be the first to share your ritual!</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-6">
          {/* Masterclass Library Shortcut */}
          <Card className="bg-primary text-primary-foreground border-none shadow-lg overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
              <PlayCircle size={80} />
            </div>
            <CardHeader>
              <CardTitle className="font-serif text-2xl">Education Vault</CardTitle>
              <CardDescription className="text-primary-foreground/70">Masterclasses & Articles</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 relative z-10">
              <p className="text-sm text-primary-foreground/90 leading-relaxed font-light">
                Unlock ancestral knowledge through our curated library of video lessons and guides.
              </p>
              <Link href="/masterclasses">
                <Button className="w-full bg-white text-primary hover:bg-white/90 border-none h-12 text-base shadow-xl">
                  Explore Library
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Quick Resources */}
          <Card className="bg-white/60 backdrop-blur-md border-white/40">
            <CardHeader>
              <CardTitle className="font-serif text-xl">Quick Resources</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-primary/5 transition-colors cursor-pointer group border border-transparent hover:border-primary/10">
                <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center text-accent-foreground">
                  <BookOpen size={16} />
                </div>
                <span className="text-sm font-medium flex-1">Apothecary Guide</span>
                <ArrowRight size={14} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-primary/5 transition-colors cursor-pointer group border border-transparent hover:border-primary/10">
                <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-secondary-foreground">
                  <Clock size={16} />
                </div>
                <span className="text-sm font-medium flex-1">Ritual Timers</span>
                <ArrowRight size={14} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
