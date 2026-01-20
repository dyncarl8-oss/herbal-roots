import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge"; // Added missing import
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, ArrowRight, RefreshCw, ShoppingBag, Share2 } from "lucide-react";
import chamomileImage from "@assets/generated_images/chamomile_lavender_tea_blend.png";
import hibiscusImage from "@assets/generated_images/hibiscus_tea_blend.png";
import { cn } from "@/lib/utils";

export default function SymptomTool() {
  const [step, setStep] = useState(1);
  const [result, setResult] = useState<string | null>(null);

  const reset = () => {
    setStep(1);
    setResult(null);
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);
  
  const showResult = () => {
    setResult("calm"); // Mock result logic
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="text-center space-y-4 mb-12">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-primary">Symptom to Stems</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Tell us how you're feeling, and we'll curate the perfect herbal ritual for your needs.
        </p>
      </div>

      {!result ? (
        <Card className="bg-white/80 backdrop-blur-xl border-white/50 shadow-soft max-w-2xl mx-auto overflow-hidden">
          <div className="h-2 bg-secondary w-full">
            <div 
              className="h-full bg-primary transition-all duration-500 ease-out" 
              style={{ width: `${(step / 3) * 100}%` }} 
            />
          </div>
          
          <CardHeader>
            <span className="text-xs font-bold text-primary uppercase tracking-widest mb-2 block">Step {step} of 3</span>
            <CardTitle className="text-2xl font-serif">
              {step === 1 && "What's your primary wellness goal today?"}
              {step === 2 && "How would you describe your current energy?"}
              {step === 3 && "Any specific flavor preferences?"}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="min-h-[300px] flex flex-col justify-center">
            {step === 1 && (
              <RadioGroup defaultValue="sleep" className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { id: "sleep", label: "Better Sleep", desc: "Deep rest & relaxation" },
                  { id: "digest", label: "Digestion", desc: "Soothing gut health" },
                  { id: "energy", label: "Natural Energy", desc: "Focus without jitters" },
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
              <div className="space-y-8 py-8">
                <div className="text-center mb-8">
                  <span className="text-lg font-medium">I'm feeling...</span>
                </div>
                <Slider defaultValue={[50]} max={100} step={1} className="w-full" />
                <div className="flex justify-between text-sm text-muted-foreground font-medium uppercase tracking-wider px-2">
                  <span>Drained</span>
                  <span>Balanced</span>
                  <span>Wired</span>
                </div>
              </div>
            )}

            {step === 3 && (
               <RadioGroup defaultValue="floral" className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            {step < 3 ? (
              <Button onClick={nextStep} className="bg-primary text-primary-foreground hover:bg-primary/90">
                Continue <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            ) : (
              <Button onClick={showResult} className="bg-primary text-primary-foreground hover:bg-primary/90">
                Reveal My Ritual <Check className="ml-2 w-4 h-4" />
              </Button>
            )}
          </CardFooter>
        </Card>
      ) : (
        <div className="animate-in zoom-in-95 duration-700 space-y-8">
           <Card className="bg-white/90 backdrop-blur-xl border-white/50 shadow-xl overflow-hidden">
             <div className="grid md:grid-cols-2">
               <div className="relative h-64 md:h-auto bg-secondary/30 group">
                 <img 
                   src={chamomileImage} 
                   alt="Recommended Blend" 
                   className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                 />
                 <div className="absolute top-4 left-4">
                   <Badge className="bg-white text-primary hover:bg-white shadow-sm">Best Match</Badge>
                 </div>
               </div>
               
               <div className="p-8 md:p-12 flex flex-col justify-center space-y-6">
                 <div>
                   <span className="text-accent-foreground font-medium tracking-wide uppercase text-sm">Your Personal Recommendation</span>
                   <h2 className="text-4xl font-serif font-bold text-primary mt-2">Deep Rest Blend</h2>
                   <p className="text-lg text-muted-foreground mt-4 leading-relaxed">
                     A calming infusion of chamomile, valerian root, and lavender designed to quiet the mind and prepare the body for restorative sleep.
                   </p>
                 </div>
                 
                 <div className="grid grid-cols-3 gap-4 border-y border-border/50 py-6">
                   <div className="text-center">
                     <span className="block text-2xl font-serif font-bold text-primary">100%</span>
                     <span className="text-xs text-muted-foreground uppercase tracking-wider">Organic</span>
                   </div>
                   <div className="text-center border-l border-border/50">
                     <span className="block text-2xl font-serif font-bold text-primary">0g</span>
                     <span className="text-xs text-muted-foreground uppercase tracking-wider">Caffeine</span>
                   </div>
                    <div className="text-center border-l border-border/50">
                     <span className="block text-2xl font-serif font-bold text-primary">25</span>
                     <span className="text-xs text-muted-foreground uppercase tracking-wider">Servings</span>
                   </div>
                 </div>

                 <div className="flex flex-col sm:flex-row gap-4 pt-2">
                   <Button size="lg" className="flex-1 bg-primary text-primary-foreground shadow-lg hover:bg-primary/90">
                     <ShoppingBag className="mr-2 w-4 h-4" />
                     Purchase Ritual ($28)
                   </Button>
                   <Button size="lg" variant="outline" className="flex-1 border-primary text-primary hover:bg-primary/5">
                     <Share2 className="mr-2 w-4 h-4" />
                     Share Link
                   </Button>
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
    </div>
  );
}
