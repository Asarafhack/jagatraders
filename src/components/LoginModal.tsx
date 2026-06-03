import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Lock, User as UserIcon, Loader2 } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { toast } from "sonner";

export function LoginModal() {
  const { loginOpen, closeLogin } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back to Jaga Traders");
        closeLogin();
      } else {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: { display_name: name || email.split("@")[0] },
          },
        });
        if (error) throw error;
        toast.success("Check your email to verify your account");
        setMode("signin");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setBusy(false);
    }
  }

  async function onGoogle() {
    setBusy(true);
    try {
      const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
      if (r.error) throw r.error;
      if (!r.redirected) { toast.success("Signed in"); closeLogin(); }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Google sign-in failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AnimatePresence>
      {loginOpen && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={closeLogin}
        >
          <motion.div
            initial={{ scale: 0.92, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.92, y: 20, opacity: 0 }}
            transition={{ type: "spring", damping: 22 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md bg-card border border-gold/30 shadow-gold p-8 overflow-hidden"
          >
            <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-gold to-transparent" />
            <button onClick={closeLogin} className="absolute top-4 right-4 text-muted-foreground hover:text-gold" aria-label="Close">
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <div className="font-display text-3xl tracking-widest text-gradient-gold">JAGA TRADERS</div>
              <p className="text-xs tracking-[0.3em] text-muted-foreground mt-1">
                {mode === "signin" ? "WELCOME BACK" : "JOIN THE COURT"}
              </p>
            </div>

            <button
              type="button"
              disabled={busy}
              onClick={onGoogle}
              className="w-full flex items-center justify-center gap-3 border border-border bg-background hover:border-gold hover:text-gold transition-colors py-3 text-sm tracking-wider font-medium disabled:opacity-50"
            >
              <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-2 1.4-4.5 2.4-7.2 2.4-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.6 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.1 5.7l6.2 5.2c-.4.4 6.6-4.8 6.6-14.9 0-1.3-.1-2.3-.4-3.5z"/></svg>
              Continue with Google
            </button>

            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-border" />
              <span className="text-[10px] tracking-[0.3em] text-muted-foreground">OR</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <form onSubmit={onSubmit} className="space-y-3">
              {mode === "signup" && (
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="w-full pl-10 pr-3 py-3 bg-background border border-border focus:border-gold outline-none text-sm" />
                </div>
              )}
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full pl-10 pr-3 py-3 bg-background border border-border focus:border-gold outline-none text-sm" />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full pl-10 pr-3 py-3 bg-background border border-border focus:border-gold outline-none text-sm" />
              </div>

              {mode === "signin" && (
                <div className="text-right">
                  <Link to="/forgot-password" onClick={closeLogin} className="text-xs text-muted-foreground hover:text-gold">Forgot password?</Link>
                </div>
              )}

              <button disabled={busy} className="w-full bg-gold text-primary-foreground py-3 font-bold tracking-widest text-sm hover:shadow-gold transition-shadow disabled:opacity-60 flex items-center justify-center gap-2">
                {busy && <Loader2 className="w-4 h-4 animate-spin" />}
                {mode === "signin" ? "SIGN IN" : "CREATE ACCOUNT"}
              </button>
            </form>

            <p className="text-center text-xs text-muted-foreground mt-5">
              {mode === "signin" ? "New to Jaga Traders?" : "Already have an account?"}{" "}
              <button type="button" onClick={() => setMode(mode === "signin" ? "signup" : "signin")} className="text-gold hover:underline font-semibold">
                {mode === "signin" ? "Create account" : "Sign in"}
              </button>
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}