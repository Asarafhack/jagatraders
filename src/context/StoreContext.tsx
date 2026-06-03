import { createContext, useContext, useEffect, useReducer, type ReactNode } from "react";
import type { Product } from "@/data/products";

type CartItem = { product: Product; qty: number };
type State = { cart: CartItem[]; wishlist: string[] };
type Action =
  | { type: "ADD"; product: Product; qty?: number }
  | { type: "REMOVE"; id: string }
  | { type: "QTY"; id: string; qty: number }
  | { type: "CLEAR" }
  | { type: "WISH"; id: string }
  | { type: "HYDRATE"; state: State };

const KEY = "jaga-store";
const initial: State = { cart: [], wishlist: [] };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "HYDRATE": return action.state;
    case "ADD": {
      const existing = state.cart.find((i) => i.product.id === action.product.id);
      if (existing)
        return { ...state, cart: state.cart.map((i) =>
          i.product.id === action.product.id ? { ...i, qty: i.qty + (action.qty ?? 1) } : i) };
      return { ...state, cart: [...state.cart, { product: action.product, qty: action.qty ?? 1 }] };
    }
    case "REMOVE":
      return { ...state, cart: state.cart.filter((i) => i.product.id !== action.id) };
    case "QTY":
      return { ...state, cart: state.cart.map((i) =>
        i.product.id === action.id ? { ...i, qty: Math.max(1, action.qty) } : i) };
    case "CLEAR": return { ...state, cart: [] };
    case "WISH": {
      const has = state.wishlist.includes(action.id);
      return { ...state, wishlist: has
        ? state.wishlist.filter((x) => x !== action.id)
        : [...state.wishlist, action.id] };
    }
  }
}

const Ctx = createContext<{
  state: State;
  add: (p: Product, qty?: number) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  toggleWish: (id: string) => void;
  cartCount: number;
  cartTotal: number;
} | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initial);

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem(KEY) : null;
      if (raw) dispatch({ type: "HYDRATE", state: JSON.parse(raw) });
    } catch { /* noop */ }
  }, []);

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* noop */ }
  }, [state]);

  const cartCount = state.cart.reduce((s, i) => s + i.qty, 0);
  const cartTotal = state.cart.reduce((s, i) => s + i.qty * i.product.price, 0);

  return (
    <Ctx.Provider value={{
      state,
      add: (p, qty) => dispatch({ type: "ADD", product: p, qty }),
      remove: (id) => dispatch({ type: "REMOVE", id }),
      setQty: (id, qty) => dispatch({ type: "QTY", id, qty }),
      clear: () => dispatch({ type: "CLEAR" }),
      toggleWish: (id) => dispatch({ type: "WISH", id }),
      cartCount, cartTotal,
    }}>
      {children}
    </Ctx.Provider>
  );
}

export function useStore() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useStore must be used inside StoreProvider");
  return c;
}

export const formatINR = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);