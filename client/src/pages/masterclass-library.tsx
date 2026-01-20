import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useUser } from "@/context/UserContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlayCircle, Clock, BookOpen, ArrowRight, Loader2, Sparkles, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface Masterclass {
    id: string;
    title: string;
    type: string;
    duration: string;
    category: string;
    thumbnail: string;
    description: string;
}

export default function MasterclassLibrary() {
    const { user } = useUser();
    const [content, setContent] = useState<Masterclass[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const res = await fetch("/api/masterclasses");
                if (res.ok) {
                    setContent(await res.json());
                }
            } catch (err) {
                console.error("Failed to fetch masterclasses", err);
            } finally {
                setLoading(false);
            }
        };
        fetchContent();
    }, []);

    const filteredContent = content.filter(item =>
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.category.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="mt-4 text-primary font-serif">Brewing your library...</p>
            </div>
        );
    }

    return (
        <div className="space-y-12 pb-20 animate-in fade-in duration-700">
            {/* Header */}
            <div className="text-center max-w-3xl mx-auto space-y-4">
                <Badge variant="outline" className="border-primary/20 text-primary tracking-widest uppercase mb-2">
                    The Steep Circle
                </Badge>
                <h1 className="text-4xl md:text-6xl font-serif font-bold text-primary">Masterclass Library</h1>
                <p className="text-lg text-muted-foreground">
                    Deepen your knowledge of Caribbean herbalism through guided video lessons and ancestral archives.
                </p>
            </div>

            {/* Search & Filter */}
            <div className="max-w-xl mx-auto relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                    placeholder="Search by topic, ingredient or category..."
                    className="pl-12 h-14 rounded-2xl bg-white/50 border-white/40 shadow-soft focus-visible:ring-primary/20 text-lg"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredContent.map((item) => (
                    <Card key={item.id} className="group hover:shadow-2xl transition-all duration-500 border-none bg-white/40 backdrop-blur-md overflow-hidden flex flex-col h-full ring-1 ring-primary/5">
                        <div className="aspect-video relative overflow-hidden bg-secondary/10">
                            <div className="absolute inset-0 bg-primary/20 mix-blend-multiply opacity-0 group-hover:opacity-100 transition-opacity z-10" />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100 z-20">
                                {item.type === "Video Lesson" ? (
                                    <PlayCircle className="w-12 h-12 text-white drop-shadow-lg" />
                                ) : (
                                    <BookOpen className="w-12 h-12 text-white drop-shadow-lg" />
                                )}
                            </div>
                            <div className="absolute top-4 right-4 z-20">
                                <Badge className="bg-white/90 text-primary border-none shadow-sm backdrop-blur-sm">
                                    {item.type}
                                </Badge>
                            </div>
                            <div className="w-full h-full bg-gradient-to-br from-secondary/30 to-primary/10" />
                        </div>
                        <CardContent className="p-6 flex-grow flex flex-col">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-[10px] font-bold tracking-wider uppercase text-accent-foreground px-2 py-0.5 rounded-full bg-accent/20">
                                    {item.category}
                                </span>
                                <span className="text-[10px] text-muted-foreground flex items-center">
                                    <Clock className="w-3 h-3 mr-1" /> {item.duration}
                                </span>
                            </div>
                            <h3 className="font-serif text-2xl font-bold text-primary mb-3 group-hover:text-accent-foreground transition-colors">
                                {item.title}
                            </h3>
                            <p className="text-muted-foreground text-sm leading-relaxed mb-6 line-clamp-2">
                                {item.description}
                            </p>
                            <Link href={`/masterclass/${item.id}`} className="mt-auto">
                                <Button className="w-full bg-primary/5 text-primary hover:bg-primary hover:text-white transition-all border-none group/btn">
                                    {item.type === "Video Lesson" ? "Watch Lesson" : "Read Article"}
                                    <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {filteredContent.length === 0 && (
                <div className="text-center py-20 bg-white/30 rounded-3xl border-2 border-dashed border-primary/5">
                    <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                    <p className="text-muted-foreground text-lg italic">We couldn't find any content matching your search.</p>
                </div>
            )}
        </div>
    );
}
