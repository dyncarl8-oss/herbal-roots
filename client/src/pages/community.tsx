import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Heart, Share2, PlayCircle, BookOpen, Clock, ArrowRight, Loader2, Plus } from "lucide-react";
import { Link } from "wouter";
import headerImage from "@assets/generated_images/serene_caribbean_ocean_header.png";

interface CommunityPost {
  id: number;
  author: string;
  role: string;
  content: string;
  likes: number;
  time: string;
}

export default function Community() {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch("/api/community/posts");
        if (res.ok) {
          setPosts(await res.json());
        }
      } catch (err) {
        console.error("Failed to fetch posts", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Community Header */}
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
            <Button size="sm" className="bg-primary text-primary-foreground rounded-full">
              <Plus className="w-4 h-4 mr-2" /> Share Ritual
            </Button>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-6">
              {posts.map((post) => (
                <Card key={post.id} className="bg-white/80 backdrop-blur-sm border-white/50 shadow-sm hover:shadow-md transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-10 w-10 border border-primary/10">
                        <AvatarFallback className="bg-secondary text-primary font-bold">
                          {post.author[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-bold text-primary">{post.author}</p>
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{post.role}</p>
                          </div>
                          <span className="text-xs text-muted-foreground">{post.time}</span>
                        </div>
                        <p className="text-foreground leading-relaxed">
                          {post.content}
                        </p>
                        <div className="flex items-center gap-6 pt-2 border-t border-primary/5">
                          <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-accent-foreground transition-colors group">
                            <Heart className="w-4 h-4 group-hover:fill-accent-foreground" />
                            {post.likes}
                          </button>
                          <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors">
                            <MessageCircle className="w-4 h-4" />
                            Reply
                          </button>
                          <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors ml-auto">
                            <Share2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
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
