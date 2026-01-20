import { useRoute } from "wouter";
import { useUser } from "@/context/UserContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, Flame, Leaf, Share2, Droplets } from "lucide-react";
import { Link } from "wouter";

// --- CONTENT DATABASE ---
// Mapped from PDF Extractions (Bush Tea Guide, Fire Cider, etc.)

interface RitualContent {
    title: string;
    subtitle: string;
    description: string;
    history: string;
    ingredients: string[];
    prep: {
        method: string;
        time: string;
        temp: string;
        steps: string[];
    };
    benefits: {
        title: string;
        desc: string;
    }[];
    image_prompt?: string;
}

const RITUALS: Record<string, RitualContent> = {
    // SLEEP
    sleep_classic: {
        title: "Deep Rest Infusion",
        subtitle: "The Island Lullaby",
        description: "A calming infusion designed to quiet the mind. In the Caribbean, 'tea' is often a cure-all, and this blend draws on the tradition of using aromatic leaves to settle the spirit before sleep.",
        history: "Inspired by the 'Island Calm' traditions, this blend utilizes soft florals. While traditional bush tea often uses heavy spices like Nutmeg for sleep, this lighter infusion is perfect for nightly use without over-sedation.",
        ingredients: ["Chamomile Flowers", "Valerian Root", "Lavender Buds"],
        prep: {
            method: "Infusion",
            time: "5-7 Minutes",
            temp: "200°F (Just below boiling)",
            steps: [
                "boil fresh water (avoid re-boiling as it loses oxygen).",
                "Pour water over 1 tablespoon of the blend in a covered vessel.",
                "Let it 'draw' (steep) for at least 5 minutes to release the volatile oils.",
                "Strain and sweeten lightly with raw honey if desired."
            ]
        },
        benefits: [
            { title: "Nervine Support", desc: "Calms the nervous system and reduces racing thoughts." },
            { title: "Muscle Relaxation", desc: "Valerian root acts as a natural muscle relaxant." }
        ]
    },
    sleep_island: {
        title: "Island Dreams Soursop",
        subtitle: "The Heavy Sleeper",
        description: "Soursop leaves (Graviola) are legendary in the Caribbean for their ability to induce a deep, heavy relaxation. This is a serious remedy for when rest feels impossible.",
        history: "Soursop leaves have been used for generations in the islands to soothe nerves and lower blood pressure. Elders often say a cup of soursop tea will make you 'sleep like a baby' through anything.",
        ingredients: ["Soursop Leaves (Graviola)", "Lemongrass"],
        prep: {
            method: "Infusion",
            time: "10 Minutes",
            temp: "212°F (Boiling)",
            steps: [
                "Crush the leaves slightly to release their potency.",
                "Pour boiling water over the leaves in a teapot or mug.",
                "Cover immediately! Retaining the steam is crucial.",
                "Let steep for a full 10 minutes before straining."
            ]
        },
        benefits: [
            { title: "Deep Sedation", desc: "Known to have a mild sedative effect for deep restorative sleep." },
            { title: "Nerve Tonic", desc: "Traditionally used to support the nervous system during high stress." }
        ]
    },

    // ENERGY
    energy_focus: {
        title: "Morning Focus Elixir",
        subtitle: "The Clean Awakening",
        description: "A sharp, awakening blend that provides focus without the jittery crash of coffee. Combines South American Yerba Mate with the brightness of citrus.",
        history: "While not native to the deep Caribbean, Yerba Mate is consumed globally for its unique 'matteine' energy. We've paired it with dried Caribbean citrus peels for an island twist on productivity.",
        ingredients: ["Yerba Mate", "Guayusa", "Dried Lemon Peel"],
        prep: {
            method: "Infusion",
            time: "4-5 Minutes",
            temp: "175°F (Not boiling)",
            steps: [
                "Use water that has boiled and cooled slightly (or stop the kettle early).",
                "Pour over the leaves. Too hot water can make Mate bitter.",
                "Steep for 4 minutes for energy, 5+ for extensive antioxidant release.",
                "Drink plain or with a slice of fresh lemon."
            ]
        },
        benefits: [
            { title: "Sustained Energy", desc: "Provides a steady release of caffeine without the spike and crash." },
            { title: "Mental Clarity", desc: "Guayusa is prized by Amazonian hunters for 'night watch' focus." }
        ]
    },
    energy_roots: {
        title: "Vitality Roots Tonic",
        subtitle: "The Stamina Builder",
        description: "A powerhouse decoction of roots. In Caribbean herbalism, 'roots' drinks are famous for building stamina, vitality, and male virility.",
        history: "Root tonics act as the 'backbone' of island wellness. Ingredients like Sarsparilla and Chainy Root are boiled for long periods to extract their mineral-rich essence, often served at street stalls as vitality boosters.",
        ingredients: ["Sarsparilla Root", "Ginger Rhizome", "Bissy (Cola Nut)"],
        prep: {
            method: "Decoction",
            time: "15-20 Minutes",
            temp: "Rolling Boil",
            steps: [
                "This is a 'hard' tea. You cannot just pour water over it.",
                "Place the roots in a pot with cold water.",
                "Bring to a boil and SIMMER (low boil) for 20 minutes.",
                "The liquid should turn dark and rich.",
                "Strain and sweeten with molasses or brown sugar for the traditional taste."
            ]
        },
        benefits: [
            { title: "Physical Stamina", desc: "Traditionally used to increase physical endurance and energy." },
            { title: "Circulation", desc: "Ginger moves the blood, warming the extremities and energizing the body." }
        ]
    },

    // DIGESTION
    digest_mint: {
        title: "Gut Harmony Tea",
        subtitle: "The After-Meal Soothe",
        description: "A classic, refreshing blend to settle the stomach. Peppermint is cooling, while Ginger provides a gentle warming action to move digestion along.",
        history: "Mint grows wild in many Caribbean gardens. Combining it with Ginger (a staple spice) creates a balanced hot/cold digestive aid used after heavy Sunday dinners.",
        ingredients: ["Peppermint Leaf", "Ginger Root", "Fennel Seeds"],
        prep: {
            method: "Infusion",
            time: "5 Minutes",
            temp: "212°F (Boiling)",
            steps: [
                "Boil fresh water.",
                "Pour over the blend.",
                "Cover tightly. The oils in mint are volatile and will escape in steam if uncovered.",
                "Steep for 5 minutes and sip slowly."
            ]
        },
        benefits: [
            { title: "Bloating Relief", desc: "Peppermint relaxes the muscles of the digestive tract." },
            { title: "Carminative", desc: "Fennel helps prevent the formation of gas." }
        ]
    },
    digest_detox: {
        title: "Bitter Detox (Cerassee)",
        subtitle: "The System Reset",
        description: "WARNING: This is BITTER. Cerassee (Bitter Melon) is the most famous Caribbean 'wash out'. It is not drunk for flavor; it is drunk for health.",
        history: "Every Caribbean child knows the dread of a cup of Cerassee. Traditionally used as a blood purifier and sugar balancer, it is the ultimate 'reset' button for the body.",
        ingredients: ["Cerassee Leaves & Vines (Momordica charantia)"],
        prep: {
            method: "Infusion (Strong)",
            time: "5-10 Minutes",
            temp: "212°F (Boiling)",
            steps: [
                "Pour boiling water over the herb.",
                "Steep for 5 minutes for a mild detox, 10+ for the full experience.",
                "Do not sweeten. The bitterness is the medicine (it stimulates liver bile).",
                "Drink quickly while warm."
            ]
        },
        benefits: [
            { title: "Blood Purifier", desc: "Traditionally used to cleanse the blood and skin." },
            { title: "Sugar Balance", desc: "Studied for its ability to support healthy blood sugar levels." }
        ]
    },

    // IMMUNITY
    immunity_berry: {
        title: "Defense Shield Brew",
        subtitle: "The Vitamin C Bomb",
        description: "A tart, fruity blend packed with antioxidants. Rosehips and Hibiscus (Sorrel) provide a massive dose of Vitamin C for immune support.",
        history: "Sorrel is the Christmas drink of the Caribbean, but its health benefits apply year-round. Rich in anthocyanins (like blueberries), it's a delicious way to fight off colds.",
        ingredients: ["Elderberry", "Echinacea", "Rosehips", "Hibiscus"],
        prep: {
            method: "Decoction (Light)",
            time: "10-15 Minutes",
            temp: "Simmer",
            steps: [
                "Berries are harder than leaves. Simmer them gently in water for 10 minutes.",
                "Turn off heat and add any softer flower petals (Hibiscus) to steep for 5 more minutes.",
                "Strain and pressing the berries to extract the juice.",
                "Delicious hot or iced."
            ]
        },
        benefits: [
            { title: "Immune Defense", desc: "Elderberry is world-renowned for viral defense." },
            { title: "Antioxidant Rich", desc: "Protect cells from oxidative stress and inflammation." }
        ]
    },
    immunity_bush: {
        title: "Bush Doctor (Guinea Hen)",
        subtitle: "The Deep Defender",
        description: "Guinea Hen Weed (Anamu). A pungent, powerful herb with a garlic-like aroma. This is heavy artillery for deep immune support.",
        history: "Known as 'Anamu' in Spanish-speaking islands and Guinea Hen Weed in Jamaica. It has a long history of use for cellular health and deep immune challenges. It is strong medicine.",
        ingredients: ["Guinea Hen Weed (Anamu)", "Turmeric Root"],
        prep: {
            method: "Infusion",
            time: "10-15 Minutes",
            temp: "212°F (Boiling)",
            steps: [
                "Pour boiling water over the dried herb.",
                "Steep for at least 10 minutes.",
                "The aroma is strong; this is normal.",
                "Drink 1 cup daily for immune support."
            ]
        },
        benefits: [
            { title: "Cellular Health", desc: "Studied for its profound effects on cellular integrity and immunity." },
            { title: "Anti-Inflammatory", desc: "Turmeric adds a layer of systemic inflammation support." }
        ]
    },

    // STRESS
    stress_calm: {
        title: "Calm Mind Infusion",
        subtitle: "The Adaptogen Blend",
        description: "Adaptogenic herbs help your body 'adapt' to stress. Ashwagandha and Tulsi (Holy Basil) work to lower cortisol and center the mind.",
        history: "While these herbs hail from Ayurveda, they have been adopted globally. We blend them with Caribbean spices to ground the earthy flavor.",
        ingredients: ["Ashwagandha Root", "Holy Basil (Tulsi)", "Cinnamon"],
        prep: {
            method: "Simummer & Steep",
            time: "10 Minutes",
            temp: "Simmer -> Steep",
            steps: [
                "Simmer the Ashwagandha (root) and Cinnamon for 5 minutes.",
                "Turn off heat, add the Tulsi (leaf).",
                "Cover and steep for another 5 minutes.",
                "Strain and breathe in the aromatic steam before sipping."
            ]
        },
        benefits: [
            { title: "Cortisol Management", desc: "Helps the body regulate its response to stress hormones." },
            { title: "Mental Balance", desc: "Promotes a feeling of centered calm without drowsiness." }
        ]
    },
    stress_nerves: {
        title: "Blue Vervain Nerve Tonic",
        subtitle: "The Tension Breaker",
        description: "Blue Vervain is the ultimate 'nervine'. It specifically targets tension held in the neck and shoulders. Perfect for the 'wired but tired' type.",
        history: "A revered herb in Jamaica. It is often drank as a tea to 'cool' the nerves and release built-up tension from a hard day's work.",
        ingredients: ["Blue Vervain", "Skullcap"],
        prep: {
            method: "Infusion",
            time: "5-10 Minutes",
            temp: "212°F (Boiling)",
            steps: [
                "Pour boiling water over the herb.",
                "Steep for 5-10 minutes.",
                "Note: Blue Vervain is naturally bitter. This indicates its potency.",
                "Sweeten with honey if needed to mask the bitterness."
            ]
        },
        benefits: [
            { title: "Muscle Tension", desc: "Specifically targets tension in the neck, shoulders, and jaw." },
            { title: "Nervous System", desc: "Restores frayed nerves and helps recover from burnout." }
        ]
    }
};

