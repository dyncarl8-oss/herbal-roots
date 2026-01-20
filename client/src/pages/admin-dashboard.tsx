import { useState, useEffect } from "react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/ui/card";
import {
    DollarSign,
    Users,
    ShieldCheck,
    ArrowUpRight,
    Trash2,
    Loader2,
    CreditCard,
    MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface AdminStats {
    totalRevenue: number;
    totalCommission: number;
    transactionCount: number;
    memberCount: number;
    adminBalance: number;
}

interface Transaction {
    _id: string;
    type: string;
    amount: number;
    commission: number;
    buyerWhopId: string;
    description: string;
    createdAt: string;
}

interface CommunityPost {
    _id: string;
    authorName: string;
    authorAvatar?: string;
    content: string;
    createdAt: string;
}

export default function AdminDashboard() {
    const { toast } = useToast();
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [posts, setPosts] = useState<CommunityPost[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const [statsRes, transRes, postsRes] = await Promise.all([
                fetch("/api/admin/stats"),
                fetch("/api/admin/transactions"),
                fetch("/api/community/posts") // Reuse existing post fetch
            ]);

            if (statsRes.ok && transRes.ok && postsRes.ok) {
                setStats(await statsRes.json());
                setTransactions(await transRes.json());
                setPosts(await postsRes.json());
            }
        } catch (err) {
            console.error("Failed to fetch admin data", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleDeletePost = async (postId: string) => {
        if (!confirm("Are you sure you want to delete this ritual? This cannot be undone.")) return;

        try {
            const res = await fetch(`/api/admin/posts/${postId}`, { method: "DELETE" });
            if (res.ok) {
                toast({ title: "Post Removed", description: "The ritual has been purged from the Circle." });
                setPosts(prev => prev.filter(p => p._id !== postId));
                setStats(prev => prev ? { ...prev, transactionCount: prev.transactionCount } : null);
            }
        } catch (err) {
            toast({ title: "Action Failed", description: "Could not remove post.", variant: "destructive" });
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="w-12 h-12 animate-spin text-primary opacity-50" />
                <p className="mt-4 text-primary font-serif">Syncing Command Center...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-serif font-bold text-primary">Command Center</h1>
                    <p className="text-muted-foreground italic">Managing the Herbal Roots ecosystem.</p>
                </div>
                <Badge className="bg-primary text-primary-foreground px-4 py-1.5 rounded-full flex gap-2 items-center">
                    <ShieldCheck size={14} /> Full Authority
                </Badge>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-white/60 backdrop-blur-md border-white/40 shadow-sm border-none">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                                <DollarSign size={24} />
                            </div>
                            <ArrowUpRight className="text-muted-foreground w-4 h-4" />
                        </div>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Platform Revenue</p>
                        <h3 className="text-3xl font-bold text-primary mt-1">${stats?.totalRevenue.toFixed(2)}</h3>
                    </CardContent>
                </Card>

                <Card className="bg-white/60 backdrop-blur-md border-white/40 shadow-sm border-none">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                <CreditCard size={24} />
                            </div>
                            <Badge variant="outline" className="text-primary border-primary/20">50% Earned</Badge>
                        </div>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Command Commission</p>
                        <h3 className="text-3xl font-bold text-primary mt-1">${stats?.totalCommission.toFixed(2)}</h3>
                    </CardContent>
                </Card>

                <Card className="bg-white/60 backdrop-blur-md border-white/40 shadow-sm border-none">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600">
                                <Users size={24} />
                            </div>
                        </div>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Active Seekers</p>
                        <h3 className="text-3xl font-bold text-primary mt-1">{stats?.memberCount}</h3>
                    </CardContent>
                </Card>

                <Card className="bg-white/60 backdrop-blur-md border-white/40 shadow-sm border-none">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent-foreground">
                                <MessageSquare size={24} />
                            </div>
                        </div>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Ritual Pulse</p>
                        <h3 className="text-3xl font-bold text-primary mt-1">{posts.length}</h3>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Transactions */}
                <Card className="bg-white/40 backdrop-blur-xl border-white/50 border-none shadow-soft overflow-hidden">
                    <CardHeader className="p-6 border-b border-primary/5">
                        <CardTitle className="font-serif text-2xl">Financial Intelligence</CardTitle>
                        <CardDescription>Visualizing platform activity and incoming commissions.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="space-y-4">
                            {transactions.length === 0 ? (
                                <div className="text-center py-10 opacity-30 italic">No transactions recorded yet.</div>
                            ) : (
                                transactions.map((t) => (
                                    <div key={t._id} className="flex items-center justify-between p-4 rounded-2xl bg-white/50 border border-white/20 group hover:shadow-sm transition-all hover:bg-white/80">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                                                <DollarSign size={18} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-primary text-sm">{t.description}</p>
                                                <p className="text-[10px] text-muted-foreground">Audit ID: {t.buyerWhopId.slice(0, 8)}...</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-emerald-600 text-sm">+${t.commission.toFixed(2)}</p>
                                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{formatDistanceToNow(new Date(t.createdAt), { addSuffix: true })}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Sanctuary Moderation Summary */}
                <Card className="bg-white/40 backdrop-blur-xl border-white/50 border-none shadow-soft overflow-hidden">
                    <CardHeader className="p-6 border-b border-primary/5">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="font-serif text-2xl">Sentinel Overview</CardTitle>
                                <CardDescription>High-level monitoring of recent community rituals.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="space-y-4">
                            {posts.slice(0, 5).map((post) => (
                                <div key={post._id} className="flex items-start justify-between p-4 rounded-2xl bg-white/50 border border-white/20 group hover:border-red-100 transition-all hover:bg-white/80">
                                    <div className="flex gap-3">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={post.authorAvatar} />
                                            <AvatarFallback className="text-[10px] bg-secondary text-primary font-bold">
                                                {post.authorName[0]}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <p className="text-xs font-bold text-primary">{post.authorName}</p>
                                            <p className="text-[11px] text-foreground/80 font-light line-clamp-2 mt-1 italic border-l border-primary/10 pl-2">"{post.content}"</p>
                                            <p className="text-[9px] text-muted-foreground mt-2 uppercase tracking-tighter">{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-xl opacity-0 group-hover:opacity-100 transition-all shadow-sm"
                                        onClick={() => handleDeletePost(post._id)}
                                    >
                                        <Trash2 size={16} />
                                    </Button>
                                </div>
                            ))}
                            {posts.length > 5 && (
                                <p className="text-center text-[10px] text-muted-foreground pt-4 uppercase tracking-widest font-bold">Latest 5 Rituals tracked</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
