import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Download, DollarSign, TrendingUp, Users, ExternalLink, FileText, Sparkles, Megaphone } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import hibiscusImage from "@assets/generated_images/hibiscus_tea_blend.png";

const data = [
  { name: "Jan", total: 150 },
  { name: "Feb", total: 230 },
  { name: "Mar", total: 180 },
  { name: "Apr", total: 290 },
  { name: "May", total: 340 },
  { name: "Jun", total: 410 },
];

export default function Affiliate() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-serif font-bold text-primary">Affiliate Hub</h1>
          <p className="text-muted-foreground">Track your impact and access growth tools.</p>
        </div>
        <Button className="bg-primary text-primary-foreground shadow-lg hover:bg-primary/90">
          <DollarSign className="mr-2 w-4 h-4" /> Payout Request
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white/80 backdrop-blur-sm border-white/50 shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-serif font-bold text-primary">$1,245.00</div>
            <p className="text-xs text-muted-foreground mt-1">+20.1% from last month</p>
          </CardContent>
        </Card>
        <Card className="bg-white/80 backdrop-blur-sm border-white/50 shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Clicks</CardTitle>
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-serif font-bold text-primary">+2,350</div>
            <p className="text-xs text-muted-foreground mt-1">+180.1% from last month</p>
          </CardContent>
        </Card>
        <Card className="bg-white/80 backdrop-blur-sm border-white/50 shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Conversions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-serif font-bold text-primary">45</div>
            <p className="text-xs text-muted-foreground mt-1">+19% from last month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart */}
        <Card className="lg:col-span-2 bg-white/80 backdrop-blur-sm border-white/50 shadow-soft">
          <CardHeader>
            <CardTitle className="font-serif text-xl">Revenue Overview</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                  <Tooltip 
                    cursor={{fill: 'rgba(0,0,0,0.05)'}}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="total" fill="hsl(150, 30%, 35%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Tools & Links */}
        <div className="space-y-6">
          <Card className="bg-white/80 backdrop-blur-sm border-white/50 shadow-soft">
            <CardHeader>
              <CardTitle className="font-serif text-xl">Your Unique Link</CardTitle>
              <CardDescription>Share this to earn commissions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <code className="flex-1 p-2 bg-secondary/30 rounded border border-secondary text-sm font-mono truncate">
                  herbalroots.com/ref/sarah
                </code>
                <Button size="icon" variant="outline" className="shrink-0">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <Button className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-sm">
                Generate Custom Link
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-white/50 shadow-soft">
             <CardHeader className="pb-2">
              <CardTitle className="font-serif text-xl flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-accent-foreground" />
                Growth Tools
              </CardTitle>
              <CardDescription>Bespoke assets for your brand</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-primary/5 border border-primary/10 rounded-xl space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    <Megaphone size={18} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-primary">Marketing Planner</p>
                    <p className="text-xs text-muted-foreground">1-Month Roadmap Template</p>
                  </div>
                </div>
                <Button size="sm" variant="secondary" className="w-full text-xs h-8">
                  <Download className="mr-2 h-3 w-3" /> Download Workbook
                </Button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-4 p-3 bg-white/50 rounded-xl border border-white/40 hover:bg-white/80 transition-colors cursor-pointer group">
                  <img src={hibiscusImage} className="w-12 h-12 rounded-lg object-cover" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Summer Story Kit</p>
                    <p className="text-xs text-muted-foreground">Instagram • 1080x1920</p>
                  </div>
                  <Download className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>

                <div className="flex items-center gap-4 p-3 bg-white/50 rounded-xl border border-white/40 hover:bg-white/80 transition-colors cursor-pointer group">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                    <FileText size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Email Swipe File</p>
                    <p className="text-xs text-muted-foreground">Conversion Templates</p>
                  </div>
                  <Download className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
