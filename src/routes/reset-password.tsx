import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Lock, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "Set New Password — Jaga Traders" }] }),
  component: ResetPassword,
});

function ResetPassword() {
  const navigate = useNavigate();
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => { if (data.session) setReady(true); });
    return () => subscription.unsubscribe();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (pw !== pw2) { toast.error("Passwords don't match"); return; }
    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: pw });
      if (error) throw error;
      toast.success("Password updated. Welcome back.");
      navigate({ to: "/" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update password");
    } finally { setBusy(false); }
  }

  return (
    <div className="max-w-md mx-auto px-6 py-24">
      <div className="text-xs tracking-widest text-gold">NEW PASSWORD</div>
      <h1 className="font-display text-4xl mt-2">SET A NEW PASSWORD</h1>
      {!ready ? (
        <p className="mt-6 text-muted-foreground text-sm">Validating reset link…</p>
      ) : (
        <form onSubmit={submit} className="mt-8 space-y-4">
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input type="password" required minLength={6} value={pw} onChange={(e) => setPw(e.target.value)} placeholder="New password" className="w-full pl-10 pr-3 py-3 bg-background border border-border focus:border-gold outline-none" />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input type="password" required minLength={6} value={pw2} onChange={(e) => setPw2(e.target.value)} placeholder="Confirm password" className="w-full pl-10 pr-3 py-3 bg-background border border-border focus:border-gold outline-none" />
          </div>
          <button disabled={busy} className="w-full bg-gold text-primary-foreground py-3 font-bold tracking-widest text-sm hover:shadow-gold transition-shadow disabled:opacity-60 inline-flex items-center justify-center gap-2">
            {busy && <Loader2 className="w-4 h-4 animate-spin" />}
            UPDATE PASSWORD
          </button>
        </form>
      )}
    </div>
  );
}