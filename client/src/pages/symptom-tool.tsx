import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Check, ArrowRight, RefreshCw, ShoppingBag, Share2, Loader2, Heart, Leaf } from "lucide-react";
import chamomileImage from "@assets/generated_images/chamomile_lavender_tea_blend.png";
import hibiscusImage from "@assets/generated_images/hibiscus_tea_blend.png";
import { WhopCheckoutEmbed } from "@whop/checkout/react";
import { useUser } from "@/context/UserContext";
import { useToast } from "@/hooks/use-toast";

// --- Mock Product Database ---
interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  benefits: string[];
  tags: {
    goal: string[];
    flavor: string[];
    caffeine: "none" | "low" | "high";
  };
  specs: {
    origin: string;
    servings: number;
  };
}

const PRODUCTS: Product[] = [
  // SLEEP
  {
    id: "sleep_classic",
    name: "Deep Rest Blend",
    price: 28.00,
    description: "A calming infusion of chamomile, valerian root, and lavender designed to quiet the mind and prepare the body for restorative sleep.",
    image: chamomileImage,
    benefits: ["Promotes Deep Sleep", "Reduces Anxiety", "Relaxes Muscles"],
    tags: { goal: ["sleep", "stress"], flavor: ["floral"], caffeine: "none" },
    specs: { origin: "Global Organic", servings: 25 }
  },
  {
    id: "sleep_island",
    name: "Island Dreams Soursop",
    price: 35.00,
    description: "A traditional Caribbean remedy using Soursop leaves (Graviola) to soothe nerves and induce a heavy, peaceful sleep.",
    image: chamomileImage,
    benefits: ["Nerve Tonic", "Deep Relaxation", "Tropical Traditions"],
    tags: { goal: ["sleep", "stress"], flavor: ["earthy", "fruity"], caffeine: "none" },
    specs: { origin: "St. Lucia", servings: 20 }
  },

  // ENERGY
  {
    id: "energy_focus",
    name: "Morning Focus Elixir",
    price: 32.00,
    description: "An awakening blend of yerba mate, guayusa, and lemon peel. Provides sustained energy without the jitters or crash of coffee.",
    image: hibiscusImage,
    benefits: ["Boosts Focus", "Sustained Energy", "No Jitters"],
    tags: { goal: ["energy"], flavor: ["earthy", "fruity"], caffeine: "high" },
    specs: { origin: "Brazil / Peru", servings: 30 }
  },
  {
    id: "energy_roots",
    name: "Vitality Roots Tonic",
    price: 38.00,
    description: "A powerhouse of Sarsparilla, Ginger, and Bissy (Cola Nut). This earthy blend is a traditional Caribbean stamina builder.",
    image: hibiscusImage,
    benefits: ["Stamina", "Circulation", "Natural Virility"],
    tags: { goal: ["energy"], flavor: ["earthy", "spicy"], caffeine: "low" },
    specs: { origin: "Jamaica", servings: 25 }
  },

  // DIGESTION
  {
    id: "digest_mint",
    name: "Gut Harmony Tea",
    price: 26.00,
    description: "Soothing peppermint, ginger, and fennel seeds work together to calm bloating and support healthy digestion after meals.",
    image: chamomileImage,
    benefits: ["Soothes Bloating", "Aids Digestion", "Fresh Breath"],
    tags: { goal: ["digest"], flavor: ["minty"], caffeine: "none" },
    specs: { origin: "Egypt", servings: 20 }
  },
  {
    id: "digest_detox",
    name: "Bitter Detox (Cerassee)",
    price: 30.00,
    description: "Authentication Cerassee (Bitter Melon) tea. A potent, bitter cleanser used for generations to reset the gut and purify the blood.",
    image: chamomileImage,
    benefits: ["Gut Reset", "Blood Purification", "Sugar Balance"],
    tags: { goal: ["digest", "immunity"], flavor: ["earthy", "bitter"], caffeine: "none" },
    specs: { origin: "Jamaica", servings: 15 }
  },

  // IMMUNITY
  {
    id: "immunity_berry",
    name: "Defense Shield Brew",
    price: 30.00,
    description: "A potent mix of elderberry, echinacea, and vitamin-rich rosehips to strengthen your body's natural defenses year-round.",
    image: hibiscusImage,
    benefits: ["Immune Support", "Vitamin C Rich", "Antioxidant Boost"],
    tags: { goal: ["immunity"], flavor: ["fruity"], caffeine: "none" },
    specs: { origin: "USA / Europe", servings: 25 }
  },
  {
    id: "immunity_bush",
    name: "Bush Doctor (Guinea Hen)",
    price: 40.00,
    description: "Guinea Hen Weed (Anamu) paired with Turmeric. A serious herbal ally known for its cellular support and deep immune boosting properties.",
    image: hibiscusImage,
    benefits: ["Cellular Health", "Deep Immunity", "Inflammation"],
    tags: { goal: ["immunity"], flavor: ["earthy", "spicy"], caffeine: "none" },
    specs: { origin: "Jamaica", servings: 20 }
  },

  // STRESS
  {
    id: "stress_calm",
    name: "Calm Mind Infusion",
    price: 28.00,
    description: "Adaptogenic ashwagandha meets holy basil (tulsi) to help your body manage stress and find balance in chaotic moments.",
    image: chamomileImage,
    benefits: ["Reduces Cortisol", "Balances Mood", "Adaptogenic"],
    tags: { goal: ["stress"], flavor: ["earthy"], caffeine: "none" },
    specs: { origin: "India", servings: 22 }
  },
  {
    id: "stress_nerves",
    name: "Blue Vervain Nerve Tonic",
    price: 35.00,
    description: "Blue Vervain is the ultimate 'nervine'. Great for those who are 'wired but tired', helping to release tension held in the neck and shoulders.",
    image: chamomileImage,
    benefits: ["Muscle Release", "Nervous System", "Tension Relief"],
    tags: { goal: ["stress", "sleep"], flavor: ["earthy", "bitter"], caffeine: "none" },
    specs: { origin: "Caribbean", servings: 20 }
  }
];

