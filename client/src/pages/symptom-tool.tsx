import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Check, ArrowRight, RefreshCw, ShoppingBag, Share2, Loader2, Heart } from "lucide-react";
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
  specs: {
    origin: string;
    caffeine: string;
    servings: number;
  };
}

const PRODUCTS: Record<string, Product> = {
  sleep: {
    id: "sleep_blend",
    name: "Deep Rest Blend",
    price: 28.00,
    description: "A calming infusion of chamomile, valerian root, and lavender designed to quiet the mind and prepare the body for restorative sleep.",
    image: chamomileImage,
    benefits: ["Promotes Deep Sleep", "Reduces Anxiety", "Relaxes Muscles"],
    specs: { origin: "organic", caffeine: "0g", servings: 25 }
  },
  energy: {
    id: "energy_blend",
    name: "Morning Focus Elixir",
    price: 32.00,
    description: "An awakening blend of yerba mate, guayusa, and lemon peel. Provides sustained energy without the jitters or crash of coffee.",
    image: hibiscusImage,
    benefits: ["Boosts Focus", "Sustained Energy", "No Jitters"],
    specs: { origin: "wild-harvested", caffeine: "45mg", servings: 30 }
  },
  digest: {
    id: "digest_blend",
    name: "Gut Harmony Tea",
    price: 26.00,
    description: "Soothing peppermint, ginger, and fennel seeds work together to calm bloating and support healthy digestion after meals.",
    image: chamomileImage, // Placeholder image reuse
    benefits: ["Soothes Bloating", "Aids Digestion", "Reduces Inflammation"],
    specs: { origin: "organic", caffeine: "0g", servings: 20 }
  },
  immunity: {
    id: "immunity_blend",
    name: "Defense Shield Brew",
    price: 30.00,
    description: "A potent mix of elderberry, echinacea, and vitamin-rich rosehips to strengthen your body's natural defenses year-round.",
    image: hibiscusImage, // Placeholder image reuse
    benefits: ["Immune Support", "Vitamin C Rich", "Antioxidant Boost"],
    specs: { origin: "organic", caffeine: "0g", servings: 25 }
  },
  stress: {
    id: "stress_blend",
    name: "Calm Mind Infusion",
    price: 28.00,
    description: "Adaptogenic ashwagandha meets holy basil (tulsi) to help your body manage stress and find balance in chaotic moments.",
    image: chamomileImage, // Placeholder image reuse
    benefits: ["Reduces Cortisol", "Balances Mood", "Adaptogenic"],
    specs: { origin: "ayurvedic", caffeine: "0g", servings: 22 }
  }
};

export default function SymptomTool() {
  const { user } = useUser();
  const { toast } = useToast();

  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [result, setResult] = useState<Product | null>(null);

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
    // Simple logic: key off the first question (goal)
    // In a real app, this would be a weighted algorithm based on all 5 answers
    const goal = answers['goal'] || 'sleep';
    setResult(PRODUCTS[goal] || PRODUCTS['sleep']);
  };

  const reset = () => {
    setStep(1);
    setAnswers({});
    setResult(null);
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
        body: JSON.stringify({ name: result.name, type: result.benefits[0] }) // Use primary benefit as type
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

      {!result ? (
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
              <RadioGroup onValueChange={(v) => handleAnswer('flavor', v)} defaultValue={answers['flavor'] || "floral"} className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
      ) : (
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
                  <Badge className="bg-white text-primary hover:bg-white shadow-sm">Best Match</Badge>
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
                    <span className="block text-2xl font-serif font-bold text-primary capitalize">{result.specs.origin}</span>
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">Origin</span>
                  </div>
                  <div className="text-center border-l border-border/50">
                    <span className="block text-2xl font-serif font-bold text-primary">{result.specs.caffeine}</span>
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">Caffeine</span>
                  </div>
                  <div className="text-center border-l border-border/50">
                    <span className="block text-2xl font-serif font-bold text-primary">{result.specs.servings}</span>
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">Servings</span>
                  </div>
                </div>

                <div className="flex flex-col gap-3 pt-2">
                  <Button
                    size="lg"
                    className="w-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 relative overflow-hidden"
                    onClick={handlePurchase}
                    disabled={loadingCheckout}
                  >
                    {loadingCheckout ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <ShoppingBag className="mr-2 w-4 h-4" />
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
                      Save to Dashboard
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
              Start Over
            </Button>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent className="sm:max-w-md bg-white border-none shadow-2xl p-0 overflow-hidden min-h-[500px]">
          <DialogHeader className="p-6 bg-secondary/30">
            <DialogTitle className="text-center font-serif text-2xl text-primary">Complete Your Order</DialogTitle>
          </DialogHeader>
          <div className="w-full h-full min-h-[400px]">
            {checkoutSessionId && (
              <WhopCheckoutEmbed
                sessionId={checkoutSessionId}
                onComplete={() => {
                  toast({
                    title: "Order Completed!",
                    description: "Thank you for your purchase. Your ritual is on its way.",
                  });
                  setIsCheckoutOpen(false);
                }}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