export default function RitualGuide() {
    const [match, params] = useRoute("/ritual/:id");
    const { user } = useUser();
    const id = match ? params?.id : null;
    const content = id ? RITUALS[id as keyof typeof RITUALS] : null;

    if (!content) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
                <h2 className="text-2xl font-serif text-primary mb-4">Ritual Not Found</h2>
                <p className="text-muted-foreground mb-6">We couldn't find the guide you're looking for.</p>
                <Link href="/">
                    <Button variant="outline">Return Home</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto pb-20 animate-in fade-in duration-700">
            {/* Navigation */}
            <div className="mb-8 pt-4">
                <Link href="/dashboard">
                    <Button variant="ghost" className="pl-0 hover:pl-2 transition-all text-muted-foreground">
                        <ArrowLeft className="mr-2 w-4 h-4" /> Back to Sanctuary
                    </Button>
                </Link>
            </div>

            {/* Hero Header */}
            <div className="text-center space-y-4 mb-16">
                <Badge variant="outline" className="border-primary/20 text-primary/80 tracking-widest uppercase mb-4">
                    Unlocked Ritual Guide
                </Badge>
                <h1 className="text-4xl md:text-6xl font-serif font-bold text-primary">{content.title}</h1>
                <p className="text-xl text-primary/60 font-serif italic">{content.subtitle}</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 md:gap-12">
                {/* Left Column: Prep & Ingredients */}
                <div className="space-y-8 md:col-span-1">
                    <Card className="bg-secondary/20 border-none shadow-sm">
                        <CardContent className="p-6 space-y-6">
                            <div>
                                <h3 className="text-sm font-bold uppercase tracking-wider text-primary mb-3 flex items-center">
                                    <Leaf className="w-4 h-4 mr-2" /> Ingredients
                                </h3>
                                <ul className="space-y-2 text-sm text-foreground/80">
                                    {content.ingredients.map((ing, i) => (
                                        <li key={i} className="flex items-start">
                                            <span className="mr-2">•</span> {ing}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="border-t border-primary/10 pt-6">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-primary mb-3 flex items-center">
                                    <Flame className="w-4 h-4 mr-2" /> Preparation
                                </h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Method</span>
                                        <span className="font-medium">{content.prep.method}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Temp</span>
                                        <span className="font-medium">{content.prep.temp}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Time</span>
                                        <span className="font-medium">{content.prep.time}</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Button variant="outline" className="w-full border-primary/20 text-primary hover:bg-primary/5">
                        <Share2 className="mr-2 w-4 h-4" /> Share This Ritual
                    </Button>
                </div>

                {/* Right Column: The Knowledge */}
                <div className="md:col-span-2 space-y-12">

                    {/* Introduction */}
                    <section>
                        <p className="text-lg leading-relaxed text-muted-foreground first-letter:text-5xl first-letter:font-serif first-letter:text-primary first-letter:mr-3 first-letter:float-left">
                            {content.description}
                        </p>
                    </section>

                    {/* History / Lore */}
                    <section className="bg-white rounded-2xl p-8 shadow-sm border border-border/40 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5">
                            <Leaf className="w-32 h-32" />
                        </div>
                        <h3 className="text-2xl font-serif text-primary mb-4">Roots & Origins</h3>
                        <p className="text-muted-foreground leading-relaxed">
                            {content.history}
                        </p>
                    </section>

                    {/* Steps */}
                    <section>
                        <h3 className="text-2xl font-serif text-primary mb-6 flex items-center">
                            <Droplets className="w-6 h-6 mr-3 text-primary/60" />
                            The Brewing Ritual
                        </h3>
                        <div className="space-y-6">
                            {content.prep.steps.map((step, i) => (
                                <div key={i} className="flex gap-4">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center font-serif font-bold">
                                        {i + 1}
                                    </div>
                                    <p className="text-foreground/80 pt-1 leading-relaxed">{step}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Benefits */}
                    <section>
                        <h3 className="text-2xl font-serif text-primary mb-6">Wellness Benefits</h3>
                        <div className="grid sm:grid-cols-2 gap-4">
                            {content.benefits.map((benefit, i) => (
                                <Card key={i} className="border-primary/10 bg-gradient-to-br from-white to-secondary/30">
                                    <CardContent className="p-6">
                                        <h4 className="font-bold text-primary mb-2">{benefit.title}</h4>
                                        <p className="text-sm text-muted-foreground">{benefit.desc}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </section>

                </div>
            </div>
        </div>
    );
}
