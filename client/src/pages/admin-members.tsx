import { useState, useEffect } from "react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/ui/card";
import {
    Users,
    Search,
    Loader2,
    Calendar,
    Shield,
    User as UserIcon,
    TrendingUp,
    DollarSign,
    Briefcase
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface User {
    whopUserId: string;
    username: string;
    name: string;
    profilePicture?: string;
    accessLevel: string;
    createdAt: string;
    balance?: number;
}

interface UserStats {
    whopUserId: string;
    totalPurchases: number;
    totalSpend: number;
    referralCount: number;
    referralRevenue: number;
}

export default function AdminMembers() {
    const [users, setUsers] = useState<User[]>([]);
    const [stats, setStats] = useState<UserStats[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    const fetchData = async () => {
        try {
            const [usersRes, statsRes] = await Promise.all([
                fetch("/api/admin/users"),
                fetch("/api/admin/users/stats")
            ]);

            if (usersRes.ok && statsRes.ok) {
                setUsers(await usersRes.json());
                setStats(await statsRes.json());
            }
        } catch (err) {
            console.error("Failed to fetch member data", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const getUserStat = (userId: string) => {
        return stats.find(s => s.whopUserId === userId) || {
            totalPurchases: 0,
            totalSpend: 0,
            referralCount: 0,
            referralRevenue: 0
        };
    };

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.username.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const platformTotalRevenue = stats.reduce((sum, s) => sum + s.totalSpend, 0);
    const platformTotalReferrals = stats.reduce((sum, s) => sum + s.referralCount, 0);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="w-12 h-12 animate-spin text-primary opacity-50" />
                <p className="mt-4 text-primary font-serif italic">Loading members...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-serif font-bold text-primary">Member & Sales Audit</h1>
                    <p className="text-muted-foreground italic">View member sales and referral performance.</p>
                </div>
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                        placeholder="Search members..."
                        className="pl-10 h-10 rounded-full bg-white/50 border-white/20"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Growth Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-white/40 backdrop-blur-xl border-none shadow-soft">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                                <TrendingUp size={24} />
                            </div>
                            <Badge variant="outline" className="text-[10px] border-primary/20">Revenue</Badge>
                        </div>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Total Referral Sales</p>
                        <h3 className="text-3xl font-bold text-primary mt-1">${platformTotalRevenue.toFixed(2)}</h3>
                    </CardContent>
                </Card>

                <Card className="bg-white/40 backdrop-blur-xl border-none shadow-soft">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-600">
                                <Briefcase size={24} />
                            </div>
                        </div>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Total Orders</p>
                        <h3 className="text-3xl font-bold text-primary mt-1">{platformTotalReferrals}</h3>
                    </CardContent>
                </Card>

                <Card className="bg-white/40 backdrop-blur-xl border-none shadow-soft">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-600">
                                <Users size={24} />
                            </div>
                        </div>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Total Members</p>
                        <h3 className="text-3xl font-bold text-primary mt-1">{users.length}</h3>
                    </CardContent>
                </Card>
            </div>

            {/* Audit Table */}
            <Card className="bg-white/40 backdrop-blur-xl border-none shadow-soft overflow-hidden">
                <CardHeader className="border-b border-primary/5 bg-white/20 p-6">
                    <CardTitle className="font-serif text-2xl">Member Directory</CardTitle>
                    <CardDescription>List of all members and their sales performance.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-primary/5 text-left text-[10px] uppercase tracking-widest text-muted-foreground bg-primary/5">
                                    <th className="px-6 py-4 font-bold">Member</th>
                                    <th className="px-6 py-4 font-bold">Role</th>
                                    <th className="px-6 py-4 font-bold">Orders</th>
                                    <th className="px-6 py-4 font-bold">Sales Revenue</th>
                                    <th className="px-6 py-4 font-bold text-right">Joined</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-primary/5">
                                {filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground italic opacity-50">
                                            No matching members found.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredUsers.map((u) => {
                                        const uStats = getUserStat(u.whopUserId);
                                        return (
                                            <tr key={u.whopUserId} className="group hover:bg-white/50 transition-all duration-300">
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-10 w-10 border-2 border-primary/10 shadow-sm">
                                                            <AvatarImage src={u.profilePicture} />
                                                            <AvatarFallback className="text-xs bg-secondary text-primary font-bold">
                                                                {u.name[0]}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-bold text-primary">{u.name}</span>
                                                            <span className="text-[10px] text-muted-foreground">@{u.username}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <Badge variant="outline" className={cn(
                                                        "text-[9px] uppercase tracking-widest px-2 py-0.5",
                                                        u.accessLevel === 'admin' ? "border-amber-200 text-amber-700 bg-amber-50" : "border-primary/20 text-primary/70"
                                                    )}>
                                                        {u.accessLevel === 'admin' ? <Shield size={10} className="mr-1" /> : <UserIcon size={10} className="mr-1" />}
                                                        {u.accessLevel === 'admin' ? "Admin" : "Member"}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-2">
                                                        <Briefcase className="w-3 h-3 text-muted-foreground" />
                                                        <span className="text-sm font-bold text-primary">{uStats.referralCount} Orders</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-2">
                                                        <DollarSign className="w-3 h-3 text-emerald-600" />
                                                        <span className="text-sm font-black text-emerald-600 tracking-tight">${uStats.referralRevenue.toFixed(2)}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 text-right">
                                                    <div className="flex flex-col items-end">
                                                        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase">
                                                            <Calendar size={10} />
                                                            {format(new Date(u.createdAt), "MMM yyyy")}
                                                        </div>
                                                        <span className="text-[9px] text-muted-foreground mt-1">ID: {u.whopUserId.slice(0, 8)}...</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
