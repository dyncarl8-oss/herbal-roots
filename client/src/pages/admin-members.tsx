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
    User as UserIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";

interface User {
    whopUserId: string;
    username: string;
    name: string;
    profilePicture?: string;
    accessLevel: string;
    createdAt: string;
    balance?: number;
}

export default function AdminMembers() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    const fetchUsers = async () => {
        try {
            const res = await fetch("/api/admin/users");
            if (res.ok) {
                setUsers(await res.json());
            }
        } catch (err) {
            console.error("Failed to fetch users", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.whopUserId.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="w-12 h-12 animate-spin text-primary opacity-50" />
                <p className="mt-4 text-primary font-serif italic">Auditing the Herbalists...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-serif font-bold text-primary">Member Audit</h1>
                    <p className="text-muted-foreground italic">Comprehensive overview of the Herbal Roots community.</p>
                </div>
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                        placeholder="Search by name or ID..."
                        className="pl-10 h-10 rounded-full bg-white/50 border-white/20"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Directory Board */}
            <Card className="bg-white/40 backdrop-blur-xl border-none shadow-soft overflow-hidden">
                <CardHeader className="border-b border-primary/5 bg-white/20">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Users className="text-primary w-5 h-5" />
                            <CardTitle className="font-serif text-xl">Herbalist Directory</CardTitle>
                        </div>
                        <div className="flex gap-2">
                            <Badge variant="outline" className="text-[10px] uppercase tracking-tighter border-primary/20">
                                {users.filter(u => u.accessLevel === 'admin').length} Admins
                            </Badge>
                            <Badge variant="secondary" className="bg-primary/10 text-primary border-none text-[10px] uppercase tracking-tighter">
                                {users.filter(u => u.accessLevel === 'customer').length} Members
                            </Badge>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-primary/5 text-left text-[10px] uppercase tracking-widest text-muted-foreground bg-primary/5">
                                    <th className="px-6 py-4 font-bold">Profile</th>
                                    <th className="px-6 py-4 font-bold">Role</th>
                                    <th className="px-6 py-4 font-bold">Whop ID</th>
                                    <th className="px-6 py-4 font-bold">Member Since</th>
                                    <th className="px-6 py-4 font-bold text-right">Activity</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-primary/5">
                                {filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground italic opacity-50">
                                            No members matching your search.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredUsers.map((u) => (
                                        <tr key={u.whopUserId} className="group hover:bg-white/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-10 w-10 border-2 border-primary/10">
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
                                            <td className="px-6 py-4">
                                                <Badge variant="outline" className={cn(
                                                    "text-[9px] uppercase tracking-widest",
                                                    u.accessLevel === 'admin' ? "border-amber-200 text-amber-700 bg-amber-50" : "border-primary/20 text-primary/70"
                                                )}>
                                                    {u.accessLevel === 'admin' ? <Shield size={10} className="mr-1" /> : <UserIcon size={10} className="mr-1" />}
                                                    {u.accessLevel === 'admin' ? "Admin" : "Member"}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4">
                                                <code className="text-[10px] bg-primary/5 px-2 py-1 rounded text-primary/60">{u.whopUserId}</code>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                    <Calendar size={12} />
                                                    {format(new Date(u.createdAt), "MMM dd, yyyy")}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex flex-col items-end">
                                                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-tighter">
                                                        ${u.balance?.toFixed(2) || "0.00"} Balance
                                                    </span>
                                                    <span className="text-[9px] text-muted-foreground">Last Seen 3 hours ago</span>
                                                </div>
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

// Helper to handle conditional styles
function cn(...classes: any[]) {
    return classes.filter(Boolean).join(' ');
}
