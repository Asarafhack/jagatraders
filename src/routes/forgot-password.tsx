import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, Loader2, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({ meta: [{ title: "Reset Password — Jaga Traders" }] }),
  component: ForgotPassword,
});

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setSent(true);
      toast.success("Check your inbox for the reset link");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send reset email");
    } finally { setBusy(false); }
  }

  return (
    <div className="max-w-md mx-auto px-6 py-24">
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-gold mb-8">
        <ArrowLeft className="w-4 h-4" /> Back home
      </Link>
      <div className="text-xs tracking-widest text-gold">PASSWORD RESET</div>
      <h1 className="font-display text-4xl mt-2">FORGOT YOUR PASSWORD?</h1>
      <p className="text-muted-foreground mt-3 text-sm">Enter your email and we'll send you a secure link to set a new one.</p>

      {sent ? (
        <div className="mt-8 border border-gold/40 bg-gold/5 p-6 text-sm">
          A reset link has been sent to <strong className="text-gold">{email}</strong>. Check your inbox (and spam folder).
        </div>
      ) : (
        <form onSubmit={submit} className="mt-8 space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full pl-10 pr-3 py-3 bg-background border border-border focus:border-gold outline-none" />
          </div>
          <button disabled={busy} className="w-full bg-gold text-primary-foreground py-3 font-bold tracking-widest text-sm hover:shadow-gold transition-shadow disabled:opacity-60 inline-flex items-center justify-center gap-2">
            {busy && <Loader2 className="w-4 h-4 animate-spin" />}
            SEND RESET LINK
          </button>
        </form>
      )}
    </div>
  );
}