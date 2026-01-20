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
                fetch("/api/community/posts")
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

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="w-12 h-12 animate-spin text-primary opacity-50" />
                <p className="mt-4 text-primary font-serif italic">Loading Dashboard...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-serif font-bold text-primary">Admin Dashboard</h1>
                    <p className="text-muted-foreground italic">Monitor your earnings and platform activity.</p>
                </div>
                <Badge className="bg-primary text-primary-foreground px-4 py-1.5 rounded-full flex gap-2 items-center">
                    <ShieldCheck size={14} /> Administrator
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
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Total Sales</p>
                        <h3 className="text-3xl font-bold text-primary mt-1">${stats?.totalRevenue.toFixed(2)}</h3>
                    </CardContent>
                </Card>

                <Card className="bg-white/60 backdrop-blur-md border-white/40 shadow-sm border-none">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                <CreditCard size={24} />
                            </div>
                            <Badge variant="outline" className="text-primary border-primary/20">50% Cut</Badge>
                        </div>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">My Earnings</p>
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
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Members</p>
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
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Posts</p>
                        <h3 className="text-3xl font-bold text-primary mt-1">{posts.length}</h3>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Transactions */}
            <Card className="bg-white/40 backdrop-blur-xl border-white/50 border-none shadow-soft overflow-hidden">
                <CardHeader className="p-6 border-b border-primary/5">
                    <CardTitle className="font-serif text-2xl">Recent Sales</CardTitle>
                    <CardDescription>View latest ritual purchases and commissions.</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="space-y-4">
                        {transactions.length === 0 ? (
                            <div className="text-center py-10 opacity-30 italic font-serif">No sales recorded yet.</div>
                        ) : (
                            transactions.map((t) => (
                                <div key={t._id} className="flex items-center justify-between p-4 rounded-2xl bg-white/50 border border-white/20 group hover:shadow-sm transition-all hover:bg-white/80">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                                            <DollarSign size={18} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-primary text-sm">{t.description}</p>
                                            <p className="text-[10px] text-muted-foreground uppercase tracking-tighter">Member ID: {t.buyerWhopId.slice(0, 8)}...</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-emerald-600 text-sm">+${t.commission.toFixed(2)}</p>
                                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono opacity-60">
                                            {formatDistanceToNow(new Date(t.createdAt), { addSuffix: true })}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
