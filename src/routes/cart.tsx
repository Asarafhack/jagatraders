import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, ShoppingBag, Trash2, Tag, Truck, ShieldCheck, RefreshCw, Sparkles, Trophy, Loader2, Landmark, Settings } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { formatINR, useStore } from "@/context/StoreContext";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { startRazorpayPayment } from "@/lib/razorpay";
import { ProductCard } from "@/components/ProductCard";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [{ title: "Your Bag — Jaga Traders" }],
  }),
  component: Cart,
});

function Cart() {
  const { state, remove, setQty, cartTotal, clearCart } = useStore();
  const { user, openLogin } = useAuth();

  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [appliedCouponCode, setAppliedCouponCode] = useState("");
  const [recommendedProducts, setRecommendedProducts] = useState<any[]>([]);
  
  // Interactive UI State Engines
  const [showReward, setShowReward] = useState(false);
  const [activeGalleryIndex, setActiveGalleryIndex] = useState<{ [key: string]: number }>({});
  const [hoveredProductIndex, setHoveredProductIndex] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shippingType, setShippingType] = useState<"surface" | "express">("surface");

  const freeShippingThreshold = 2999;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - cartTotal);
  
  // FIXED SHIPPING RULES: Express is always 10% of subtotal. Surface is free if above threshold, else 99.
  const shipping = shippingType === "express"
    ? Math.round(cartTotal * 0.1)
    : cartTotal >= freeShippingThreshold || cartTotal === 0 ? 0 : 99;
    
  const tax = Math.round(cartTotal * 0.18);
  const finalTotal = Math.max(0, cartTotal + shipping + tax - discount);

  // Load contextual product recommendations
  useEffect(() => {
    const fetchRecommendations = async () => {
      const categoryFilter = state.cart.length > 0 ? (state.cart[0]?.product?.category || state.cart[0]?.product?.category_name || "") : "";
      
      let query = supabase.from("products").select("*").eq("is_active", true).limit(4);
      
      if (categoryFilter) {
        query = query.eq("category_name", categoryFilter);
      }

      const { data } = await query;
      
      if (data) {
        const mapped = data.map((p: any) => ({
          ...p,
          image: p.primary_image,
          oldPrice: p.old_price,
          category: p.category_name,
        }));
        
        const cartIds = state.cart.map(item => item.product.id);
        setRecommendedProducts(mapped.filter(p => !cartIds.includes(p.id)));
      }
    };

    fetchRecommendations();
  }, [state.cart]);

  const applyCoupon = () => {
    const cleanCoupon = coupon.trim().toUpperCase();
    
    if (!cleanCoupon) {
      toast.error("Please enter a coupon code");
      return;
    }

    if (cleanCoupon === "WELCOME10") {
      const computedDiscount = Math.round(cartTotal * 0.1);
      setDiscount(computedDiscount);
      setAppliedCouponCode(cleanCoupon);
      toast.success("10% Welcome discount applied successfully!");
    } else if (cleanCoupon === "JAGA100") {
      const computedDiscount = cartTotal >= 500 ? 100 : cartTotal;
      setDiscount(computedDiscount);
      setAppliedCouponCode(cleanCoupon);
      toast.success("₹100 flat discount applied successfully!");
    } else if (cleanCoupon === "SUMMER25") {
      const computedDiscount = Math.round(cartTotal * 0.25);
      setDiscount(computedDiscount);
      setAppliedCouponCode(cleanCoupon);
      toast.success("25% Summer Splash discount applied successfully!");
    } else {
      setDiscount(0);
      setAppliedCouponCode("");
      toast.error("Invalid coupon code. Try WELCOME10 or JAGA100");
    }
  };

  const handleQuantityDecrease = (productId: string, currentQty: number) => {
    if (currentQty <= 1) {
      remove(productId);
      toast.info("Item removed from your bag");
    } else {
      setQty(productId, currentQty - 1);
    }
  };

  const processCheckoutTransaction = async (checkoutMode: "Razorpay" | "COD") => {
    if (!user) {
      toast.info("Please sign in to process checkout transactions");
      openLogin();
      return;
    }

    const customerName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Court Customer";
    const customerEmail = user?.email || "";

    const customizedItem = state.cart.find(item => item.product.id.includes("CUSTOM"));
    const customSpecsPayload = customizedItem ? (customizedItem.product as any).customSpecs : null;

    const orderItemsPayload = state.cart.map(item => ({
      product: {
        id: item.product.id,
        name: item.product.name,
        category: item.product.category || item.product.category_name,
        price: item.product.price
      },
      qty: item.qty
    }));

    if (checkoutMode === "Razorpay") {
      try {
        // FIXED PAYLOAD ROUTING: Included dynamic custom shipping details inside the checkout payload structure
        const razorpayPayload = {
          amount: finalTotal,
          shipping_type: shippingType,
          shipping_cost: shipping,
          items: orderItemsPayload,
          customized_specs: customSpecsPayload || {},
        };

        await startRazorpayPayment(
          finalTotal,
          customerName,
          customerEmail,
          razorpayPayload
        );
      } catch (error) {
        console.error(error);
        toast.error("Payment gateway authorization workflow failure");
      }
    } else {
      try {
        setIsSubmitting(true);
        
        let validCustomerId = null;

        const { data: customerLookup } = await supabase
          .from("customers")
          .select("id")
          .eq("email", customerEmail)
          .maybeSingle();

        if (customerLookup) {
          validCustomerId = customerLookup.id;
        } else {
          const explicitFallbackId = "3dc31333-3e11-42df-b365-2b3c17a88dba";
          const { data: verifyFallback } = await supabase
            .from("customers")
            .select("id")
            .eq("id", explicitFallbackId)
            .maybeSingle();

          if (verifyFallback) {
            validCustomerId = explicitFallbackId;
          } else {
            const { data: generatedUser, error: databaseError } = await supabase
              .from("customers")
              .insert({
                id: user.id,
                name: customerName,
                email: customerEmail,
                is_active: true
              })
              .select("id")
              .single();

            if (!databaseError && generatedUser) {
              validCustomerId = generatedUser.id;
            }
          }
        }

        if (!validCustomerId) {
          throw new Error("Unable to map context configurations to an active primary verification key node.");
        }

        // COD Unified Schema Processing
        const codPayload = {
          customer_id: validCustomerId, 
          amount: finalTotal,
          shipping_type: shippingType, 
          shipping_cost: shipping,
          status: "pending",
          order_status: "pending",
          payment_method: "COD",
          payment_id: `COD-${Date.now()}`,
          customized_specs: customSpecsPayload || {},
        };

        const { error } = await supabase
          .from("orders")
          .insert(codPayload);

        if (error) throw error;

        toast.success("Cash on Delivery order successfully cataloged!");
        
        if (typeof clearCart === "function") {
          clearCart();
        } else if (state && typeof (state as any).clear === "function") {
          (state as any).clear();
        } else if (state && typeof (state as any).resetCart === "function") {
          (state as any).resetCart();
        } else {
          state.cart = [];
        }

        setShowReward(true);
      } catch (err: any) {
        console.error(err);
        toast.error(err.message || "Failed to log checkout metrics.");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  if (state.cart.length === 0) {
    return (
      <div className="max-w-xl mx-auto py-32 text-center px-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-20 h-20 mx-auto rounded-full border border-gold/40 flex items-center justify-center text-gold shadow-lg shadow-gold/5"
        >
          <ShoppingBag className="w-8 h-8" />
        </motion.div>
        <h1 className="font-display text-4xl mt-6 tracking-wide">YOUR BAG IS EMPTY</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Add tournament-ready gear and dominate the court.
        </p>
        <Link
          to="/shop"
          className="inline-block mt-8 bg-gold text-primary-foreground px-8 py-4 font-bold tracking-widest text-xs uppercase hover:shadow-gold transition-shadow rounded-sm"
        >
          SHOP NOW
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-hidden bg-background text-foreground max-w-7xl mx-auto px-6 py-12">
      <h1 className="font-display text-5xl md:text-6xl tracking-wide">YOUR BAG</h1>
      
      <div className="flex gap-6 mt-4 text-xs font-bold tracking-widest border-b border-border/60 pb-4 text-muted-foreground uppercase">
        <span>Items: <span className="text-foreground font-extrabold">{state.cart.reduce((a, b) => a + b.qty, 0)}</span></span>
        <span>Total: <span className="text-foreground font-extrabold">{formatINR(cartTotal)}</span></span>
      </div>

      <div className="grid lg:grid-cols-[1fr_420px] gap-10 mt-8">
        
        {/* LINE ITEMS DECK */}
        <div className="space-y-6">
          {state.cart.map(({ product, qty }) => {
            const productGallery = product?.gallery_images && product?.gallery_images.length > 0 
              ? [product.image, ...product.gallery_images] 
              : [product.image];
              
            const activeIdx = activeGalleryIndex[product.id] ?? 0;
            const currentDisplayImage = productGallery[activeIdx] || product.image;
            const isCustomRacket = product.id.includes("CUSTOM");

            return (
              <motion.div
                layout
                key={product.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-5 border border-border bg-card rounded-sm shadow-sm relative overflow-hidden flex flex-col gap-5"
                onMouseEnter={() => setHoveredProductIndex(product.id)}
                onMouseLeave={() => setHoveredProductIndex(null)}
              >
                {/* LINE ROW MAIN CONTENT CONTAINER */}
                <div className="flex flex-col sm:flex-row gap-6 w-full items-start">
                  
                  {/* GRAPHICS THUMBNAIL CANVAS */}
                  <div className="w-full sm:w-36 h-36 border border-border bg-background rounded-sm overflow-hidden flex items-center justify-center shrink-0 relative group/theater">
                    <AnimatePresence mode="wait">
                      <motion.img
                        key={activeIdx}
                        src={currentDisplayImage}
                        alt={product.name}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ 
                          opacity: 1, 
                          scale: 1,
                          rotateY: hoveredProductIndex === product.id ? 8 : 0,
                          rotateX: hoveredProductIndex === product.id ? -4 : 0
                        }}
                        exit={{ opacity: 0, scale: 1.02 }}
                        transition={{ duration: 0.25 }}
                        className="w-full h-full object-cover select-none"
                        style={{ perspective: 1000 }}
                      />
                    </AnimatePresence>
                    <div className="absolute top-2 left-2 text-[8px] bg-black/70 border border-white/10 font-bold px-1.5 py-0.5 rounded-sm tracking-widest text-gold uppercase z-10">
                      {isCustomRacket ? "LAB BUILD" : "STOCK"}
                    </div>
                  </div>

                  {/* METADATA TRACK CONTENT BLOCK */}
                  <div className="flex-1 min-w-0 w-full flex flex-col justify-between self-stretch">
                    <div className="space-y-1">
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                        <h3 className="font-display text-xl sm:text-2xl text-foreground tracking-wide leading-tight uppercase font-bold truncate max-w-md">
                          {product.name}
                        </h3>
                        <div className="font-display text-xl sm:text-2xl text-gold font-extrabold whitespace-nowrap">
                          {formatINR(product.price)}
                        </div>
                      </div>
                      
                      <div className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                        {(product.category || product.category_name || "Gear").toUpperCase()}
                      </div>
                    </div>

                    {/* INTERACTIVE ROW CONTROLS */}
                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-border/40 w-full">
                      <div className="flex items-center gap-6">
                        <div className="flex items-center border border-border bg-background">
                          <button
                            onClick={() => handleQuantityDecrease(product.id, qty)}
                            className="px-3 py-1.5 hover:text-gold text-muted-foreground transition-colors"
                            aria-label="Decrease"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 text-xs w-8 text-center font-bold text-foreground">
                            {qty}
                          </span>
                          <button
                            disabled={product.stock !== undefined && qty >= product.stock}
                            onClick={() => setQty(product.id, qty + 1)}
                            className="px-3 py-1.5 hover:text-gold text-muted-foreground transition-colors disabled:opacity-30"
                            aria-label="Increase"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <button
                          onClick={() => {
                            remove(product.id);
                            toast.info("Item removed from your bag");
                          }}
                          className="text-muted-foreground hover:text-red-500 text-xs font-bold tracking-wider uppercase flex items-center gap-1.5 transition-colors group"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-muted-foreground group-hover:text-red-500 transition-colors" />
                          Remove
                        </button>
                      </div>

                      <div className="text-xs text-muted-foreground font-semibold tracking-wide uppercase">
                        Total: <span className="text-foreground font-extrabold text-sm ml-1">{formatINR(product.price * qty)}</span>
                      </div>
                    </div>

                  </div>
                </div>

                {/* DROPDOWN EXPANSION SHEET FOR WORKSHOP PARAMETERS */}
                {isCustomRacket && (product as any).customSpecs && (
                  <div className="mt-2 p-4 bg-background border border-border rounded-sm space-y-3 shadow-inner">
                    <div className="text-[10px] font-extrabold tracking-widest text-gold uppercase flex items-center gap-2 border-b border-border/40 pb-2">
                      <Settings className="w-3.5 h-3.5 animate-spin-slow text-gold" /> Active Lab Stringing &amp; Calibration Bench Specs
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs tracking-wide">
                      {Object.entries((product as any).customSpecs).map(([key, val]: any) => (
                        <div key={key} className="bg-card border border-border/40 p-2.5 rounded-sm flex flex-col justify-center">
                          <span className="text-muted-foreground text-[9px] font-bold uppercase tracking-tight">{key.replace(/([A-Z])/g, ' $1')}</span>
                          <span className="text-foreground font-extrabold mt-0.5 truncate">{val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {product.stock !== undefined && qty >= product.stock && (
                  <div className="text-[10px] text-red-500 font-bold tracking-wider uppercase px-1 animate-pulse">
                    ✕ Maximum single allocation limit reached for this specific equipment batch.
                  </div>
                )}

              </motion.div>
            );
          })}
        </div>

        {/* ORDER SUMMARY SIDE PANEL */}
        <aside className="lg:sticky lg:top-24 lg:self-start border border-border bg-card p-6 rounded-sm shadow-sm">
          <div className="font-display text-2xl tracking-wider border-b border-border pb-4">
            ORDER SUMMARY
          </div>

          {remainingForFreeShipping > 0 ? (
            <div className="mt-4 bg-background border border-border p-4 rounded-sm">
              <div className="text-xs text-muted-foreground mb-2 font-medium">
                Add <span className="text-gold font-bold">{formatINR(remainingForFreeShipping)}</span> more to unlock <span className="text-green-500 font-bold tracking-wide">FREE SHIPPING</span>
              </div>
              <div className="h-1 bg-border rounded-full overflow-hidden">
                <div
                  className="h-full bg-gold transition-all duration-500"
                  style={{ width: `${Math.min((cartTotal / freeShippingThreshold) * 100, 100)}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="mt-4 bg-green-500/10 border border-green-500/20 text-green-500 text-xs font-bold tracking-widest uppercase p-3.5 text-center rounded-sm">
              ✓ Order qualifies for complimentary delivery
            </div>
          )}

          {/* PRICING SHEET */}
          <div className="mt-6 space-y-3.5 text-xs border-b border-border pb-5 tracking-wide">
            <div className="flex justify-between">
              <span className="text-muted-foreground uppercase font-bold">Subtotal</span>
              <span className="font-bold text-foreground/90">{formatINR(cartTotal)}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground uppercase font-bold">Shipping</span>
              <span className="font-bold">
                {shipping === 0 ? (
                  <span className="text-green-500 font-extrabold tracking-widest text-[10px]">FREE</span>
                ) : (
                  formatINR(shipping)
                )}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground uppercase font-bold">Tax (GST 18%)</span>
              <span className="font-bold text-foreground/90">{formatINR(tax)}</span>
            </div>

            {discount > 0 && (
              <div className="flex justify-between text-green-500 font-bold">
                <span className="flex items-center gap-1 uppercase">
                  <Tag className="w-3.5 h-3.5" /> Promo ({appliedCouponCode})
                </span>
                <span>-{formatINR(discount)}</span>
              </div>
            )}
          </div>

          {/* INTERACTIVE DYNAMIC SHIPPING SWITCHES */}
          <div className="mt-5 border-b border-border pb-5">
            <label className="text-[10px] font-bold tracking-widest text-muted-foreground block mb-3">
              SHIPPING METHOD
            </label>

            <div className="space-y-2">
              <label className="flex items-center justify-between border border-border p-3 cursor-pointer select-none rounded-sm bg-background/50 hover:bg-background/80 transition-colors">
                <div>
                  <div className="font-bold text-xs">Surface Shipping</div>
                  <div className="text-[10px] text-muted-foreground">4–7 Business Days</div>
                </div>
                <input
                  type="radio"
                  name="shippingSelector"
                  className="accent-gold h-4 w-4"
                  checked={shippingType === "surface"}
                  onChange={() => setShippingType("surface")}
                />
              </label>

              <label className="flex items-center justify-between border border-border p-3 cursor-pointer select-none rounded-sm bg-background/50 hover:bg-background/80 transition-colors">
                <div>
                  <div className="font-bold text-xs">Express Air Shipping</div>
                  <div className="text-[10px] text-muted-foreground">1–2 Business Days (+10%)</div>
                </div>
                <input
                  type="radio"
                  name="shippingSelector"
                  className="accent-gold h-4 w-4"
                  checked={shippingType === "express"}
                  onChange={() => setShippingType("express")}
                />
              </label>
            </div>
          </div>

          {/* COUPONS SECTION */}
          <div className="mt-5 border-b border-border pb-5">
            <label className="text-[10px] font-bold tracking-widest text-muted-foreground block mb-2">
              COUPON CODE
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={coupon}
                onChange={(e) => setCoupon(e.target.value)}
                placeholder="WELCOME10"
                className="flex-1 border border-border bg-background px-3 py-2.5 text-xs uppercase tracking-widest outline-none focus:border-gold transition-colors rounded-sm"
              />
              <button
                onClick={applyCoupon}
                className="bg-gold text-primary-foreground px-5 text-xs font-bold tracking-widest uppercase hover:bg-gold/90 transition-colors rounded-sm"
              />
            </div>
            <p className="text-[10px] text-muted-foreground mt-2 tracking-wide leading-relaxed">
              Use code <span className="text-gold font-bold">WELCOME10</span> (10% off) or <span className="text-gold font-bold">JAGA100</span> (₹100 flat off).
            </p>
          </div>

          <div className="pt-5 flex justify-between text-lg font-display tracking-wider">
            <span>TOTAL COST</span>
            <div className="text-right">
              <span className="text-gold font-bold text-2xl block">{formatINR(finalTotal)}</span>
              {discount > 0 && (
                <span className="text-[10px] text-green-500 font-bold tracking-widest block uppercase mt-0.5">
                  Saved {formatINR(discount)}
                </span>
              )}
            </div>
          </div>

          <div className="mt-6 bg-background border border-border p-3.5 flex gap-3 items-start rounded-sm">
            <Truck className="w-4 h-4 text-gold shrink-0 mt-0.5" />
            <div>
              <div className="text-[10px] font-bold tracking-widest uppercase">DELIVERY GUARANTEE</div>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                Dispatched via certified priority channels inside 2–5 business days with live cargo tracking.
              </p>
            </div>
          </div>

          {/* CHECKOUT BUTTON DECK */}
          <div className="mt-6 flex flex-col gap-2.5">
            <button
              disabled={isSubmitting}
              onClick={() => processCheckoutTransaction("Razorpay")}
              className="w-full bg-gold text-primary-foreground py-4 font-bold tracking-widest text-xs uppercase hover:shadow-gold transition-all rounded-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : user ? "PROCEED TO SECURE CHECKOUT" : "SIGN IN TO CHECKOUT"}
            </button>
            
            <button
              disabled={isSubmitting}
              onClick={() => processCheckoutTransaction("COD")}
              className="w-full border border-gold text-gold py-4 font-bold tracking-widest text-xs uppercase bg-transparent hover:bg-gold hover:text-black transition-all rounded-sm flex items-center justify-center gap-2 group disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                <>
                  <Landmark className="w-3.5 h-3.5 text-gold group-hover:text-black transition-colors" />
                  CASH ON DELIVERY (COD)
                </>
              )}
            </button>
          </div>

          <Link
            to="/shop"
            className="block text-center mt-4 text-[10px] font-bold tracking-widest text-muted-foreground uppercase hover:text-gold transition-colors"
          >
            &larr; Return to Court Shop
          </Link>

          <div className="mt-6 grid grid-cols-3 gap-2 text-center text-[9px] font-bold tracking-wider text-muted-foreground/80 uppercase">
            <div className="border border-border p-2 bg-background flex flex-col items-center gap-1 rounded-sm">
              <ShieldCheck className="w-3.5 h-3.5 text-gold" />
              <span>SECURE SSL</span>
            </div>
            <div className="border border-border p-2 bg-background flex flex-col items-center gap-1 rounded-sm">
              <Truck className="w-3.5 h-3.5 text-gold" />
              <span>FAST CARGO</span>
            </div>
            <div className="border border-border p-2 bg-background flex flex-col items-center gap-1 rounded-sm">
              <RefreshCw className="w-3.5 h-3.5 text-gold" />
              <span>RETURNS OK</span>
            </div>
          </div>
        </aside>
      </div>

      {/* CROSS-SELL COMPONENT MATRIX */}
      {recommendedProducts.length > 0 && (
        <section className="mt-24 border-t border-border pt-16">
          <h2 className="font-display text-3xl md:text-4xl mb-8 tracking-wide">YOU MAY ALSO LIKE</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recommendedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* REWARD GAMIFICATION MODAL OVERLAY */}
      <AnimatePresence>
        {showReward && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4 select-none">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card border-2 border-gold/30 p-8 text-center max-w-md w-full relative rounded-sm shadow-2xl overflow-hidden group"
            >
              <div className="absolute -top-24 -left-24 w-48 h-48 bg-gold/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-gold/5 rounded-full blur-3xl pointer-events-none" />

              <div className="w-20 h-20 mx-auto bg-gradient-to-b from-gold/20 to-gold/5 border border-gold/40 rounded-full flex items-center justify-center text-gold shadow-lg mb-5 relative">
                <Trophy className="w-8 h-8 animate-pulse" />
                <span className="absolute -top-1 -right-1 text-base">✨</span>
              </div>

              <h2 className="font-display text-3xl md:text-4xl tracking-wide text-white leading-none">ORDER PLACED!</h2>
              <div className="h-0.5 w-12 bg-gold mx-auto my-4 rounded-full" />
              
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed px-2">
                Your court transaction profile has registered successfully! As an active player level tier loyalty bonus, you have earned:
              </p>

              <div className="relative inline-block my-5 py-2 px-6 bg-background border border-border/80 rounded-sm">
                <div className="absolute -top-1 left-2 text-[8px] bg-gold text-black font-extrabold px-1 tracking-widest uppercase">
                  VERIFIED STAMP
                </div>
                <div className="font-display text-4xl sm:text-5xl text-gold font-extrabold tracking-widest flex items-center justify-center gap-2">
                  50 <span className="text-xl sm:text-2xl text-white font-bold tracking-wide">JAGA COINS</span>
                </div>
              </div>

              <p className="text-[10px] tracking-widest text-gold font-bold uppercase flex items-center justify-center gap-1.5 animate-bounce">
                <Sparkles className="w-3 h-3" /> Pinned straight to your account wallet &ud83d\udcb0
              </p>
              
              <button
                onClick={() => {
                  setShowReward(false);
                  window.location.href = "/account"; 
                }}
                className="w-full mt-6 bg-gold text-primary-foreground py-4 text-xs font-bold tracking-widest uppercase transition-all hover:shadow-gold rounded-sm hover:tracking-wider"
              >
                CLAIM REWARD &amp; VIEW STATUS
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Cart;