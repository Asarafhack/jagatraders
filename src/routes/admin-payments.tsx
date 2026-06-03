import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, RefreshCw, Search } from "lucide-react";

interface Payment {
  id: string;
  order_id: string | null;
  payment_id: string | null;
  amount: number;
  status: string;
  payment_method: string | null;
  created_at: string;
}

export const Route = createFileRoute("/admin-payments")({
  component: AdminPayments,
});

// FIXED: Removed inline export statement to satisfy TanStack code-splitting architectures
function AdminPayments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  async function loadPayments() {
    setLoading(true);
    const { data, error } = await supabase
      .from("payments")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error(error);
    } else {
      setPayments((data as Payment[]) || []);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadPayments();
  }, []);

  const filteredPayments = useMemo(() => {
    return payments.filter((p) =>
      (p.payment_id ?? "")
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [payments, search]);

  const totalRevenue = payments.reduce(
    (sum, payment) => sum + Number(payment.amount || 0),
    0
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 text-foreground bg-background">
      <div className="flex justify-between items-center border-b border-border pb-5">
        <div>
          <h1 className="text-4xl font-display font-bold tracking-wide">Payments Audit Log</h1>
          <p className="text-xs text-muted-foreground tracking-wider uppercase mt-1">Razorpay Ledger Pipelines</p>
        </div>

        <button
          onClick={loadPayments}
          disabled={loading}
          className="px-5 py-2.5 bg-gold hover:bg-gold/90 text-primary-foreground text-xs font-bold tracking-widest uppercase flex items-center gap-2 rounded-sm transition-all disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
          Refresh Ledger
        </button>
      </div>

      {/* KPI METRIC CARDS OVERVIEW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-8">
        <div className="border border-border bg-card p-6 rounded-sm shadow-sm">
          <div className="text-[10px] tracking-widest text-muted-foreground font-bold uppercase">Total Transactions</div>
          <div className="text-4xl font-display font-bold mt-2 text-foreground">{payments.length}</div>
        </div>

        <div className="border border-border bg-card p-6 rounded-sm shadow-sm">
          <div className="text-[10px] tracking-widest text-muted-foreground font-bold uppercase">Gross Revenue</div>
          <div className="text-4xl font-display font-bold mt-2 text-gold">₹{totalRevenue.toLocaleString("en-IN")}</div>
        </div>

        <div className="border border-border bg-card p-6 rounded-sm shadow-sm">
          <div className="text-[10px] tracking-widest text-muted-foreground font-bold uppercase">Successful Clearances</div>
          <div className="text-4xl font-display font-bold mt-2 text-green-500">
            {payments.filter((p) => p.status === "paid").length}
          </div>
        </div>
      </div>

      {/* FILTER CONTROL BAR */}
      <div className="mt-8 relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search Razorpay Payment Identifier String (e.g. pay_P3x...)"
          className="border border-border bg-card pl-10 pr-4 py-3 rounded-sm w-full text-sm outline-none focus:border-gold transition-colors"
        />
      </div>

      {loading ? (
        <div className="mt-20 flex flex-col items-center justify-center gap-3 text-muted-foreground text-sm font-semibold tracking-wider uppercase">
          <Loader2 className="w-6 h-6 animate-spin text-gold" />
          Mapping transaction hashes...
        </div>
      ) : (
        <div className="mt-6 border border-border bg-card rounded-sm shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/40 text-xs font-bold tracking-widest text-muted-foreground uppercase border-b border-border">
              <tr>
                <th className="p-4 text-left">Payment ID</th>
                <th className="p-4 text-left">Order Reference</th>
                <th className="p-4 text-left">Amount</th>
                <th className="p-4 text-left">Gateway Method</th>
                <th className="p-4 text-left">Clearance Status</th>
                <th className="p-4 text-left">Settlement Date</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border/60">
              {filteredPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-secondary/10 transition-colors">
                  <td className="p-4 font-mono text-xs text-foreground/90 tracking-wide selection:bg-gold/20">
                    {payment.payment_id || "N/A"}
                  </td>
                  <td className="p-4 font-mono text-xs text-muted-foreground">
                    {payment.order_id ? `${payment.order_id.slice(0, 12)}...` : "N/A"}
                  </td>
                  <td className="p-4 font-bold text-foreground">
                    ₹{payment.amount.toLocaleString("en-IN")}
                  </td>
                  <td className="p-4 text-xs font-semibold tracking-wide uppercase text-muted-foreground/90">
                    {payment.payment_method || "UPI / CARD"}
                  </td>
                  <td className="p-4">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        payment.status === "paid"
                          ? "bg-green-500/10 text-green-500"
                          : "bg-destructive/10 text-destructive animate-pulse"
                      }`}
                    >
                      {payment.status}
                    </span>
                  </td>
                  <td className="p-4 text-xs text-muted-foreground font-medium">
                    {new Date(payment.created_at).toLocaleString("en-IN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </td>
                </tr>
              ))}
              {filteredPayments.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-muted-foreground italic">
                    No matching structural payment logs registered in this node profile.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminPayments;