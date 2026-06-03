import { Link } from "@tanstack/react-router";
import { Camera, Send, MessageCircle, Play } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card mt-24">
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-2 md:grid-cols-5 gap-10">
        <div className="col-span-2">
          <div className="font-display text-3xl tracking-widest text-gradient-gold">JAGA TRADERS</div>
          <p className="text-sm text-muted-foreground mt-2 italic">"Your Court, Your Style, Your Gear."</p>
          <p className="text-sm text-muted-foreground mt-6 max-w-sm">
            Premium badminton equipment for serious players. Curated rackets, tournament-grade shuttles,
            and gear engineered for the court.
          </p>
          <div className="flex gap-3 mt-6">
            {[Camera, Send, MessageCircle, Play].map((Icon, i) => (
              <a key={i} href="#" className="w-9 h-9 rounded-sm border border-border flex items-center justify-center hover:border-gold hover:text-gold transition-colors">
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <div className="font-display text-sm tracking-widest text-gold mb-4">SHOP</div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/shop" className="hover:text-gold">Rackets</Link></li>
            <li><Link to="/shop" className="hover:text-gold">Shuttlecocks</Link></li>
            <li><Link to="/shop" className="hover:text-gold">Footwear</Link></li>
            <li><Link to="/shop" className="hover:text-gold">Apparel</Link></li>
            <li><Link to="/shop" className="hover:text-gold">Bags</Link></li>
          </ul>
        </div>

        <div>
          <div className="font-display text-sm tracking-widest text-gold mb-4">COMPANY</div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/about" className="hover:text-gold">About Us</Link></li>
            <li><Link to="/contact" className="hover:text-gold">Contact</Link></li>
            <li><Link to="/faq" className="hover:text-gold">FAQ</Link></li>
            <li><a className="hover:text-gold">Careers</a></li>
            <li><a className="hover:text-gold">Blog</a></li>
          </ul>
        </div>

        <div>
          <div className="font-display text-sm tracking-widest text-gold mb-4">SUPPORT</div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/shipping" className="hover:text-gold">Shipping</Link></li>
            <li><Link to="/returns" className="hover:text-gold">Returns</Link></li>
            <li><Link to="/returns" className="hover:text-gold">Warranty</Link></li>
            <li><Link to="/account" className="hover:text-gold">Track Order</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <div>&copy; {new Date().getFullYear()} Jaga Traders. All rights reserved.</div>
          <div className="flex gap-6">
            <Link to="/privacy" className="hover:text-gold">Privacy</Link>
            <Link to="/terms" className="hover:text-gold">Terms</Link>
            <Link to="/privacy" className="hover:text-gold">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}