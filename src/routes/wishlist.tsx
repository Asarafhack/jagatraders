import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useStore } from "@/context/StoreContext";
import { ProductCard } from "@/components/ProductCard";
import { supabase } from "@/integrations/supabase/client";
import { mapDbProductToFrontend, type Product } from "@/data/products";

export const Route = createFileRoute("/wishlist")({
  head: () => ({ meta: [{ title: "Wishlist — Jaga Traders" }] }),
  component: Wishlist,
});

function Wishlist() {
  const { state } = useStore();
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadWishlistData = async () => {
      try {
        setLoading(true);
        
        // Break out early if the client's local context wishlist is empty
        if (!state.wishlist || state.wishlist.length === 0) {
          setItems([]);
          return;
        }

        // Strategy A: If global context products have already finished loading, use them instantly
        if (state.items && state.items.length > 0) {
          const filteredContext = state.items.filter((p) => state.wishlist.includes(p.id));
          setItems(filteredContext);
          return;
        }

        // Strategy B: Fallback async network query to Supabase directly if context is cold-starting
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("is_active", true)
          .in("id", state.wishlist);

        if (error) throw error;

        if (data) {
          setItems(data.map(mapDbProductToFrontend));
        }
      } catch (err) {
        console.error("Failed to load secure wishlist metrics from Supabase:", err);
      } finally {
        setLoading(false);
      }
    };

    loadWishlistData();
  }, [state.wishlist, state.items]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-40 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-gold animate-spin" />
        <p className="text-xs text-muted-foreground font-bold tracking-widest uppercase">Syncing your court setup...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* SECTION TITLE BANNER */}
      <div className="border-b border-border pb-8 mb-8">
        <div className="text-xs tracking-widest text-gold font-bold">SAVED FOR LATER</div>
        <h1 className="font-display text-5xl md:text-6xl mt-2 tracking-wide">WISHLIST</h1>
      </div>

      {items.length === 0 ? (
        /* EMPTY SAVED VIEW COMPONENT PANEL */
        <div className="text-center py-20 border border-dashed border-border bg-card rounded-lg max-w-2xl mx-auto px-4">
          <div className="w-20 h-20 mx-auto rounded-full border border-gold/30 flex items-center justify-center text-gold">
            <Heart className="w-8 h-8" />
          </div>
          <h2 className="font-display text-2xl mt-6 tracking-wide">YOUR WISHLIST IS EMPTY</h2>
          <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
            Save tournament-ready rackets, footwear, or apparel bundles here to track your gear upgrades.
          </p>
          <Link 
            to="/shop" 
            className="inline-block mt-8 bg-gold text-primary-foreground px-8 py-4 text-xs font-bold tracking-widest transition-shadow hover:shadow-gold uppercase rounded-sm"
          >
            Browse Gear catalog
          </Link>
        </div>
      ) : (
        /* SAVED WISHLIST POPULATED CARD MATRIX GRID */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}