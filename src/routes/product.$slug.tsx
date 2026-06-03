import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { Heart, Minus, Plus, ShoppingBag, Star, Truck, Shield, RotateCcw, Settings } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo, useEffect } from "react";
import { getProductBySlug, fetchRelatedProducts } from "@/data/products";
import { formatINR, useStore } from "@/context/StoreContext";
import { ProductCard } from "@/components/ProductCard";

export const Route = createFileRoute("/product/$slug")({
  // Dynamic asynchronous data loader pulling directly from Supabase
  loader: async ({ params }) => {
    const product = await getProductBySlug(params.slug);
    
    // Explicit 404 gate trigger protecting against mismatched slugs or unlisted items
    if (!product) {
      throw notFound();
    }

    // Dynamic cross-sell aggregation driven by the database category name
    const relatedProducts = await fetchRelatedProducts(
      product.id,
      product.category
    );

    return { 
      product, 
      relatedProducts 
    };
  },
  head: ({ loaderData }) => ({
    meta: loaderData ? [
      { title: `${loaderData.product.name} — Jaga Traders` },
      { name: "description", content: loaderData.product.tagline },
      { property: "og:title", content: loaderData.product.name },
      { property: "og:description", content: loaderData.product.tagline },
      { property: "og:image", content: loaderData.product.image },
      { property: "og:type", content: "product" },
    ] : [],
    links: loaderData ? [{ rel: "canonical", href: `/product/${loaderData.product.slug}` }] : [],
  }),
  notFoundComponent: () => (
    <div className="max-w-xl mx-auto py-32 text-center px-6">
      <h2 className="font-display text-4xl">Product not found</h2>
      <p className="text-muted-foreground mt-2 text-sm">This item profile does not exist or has been unlisted from our court inventory.</p>
      <Link to="/shop" className="inline-block mt-6 text-gold underline font-semibold tracking-wider text-xs uppercase">Back to shop</Link>
    </div>
  ),
  component: ProductPage,
});

