import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";

type AuthCtx = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  loginOpen: boolean;
  openLogin: () => void;
  closeLogin: () => void;
  signOut: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
  setSession(s);
  setUser(s?.user ?? null);

  console.log("EMAIL:", s?.user?.email);

  if (s?.user) {

    setTimeout(async () => {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", s.user.id);

      console.log("ROLES:", data);

      const admin =
  s.user.email?.toLowerCase() ===
    "admin@jagatraders.com"
  ||
  !!data?.some(
    (r) => r.role === "admin"
  );

setIsAdmin(admin);
    }, 0);

  } else {
    setIsAdmin(false);
  }
});

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const openLogin = useCallback(() => setLoginOpen(true), []);
  const closeLogin = useCallback(() => setLoginOpen(false), []);
  const signOut = useCallback(async () => { await supabase.auth.signOut(); }, []);

  return (
    <Ctx.Provider value={{ user, session, loading, isAdmin, loginOpen, openLogin, closeLogin, signOut }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth must be used inside AuthProvider");
  return c;
}

export function useRequireAuth() {
  const { user, openLogin } = useAuth();
  return (cb: () => void) => {
    if (!user) { openLogin(); return false; }
    cb();
    return true;
  };
}