export default function SymptomTool() {
  const { user } = useUser();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [result, setResult] = useState<Product | null>(null);
  const [loadingResult, setLoadingResult] = useState(false);

  // Checkout State
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutSessionId, setCheckoutSessionId] = useState<string | null>(null);
  const [loadingCheckout, setLoadingCheckout] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // --- Quiz Logic ---
  const handleAnswer = (key: string, value: any) => {
    setAnswers(prev => ({ ...prev, [key]: value }));
  };

  const nextStep = () => {
    if (step < 5) setStep(step + 1);
    else calculateResult();
  };

  const prevStep = () => setStep(step - 1);

  const calculateResult = () => {
    setLoadingResult(true);
    // Simulate thinking
    setTimeout(() => {
      const goal = answers['goal'] || 'sleep';
      const flavor = answers['flavor'] || 'earthy';
      const caffeine = answers['caffeine'] || 'none';

      // Scoring Algorithm
      const scored = PRODUCTS.map(p => {
        let score = 0;
        if (p.tags.goal.includes(goal)) score += 5; // Biggest weight
        if (p.tags.flavor.includes(flavor)) score += 2; // Medium weight

        // Exact caffeine match bonus, penalty if unwanted
        if (caffeine === 'none' && p.tags.caffeine !== 'none') score -= 10;
        if (caffeine === 'high' && p.tags.caffeine === 'high') score += 3;

        return { product: p, score };
      });

      // Sort by score desc
      scored.sort((a, b) => b.score - a.score);
      setResult(scored[0].product);
      setLoadingResult(false);
    }, 1500);
  };

  const reset = () => {
    setStep(1);
    setAnswers({});
    setResult(null);
    setLoadingResult(false);
    setCheckoutSessionId(null);
  };

  // --- API Integrations ---

  const handleSaveBlend = async () => {
    if (!result || !user) return;
    setIsSaving(true);
    try {
      const res = await fetch('/api/user/blends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: result.name,
          type: result.tags.goal[0],
          productId: result.id
        })
      });

      if (res.ok) {
        toast({
          title: "Ritual Saved",
          description: "This blend has been added to your dashboard.",
        });
      } else {
        throw new Error("Failed to save");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not save ritual. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePurchase = async () => {
    if (!result) return;
    setLoadingCheckout(true);
    try {
      const res = await fetch('/api/checkout/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: result.name, price: result.price }) // Sending price from frontend is insecure for real apps, but ok for this demo
      });

      if (!res.ok) throw new Error("Checkout creation failed");

      const data = await res.json();
      setCheckoutSessionId(data.sessionId);
      setIsCheckoutOpen(true);
    } catch (error) {
      console.error(error);
      toast({
        title: "Checkout Error",
        description: "Could not initialize checkout. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoadingCheckout(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="text-center space-y-4 mb-12">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-primary">Symptom to Stems</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Tell us how you're feeling, and we'll curate the perfect herbal ritual for your needs.
        </p>
      </div>

      {!result && !loadingResult ? (
        <Card className="bg-white/80 backdrop-blur-xl border-white/50 shadow-soft max-w-2xl mx-auto overflow-hidden transition-all duration-300">
          <div className="h-2 bg-secondary/50 w-full">
            <div
              className="h-full bg-primary transition-all duration-500 ease-out"
              style={{ width: `${(step / 5) * 100}%` }}
            />
          </div>

          <CardHeader>
            <span className="text-xs font-bold text-primary uppercase tracking-widest mb-2 block">Step {step} of 5</span>
            <CardTitle className="text-2xl font-serif">
              {step === 1 && "What's your primary wellness goal today?"}
              {step === 2 && "How would you describe your current energy levels?"}
              {step === 3 && "Any specific flavor preferences?"}
              {step === 4 && "Are you sensitive to caffeine?"}
              {step === 5 && "How do you prefer to brew?"}
            </CardTitle>
          </CardHeader>

          <CardContent className="min-h-[300px] flex flex-col justify-center animate-in slide-in-from-right-4 duration-300">
            {step === 1 && (
              <RadioGroup onValueChange={(v) => handleAnswer('goal', v)} defaultValue={answers['goal'] || "sleep"} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { id: "sleep", label: "Better Sleep", desc: "Deep rest & relaxation" },
                  { id: "digest", label: "Digestion", desc: "Soothing gut health" },
                  { id: "energy", label: "Natural Energy", desc: "Focus without jitters" },
                  { id: "stress", label: "Stress Relief", desc: "Calm in the chaos" },
                  { id: "immunity", label: "Immunity", desc: "Daily defense boost" }
                ].map((option) => (
                  <div key={option.id}>
                    <RadioGroupItem value={option.id} id={option.id} className="peer sr-only" />
                    <Label
                      htmlFor={option.id}
                      className="flex flex-col items-center justify-center p-6 rounded-xl border-2 border-transparent bg-white shadow-sm hover:bg-secondary/30 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-secondary/50 cursor-pointer transition-all text-center h-full"
                    >
                      <span className="font-serif text-xl font-bold mb-1 text-primary">{option.label}</span>
                      <span className="text-sm text-muted-foreground">{option.desc}</span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}

            {step === 2 && (
              <div className="space-y-8 py-8 px-4">
                <div className="text-center mb-8">
                  <span className="text-4xl font-serif text-primary font-bold">{answers['energy'] || 50}%</span>
                  <p className="text-sm text-muted-foreground mt-2">Energy Level</p>
                </div>
                <Slider
                  defaultValue={[answers['energy'] || 50]}
                  max={100}
                  step={1}
                  className="w-full"
                  onValueChange={(v) => handleAnswer('energy', v[0])}
                />
                <div className="flex justify-between text-sm text-muted-foreground font-medium uppercase tracking-wider px-2">
                  <span>Drained</span>
                  <span>Balanced</span>
                  <span>Wired</span>
                </div>
              </div>
            )}

            {step === 3 && (
              <RadioGroup onValueChange={(v) => handleAnswer('flavor', v)} defaultValue={answers['flavor'] || "earthy"} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { id: "floral", label: "Floral & Light", desc: "Lavender, Rose, Chamomile" },
                  { id: "earthy", label: "Earthy & Grounding", desc: "Roots, Bark, Spices" },
                  { id: "fruity", label: "Fruity & Bright", desc: "Hibiscus, Berries, Citrus" },
                  { id: "minty", label: "Fresh & Minty", desc: "Peppermint, Spearmint" }
                ].map((option) => (
                  <div key={option.id}>
                    <RadioGroupItem value={option.id} id={option.id} className="peer sr-only" />
                    <Label
                      htmlFor={option.id}
                      className="flex flex-col items-center justify-center p-6 rounded-xl border-2 border-transparent bg-white shadow-sm hover:bg-secondary/30 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-secondary/50 cursor-pointer transition-all text-center h-full"
                    >
                      <span className="font-serif text-xl font-bold mb-1 text-primary">{option.label}</span>
                      <span className="text-sm text-muted-foreground">{option.desc}</span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}

            {step === 4 && (
              <RadioGroup onValueChange={(v) => handleAnswer('caffeine', v)} defaultValue={answers['caffeine'] || "none"} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { id: "none", label: "No Caffeine", desc: "Strictly herbal" },
                  { id: "low", label: "Low Caffeine", desc: "Green & White teas" },
                  { id: "high", label: "High Caffeine", desc: "Black teas & Mate" },
                ].map((option) => (
                  <div key={option.id}>
                    <RadioGroupItem value={option.id} id={option.id} className="peer sr-only" />
                    <Label
                      htmlFor={option.id}
                      className="flex flex-col items-center justify-center p-6 rounded-xl border-2 border-transparent bg-white shadow-sm hover:bg-secondary/30 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-secondary/50 cursor-pointer transition-all text-center h-full"
                    >
                      <span className="font-serif text-xl font-bold mb-1 text-primary">{option.label}</span>
                      <span className="text-sm text-muted-foreground">{option.desc}</span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}

            {step === 5 && (
              <RadioGroup onValueChange={(v) => handleAnswer('brew', v)} defaultValue={answers['brew'] || "hot"} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { id: "hot", label: "Hot Brew", desc: "Traditional steeping" },
                  { id: "cold", label: "Cold Brew", desc: "Refreshing & Slow steeped" },
                ].map((option) => (
                  <div key={option.id}>
                    <RadioGroupItem value={option.id} id={option.id} className="peer sr-only" />
                    <Label
                      htmlFor={option.id}
                      className="flex flex-col items-center justify-center p-6 rounded-xl border-2 border-transparent bg-white shadow-sm hover:bg-secondary/30 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-secondary/50 cursor-pointer transition-all text-center h-full"
                    >
                      <span className="font-serif text-xl font-bold mb-1 text-primary">{option.label}</span>
                      <span className="text-sm text-muted-foreground">{option.desc}</span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}
          </CardContent>

          <CardFooter className="flex justify-between border-t border-border/40 pt-6">
            <Button
              variant="ghost"
              onClick={prevStep}
              disabled={step === 1}
              className="text-muted-foreground hover:text-foreground"
            >
              Back
            </Button>
            <Button onClick={nextStep} className="bg-primary text-primary-foreground hover:bg-primary/90">
              {step < 5 ? (
                <>Continue <ArrowRight className="ml-2 w-4 h-4" /></>
              ) : (
                <>Reveal My Ritual <Check className="ml-2 w-4 h-4" /></>
              )}
            </Button>
          </CardFooter>
        </Card>
      ) : loadingResult ? (
        <Card className="max-w-xl mx-auto min-h-[400px] flex flex-col items-center justify-center bg-white/80 backdrop-blur-xl animate-in fade-in duration-500">
          <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
          <p className="text-lg font-serif text-primary">Curating your ritual...</p>
        </Card>
      ) : result ? (
        <div className="animate-in zoom-in-95 duration-700 space-y-8">
          <Card className="bg-white/90 backdrop-blur-xl border-white/50 shadow-xl overflow-hidden">
            <div className="grid md:grid-cols-2">
              <div className="relative h-64 md:h-auto bg-secondary/30 group overflow-hidden">
                <img
                  src={result.image}
                  alt={result.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute top-4 left-4">
                  <Badge className="bg-white text-primary hover:bg-white shadow-sm">Best Match (98%)</Badge>
                </div>
              </div>

              <div className="p-8 md:p-12 flex flex-col justify-center space-y-6">
                <div>
                  <span className="text-accent-foreground font-medium tracking-wide uppercase text-sm">Your Personal Recommendation</span>
                  <h2 className="text-4xl font-serif font-bold text-primary mt-2">{result.name}</h2>
                  <p className="text-lg text-muted-foreground mt-4 leading-relaxed">
                    {result.description}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {result.benefits.map((benefit, i) => (
                    <Badge key={i} variant="secondary" className="bg-secondary text-primary border-none text-xs px-3 py-1">
                      {benefit}
                    </Badge>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-4 border-y border-border/50 py-6">
                  <div className="text-center">
                    <span className="block text-xl font-serif font-bold text-primary capitalize">{result.specs.origin}</span>
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">Origin</span>
                  </div>
                  <div className="text-center border-l border-border/50">
                    <span className="block text-xl font-serif font-bold text-primary capitalize">{result.tags.caffeine}</span>
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">Caffeine</span>
                  </div>
                  <div className="text-center border-l border-border/50">
                    <span className="block text-xl font-serif font-bold text-primary">{result.specs.servings}tsp</span>
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">Servings</span>
                  </div>
                </div>

                <div className="flex flex-col gap-3 pt-2">
                  <Button
                    size="lg"
                    className="w-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 relative overflow-hidden h-12 text-lg"
                    onClick={handlePurchase}
                    disabled={loadingCheckout}
                  >
                    {loadingCheckout ? (
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    ) : (
                      <ShoppingBag className="mr-2 w-5 h-5" />
                    )}
                    Purchase Ritual (${result.price})
                  </Button>

                  <div className="flex gap-3">
                    <Button
                      size="lg"
                      variant="outline"
                      className="flex-1 border-primary text-primary hover:bg-primary/5"
                      onClick={handleSaveBlend}
                      disabled={isSaving}
                    >
                      {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Heart className="mr-2 w-4 h-4" />}
                      Save
                    </Button>
                    <Button size="lg" variant="outline" className="flex-1 border-primary text-primary hover:bg-primary/5">
                      <Share2 className="mr-2 w-4 h-4" />
                      Share
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <div className="text-center">
            <Button variant="link" onClick={reset} className="text-muted-foreground hover:text-primary">
              <RefreshCw className="mr-2 w-4 h-4" />
              Start Over via <Leaf className="w-3 h-3 mx-1" /> Symptom Tool
            </Button>
          </div>
        </div>
      ) : null}

      {/* Checkout Modal */}
      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent className="sm:max-w-md bg-white border-none shadow-2xl p-0 overflow-hidden max-h-[85vh] flex flex-col">
          <DialogHeader className="p-6 bg-secondary/30 flex-shrink-0">
            <DialogTitle className="text-center font-serif text-2xl text-primary">Complete Your Order</DialogTitle>
          </DialogHeader>
          <div className="w-full flex-1 min-h-[400px] overflow-y-auto">
            {checkoutSessionId && (
              <WhopCheckoutEmbed
                sessionId={checkoutSessionId}
                onComplete={() => {
                  toast({
                    title: "Order Completed!",
                    description: "Ritual Unlocked. Redirecting to your guide...",
                  });
                  setIsCheckoutOpen(false);
                  if (result?.id) {
                    setTimeout(() => setLocation(`/ritual/${result.id}`), 1000);
                  }
                }}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
