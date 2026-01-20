import { useState, useEffect } from "react";
import { useRoute, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, PlayCircle, BookOpen, Share2, Heart, Loader2 } from "lucide-react";
import ReactMarkdown from 'react-markdown';

interface Masterclass {
    id: string;
    title: string;
    type: string;
    duration: string;
    category: string;
    videoUrl?: string;
    description: string;
    content: string;
}

export default function MasterclassView() {
    const [, params] = useRoute("/masterclass/:id");
    const id = params?.id;
    const [item, setItem] = useState<Masterclass | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchItem = async () => {
            if (!id) return;
            try {
                const res = await fetch(`/api/masterclasses/${id}`);
                if (res.ok) {
                    setItem(await res.json());
                }
            } catch (err) {
                console.error("Failed to fetch masterclass", err);
            } finally {
                setLoading(false);
            }
        };
        fetchItem();
    }, [id]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!item) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-serif text-primary">Content Not Found</h2>
                <Link href="/masterclasses">
                    <Button variant="link" className="mt-4">Return to Library</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto pb-20 animate-in fade-in duration-700">
            {/* Header */}
            <div className="mb-8 pt-4 flex items-center justify-between">
                <Link href="/masterclasses">
                    <Button variant="ghost" className="pl-0 hover:pl-2 transition-all text-muted-foreground">
                        <ArrowLeft className="mr-2 w-4 h-4" /> Back to Library
                    </Button>
                </Link>
                <div className="flex gap-2">
                    <Button variant="outline" size="icon" className="rounded-full border-primary/10 hover:bg-primary/5">
                        <Heart className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="icon" className="rounded-full border-primary/10 hover:bg-primary/5">
                        <Share2 className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            <div className="space-y-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Badge className="bg-accent/20 text-accent-foreground border-none px-3 py-1">
                            {item.category}
                        </Badge>
                        <span className="text-xs text-muted-foreground flex items-center">
                            <Clock className="w-3 h-3 mr-1" /> {item.duration}
                        </span>
                        <Badge variant="outline" className="border-primary/20 text-primary">
                            {item.type}
                        </Badge>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-serif font-bold text-primary leading-tight">
                        {item.title}
                    </h1>
                    <p className="text-xl text-muted-foreground font-light leading-relaxed">
                        {item.description}
                    </p>
                </div>

                {/* Media Section */}
                {item.type === "Video Lesson" && item.videoUrl ? (
                    <div className="aspect-video w-full rounded-3xl overflow-hidden bg-black shadow-2xl relative group">
                        <iframe
                            src={item.videoUrl}
                            title={item.title}
                            className="w-full h-full border-none"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    </div>
                ) : (
                    <div className="w-full h-64 rounded-3xl bg-gradient-to-br from-secondary/30 to-primary/10 flex items-center justify-center">
                        <BookOpen className="w-16 h-16 text-primary opacity-20" />
                    </div>
                )}

                {/* Content Body */}
                <div className="prose prose-stone lg:prose-xl max-w-none pt-8 border-t border-primary/5">
                    <div className="font-sans text-foreground leading-relaxed space-y-6">
                        <ReactMarkdown
                            components={{
                                h1: ({ node, ...props }) => <h1 className="font-serif text-3xl font-bold text-primary mt-8 mb-4" {...props} />,
                                h2: ({ node, ...props }) => <h2 className="font-serif text-2xl font-bold text-primary mt-8 mb-4 border-l-4 border-accent pl-4" {...props} />,
                                h3: ({ node, ...props }) => <h3 className="font-sans text-xl font-bold text-primary mt-6 mb-2" {...props} />,
                                ul: ({ node, ...props }) => <ul className="list-disc pl-6 space-y-2 mb-4" {...props} />,
                                p: ({ node, ...props }) => <p className="mb-4 text-muted-foreground" {...props} />,
                            }}
                        >
                            {item.content}
                        </ReactMarkdown>
                    </div>
                </div>

                {/* Next Steps Card */}
                <Card className="mt-16 bg-primary/5 border-none p-8 rounded-3xl">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center shadow-soft">
                                <PlayCircle className="w-8 h-8 text-primary" />
                            </div>
                            <div>
                                <h4 className="font-serif text-xl font-bold text-primary">Ready for more?</h4>
                                <p className="text-muted-foreground text-sm">Continue your journey in the Masterclass Library.</p>
                            </div>
                        </div>
                        <Link href="/masterclasses">
                            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl px-8 h-12 shadow-lg">
                                Explore Library
                            </Button>
                        </Link>
                    </div>
                </Card>
            </div>
        </div>
    );
}
