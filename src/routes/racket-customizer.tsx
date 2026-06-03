import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useStore } from "@/context/StoreContext";
import { 
  Hammer, 
  ChevronRight, 
  ChevronLeft, 
  Sparkles, 
  Layers, 
  Gauge, 
  Activity, 
  Check, 
  ShoppingBag, 
  Info,
  RotateCcw
} from "lucide-react";

export const Route = createFileRoute("/racket-customizer")({
  head: () => ({
    meta: [{ title: "Racket Lab customizer Studio — Jaga Traders" }],
  }),
  component: RacketCustomizerStudios,
});

// REAL-WORLD TOURNAMENT SPECIFICATIONS EQUIPMENT DATA SOURCING MAPPING
const RACKET_MODELS = [
  { id: "astrox-99-pro", name: "Astrox 99 Pro Carbon Frame", brand: "Yonex", desc: "Head-Heavy power optimization for devastating down-court smashes.", basePrice: 14500, image: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=600", spec: "Head Heavy | Stiff Flex" },
  { id: "nanoflare-1000z", name: "Nanoflare 1000Z Speed Frame", brand: "Yonex", desc: "Head-Light aero-profile matrix designed for blazing defensive reaction speeds.", basePrice: 15200, image: "https://images.unsplash.com/photo-1613918108466-292b78a8ef95?q=80&w=600", spec: "Head Light | Extra Stiff" },
  { id: "thruster-f-claw", name: "Thruster F Enhanced Attack Frame", brand: "Victor", desc: "Tri-Formation frame mechanics balanced for offensive clearing command.", basePrice: 13900, image: "https://images.unsplash.com/photo-1521537634199-67368cf13329?q=80&w=600", spec: "Even Balance | Medium Flex" }
];

const STRING_OPTIONS = [
  { id: "exbolt-65", name: "Exbolt 65 Repulsion Core", desc: "Forged fiber composition delivering crisp hitting sound and instant snap-back repulsion.", price: 850 },
  { id: "bg80-power", name: "BG80 Power High-Modulus Nylon", desc: "High-intensity vector multifilament construction providing excellent tension hold.", price: 950 },
  { id: "nanogy-95", name: "Nanogy 95 Compound Durability Core", desc: "Carbon nanotube coating architecture minimizing friction friction wear.", price: 750 }
];

const STRING_COLORS = [
  { name: "Neon Yellow", hex: "#ccff00" },
  { name: "Sonic White", hex: "#ffffff" },
  { name: "Cyber Black", hex: "#111111" },
  { name: "Coral Orange", hex: "#ff4500" }
];

const TENSION_RANGES = [
  { value: 24, label: "24 lbs (Optimal Control Fallback for Budding Players)" },
  { value: 26, label: "26 lbs (Club Intermediate Standard Baseline Tier)" },
  { value: 28, label: "28 lbs (Advanced Tournament Level Repulsion Matrix)" },
  { value: 30, label: "30 lbs (Professional High-Modulus Structural Rigidity Master Execution)" }
];

const GRIP_OPTIONS = [
  { id: "pu-supergrip", name: "Premium Absorbent Polyurethane Overgrip", type: "Synthetic", desc: "Ultra-tacky friction face optimizing torque stabilization.", price: 150 },
  { id: "classic-towel", name: "Tournament Textured Cotton Towel Grip", type: "Towel", desc: "Exceptional moisture wicking for heavy sweat control profiles.", price: 200 }
];

const GRIP_COLORS = [
  { name: "Matte Black", hex: "#1c1c1c" },
  { name: "Tournament Gold", hex: "#c9a84c" },
  { name: "Pure Red", hex: "#dc2626" },
  { name: "White Velvet", hex: "#f4f4f5" }
];

function RacketCustomizerStudios() {
  const { add } = useStore();
  const [step, setStep] = useState(1);
  const [isHovered, setIsHovered] = useState(false);

  // Configuration Assembly State Engine
  const [selectedRacket, setSelectedRacket] = useState(RACKET_MODELS[0]);
  const [selectedString, setSelectedString] = useState(STRING_OPTIONS[0]);
  const [selectedStrColor, setSelectedStrColor] = useState(STRING_COLORS[0]);
  const [selectedTension, setSelectedTension] = useState(TENSION_RANGES[1]);
  const [selectedGrip, setSelectedGrip] = useState(GRIP_OPTIONS[0]);
  const [selectedGripColor, setSelectedGripColor] = useState(GRIP_COLORS[0]);

  // Dynamically calculate product pricing on configuration change
  const totalCustomPrice = selectedRacket.basePrice + selectedString.price + selectedGrip.price;

  const handleAddToBag = () => {
    // Structural normalization to fit e-commerce shopping cart store interfaces
    const customizedProductPayload = {
      id: `CUSTOM-${selectedRacket.id}-${Date.now()}`,
      name: `CUSTOMIZED ${selectedRacket.name.toUpperCase()}`,
      slug: selectedRacket.id,
      price: totalCustomPrice,
      image: selectedRacket.image,
      category: "Customized Rackets",
      category_name: "Rackets",
      inStock: true,
      customSpecs: {
        racketFrame: selectedRacket.name,
        stringModel: selectedString.name,
        stringColor: selectedStrColor.name,
        tensionRatio: `${selectedTension.value} lbs`,
        gripModel: selectedGrip.name,
        gripColor: selectedGripColor.name
      }
    };

    add(customizedProductPayload as any);
    toast.success("Your custom racket build was successfully added to your shopping bag!");
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 text-foreground bg-background">
      
      {/* TITLE STAGE HEADER */}
      <div className="border-b border-border/60 pb-6 mb-10">
        <div className="flex items-center gap-2 text-xs font-bold tracking-widest text-gold uppercase">
          <Hammer className="w-3.5 h-3.5 animate-pulse" /> Racket Engineering Lab
        </div>
        <h1 className="font-display text-5xl md:text-6xl tracking-wide mt-2">CUSTOMIZER STUDIO</h1>
        <p className="text-sm text-muted-foreground mt-1 max-w-xl">
          Fine-tune every metric of your racket to match your style of play.
        </p>
      </div>

      {/* STEP PROGRESS TRACKER */}
      <div className="grid grid-cols-5 gap-2 mb-10 text-center">
        {[
          { num: 1, label: "Frame Configuration" },
          { num: 2, label: "String Core Selection" },
          { num: 3, label: "Tension Mapping" },
          { num: 4, label: "Ergonomic Grip" },
          { num: 5, label: "Review Summary" }
        ].map((s) => (
          <button
            key={s.num}
            disabled={s.num > step && step !== 5}
            onClick={() => setStep(s.num)}
            className="flex flex-col items-center group focus:outline-none disabled:opacity-40"
          >
            <div className={`w-8 h-8 rounded-full border text-xs font-bold flex items-center justify-center transition-all ${
              step === s.num 
                ? "bg-gold text-primary-foreground border-gold shadow-lg shadow-gold/20 scale-105" 
                : step > s.num ? "bg-green-500/10 text-green-500 border-green-500/30" : "border-border bg-card text-muted-foreground"
            }`}>
              {step > s.num ? <Check className="w-3.5 h-3.5" /> : s.num}
            </div>
            <span className={`text-[10px] uppercase tracking-wider font-bold mt-2 hidden md:block transition-colors ${
              step === s.num ? "text-gold" : "text-muted-foreground group-hover:text-foreground"
            }`}>
              {s.label}
            </span>
          </button>
        ))}
      </div>

      {/* CORE CANVAS COMPONENT INTERACTION ZONE */}
      <div className="grid lg:grid-cols-[440px_1fr] gap-10">
        
        {/* LEFT COLUMN: INTERACTIVE 3D PERSPECTIVE PREVIEW FRAME STUDIO */}
        <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <div 
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{ perspective: 1000 }}
            className="w-full aspect-square border border-border bg-gradient-to-b from-card to-zinc-950 flex items-center justify-center rounded-sm p-8 relative overflow-hidden shadow-xl"
          >
            {/* Real-time Dynamic Ambient Spec-Light Accents */}
            <div className="absolute top-4 left-4 text-[9px] font-mono tracking-widest text-gold bg-black/60 px-2 py-0.5 border border-white/5 rounded-xs uppercase">
              Racket Lab Renderer v4.9
            </div>

            <div className="absolute bottom-4 left-4 text-left font-mono space-y-0.5 text-[9px] text-muted-foreground/80 bg-black/40 p-2 border border-border/40 rounded-xs">
              <div>FRAME: <span className="text-foreground font-bold">{selectedRacket.brand.toUpperCase()}</span></div>
              <div className="flex items-center gap-1">
                STRING COLOR: 
                <span className="w-2 h-2 rounded-full inline-block border border-white/10" style={{ backgroundColor: selectedStrColor.hex }} />
                <span className="text-foreground font-bold">{selectedStrColor.name.toUpperCase()}</span>
              </div>
              <div className="flex items-center gap-1">
                GRIP HUE: 
                <span className="w-2 h-2 rounded-full inline-block border border-white/10" style={{ backgroundColor: selectedGripColor.hex }} />
                <span className="text-foreground font-bold">{selectedGripColor.name.toUpperCase()}</span>
              </div>
            </div>

            {/* DYNAMIC SCALE PERSPECTIVE OBJECT CHASSIS */}
            <AnimatePresence mode="wait">
              <motion.img
                key={selectedRacket.id}
                src={selectedRacket.image}
                alt=" Racket Customization Layer"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1,
                  rotateY: isHovered ? 12 : 0,
                  rotateX: isHovered ? -5 : 0,
                  y: isHovered ? -4 : 0
                }}
                exit={{ opacity: 0, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 120, damping: 20 }}
                className="w-full h-full object-contain select-none drop-shadow-[0_15px_35px_rgba(0,0,0,0.6)]"
              />
            </AnimatePresence>

            {/* Dynamic Spliced Macro Filament Vector String Overlays */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40 mix-blend-screen" viewBox="0 0 400 400">
              <g stroke={selectedStrColor.hex} strokeWidth="0.6">
                {[...Array(14)].map((_, i) => (
                  <line key={`v-${i}`} x1={130 + i * 10} y1={80} x2={130 + i * 10} y2={220} />
                ))}
                {[...Array(14)].map((_, i) => (
                  <line key={`h-${i}`} x1={120} y1={90 + i * 10} x2={280} y2={90 + i * 10} />
                ))}
              </g>
            </svg>
          </div>

          {/* DYNAMIC CONFIG SUMMARY CHIP MATRIX */}
          <div className="bg-card border border-border p-5 rounded-sm shadow-sm space-y-3.5">
            <div className="font-display text-lg tracking-wide border-b border-border/60 pb-2 uppercase text-gold">ACTIVE LABORATORY SPECIFICATIONS</div>
            
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-muted-foreground font-bold tracking-wider block uppercase text-[10px]">Frame Type Matrix</span>
                <span className="font-medium text-foreground mt-0.5 block truncate">{selectedRacket.name}</span>
              </div>
              <div>
                <span className="text-muted-foreground font-bold tracking-wider block uppercase text-[10px]">String Structural Core</span>
                <span className="font-medium text-foreground mt-0.5 block truncate">{selectedString.name}</span>
              </div>
              <div>
                <span className="text-muted-foreground font-bold tracking-wider block uppercase text-[10px]">Calibrated Tension</span>
                <span className="font-bold text-gold mt-0.5 block">{selectedTension.value} lbs Ratio</span>
              </div>
              <div>
                <span className="text-muted-foreground font-bold tracking-wider block uppercase text-[10px]">Grip Component Layer</span>
                <span className="font-medium text-foreground mt-0.5 block truncate">{selectedGrip.name}</span>
              </div>
            </div>

            <div className="border-t border-border/40 pt-3 flex justify-between items-center font-display">
              <span className="text-sm tracking-widest text-muted-foreground font-bold">ACCUMULATED COST:</span>
              <span className="text-2xl text-gold font-extrabold">₹{totalCustomPrice.toLocaleString("en-IN")}</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: STEP ACTION OPERATOR CONSOLE WIZARD */}
        <div className="border border-border bg-card p-6 md:p-8 rounded-sm shadow-sm min-h-[500px] flex flex-col justify-between">
          <div>
            
            {/* STEP 1: RACKET BASE FRAME ENGINE */}
            {step === 1 && (
              <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <div>
                  <span className="text-[10px] tracking-widest text-gold font-bold uppercase">MODULE STAGE 01</span>
                  <h2 className="font-display text-3xl tracking-wide mt-1">SELECT FRAME PROFILE MATRIX</h2>
                  <p className="text-xs text-muted-foreground mt-1">The aerodynamic frame controls distribution weight ratios and swing velocities.</p>
                </div>

                <div className="space-y-3.5">
                  {RACKET_MODELS.map((rack) => (
                    <button
                      key={rack.id}
                      onClick={() => setSelectedRacket(rack)}
                      className={`w-full text-left p-4 border rounded-sm bg-background/40 transition-all flex justify-between items-start gap-4 ${
                        selectedRacket.id === rack.id ? "border-gold ring-1 ring-gold bg-gold/5" : "border-border hover:border-border/80"
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] px-1.5 py-0.5 bg-secondary/80 font-bold tracking-wider uppercase text-foreground/80 border border-border rounded-xs">{rack.brand}</span>
                          <span className="font-display text-lg font-bold text-foreground">{rack.name}</span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">{rack.desc}</p>
                        <div className="text-[10px] font-mono text-gold uppercase font-bold tracking-wider pt-1">● Core Layout Specs: {rack.spec}</div>
                      </div>
                      <div className="font-display text-base font-bold text-foreground shrink-0">
                        ₹{rack.basePrice.toLocaleString("en-IN")}
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* STEP 2: STRING COMPOSITES OPTIONS SELECTION */}
            {step === 2 && (
              <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <div>
                  <span className="text-[10px] tracking-widest text-gold font-bold uppercase">MODULE STAGE 02</span>
                  <h2 className="font-display text-3xl tracking-wide mt-1">SELECT FILAMENT COMPOSITE STRING</h2>
                  <p className="text-xs text-muted-foreground mt-1">Core multifilament parameters guide repulsion power metrics and impact acoustic sounds.</p>
                </div>

                <div className="space-y-3.5">
                  {STRING_OPTIONS.map((str) => (
                    <button
                      key={str.id}
                      onClick={() => setSelectedString(str)}
                      className={`w-full text-left p-4 border rounded-sm bg-background/40 transition-all flex justify-between items-center gap-4 ${
                        selectedString.id === str.id ? "border-gold ring-1 ring-gold bg-gold/5" : "border-border hover:border-border/80"
                      }`}
                    >
                      <div className="space-y-0.5">
                        <span className="font-display text-lg font-bold text-foreground block">{str.name}</span>
                        <p className="text-xs text-muted-foreground leading-relaxed">{str.desc}</p>
                      </div>
                      <div className="font-display text-sm font-bold text-gold shrink-0">
                        +₹{str.price}
                      </div>
                    </button>
                  ))}
                </div>

                {/* STRING REEL COSMETIC TONAL CHOICE BAR */}
                <div className="pt-4 border-t border-border/40">
                  <label className="text-[10px] font-bold tracking-widest text-muted-foreground block mb-3 uppercase">Cosmetic Filament Coating Tonal Color</label>
                  <div className="flex flex-wrap gap-3">
                    {STRING_COLORS.map((col) => (
                      <button
                        key={col.name}
                        onClick={() => setSelectedStrColor(col)}
                        className={`flex items-center gap-2 px-3 py-1.5 border rounded-sm text-xs font-semibold bg-background transition-all ${
                          selectedStrColor.name === col.name ? "border-gold ring-1 ring-gold" : "border-border hover:border-border/80"
                        }`}
                      >
                        <span className="w-3.5 h-3.5 rounded-full border border-white/10" style={{ backgroundColor: col.hex }} />
                        {col.name}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 3: TENSION CALIBRATION RATIOS CONTROL */}
            {step === 3 && (
              <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <div>
                  <span className="text-[10px] tracking-widest text-gold font-bold uppercase">MODULE STAGE 03</span>
                  <h2 className="font-display text-3xl tracking-wide mt-1">CALIBRATE TENSION CONFIGURATIONS</h2>
                  <p className="text-xs text-muted-foreground mt-1">High tensions amplify shot accuracy for elite tournament players; lower configurations expand structural sweet-spots.</p>
                </div>

                <div className="space-y-3.5">
                  {TENSION_RANGES.map((tens) => (
                    <button
                      key={tens.value}
                      onClick={() => setSelectedTension(tens)}
                      className={`w-full text-left p-4 border rounded-sm bg-background/40 transition-all flex items-center justify-between gap-4 ${
                        selectedTension.value === tens.value ? "border-gold ring-1 ring-gold bg-gold/5" : "border-border hover:border-border/80"
                      }`}
                    >
                      <div className="space-y-0.5">
                        <span className="font-display text-xl font-bold tracking-wide text-foreground block">{tens.value} lbs Rigidity</span>
                        <p className="text-xs text-muted-foreground">{tens.label}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                        selectedTension.value === tens.value ? "border-gold text-gold bg-gold/10" : "border-border"
                      }`}>
                        {selectedTension.value === tens.value && <Check className="w-3 h-3" />}
                      </div>
                    </button>
                  ))}
                </div>

                {/* SAFETY ALIGNMENT ADVISORY BOARD CAPTURE CHIP */}
                <div className="bg-secondary/10 border border-border p-4 flex gap-3 items-start rounded-sm mt-6">
                  <Info className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    <span className="text-foreground font-bold uppercase block text-[10px] tracking-wider mb-0.5">Laboratory Safety Advisory Warning</span>
                    Tensions exceeding 28 lbs require high-modulus professional frame components. Ensure your structural setup can handle high impact velocities without fracturing tracking frameworks.
                  </p>
                </div>
              </motion.div>
            )}

            {/* STEP 4: ERGONOMIC OVERGRIP SELECTION MODALITY */}
            {step === 4 && (
              <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <div>
                  <span className="text-[10px] tracking-widest text-gold font-bold uppercase">MODULE STAGE 04</span>
                  <h2 className="font-display text-3xl tracking-wide mt-1">SELECT HANDLING OVERGRIP WRAP</h2>
                  <p className="text-xs text-muted-foreground mt-1">Handles absorption dynamics, tactile tracking parameters, and impact torque feedback.</p>
                </div>

                <div className="space-y-3.5">
                  {GRIP_OPTIONS.map((grp) => (
                    <button
                      key={grp.id}
                      onClick={() => setSelectedGrip(grp)}
                      className={`w-full text-left p-4 border rounded-sm bg-background/40 transition-all flex justify-between items-center gap-4 ${
                        selectedGrip.id === grp.id ? "border-gold ring-1 ring-gold bg-gold/5" : "border-border hover:border-border/80"
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-display text-lg font-bold text-foreground">{grp.name}</span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">{grp.desc}</p>
                      </div>
                      <div className="font-display text-sm font-bold text-gold shrink-0">
                        +₹{grp.price}
                      </div>
                    </button>
                  ))}
                </div>

                {/* GRIP MULTI-COLOR SELECTOR PLATFORM TRACK */}
                <div className="pt-4 border-t border-border/40">
                  <label className="text-[10px] font-bold tracking-widest text-muted-foreground block mb-3 uppercase">Tactile Grip Finish Polyurethane Color</label>
                  <div className="flex flex-wrap gap-3">
                    {GRIP_COLORS.map((col) => (
                      <button
                        key={col.name}
                        onClick={() => setSelectedGripColor(col)}
                        className={`flex items-center gap-2 px-3 py-1.5 border rounded-sm text-xs font-semibold bg-background transition-all ${
                          selectedGripColor.name === col.name ? "border-gold ring-1 ring-gold" : "border-border hover:border-border/80"
                        }`}
                      >
                        <span className="w-3.5 h-3.5 rounded-full border border-white/10" style={{ backgroundColor: col.hex }} />
                        {col.name}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 5: GRAND SUMMARY REVIEW ANALYSIS PANEL BLOCK */}
            {step === 5 && (
              <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <div>
                  <span className="text-[10px] tracking-widest text-gold font-bold uppercase">MODULE STAGE 05</span>
                  <h2 className="font-display text-3xl tracking-wide mt-1">ENGINEERING LOG SUMMARY</h2>
                  <p className="text-xs text-muted-foreground mt-1">Review your customized tournament configuration before submitting to the stringing bench.</p>
                </div>

                <div className="border border-border bg-background/50 rounded-sm divide-y divide-border/60 text-xs tracking-wide">
                  <div className="p-3.5 flex justify-between"><span className="text-muted-foreground font-bold">RACKET GRAPHITE CHASSIS:</span><span className="font-bold text-foreground">{selectedRacket.name}</span></div>
                  <div className="p-3.5 flex justify-between"><span className="text-muted-foreground font-bold">STRING CORE MODEL:</span><span className="font-bold text-foreground">{selectedString.name}</span></div>
                  <div className="p-3.5 flex justify-between"><span className="text-muted-foreground font-bold">STRING COMPOSITE COLOR:</span><span className="font-bold text-gold uppercase">{selectedStrColor.name}</span></div>
                  <div className="p-3.5 flex justify-between"><span className="text-muted-foreground font-bold">BENCH TENSION RATIO:</span><span className="font-extrabold text-gold">{selectedTension.value} lbs Rigidity</span></div>
                  <div className="p-3.5 flex justify-between"><span className="text-muted-foreground font-bold">TACTILE OVERGRIP MAT:</span><span className="font-bold text-foreground">{selectedGrip.name}</span></div>
                  <div className="p-3.5 flex justify-between"><span className="text-muted-foreground font-bold">GRIP SHADE PROFILE:</span><span className="font-bold text-foreground uppercase">{selectedGripColor.name}</span></div>
                </div>

                <div className="bg-gold/5 border border-gold/20 p-4 rounded-sm flex items-center gap-3">
                  <Sparkles className="w-4 h-4 text-gold shrink-0" />
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    ✓ Custom orders are hand-calibrated on precision electronic tension drop-weight systems inside 24 hours by BWF certified stringing technicians.
                  </p>
                </div>
              </motion.div>
            )}

          </div>

          {/* STEPPER BACK / FORWARD NAVIGATION SYSTEM BUTTON CONTAINER DECK */}
          <div className="flex justify-between items-center pt-8 border-t border-border/40 mt-10">
            <button
              disabled={step === 1}
              onClick={() => setStep(prev => prev - 1)}
              className="px-5 py-3 text-xs font-bold tracking-widest border border-border uppercase rounded-sm hover:bg-background transition-colors disabled:opacity-30 inline-flex items-center gap-1.5"
            >
              <ChevronLeft className="w-4 h-4" /> Previous Step
            </button>

            {step < 5 ? (
              <button
                onClick={() => setStep(prev => prev + 1)}
                className="px-6 py-3 bg-gold text-primary-foreground text-xs font-bold tracking-widest uppercase rounded-sm hover:shadow-lg hover:shadow-gold/10 inline-flex items-center gap-1.5"
              >
                Next Step <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleAddToBag}
                className="px-8 py-4 bg-gold text-primary-foreground text-xs font-bold tracking-widest uppercase rounded-sm hover:shadow-xl hover:shadow-gold/20 inline-flex items-center gap-2 group"
              >
                <ShoppingBag className="w-4 h-4" />
                ADD CUSTOMIZED BUNDLE TO BAG
              </button>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}