import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Lock, Play, FileText, Calendar, MessageCircle, Heart, Share2, BookOpen, ShieldCheck } from "lucide-react";
import headerImage from "@assets/generated_images/serene_caribbean_ocean_header.png";

export default function Community() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Community Header */}
      <div className="relative rounded-3xl overflow-hidden h-[300px] shadow-soft flex items-end">
        <img 
          src={headerImage} 
          alt="Community Header" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/40 to-transparent" />
        
        <div className="relative z-10 p-8 w-full flex flex-col md:flex-row justify-between items-end gap-6">
          <div className="space-y-2">
            <Badge className="bg-accent text-accent-foreground border-none hover:bg-accent/80 mb-2">Member Access Only</Badge>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-white">The Steep Circle</h1>
            <p className="text-white/80 max-w-xl">
              Your sanctuary for wellness education, live rituals, and community connection.
            </p>
          </div>
          <div className="w-full md:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/60" />
              <Input 
                placeholder="Search masterclasses..." 
                className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60 focus-visible:ring-white/30 backdrop-blur-sm w-full md:w-[300px] rounded-xl"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Feed */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-serif font-bold text-primary">Member Resources</h2>
             <div className="flex gap-2">
               <Button variant="outline" size="sm" className="rounded-full">All</Button>
               <Button variant="ghost" size="sm" className="rounded-full text-muted-foreground">Video</Button>
               <Button variant="ghost" size="sm" className="rounded-full text-muted-foreground">Guides</Button>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-white/80 backdrop-blur-sm border-white/50 shadow-sm hover:shadow-md transition-all group cursor-pointer overflow-hidden">
              <CardContent className="p-0">
                <div className="p-6 space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <BookOpen size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-serif font-bold">Island Apothecary Guide</h3>
                    <p className="text-sm text-muted-foreground mt-1">Bush tea traditions & immune boosting tisanes.</p>
                  </div>
                  <Button variant="secondary" size="sm" className="w-full">Open Guide</Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-white/50 shadow-sm hover:shadow-md transition-all group cursor-pointer overflow-hidden">
              <CardContent className="p-0">
                <div className="p-6 space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center text-accent-foreground group-hover:scale-110 transition-transform">
                    <ShieldCheck size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-serif font-bold">The Healer's Toolkit</h3>
                    <p className="text-sm text-muted-foreground mt-1">Rapid response checklist for wellness rituals.</p>
                  </div>
                  <Button variant="secondary" size="sm" className="w-full">View Checklist</Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-white/80 backdrop-blur-sm border-white/50 shadow-sm hover:shadow-md transition-all overflow-hidden">
            <div className="aspect-video bg-gray-100 relative group cursor-pointer">
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition-colors">
                <div className="w-16 h-16 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center text-white border border-white/40 shadow-xl group-hover:scale-110 transition-transform">
                  <Play size={32} fill="currentColor" />
                </div>
              </div>
              <div className="w-full h-full bg-neutral-200" />
            </div>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="secondary" className="rounded-full">Masterclass</Badge>
                <span className="text-xs text-muted-foreground">2 days ago</span>
              </div>
              <h3 className="text-2xl font-serif font-bold text-foreground mb-2">The Art of Cold Brewing Herbs</h3>
              <p className="text-muted-foreground mb-4 line-clamp-2">
                Learn the gentle method of extracting delicate flavors and nutrients using cold water and time. Perfect for hibiscus and mint blends.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-6">
          <Card className="bg-primary text-primary-foreground border-none shadow-lg">
            <CardHeader>
              <CardTitle className="font-serif text-xl flex items-center gap-2">
                <Calendar className="h-5 w-5 opacity-80" />
                Upcoming Live
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/10">
                <span className="text-xs font-medium bg-accent text-accent-foreground px-2 py-0.5 rounded mb-2 inline-block">Tomorrow, 10:00 AM</span>
                <h4 className="font-bold text-lg mb-1">New Moon Tea Ceremony</h4>
                <p className="text-sm text-white/80 mb-3">Guided meditation and brewing session.</p>
                <Button size="sm" className="w-full bg-white text-primary hover:bg-white/90 border-none">RSVP Now</Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/60 backdrop-blur-md border-white/40">
            <CardHeader>
              <CardTitle className="font-serif text-xl">Member Vault</CardTitle>
              <CardDescription>E-Commerce & Branding</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/40 transition-colors cursor-pointer group">
                <FileText size={18} className="text-primary" />
                <span className="text-sm font-medium flex-1">Brand Foundation Workbook</span>
                <Lock size={14} className="text-muted-foreground" />
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/40 transition-colors cursor-pointer group">
                <FileText size={18} className="text-primary" />
                <span className="text-sm font-medium flex-1">E-Commerce Essentials SME</span>
                <Lock size={14} className="text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
