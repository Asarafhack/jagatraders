import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, RefreshCw, Search, Trash2, Users, Mail, PhoneCall } from "lucide-react";
import { toast } from "sonner";

interface Customer {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  created_at: string;
}

export const Route = createFileRoute("/admin-customers")({
  component: AdminCustomers,
});

// FIXED: Defined strictly as a localized internal function block to resolve the TanStack Router bundle-size code-splitting error
function AdminCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  async function loadCustomers() {
    setLoading(true);
    // Explicitly targets core account metadata configurations without returning localized browser state streams
    const { data, error } = await supabase
      .from("customers")
      .select("id, name, email, phone, address, created_at")
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error(error);
      toast.error("Failed to fetch customer directory records.");
    } else {
      setCustomers((data as Customer[]) || []);
    }
    setLoading(false);
  }

  async function deleteCustomer(id: string) {
    const ok = window.confirm("Are you sure you want to permanently delete this customer profile? This action clears account access parameters.");
    if (!ok) return;

    const { error } = await supabase
      .from("customers")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(error);
      toast.error("Failed to delete customer row asset.");
      return;
    }

    toast.success("Customer profile purged from database registries successfully.");
    loadCustomers();
  }

  useEffect(() => {
    loadCustomers();
  }, []);

  const filteredCustomers = useMemo(() => {
    return customers.filter(
      (c) =>
        (c.name ?? "").toLowerCase().includes(search.toLowerCase()) ||
        (c.email ?? "").toLowerCase().includes(search.toLowerCase())
    );
  }, [customers, search]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 text-foreground bg-background">
      {/* SECTION BANNER HEAD CONTROL ROW */}
      <div className="flex flex-wrap gap-4 justify-between items-center border-b border-border pb-5">
        <div>
          <h1 className="text-4xl font-display font-bold tracking-wide">Customer Directory</h1>
          <p className="text-xs text-muted-foreground tracking-wider uppercase mt-1">Player Profile Registries</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Name or Email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border border-border bg-card pl-9 pr-4 py-2.5 rounded-sm text-sm outline-none focus:border-gold transition-colors w-64"
            />
          </div>

          <button
            onClick={loadCustomers}
            disabled={loading}
            className="px-5 py-2.5 bg-gold text-primary-foreground text-xs font-bold tracking-widest uppercase inline-flex items-center gap-2 rounded-sm transition-all hover:bg-gold/90 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
            Refresh Directory
          </button>
        </div>
      </div>

      {/* METRIC OVERVIEW DECK CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-8">
        <div className="border border-border bg-card p-6 rounded-sm shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[10px] tracking-widest text-muted-foreground font-bold uppercase">Total Registrations</div>
            <div className="text-4xl font-display font-bold mt-2">{customers.length}</div>
          </div>
          <div className="w-10 h-10 rounded-sm border border-gold/20 bg-gold/5 flex items-center justify-center text-gold"><Users className="w-5 h-5" /></div>
        </div>

        <div className="border border-border bg-card p-6 rounded-sm shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[10px] tracking-widest text-muted-foreground font-bold uppercase">Mailable Nodes</div>
            <div className="text-4xl font-display font-bold mt-2 text-gold">
              {customers.filter((c) => c.email).length}
            </div>
          </div>
          <div className="w-10 h-10 rounded-sm border border-border bg-secondary/20 flex items-center justify-center text-muted-foreground"><Mail className="w-5 h-5" /></div>
        </div>

        <div className="border border-border bg-card p-6 rounded-sm shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[10px] tracking-widest text-muted-foreground font-bold uppercase">Contact Links</div>
            <div className="text-4xl font-display font-bold mt-2 text-green-500">
              {customers.filter((c) => c.phone).length}
            </div>
          </div>
          <div className="w-10 h-10 rounded-sm border border-border bg-secondary/20 flex items-center justify-center text-muted-foreground"><PhoneCall className="w-5 h-5" /></div>
        </div>
      </div>

      {/* CORE ACTIVE TABLE HUB */}
      {loading ? (
        <div className="mt-24 flex flex-col items-center justify-center gap-3 text-sm text-muted-foreground font-bold tracking-widest uppercase">
          <Loader2 className="w-6 h-6 animate-spin text-gold" />
          Mapping profile indexes...
        </div>
      ) : (
        <div className="mt-8 border border-border bg-card rounded-sm shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/40 text-xs font-bold tracking-widest text-muted-foreground uppercase border-b border-border">
              <tr>
                <th className="p-4 text-left">Customer Name</th>
                <th className="p-4 text-left">Email Address</th>
                <th className="p-4 text-left">Phone Number</th>
                <th className="p-4 text-left">Delivery Address</th>
                <th className="p-4 text-left">Joined</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border/60">
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-secondary/10 transition-colors">
                  <td className="p-4 font-semibold text-foreground">
                    {customer.name || <span className="text-muted-foreground/40 font-normal italic">Anonymous Court Player</span>}
                  </td>

                  <td className="p-4 font-medium text-foreground/90">
                    {customer.email || "—"}
                  </td>

                  <td className="p-4 font-mono text-xs text-muted-foreground tracking-wide">
                    {customer.phone || "—"}
                  </td>

                  <td className="p-4 text-xs text-muted-foreground max-w-xs truncate font-medium">
                    {customer.address || "No active shipping location saved"}
                  </td>

                  <td className="p-4 text-xs text-muted-foreground font-medium">
                    {new Date(customer.created_at).toLocaleDateString("en-IN", {
                      dateStyle: "medium",
                    })}
                  </td>

                  <td className="p-4 text-right">
                    <button
                      onClick={() => deleteCustomer(customer.id)}
                      className="text-muted-foreground hover:text-destructive p-2 transition-colors"
                      aria-label="Purge Profile Entry"
                    >
                      <Trash2 className="w-4.5 h-4.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredCustomers.length === 0 && (
            <div className="text-center py-12 text-sm text-muted-foreground italic font-medium">
              No matching profiles found in the directory search index indices.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AdminCustomers;