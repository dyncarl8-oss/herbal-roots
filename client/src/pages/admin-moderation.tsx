import { useState, useEffect } from "react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/ui/card";
import {
    Trash2,
    Loader2,
    Users,
    MessageSquare,
    Search,
    ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface CommunityPost {
    _id: string;
    authorName: string;
    authorAvatar?: string;
    content: string;
    createdAt: string;
}

export default function AdminModeration() {
    const { toast } = useToast();
    const [posts, setPosts] = useState<CommunityPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    const fetchData = async () => {
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

    useEffect(() => {
        fetchData();
    }, []);

    const handleDeletePost = async (postId: string) => {
        if (!confirm("Are you sure you want to prune this ritual? This action is permanent.")) return;

        try {
            const res = await fetch(`/api/admin/posts/${postId}`, { method: "DELETE" });
            if (res.ok) {
                toast({ title: "Ritual Pruned", description: "The content has been removed from the Sanctuary." });
                setPosts(prev => prev.filter(p => p._id !== postId));
            }
        } catch (err) {
            toast({ title: "Moderation Failed", description: "Could not remove post.", variant: "destructive" });
        }
    };

    const filteredPosts = posts.filter(p =>
        p.authorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.content.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="w-12 h-12 animate-spin text-primary opacity-50" />
                <p className="mt-4 text-primary font-serif italic">Reviewing the Sanctuary...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-serif font-bold text-primary">Sanctuary Sentinel</h1>
                    <p className="text-muted-foreground italic">Guarding the quality and sacredness of community rituals.</p>
                </div>
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                        placeholder="Scan ritual content..."
                        className="pl-10 h-10 rounded-full bg-white/50 border-white/20 shadow-inner"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-white/40 backdrop-blur-xl border-none shadow-soft">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                            <MessageSquare size={24} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Total Rituals</p>
                            <h3 className="text-2xl font-bold text-primary">{posts.length}</h3>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white/40 backdrop-blur-xl border-none shadow-soft">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                            <Users size={24} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Active Seekers</p>
                            <h3 className="text-2xl font-bold text-primary">{Array.from(new Set(posts.map(p => p.authorName))).length}</h3>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white/40 backdrop-blur-xl border-none shadow-soft">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600">
                            <ShieldCheck size={24} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Shield Status</p>
                            <h3 className="text-lg font-bold text-amber-600 uppercase">Active</h3>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="bg-white/40 backdrop-blur-xl border-none shadow-soft overflow-hidden">
                <CardHeader className="border-b border-primary/5 bg-white/20 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="font-serif text-2xl">Ritual Surveillance</CardTitle>
                            <CardDescription>Real-time feed of all community interactions.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-primary/5 text-left text-[10px] uppercase tracking-widest text-muted-foreground bg-primary/5">
                                    <th className="px-6 py-4 font-bold">Author Identity</th>
                                    <th className="px-6 py-4 font-bold">Shared Ritual</th>
                                    <th className="px-6 py-4 font-bold">Time Seed</th>
                                    <th className="px-6 py-4 font-bold text-right">Sanctuary Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-primary/5">
                                {filteredPosts.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground italic opacity-50 font-serif">
                                            The Sanctuary is quiet. No matching rituals detected.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredPosts.map((post) => (
                                        <tr key={post._id} className="group hover:bg-white/50 transition-all duration-300">
                                            <td className="px-6 py-6 transition-all group-hover:pl-8">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-9 w-9 border-2 border-primary/10 shadow-sm transition-transform group-hover:scale-110">
                                                        <AvatarImage src={post.authorAvatar} />
                                                        <AvatarFallback className="text-[10px] bg-secondary text-primary font-bold">
                                                            {post.authorName[0]}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <span className="text-sm font-bold text-primary group-hover:translate-x-1 transition-transform">{post.authorName}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6">
                                                <p className="text-sm text-foreground/80 font-light line-clamp-2 italic max-w-md border-l-2 border-primary/5 pl-4 py-1">
                                                    "{post.content}"
                                                </p>
                                            </td>
                                            <td className="px-6 py-6 text-[10px] text-muted-foreground uppercase opacity-70">
                                                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                                            </td>
                                            <td className="px-6 py-6 text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-xl gap-2 transition-all opacity-0 group-hover:opacity-100 shadow-sm border border-transparent hover:border-red-100"
                                                    onClick={() => handleDeletePost(post._id)}
                                                >
                                                    <Trash2 size={14} />
                                                    <span className="text-[10px] font-bold uppercase tracking-tighter">Prune Ritual</span>
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