// SUB-COMPONENT: Staggered spring loading analytics bars using micro-animations
function PerformanceBars({ metrics }: { metrics: any }) {
  if (!metrics) return null;

  const barVariants = {
    hidden: { width: 0 },
    visible: (targetWidth: number) => ({
      width: `${targetWidth}%`,
      transition: { type: "spring", stiffness: 80, damping: 15, delay: 0.1 }
    })
  };

  return (
    <div className="space-y-4 p-5 border border-border bg-card/50 rounded-sm backdrop-blur-sm mt-8">
      <div className="text-[10px] font-extrabold tracking-widest text-gold uppercase flex items-center gap-2 border-b border-border/40 pb-2">
        <Settings className="w-3.5 h-3.5 animate-spin-slow text-gold" /> 
        Equipment Performance Analytics Bench
      </div>
      
      <div className="grid gap-3.5">
        {Object.entries(metrics).map(([key, val]) => {
          if (val === undefined || val === null) return null;
          return (
            <div key={key} className="space-y-1">
              <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider">
                <span className="text-muted-foreground">{key} Velocity</span>
                <span className="text-gold font-extrabold">{val} / 100</span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden relative">
                <motion.div
                  custom={val}
                  initial="hidden"
                  animate="visible"
                  variants={barVariants}
                  className="h-full bg-gradient-to-r from-gold/60 to-gold rounded-full shadow-[0_0_8px_rgba(212,175,55,0.25)]"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ProductPage() {
  const { product, relatedProducts } = Route.useLoaderData();
  const { add, toggleWish, state } = useStore();
  const [qty, setQty] = useState(1);
  const navigate = useNavigate();

  // Reset local state quantity index counters whenever parameters alter downstream
  useEffect(() => {
    setQty(1);
  }, [product.id]);

  // Group fallback images into structured collections
  const images = useMemo(() => {
    if (product.gallery_images && product.gallery_images.length > 0) {
      return [product.image, ...product.gallery_images];
    }
    return [product.image];
  }, [product.image, product.gallery_images]);

  const [selectedImage, setSelectedImage] = useState(images[0]);

  // Sync state container immediately if primary display asset keys update
  useEffect(() => {
    setSelectedImage(images[0]);
  }, [images]);

  const wished = state.wishlist.includes(product.id);

  // 3D Gyroscopic Hover Variables
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouseMove3D = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const box = card.getBoundingClientRect();
    const x = e.clientX - box.left - box.width / 2;
    const y = e.clientY - box.top - box.height / 2;
    setRotateX(-y / 15);
    setRotateY(x / 15);
  };

  const handleMouseLeave3D = () => {
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 text-foreground bg-background">
      {/* BREADCRUMBS */}
      <div className="text-xs text-muted-foreground mb-6 tracking-wider font-semibold uppercase">
        <Link to="/" className="hover:text-gold transition-colors">HOME</Link> /{" "}
        <Link to="/shop" className="hover:text-gold transition-colors">SHOP</Link> /{" "}
        <span className="text-foreground font-extrabold">{product.name}</span>
      </div>

      <div className="grid lg:grid-cols-2 gap-12 items-start">
        {/* COLUMN 1: INTERACTIVE 3D THEATRE BOX GALLERY */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:sticky lg:top-24"
        >
          <div 
            onMouseMove={handleMouseMove3D}
            onMouseLeave={handleMouseLeave3D}
            style={{ perspective: 1200 }}
            className="w-full"
          >
            <motion.div
              animate={{ rotateX, rotateY }}
              transition={{ type: "tween", ease: "easeOut", duration: 0.1 }}
              className="bg-card border border-border aspect-square overflow-hidden rounded-sm flex items-center justify-center relative shadow-lg group/stage select-none"
            >
              <AnimatePresence mode="wait">
                <motion.img
                  key={selectedImage}
                  src={selectedImage}
                  alt={product.name}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 0.25 }}
                  className="w-full h-full object-cover"
                />
              </AnimatePresence>

              <div className="absolute top-4 left-4 text-[8px] bg-black/80 border border-white/10 font-bold px-2 py-0.5 rounded-sm tracking-widest text-gold uppercase z-10">
                JAGA LAB PRO — INTEL STAMP
              </div>
            </motion.div>
          </div>

          {/* GALLERY ACCELERATOR SLIDE CONTROLS */}
          {images.length > 1 && (
            <div className="grid grid-cols-5 gap-3 mt-4">
              {images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(img)}
                  className={`border rounded-sm overflow-hidden transition-all aspect-square bg-card relative ${
                    selectedImage === img ? "border-gold ring-1 ring-gold shadow-md" : "border-border hover:border-gold/60"
                  }`}
                >
                  <img
                    src={img}
                    alt=""
                    className="w-full h-full object-cover select-none"
                  />
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* COLUMN 2: TECHNICAL METADATA SPEC PANELS */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="text-xs font-bold tracking-widest text-gold uppercase">{product.category}</div>
          
          {/* CONFIGURATION LEVEL STATUS BADGES */}
          <div className="flex gap-2 mt-3 mb-1">
            {product.isNew && (
              <span className="bg-green-600/10 border border-green-500/20 text-green-500 px-2 py-0.5 text-[9px] font-extrabold tracking-widest uppercase rounded-sm">
                NEW RELEASE
              </span>
            )}
            {product.bestseller && (
              <span className="bg-gold/10 border border-gold/20 text-gold px-2 py-0.5 text-[9px] font-extrabold tracking-widest uppercase rounded-sm">
                BESTSELLER
              </span>
            )}
            {product.featured && (
              <span className="bg-blue-600/10 border border-blue-500/20 text-blue-400 px-2 py-0.5 text-[9px] font-extrabold tracking-widest uppercase rounded-sm">
                TIER SELECTION
              </span>
            )}
          </div>

          <h1 className="font-display text-4xl md:text-5xl mt-2 tracking-wide uppercase font-bold text-foreground leading-none">{product.name}</h1>
          <p className="text-muted-foreground mt-2 text-sm font-medium tracking-wide uppercase">{product.tagline}</p>

          {/* REVIEWS HUB */}
          <div className="flex items-center gap-3 mt-4 border-b border-border/40 pb-4">
            <div className="flex items-center gap-0.5 text-gold">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-3.5 h-3.5 ${i < Math.round(product.rating) ? "fill-current" : "text-muted-foreground/30"}`} />
              ))}
            </div>
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{product.rating} ({product.reviews} verified entries)</span>
          </div>

          {/* RUNTIME VALUATION BLOCK */}
          <div className="flex items-baseline gap-4 mt-6 pb-6 border-b border-border">
            <span className="font-display text-4xl text-gold font-extrabold tracking-wider">{formatINR(product.price)}</span>
            {product.oldPrice && product.oldPrice > product.price && (
              <>
                <span className="text-lg text-muted-foreground line-through font-medium">{formatINR(product.oldPrice)}</span>
                <span className="px-2 py-0.5 text-[10px] tracking-widest bg-red-500/10 text-red-500 border border-red-500/20 font-extrabold uppercase rounded-sm">
                  SAVE {Math.round((1 - product.price / product.oldPrice) * 100)}% OFF
                </span>
              </>
            )}
          </div>

          {/* INVENTORY DEPOT FEEDBACK LABELS */}
          <div className="mt-4">
            {product.inStock ? (
              <span className="text-green-500 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                ● ALLOCATION STABLE ({product.stock || 0} batches remaining)
              </span>
            ) : (
              <span className="text-red-500 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 animate-pulse">
                ✕ ALLOCATION DEVOId — BACKORDER DEPOT QUEUE OPEN
              </span>
            )}
          </div>

          <p className="mt-6 text-sm text-foreground/80 leading-relaxed font-medium">{product.description}</p>

          {/* FLUID ALLOCATION CTA STEPPERS */}
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <div className="flex items-center border border-border bg-card">
              <button 
                onClick={() => setQty(Math.max(1, qty - 1))} 
                className="px-4 py-3.5 hover:text-gold text-muted-foreground transition-colors" 
                aria-label="Decrease"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 font-mono font-extrabold text-sm text-center w-8">{qty}</span>
              <button 
                disabled={product.stock !== undefined && qty >= (product.stock || 0)}
                onClick={() => setQty(qty + 1)} 
                className="px-4 py-3.5 hover:text-gold text-muted-foreground transition-colors disabled:opacity-20" 
                aria-label="Increase"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex gap-2.5 flex-wrap flex-1 min-w-[280px]">
              <button
                disabled={!product.inStock}
                onClick={() => {
                  add(product, qty);
                  toast.success(`Dispatched ${qty} unit(s) of ${product.name} directly to your matching cart stack.`);
                }}
                className="flex-1 min-w-[150px] bg-gold text-primary-foreground py-4 font-bold tracking-widest text-xs uppercase hover:bg-gold/90 transition-all rounded-sm flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                {product.inStock ? "ADD TO BAG" : "SOLD OUT"}
              </button>

              <button
                disabled={!product.inStock}
                onClick={() => {
                  add(product, qty);
                  navigate({ to: "/cart" });
                }}
                className="flex-1 min-w-[150px] border border-gold text-gold py-4 font-bold tracking-widest text-xs uppercase bg-transparent hover:bg-gold hover:text-black transition-all rounded-sm"
              >
                BUY NOW
              </button>
            </div>

            <button 
              onClick={() => toggleWish(product.id)} 
              className={`w-14 h-14 border border-border flex items-center justify-center hover:border-gold hover:text-gold transition-colors shrink-0 rounded-sm ${wished ? "border-gold text-gold bg-gold/5" : ""}`} 
              aria-label="Wishlist Toggle"
            >
              <Heart className={`w-4 h-4 ${wished ? "fill-current" : ""}`} />
            </button>
          </div>

          {/* DYNAMIC CALIBRATION HUD METERS */}
          {product.performanceMetrics && (
            <PerformanceBars metrics={product.performanceMetrics} />
          )}

          {/* TECHNICAL SPEC MATRIX SHEET */}
          <div className="mt-10 border-t border-border/60 pt-8">
            <div className="font-display text-lg tracking-wider font-bold mb-4 uppercase">Product Specifications</div>
            {product.specs && product.specs.length > 0 ? (
              <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
                {product.specs.map((s: { label: string; value: string }) => (
                  <div key={s.label} className="border-b border-border/40 pb-2 flex flex-col justify-center">
                    <dt className="text-[10px] tracking-widest text-muted-foreground uppercase font-bold">{s.label.replace(/([A-Z])/g, ' $1')}</dt>
                    <dd className="text-xs font-extrabold mt-1 text-foreground/90 truncate">{s.value}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="text-xs text-muted-foreground italic font-medium">No specialized calibrations mapped to this segment.</p>
            )}
          </div>

          {/* METRIC TRUST SEAL OVERLAYS */}
          <div className="mt-8 grid grid-cols-3 gap-3 text-center">
            {[
              { Icon: Truck, label: "FREE SHIPPING" },
              { Icon: Shield, label: "2-YR WARRANTY" },
              { Icon: RotateCcw, label: "RETURNS OK" }
            ].map(({ Icon, label }, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5 p-3.5 border border-border bg-card/40 rounded-sm">
                <Icon className="w-4 h-4 text-gold shrink-0" />
                <span className="tracking-widest text-[9px] font-extrabold uppercase text-foreground/80">{label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* CROSS-SELL CONTEXT COMPONENT SLIDES */}
      {relatedProducts && relatedProducts.length > 0 && (
        <section className="mt-24 border-t border-border pt-16">
          <h2 className="font-display text-2xl md:text-3xl font-bold mb-8 tracking-wide uppercase">You May Also Like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default ProductPage;