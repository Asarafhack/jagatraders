import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { LogOut, ShoppingBag, Heart, ShieldCheck, CalendarDays, Phone, CircleHelp } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export const Route = createFileRoute("/account")({
  head: () => ({ meta: [{ title: "My Account — Jaga Traders" }] }),
  component: Account,
});

function Account() {
  const { user, loading, isAdmin, signOut, openLogin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) openLogin();
  }, [loading, user, openLogin]);

  if (!user) return (
    <div className="max-w-md mx-auto px-6 py-24 text-center">
      <h1 className="font-display text-3xl tracking-wide">SIGN IN REQUIRED</h1>
      <p className="text-muted-foreground mt-2 text-sm">Please sign in to view your account dashboard.</p>
    </div>
  );

  // Dynamic initialization value processing safely matching custom attributes
  const displayName =
    user.user_metadata?.full_name ||
    user.email?.split("@")[0] ||
    "Jaga Player";

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <div className="text-xs tracking-widest text-gold font-bold">MEMBER AREA</div>
      <h1 className="font-display text-5xl mt-2 tracking-wide">MY ACCOUNT</h1>

      {/* PREMIUM PROFILE BANNER */}
      <div className="mt-6 flex items-center gap-4 bg-card border border-border p-6 rounded-sm">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gold text-black flex items-center justify-center text-2xl sm:text-3xl font-bold font-display shrink-0 shadow-lg shadow-gold/10">
          {displayName.charAt(0).toUpperCase()}
        </div>

        <div className="min-w-0">
          <h2 className="font-display text-2xl tracking-wide text-foreground truncate">
            {displayName.toUpperCase()}
          </h2>
          <p className="text-sm text-muted-foreground truncate mt-0.5">
            {user.email}
          </p>
          <div className="inline-flex items-center gap-1.5 text-[10px] bg-gold/10 text-gold border border-gold/20 font-bold px-2 py-0.5 rounded-full mt-2 tracking-widest">
            PRO MEMBER
          </div>
        </div>
      </div>

      {/* ACCOUNT STATS HIGHLIGHT GRID (CLEAN BASELINE VALUES) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
        <div className="border border-border bg-card p-5 rounded-sm">
          <div className="text-[10px] tracking-widest font-bold text-muted-foreground">ORDERS</div>
          <div className="font-display text-3xl sm:text-4xl text-gold mt-1">0</div>
        </div>

        <div className="border border-border bg-card p-5 rounded-sm">
          <div className="text-[10px] tracking-widest font-bold text-muted-foreground">WISHLIST</div>
          <div className="font-display text-3xl sm:text-4xl text-gold mt-1">0</div>
        </div>

        <div className="border border-border bg-card p-5 rounded-sm">
          <div className="text-[10px] tracking-widest font-bold text-muted-foreground">SPENT</div>
          <div className="font-display text-3xl sm:text-4xl text-gold mt-1">₹0</div>
        </div>

        <div className="border border-border bg-card p-5 rounded-sm">
          <div className="text-[10px] tracking-widest font-bold text-muted-foreground">STATUS</div>
          <div className="font-display text-xl sm:text-2xl text-green-500 mt-2 font-bold tracking-wide flex items-center gap-1">
            ● ACTIVE
          </div>
        </div>
      </div>

      {/* CORE HUB INTERACTIVE ACTIONS GRID */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-10">
        {/* MY ORDERS HUBBED LINK */}
        <Link to="/cart" className="border border-border bg-card p-6 hover:border-gold transition-all group rounded-sm flex flex-col justify-between min-h-[140px]">
          <div>
            <ShoppingBag className="w-6 h-6 text-gold transition-transform group-hover:scale-110" />
            <div className="font-display text-xl mt-4 group-hover:text-gold transition-colors tracking-wide">MY ORDERS</div>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">View products added to your cart and checkout status.</p>
          </div>
        </Link>

        {/* YOUR SHOPPING BAG LINK */}
        <Link to="/cart" className="border border-border bg-card p-6 hover:border-gold transition-all group rounded-sm flex flex-col justify-between min-h-[140px]">
          <div>
            <ShoppingBag className="w-6 h-6 text-gold transition-transform group-hover:scale-110" />
            <div className="font-display text-xl mt-4 group-hover:text-gold transition-colors tracking-wide">YOUR BAG</div>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">Review saved items added into your active checkout bag.</p>
          </div>
        </Link>

        {/* SAVED WISHLIST LINK */}
        <Link to="/wishlist" className="border border-border bg-card p-6 hover:border-gold transition-all group rounded-sm flex flex-col justify-between min-h-[140px]">
          <div>
            <Heart className="w-6 h-6 text-gold transition-transform group-hover:scale-110" />
            <div className="font-display text-xl mt-4 group-hover:text-gold transition-colors tracking-wide">WISHLIST</div>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">Inspect tournament-ready choices marked for later match days.</p>
          </div>
        </Link>

        {/* SUPPORT INTERACTIVE NODE */}
        <Link to="/contact" className="border border-border bg-card p-6 hover:border-gold transition-all group rounded-sm flex flex-col justify-between min-h-[140px]">
          <div>
            <Phone className="w-6 h-6 text-gold transition-transform group-hover:scale-110" />
            <div className="font-display text-xl mt-4 group-hover:text-gold transition-colors tracking-wide">CONTACT US</div>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">Reach our support team for delivery and account assistance.</p>
          </div>
        </Link>

        {/* KNOWLEDGE BASE DOCUMENTATION NODE */}
        <Link to="/faq" className="border border-border bg-card p-6 hover:border-gold transition-all group rounded-sm flex flex-col justify-between min-h-[140px]">
          <div>
            <CircleHelp className="w-6 h-6 text-gold transition-transform group-hover:scale-110" />
            <div className="font-display text-xl mt-4 group-hover:text-gold transition-colors tracking-wide">HELP & FAQ</div>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">Find answers to common questions about orders and products.</p>
          </div>
        </Link>

        {/* ADMIN BACKEND CARD PROTECTION GATE */}
        {isAdmin && (
          <Link to="/admin" className="border border-gold/30 bg-gold/5 p-6 hover:border-gold transition-all group rounded-sm flex flex-col justify-between min-h-[140px]">
            <div>
              <ShieldCheck className="w-6 h-6 text-gold transition-transform group-hover:scale-110" />
              <div className="font-display text-xl mt-4 text-gold tracking-wide">ADMIN DASHBOARD</div>
              <p className="text-xs text-gold/80 mt-1 leading-relaxed">Access back-office tooling to manage store items & client invoices.</p>
            </div>
          </Link>
        )}
      </div>

      {/* DYNAMIC TIMELINE STATUS LOGGER */}
      <div className="mt-12 border border-border bg-card p-6 rounded-sm">
        <h3 className="font-display text-2xl tracking-wide flex items-center gap-2 mb-2">
          <CalendarDays className="w-5 h-5 text-gold" /> RECENT ACTIVITY
        </h3>
        <div className="text-center py-8 text-xs tracking-wider text-muted-foreground uppercase font-medium">
          No recent system transactional activity found.
        </div>
      </div>

      {/* SIGN OUT DISPATCH ACTIONS TERMINAL BUTTON */}
      <div className="mt-10 flex justify-start">
        <button
          onClick={async () => { 
            await signOut(); 
            navigate({ to: "/" }); 
          }}
          className="inline-flex items-center gap-2 border border-border px-6 py-3.5 text-xs font-bold tracking-widest bg-card hover:border-red-500 hover:text-red-500 transition-colors uppercase rounded-sm"
        >
          <LogOut className="w-4 h-4" /> SIGN OUT
        </button>
      </div>
    </div>
  );
}