import { Link, useNavigate } from "@tanstack/react-router";
import { Heart, ShoppingBag, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import type { Product } from "@/data/products";
import { formatINR, useStore } from "@/context/StoreContext";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export function ProductCard({ product }: { product: Product }) {
  const { add, toggleWish, state } = useStore();
  const { user, openLogin } = useAuth();
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();
  
  const wished = state.wishlist.includes(product.id);
  
  // Dynamic multi-image gallery processing for rapid interactive hover actions
  const productGallery = product.gallery_images && product.gallery_images.length > 0
    ? [product.image, ...product.gallery_images]
    : [product.image];

  const guard = (fn: () => void, msg: string) => {
    if (!user) { 
      toast.info(msg); 
      openLogin(); 
      return false; 
    }
    fn();
    return true;
  };

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative bg-card border border-border hover:border-gold/40 transition-colors overflow-hidden pb-14 rounded-sm shadow-sm flex flex-col justify-between h-full"
    >
      <Link to="/product/$slug" params={{ slug: product.slug }} className="block flex-1">
        <div className="relative aspect-square overflow-hidden bg-secondary/30 flex items-center justify-center">
          
          {/* INTERACTIVE HOVER IMAGE SWITCH CANVAS */}
          <AnimatePresence mode="wait">
            <motion.img
              key={isHovered && productGallery[1] ? productGallery[1] : productGallery[0]}
              src={isHovered && productGallery[1] ? productGallery[1] : productGallery[0]}
              alt={product.name}
              loading="lazy"
              initial={{ opacity: 0.85 }}
              animate={{ opacity: 1, scale: isHovered ? 1.05 : 1 }}
              exit={{ opacity: 0.85 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="w-full h-full object-cover transition-transform duration-700"
            />
          </AnimatePresence>
          
          {/* BADGES SECTION */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
            {product.isNew && (
              <span className="px-2 py-0.5 rounded-sm bg-green-600 text-white text-[9px] font-bold tracking-widest uppercase">
                NEW
              </span>
            )}

            {product.bestseller && (
              <span className="px-2 py-0.5 rounded-sm bg-gold text-black text-[9px] font-bold tracking-widest uppercase">
                BESTSELLER
              </span>
            )}

            {product.featured && (
              <span className="px-2 py-0.5 rounded-sm bg-blue-600 text-white text-[9px] font-bold tracking-widest uppercase">
                FEATURED
              </span>
            )}

            {!product.inStock && (
              <span className="px-2 py-0.5 rounded-sm bg-red-600 text-white text-[9px] font-bold tracking-widest uppercase">
                SOLD OUT
              </span>
            )}
          </div>

          {/* DISCOUNT PERCENTAGE BADGE */}
          {product.oldPrice && product.oldPrice > product.price && (
            <div className="absolute top-3 right-3 px-2 py-0.5 rounded-sm bg-red-600 text-white text-[9px] font-extrabold tracking-wider shadow-md z-10">
              -{Math.round((1 - product.price / product.oldPrice) * 100)}% OFF
            </div>
          )}
        </div>

        {/* METADATA CONTENT AREA */}
        <div className="p-4">
          <div className="text-[9px] font-bold tracking-widest text-muted-foreground uppercase">{product.category || "Gear"}</div>
          <h3 className="font-display text-xl tracking-wide mt-1 group-hover:text-gold transition-colors truncate">{product.name}</h3>
          
          {/* RATING COMPONENT */}
          <div className="flex items-center gap-1 mt-1.5">
            <Star className="w-3.5 h-3.5 fill-gold text-gold" />
            <span className="text-xs font-bold text-foreground/90">{product.rating ? `${product.rating}` : "0"}</span>
            <span className="text-[11px] text-muted-foreground">({product.reviews || 0})</span>
          </div>

          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-base font-bold text-gold">{formatINR(product.price)}</span>
            {product.oldPrice && product.oldPrice > product.price && (
              <span className="text-xs text-muted-foreground line-through">{formatINR(product.oldPrice)}</span>
            )}
          </div>

          {/* STOCK STATUS CHECKER */}
          <div className="mt-2">
            {product.inStock ? (
              <span className="text-green-500 text-[10px] font-bold uppercase tracking-wider">
                ● In Stock
              </span>
            ) : (
              <span className="text-red-500 text-[10px] font-bold uppercase tracking-wider animate-pulse">
                ✕ Sold Out
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* FLOATING CORNER WISHLIST ACTIONS LINK BUTTON */}
      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-20">
        <button
          onClick={(e) => { 
            e.preventDefault(); 
            e.stopPropagation();
            guard(() => toggleWish(product.id), "Sign in to save to your wishlist"); 
          }}
          className={`w-8 h-8 rounded-full bg-background/90 backdrop-blur border border-border flex items-center justify-center hover:bg-gold hover:text-primary-foreground hover:border-gold transition-colors ${wished ? "text-gold border-gold/40 bg-gold/5" : ""}`}
          aria-label="Toggle Wishlist Location"
        >
          <Heart className={`w-3.5 h-3.5 ${wished ? "fill-current" : ""}`} />
        </button>
      </div>

      {/* QUICK BUY SLIDE BAR DECK ACCELERATOR */}
      <div className="absolute bottom-0 left-0 right-0 flex translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-30 shadow-2xl">
        <button
          disabled={!product.inStock}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            guard(
              () => {
                add(product);
                toast.success(`Added ${product.name} cleanly to your shopping bag.`);
              },
              "Sign in to add items to your shopping bag"
            );
          }}
          className="flex-1 bg-gold text-primary-foreground py-3.5 font-bold text-xs tracking-widest flex items-center justify-center gap-1.5 transition-all disabled:bg-muted disabled:text-muted-foreground uppercase hover:bg-gold/90"
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          ADD TO BAG
        </button>

        <button
          disabled={!product.inStock}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            
            if (!product.inStock) return;

            // Execute programmatic navigation using the dynamic router state engine
            const authorized = guard(() => {
              add(product);
            }, "Sign in to complete transaction checkouts.");

            if (authorized) {
              navigate({ to: "/cart" });
            }
          }}
          className="flex-1 bg-black text-white py-3.5 text-center text-xs font-bold tracking-widest flex items-center justify-center transition-all disabled:bg-muted/80 disabled:text-muted-foreground uppercase hover:bg-neutral-900 border-l border-white/5"
        >
          BUY NOW
        </button>
      </div>
    </motion.div>
  );
}