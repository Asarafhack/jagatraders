import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Shield, Truck, Award, Sparkles, Hammer, ChevronRight } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import heroImg from "@/assets/hero-racket.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Jaga Traders — Premium Badminton Gear" },
      { name: "description", content: "Tournament-grade rackets, shuttles, footwear and apparel. Built for the court." },
    ],
  }),
  component: Home,
});

const bannerFadeInUp = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 18 }
  }
};

function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [bestSellerProducts, setBestSellerProducts] = useState<any[]>([]);
  const [newProducts, setNewProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true);

      if (error) throw error;

      const mappedProducts = (data || []).map((p: any) => ({
        ...p,
        image: p.primary_image,
        oldPrice: p.old_price,
        category: p.category_name,
      }));

      setFeaturedProducts(mappedProducts.filter((p: any) => p.featured));
      setBestSellerProducts(mappedProducts.filter((p: any) => p.bestseller));
      setNewProducts(mappedProducts.filter((p: any) => p.is_new));

      setCategories([
        ...new Set(
          mappedProducts
            .map((p: any) => p.category_name)
            .filter(Boolean)
        ),
      ]);
    } catch (err) {
      console.error("Database query failed inside Home payload:", err);
    }
  };

  return (
    <div className="overflow-hidden bg-[#070b13] text-foreground">
      {/* HERO SECTION */}
      <section className="relative min-h-[95vh] flex items-center noise-overlay pt-12">
        <div className="absolute inset-0 -z-10">
          <img src={heroImg} alt="Premium badminton racket and shuttle" width={1920} height={1080}
               className="w-full h-full object-cover opacity-45" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#070b13] via-[#070b13]/85 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#070b13] via-transparent to-[#070b13]/40" />
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8 grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center w-full py-20 relative z-10">
          <div>
            {/* Pill Eyebrow Badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.5 }}
              className="inline-flex items-center px-4 py-1.5 bg-[#dcae43]/5 border border-[#dcae43]/30 rounded-full text-xs font-bold tracking-widest text-[#dcae43] mb-8 cursor-default"
            >
              PREMIUM BADMINTON EQUIPMENT
            </motion.div>

            {/* Typography Heading Structure */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.7, delay: 0.1 }}
              className="font-serif font-normal text-5xl sm:text-6xl lg:text-7xl tracking-tight text-white leading-[1.15]"
            >
              Your Court,<br />
              Your Style,<br />
              <span className="bg-gradient-to-b from-[#f5e0a3] via-[#dcae43] to-[#a3791a] bg-clip-text text-transparent font-bold">Your Gear</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.7, delay: 0.25 }}
              className="mt-6 text-base sm:text-lg text-gray-300 max-w-xl font-sans leading-relaxed"
            >
              Shop world-class rackets, shuttlecocks, shoes & accessories. Customize your dream racket and earn rewards with every purchase.
            </motion.p>

            {/* Premium Interactive Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.7, delay: 0.4 }}
              className="mt-10 flex flex-wrap gap-5 items-center"
            >
              {/* Metallic Golden Smooth Sunk Button */}
              <Link to="/shop" className="group relative inline-flex items-center gap-2 bg-gradient-to-b from-[#ebd27a] via-[#d4a433] to-[#a07415] text-black font-semibold text-base tracking-wide px-8 py-3.5 rounded-lg shadow-[0_4px_25px_rgba(212,164,51,0.25)] hover:brightness-110 transition-all active:scale-95">
                Shop Now
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform stroke-[2.5]" />
              </Link>

              {/* Glossy Smooth Finished Dark Obsidian Glass Button */}
              <Link to="/racket-customizer" className="inline-flex items-center bg-gradient-to-b from-[#212735] via-[#151a26] to-[#0d1017] border border-slate-700/70 text-white font-semibold text-base tracking-wide px-8 py-3.5 rounded-lg shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] relative overflow-hidden group hover:border-[#dcae43]/40 transition-colors active:scale-95">
                <div className="absolute inset-x-0 top-0 h-[50%] bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
                Customize Racket
              </Link>
            </motion.div>
          </div>

          {/* RIGHT SIDE GRAPHIC: Custom Interactive Laboratory Visual Vector Node */}
          <div className="hidden lg:flex justify-center xl:justify-end select-none relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.85, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              whileHover={{ scale: 1.04 }}
              className="relative w-80 h-[24rem] flex flex-col items-center justify-center border border-slate-800/40 rounded-2xl bg-gradient-to-b from-slate-900/20 via-slate-950/40 to-transparent p-6 group/graphic shadow-2xl overflow-hidden"
            >
              {/* Internal vector mesh grid */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:1.5rem_1.5rem] opacity-30" />
              <div className="absolute inset-0 bg-[#dcae43]/5 rounded-2xl blur-3xl opacity-0 group-hover/graphic:opacity-100 transition-opacity duration-700" />
              
              <div className="relative flex flex-col items-center animate-shuttle">
                {/* Racket Head Hoop Layout */}
                <div className="w-28 h-36 border-2 border-[#dcae43]/30 rounded-[45px] flex items-center justify-center relative bg-[#070b13]/60 shadow-[0_0_30px_rgba(218,174,67,0.05)]">
                  {/* String alignment guides */}
                  <div className="absolute inset-0 grid grid-cols-5 opacity-20 pointer-events-none">
                    {[...Array(4)].map((_, i) => <div key={i} className="border-r border-dashed border-[#dcae43]" />)}
                  </div>
                  <div className="absolute inset-0 grid grid-rows-6 opacity-20 pointer-events-none">
                    {[...Array(5)].map((_, i) => <div key={i} className="border-b border-dashed border-[#dcae43]" />)}
                  </div>
                  {/* Internal core emblem */}
                  <div className="w-10 h-10 rounded-full border border-slate-800 flex items-center justify-center bg-[#0d1527] z-10">
                    <Sparkles className="w-5 h-5 text-[#dcae43] group-hover/graphic:rotate-90 transition-transform duration-700" />
                  </div>
                </div>

                {/* T-Joint Connector */}
                <div className="w-4 h-3 bg-gradient-to-r from-[#b1831c] via-[#dcae43] to-[#b1831c] rounded-t-sm -mt-0.5 z-20 shadow-md" />

                {/* Racket Shaft Layout */}
                <div className="w-1 bg-gradient-to-b from-[#dcae43] via-yellow-600/30 to-slate-800 h-28 relative">
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#dcae43] rounded-full blur-xs animate-ping" />
                </div>

                {/* Grip Handle */}
                <div className="w-3.5 h-10 bg-gradient-to-b from-neutral-800 to-neutral-950 border-x border-neutral-700 rounded-b-xs shadow-lg" />
              </div>

              {/* Decorative Floating Shuttles */}
              <motion.div 
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute top-10 left-8 text-xl opacity-20 group-hover/graphic:opacity-40 transition-opacity"
              >
                🪶
              </motion.div>
              <motion.div 
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bottom-12 right-8 text-2xl opacity-20 group-hover/graphic:opacity-40 transition-opacity"
              >
                🪶
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* TRUSTED BRANDS INFINITE TICKER COMPONENT */}
        <div className="absolute bottom-0 inset-x-0 bg-[#04060b] border-t border-slate-900/60 py-6 overflow-hidden">
          <div className="text-center mb-4">
            <span className="text-xs uppercase tracking-[0.2em] font-bold text-gray-400">Trusted Brands We Carry</span>
          </div>
          <div className="w-full relative flex items-center">
            <div className="flex gap-8 whitespace-nowrap animate-marquee px-4">
              {[...Array(3)].map((_, outerIdx) => (
                <div key={outerIdx} className="flex gap-8 items-center shrink-0">
                  {[
                    { n: "CARLTON", i: "🎯" },
                    { n: "BABOLAT", i: "🎾" },
                    { n: "ASHAWAY", i: "🧵" },
                    { n: "APACS", i: "⚡", active: true },
                    { n: "FORZA", i: "💪" },
                    { n: "DUNLOP", i: "🏆" },
                    { n: "WILSON", i: "🌟" },
                    { n: "YONEX", i: "🏸" },
                    { n: "LI-NING", i: "🐉" }
                  ].map((b, innerIdx) => (
                    <div key={innerIdx} className={`inline-flex flex-col items-center justify-center p-3 rounded-xl transition-all min-w-[90px] ${b.active ? "bg-[#181510] border border-yellow-600/40 shadow-[0_0_15px_rgba(218,174,67,0.1)]" : "bg-[#0d111a]/80 border border-slate-900/40"}`}>
                      <div className="text-2xl mb-1.5 filter drop-shadow-sm">{b.i}</div>
                      <span className={`text-[9px] font-black tracking-widest ${b.active ? "text-yellow-500" : "text-gray-500"}`}>{b.n}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* MARQUEE HIGHLIGHTS */}
      <div className="border-b border-slate-900/60 bg-[#090e18] overflow-hidden py-4">
        <div className="flex animate-marquee py-1 whitespace-nowrap">
          {[...Array(2)].map((_, k) => (
            <div key={k} className="flex gap-16 px-6 font-display text-lg tracking-widest text-slate-500/80 uppercase">
              {["YONEX-LEVEL QUALITY", "★", "FREE SHIPPING OVER ₹2999", "★", "BWF APPROVED SHUTTLES", "★", "30-DAY RETURNS", "★", "PRO-TESTED GEAR", "★"].map((t, i) => <span key={i} className="flex items-center gap-2 font-medium">{t}</span>)}
            </div>
          ))}
        </div>
      </div>

      {/* CATEGORIES */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="flex items-end justify-between mb-12">
          <div>
            <div className="text-xs tracking-widest text-[#dcae43] font-bold mb-2 uppercase">Explore</div>
            <h2 className="font-display text-4xl md:text-5xl text-white tracking-wide">SHOP BY CATEGORY</h2>
          </div>
          <Link to="/shop" className="hidden md:inline-flex items-center gap-2 text-xs font-bold tracking-widest text-gray-400 hover:text-[#dcae43] transition-colors uppercase">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {categories.map((c, i) => (
            <Link key={c} to="/shop" search={{ category: c }}
              className="group aspect-square border border-slate-900 bg-[#0b101d] flex items-center justify-center text-center p-5 rounded-lg transition-all hover:border-[#dcae43]/50 hover:bg-[#dcae43]/5">
              <div>
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">
                  {["🏸","🪶","👟","🎒","🧰","👕","🧵"][i % 7]}
                </div>
                <div className="text-xs tracking-widest font-bold text-gray-300 group-hover:text-[#dcae43]">{c.toUpperCase()}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURED GEAR */}
      <section className="py-20 max-w-7xl mx-auto px-6">
        <div className="mb-12">
          <div className="text-xs tracking-widest text-[#dcae43] font-bold mb-2 uppercase">Handpicked</div>
          <h2 className="font-display text-4xl md:text-5xl text-white tracking-wide">FEATURED GEAR</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* CUSTOMIZER WORKSPACE SECTION */}
      <section className="my-28 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={bannerFadeInUp}
            className="relative overflow-hidden border border-slate-800/80 bg-gradient-to-br from-[#0c1222] via-[#070b13] to-[#0c1222] p-8 md:p-20 rounded-xl shadow-2xl"
          >
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#dcae43]/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="grid lg:grid-cols-[1fr_420px] gap-12 items-center relative z-10">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 text-[#dcae43] rounded-full text-[10px] font-black tracking-widest uppercase">
                  <Hammer className="w-3 h-3 animate-pulse" /> LABORATORY WORKSHOP
                </div>
                <h3 className="font-display text-4xl md:text-6xl tracking-wide text-white uppercase leading-none">
                  Customize Your <br />
                  <span className="text-gradient-gold">Perfect Gear</span>
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed max-w-md">
                  Configure your frame specifications, select elite tournament strings, calibrate micro-tension layouts, and adjust balance profiles to match your court strategy.
                </p>
                <div className="pt-2">
                  <Link to="/racket-customizer" className="group inline-flex items-center gap-3 bg-gradient-to-b from-[#f3da83] to-[#dcae43] text-black px-8 py-4 text-xs font-black tracking-widest uppercase rounded-lg shadow-lg shadow-yellow-600/10 hover:brightness-110 transition-all">
                    Start Custom Build 
                    <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1.5" />
                  </Link>
                </div>
              </div>

              {/* INTERACTIVE PREVIEW CARD */}
              <motion.div 
                whileHover={{ scale: 1.02, rotateX: -2, rotateY: 4 }}
                style={{ transformStyle: "preserve-3d", perspective: 1000 }}
                className="bg-[#0f1626]/90 backdrop-blur-md border border-slate-800 p-6 rounded-xl flex gap-5 items-center shadow-2xl transition-all duration-300 hover:border-[#dcae43]/30 group"
              >
                <div className="w-28 h-28 bg-black border border-slate-800 rounded-lg overflow-hidden relative shrink-0 shadow-inner">
                  <img src="https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=400" alt="ARC PRO 88" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 select-none" />
                  <div className="absolute top-2 left-2 text-[7px] bg-red-600 font-extrabold text-white px-1.5 py-0.5 tracking-widest rounded-sm uppercase shadow-sm">NEW</div>
                </div>
                <div className="space-y-2 min-w-0 flex-1">
                  <div className="text-[9px] text-[#dcae43] font-black tracking-widest uppercase">LIMITED INVENTORY</div>
                  <h4 className="font-display text-xl text-white truncate tracking-wide leading-tight">THE ARC PRO 88</h4>
                  <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">88g of aerospace carbon framework built for explosive repulsion power.</p>
                  <div className="pt-1">
                    <Link to="/product/$slug" params={{ slug: "arc-pro-88" }} className="group/btn text-[10px] text-[#dcae43] font-bold uppercase tracking-widest inline-flex items-center gap-1 transition-colors hover:text-white">
                      Get Yours 
                      <ChevronRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover/btn:translate-x-1" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* BESTSELLERS */}
      <section className="py-20 max-w-7xl mx-auto px-6">
        <div className="mb-12">
          <div className="text-xs tracking-widest text-[#dcae43] font-bold mb-2 uppercase">Player Favourites</div>
          <h2 className="font-display text-4xl md:text-5xl text-white tracking-wide">BESTSELLERS</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {bestSellerProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* NEW ARRIVALS */}
      <section className="py-20 max-w-7xl mx-auto px-6">
        <div className="mb-12">
          <div className="text-xs tracking-widest text-[#dcae43] font-bold mb-2 uppercase">Just Arrived</div>
          <h2 className="font-display text-4xl md:text-5xl text-white tracking-wide">NEW ARRIVALS</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {newProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* TRUST VALUES */}
      <section className="py-20 border-t border-slate-900 bg-[#0a0f1d]">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { Icon: Truck, t: "FREE SHIPPING", d: "On orders over ₹2,999" },
            { Icon: Shield, t: "2-YEAR WARRANTY", d: "On all rackets" },
            { Icon: Award, t: "BWF APPROVED", d: "Tournament-grade shuttles" },
            { Icon: Sparkles, t: "PRO-TESTED", d: "By national-level players" },
          ].map(({ Icon, t, d }, i) => (
            <div key={i} className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg border border-slate-800 flex items-center justify-center text-[#dcae43] bg-[#0f1626] shrink-0 shadow-sm">
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <div className="font-display text-lg text-white tracking-wider uppercase font-semibold">{t}</div>
                <div className="text-sm text-gray-400 mt-1">{d}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* REVIEWS */}
      <section className="py-24 bg-[#070b13] border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="text-xs tracking-widest text-[#dcae43] font-bold uppercase">Testimonials</div>
            <h2 className="font-display text-4xl md:text-5xl text-white mt-2 tracking-wide">WHAT PLAYERS SAY</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: "Rahul", text: "Best badminton store I have used. String custom tension layout is calibrated accurately." },
              { name: "Arjun", text: "Authentic Yonex products, professional packaging, and incredibly fast express delivery." },
              { name: "Karthik", text: "Excellent customer support infrastructure. Quick responses on address updates via WhatsApp." }
            ].map((r) => (
              <div key={r.name} className="border border-slate-900/80 p-8 bg-[#0b101d] rounded-xl shadow-sm">
                <div className="text-yellow-500 text-sm tracking-widest">★★★★★</div>
                <p className="mt-4 text-gray-300 text-sm leading-relaxed italic">"{r.text}"</p>
                <div className="mt-6 font-bold text-white tracking-wide text-xs uppercase">— {r.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-28 text-center bg-gradient-to-r from-yellow-500/5 via-transparent to-yellow-500/5 border-t border-slate-900">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="font-display text-4xl md:text-5xl text-white tracking-wide">READY TO UPGRADE YOUR GAME?</h2>
          <p className="text-gray-400 mt-4 max-w-xl mx-auto text-sm leading-relaxed">
            Explore tournament-grade badminton equipment, engineered for players who demand more from every single smash.
          </p>
          <Link to="/shop" className="inline-flex mt-8 bg-gradient-to-b from-[#f3da83] to-[#dcae43] text-black px-10 py-4.5 font-black tracking-widest text-xs uppercase rounded-lg shadow-xl shadow-yellow-600/10 hover:brightness-110 transition-all">
            Shop Now
          </Link>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="py-24 max-w-3xl mx-auto px-6 text-center border-t border-slate-900">
        <div className="text-xs tracking-widest text-[#dcae43] font-bold mb-3 uppercase">Join The Court</div>
        <h3 className="font-display text-3xl md:text-4xl text-white tracking-wide uppercase">Drops, Restocks &amp; Player Stories</h3>
        <p className="text-gray-400 mt-3 text-sm">Subscribe and get 10% off your first order setup.</p>
        <form className="mt-8 flex flex-col sm:flex-row gap-3 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
          <input type="email" required placeholder="you@court.com"
            className="flex-1 bg-[#0b101d] border border-slate-800 px-4 py-3.5 rounded-lg text-white focus:border-[#dcae43] outline-none text-sm font-sans" />
          <button className="bg-gradient-to-b from-[#f3da83] to-[#dcae43] text-black px-8 py-3.5 font-black tracking-widest text-xs uppercase rounded-lg hover:brightness-110 transition-all">
            SUBSCRIBE
          </button>
        </form>
      </section>
    </div>
  );
}

export default Home;