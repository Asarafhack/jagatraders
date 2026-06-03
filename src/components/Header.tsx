import { Link, useRouterState } from "@tanstack/react-router";
import { Heart, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useStore } from "@/context/StoreContext";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import logo from "@/assets/brand-logo.jpg";

const nav = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Shop" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
  { to: "/faq", label: "FAQ" },
];

export function Header() {
  const { cartCount, state } = useStore();
  const { user, openLogin, isAdmin } = useAuth();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { location } = useRouterState();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setOpen(false); }, [location.pathname]);

  return (
    <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
      scrolled ? "bg-background/85 backdrop-blur-xl border-b border-border" : "bg-transparent"
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 md:h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <img src={logo} alt="Jaga Traders" width={40} height={40}
               className="w-10 h-10 object-cover rounded-sm border border-gold/40 group-hover:scale-110 transition-transform" />
          <div className="leading-none">
            <div className="font-display text-xl tracking-widest">JAGA</div>
            <div className="text-[10px] text-muted-foreground tracking-[0.3em] -mt-0.5">TRADERS</div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="relative text-sm font-medium uppercase tracking-wider text-foreground/80 hover:text-gold transition-colors group"
              activeProps={{ className: "text-gold" }}
              activeOptions={{ exact: n.to === "/" }}
            >
              {n.label}
              <span className="absolute -bottom-1 left-0 h-px w-0 bg-gold group-hover:w-full transition-all duration-300" />
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          {isAdmin && (
            <Link to="/admin" className="hidden md:inline-flex px-3 py-1.5 text-[10px] tracking-widest border border-gold text-gold hover:bg-gold hover:text-primary-foreground transition-colors">
              ADMIN
            </Link>
          )}
          <button className="p-2 hover:text-gold transition-colors" aria-label="Search">
            <Search className="w-5 h-5" />
          </button>
          <Link to="/wishlist" className="p-2 hover:text-gold transition-colors relative" aria-label="Wishlist">
            <Heart className="w-5 h-5" />
            {state.wishlist.length > 0 && (
              <span className="absolute top-0 right-0 w-4 h-4 rounded-full bg-gold text-primary-foreground text-[10px] flex items-center justify-center font-bold">
                {state.wishlist.length}
              </span>
            )}
          </Link>
          {user ? (
            <Link to="/account" className="p-2 hover:text-gold transition-colors hidden sm:inline-flex" aria-label="Account">
              <User className="w-5 h-5" />
            </Link>
          ) : (
            <button onClick={openLogin} className="p-2 hover:text-gold transition-colors hidden sm:inline-flex" aria-label="Sign in">
              <User className="w-5 h-5" />
            </button>
          )}
          <Link to="/cart" className="p-2 hover:text-gold transition-colors relative" aria-label="Cart">
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <motion.span
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                className="absolute top-0 right-0 w-4 h-4 rounded-full bg-gold text-primary-foreground text-[10px] flex items-center justify-center font-bold"
              >
                {cartCount}
              </motion.span>
            )}
          </Link>
          <button className="md:hidden p-2" onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {open && (
        <motion.div
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="md:hidden border-t border-border bg-background/95 backdrop-blur-xl"
        >
          <nav className="px-6 py-6 flex flex-col gap-4">
            {nav.map((n) => (
              <Link key={n.to} to={n.to} className="font-display text-2xl tracking-wide hover:text-gold transition-colors">
                {n.label}
              </Link>
            ))}
          </nav>
        </motion.div>
      )}
    </header>
  );
}