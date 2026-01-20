import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  Stethoscope,
  Users,
  DollarSign,
  Leaf,
  Menu,
  Loader2,
  ShieldCheck,
  ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import backgroundTexture from "@assets/generated_images/caribbean_herbal_background_texture.png";
import { useUser } from "@/context/UserContext";

// Helper to get user initials for avatar fallback
function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// Helper to get role display text
function getRoleLabel(accessLevel: string): string {
  switch (accessLevel) {
    case 'admin':
      return 'Admin';
    case 'customer':
      return 'Member';
    default:
      return 'Guest';
  }
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { user, loading } = useUser();
  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);
  const [hasCheckedInitialRedirect, setHasCheckedInitialRedirect] = useState(false);

  // Sync isAdminMode carefully on first load
  useEffect(() => {
    if (!loading && user?.accessLevel === 'admin' && !hasCheckedInitialRedirect) {
      setIsAdminMode(true);
      // Auto-redirect to admin if landing at root for the first time
      if (location === "/") {
        setLocation("/admin");
      }
      setHasCheckedInitialRedirect(true);
    }
  }, [user, loading, location, setLocation, hasCheckedInitialRedirect]);

  const memberNavItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/symptom-tool", label: "Symptom Tool", icon: Stethoscope },
    { href: "/community", label: "The Steep Circle", icon: Users },
    { href: "/affiliate", label: "Affiliate Hub", icon: DollarSign },
  ];

  const adminNavItems = [
    { href: "/admin", label: "Admin Dashboard", icon: ShieldCheck },
    { href: "/admin/moderation", label: "Moderation", icon: Users },
    { href: "/admin/members", label: "Audit & Sales", icon: DollarSign },
  ];

  const navItems = isAdminMode ? adminNavItems : memberNavItems;

  const handleToggleMode = () => {
    const nextMode = !isAdminMode;
    setIsAdminMode(nextMode);

    // Proactive navigation
    if (nextMode) {
      setLocation("/admin");
    } else {
      setLocation("/");
    }
  };

  // User profile component for sidebar and mobile
  const UserProfile = ({ compact = false }: { compact?: boolean }) => {
    if (loading) {
      return (
        <div className={cn(
          "flex items-center gap-3 p-2 rounded-xl bg-white/30 backdrop-blur-sm border border-white/20 shadow-sm",
          compact && "p-1"
        )}>
          <div className={cn(
            "rounded-full bg-muted animate-pulse",
            compact ? "h-8 w-8" : "h-10 w-10"
          )} />
          {!compact && (
            <div className="flex-1 min-w-0 space-y-1">
              <div className="h-4 w-24 bg-muted animate-pulse rounded" />
              <div className="h-3 w-16 bg-muted animate-pulse rounded" />
            </div>
          )}
        </div>
      );
    }

    if (!user) {
      return (
        <div className={cn(
          "flex items-center gap-3 p-2 rounded-xl bg-white/30 backdrop-blur-sm border border-white/20 shadow-sm",
          compact && "p-1"
        )}>
          <Avatar className={cn("border-2 border-primary/10", compact ? "h-8 w-8" : "h-10 w-10")}>
            <AvatarFallback>?</AvatarFallback>
          </Avatar>
          {!compact && (
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-bold text-foreground truncate">Guest</p>
              <p className="text-xs text-muted-foreground truncate">Not signed in</p>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className={cn(
        "p-2 rounded-xl bg-white/30 backdrop-blur-sm border border-white/20 shadow-sm group",
        compact && "p-1"
      )}>
        <div className="flex items-center gap-3">
          <Avatar className={cn("border-2 border-primary/10", compact ? "h-8 w-8" : "h-10 w-10")}>
            <AvatarImage src={user.profilePicture} alt={user.name} />
            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
          </Avatar>
          {!compact && (
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-bold text-foreground truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{getRoleLabel(user.accessLevel)}</p>
            </div>
          )}
        </div>

        {user.accessLevel === 'admin' && !compact && (
          <div className="mt-3 pt-3 border-t border-primary/5 flex flex-col gap-1">
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "w-full justify-start gap-2 h-9 rounded-lg transition-all",
                "bg-transparent border-primary/10 text-primary hover:bg-primary/5 shadow-none"
              )}
              onClick={handleToggleMode}
            >
              <ShieldCheck size={14} className={isAdminMode ? "animate-pulse" : ""} />
              <span className="text-[10px] font-bold uppercase tracking-wider">
                {isAdminMode ? "Act as Member" : "Back to Admin"}
              </span>
            </Button>
          </div>
        )}
      </div>
    );
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-border/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
            <Leaf size={20} />
          </div>
          <span className="font-serif text-xl font-bold tracking-tight text-primary">
            Herbal Roots
          </span>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group cursor-pointer",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:bg-white/50 hover:text-foreground hover:shadow-sm"
                )}
                onClick={() => setIsMobileOpen(false)}
              >
                <item.icon size={18} className={cn(isActive ? "text-primary-foreground" : "text-primary/70 group-hover:text-primary")} />
                <span className="font-medium">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border/40">
        <UserProfile />
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <Loader2 className="w-12 h-12 animate-spin text-primary/50" />
        <p className="mt-4 text-primary/60 font-serif italic tracking-wide">Aligning your portal...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden font-sans text-foreground">
      {/* Background Texture Overlay */}
      <div
        className="fixed inset-0 opacity-40 pointer-events-none z-0 mix-blend-multiply"
        style={{
          backgroundImage: `url(${backgroundTexture})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />

      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 hidden md:flex flex-col bg-white/40 backdrop-blur-xl border-r border-white/20 z-10 shadow-soft">
        <SidebarContent />
      </aside>

      {/* Mobile Navigation */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-white/20 z-20 flex items-center px-4 justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
            <Leaf size={16} />
          </div>
          <span className="font-serif text-lg font-bold text-primary">Herbal Roots</span>
        </div>

        <div className="flex items-center gap-2">
          <UserProfile compact />
          <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu size={24} />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 bg-white/95 backdrop-blur-xl w-72">
              <SidebarContent />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Main Content */}
      <main className="relative z-0 md:ml-64 min-h-screen pt-16 md:pt-0 transition-all duration-300">
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
          {/* Prevent flashing member content for admins who should be/are being redirected */}
          {(user?.accessLevel === 'admin' && location === "/" && isAdminMode) ? (
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center space-y-4">
                <Loader2 className="w-10 h-10 animate-spin text-primary opacity-30 mx-auto" />
                <p className="text-primary/40 font-serif italic text-sm">Entering Admin Dashboard...</p>
              </div>
            </div>
          ) : (
            children
          )}
        </div>
      </main>
    </div>
  );
}

