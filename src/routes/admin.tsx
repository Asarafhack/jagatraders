import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/context/AuthContext";
import { ShieldAlert, Plus, Trash2, Pencil, Upload, X, Package, Image as ImageIcon, Tag, BarChart3, Loader2 } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — Jaga Traders" }] }),
  component: Admin,
});

type Tab =
  | "dashboard"
  | "products"
  | "orders"
  | "customers"
  | "payments"
  | "analytics"
  | "banners"
  | "categories";

type ProductRow = {
  id: string;
  name: string;
  slug: string;
  price: number;
  old_price: number | null;
  stock: number;
  in_stock: boolean;
  featured: boolean;
  bestseller: boolean;
  is_new: boolean;
  category_name: string | null;
  tagline: string | null;
  description: string | null;
  primary_image: string | null;
  is_active: boolean;
  brand: string | null;
  sku: string | null;
  specifications: string | null;
  video_url: string | null;
  gallery_images: string[] | null;
};

function Admin() {
  const { user, isAdmin, loading } = useAuth();
  const [tab, setTab] = useState<Tab>("dashboard");

  if (loading) return <div className="py-32 flex justify-center items-center gap-2 text-muted-foreground"><Loader2 className="w-5 h-5 animate-spin text-gold" /> Loading Control Center…</div>;

  if (!user || !isAdmin) {
    return (
      <div className="max-w-md mx-auto px-6 py-24 text-center">
        <ShieldAlert className="w-12 h-12 mx-auto text-destructive" />
        <h1 className="font-display text-3xl mt-4">ACCESS RESTRICTED</h1>
        <p className="text-muted-foreground mt-2 text-sm">This area is reserved for administrators.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      <div className="text-xs tracking-widest text-gold font-bold">CONTROL CENTER</div>
      <h1 className="font-display text-5xl mt-2 tracking-wide">ADMIN DASHBOARD</h1>
      <p className="text-muted-foreground mt-2 text-sm">Welcome, {user.email}.</p>

      <div className="flex flex-wrap gap-2 mt-10 border-b border-border">
        {([
          ["dashboard", "Dashboard", BarChart3],
          ["products", "Products", Package],
          ["orders", "Orders", Package],
          ["customers", "Customers", Package],
          ["payments", "Payments", Package],
          ["analytics", "Analytics", BarChart3],
          ["banners", "Banners", ImageIcon],
          ["categories", "Categories", Tag],
        ] as const).map(([k, l, Icon]) => (
          <button key={k} onClick={() => setTab(k)}
            className={`px-4 py-3 text-xs tracking-widest font-semibold flex items-center gap-2 border-b-2 transition-colors ${tab === k ? "border-gold text-gold" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            <Icon className="w-4 h-4" /> {l.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {tab === "dashboard" && <DashboardTab />}
        {tab === "products" && <ProductsTab />}
        {tab === "banners" && <BannersTab />}
        {tab === "categories" && <CategoriesTab />}
        {tab === "orders" && <OrdersTab />}
        {tab === "customers" && <CustomersTab />}
        {tab === "payments" && <PaymentsTab />}
        {tab === "analytics" && <AnalyticsTab />}
      </div>
    </div>
  );
}

function DashboardTab() {
  const [stats, setStats] = useState({ products: 0, users: 0, lowStock: 0, banners: 0 });
  useEffect(() => {
    (async () => {
      const [p, u, l, b] = await Promise.all([
        supabase.from("products").select("*", { count: "exact", head: true }),
        supabase.from("customers").select("*", { count: "exact", head: true }),
        supabase.from("products").select("*", { count: "exact", head: true }).lt("stock", 10),
        supabase.from("banners").select("*", { count: "exact", head: true }),
      ]);
      setStats({ products: p.count ?? 0, users: u.count ?? 0, lowStock: l.count ?? 0, banners: b.count ?? 0 });
    })();
  }, []);
  const cards = [
    { l: "PRODUCTS", v: stats.products },
    { l: "CUSTOMERS", v: stats.users },
    { l: "LOW STOCK", v: stats.lowStock },
    { l: "BANNERS", v: stats.banners },
  ];
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {cards.map((c) => (
        <motion.div key={c.l} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="border border-border bg-card p-6 hover:border-gold/50 transition-colors rounded-sm shadow-sm">
          <div className="text-[10px] tracking-widest text-muted-foreground font-bold">{c.l}</div>
          <div className="font-display text-5xl text-gold mt-3 font-bold">{c.v}</div>
        </motion.div>
      ))}
    </div>
  );
}

function ProductsTab() {
  const [items, setItems] = useState<ProductRow[]>([]);
  const [editing, setEditing] = useState<Partial<ProductRow> | null>(null);
  const [q, setQ] = useState("");

  const load = async () => {
    const { data } = await supabase.from("products").select("*").order("created_at", { ascending: false });
    setItems((data as ProductRow[]) ?? []);
  };
  useEffect(() => { load(); }, []);

  const filtered = items.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()));

  const quickToggle = async (id: string, field: "is_active" | "featured" | "bestseller", value: boolean) => {
    const update = { [field]: value } as { is_active?: boolean; featured?: boolean; bestseller?: boolean };
    const { error } = await supabase.from("products").update(update).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Updated Successfully");
    load();
  };

  const del = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted Successfully");
    load();
  };

  return (
    <div>
      <div className="flex flex-wrap gap-3 items-center justify-between mb-5">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products…"
          className="bg-card border border-border px-4 py-2.5 text-sm flex-1 min-w-[200px] focus:border-gold outline-none rounded-sm transition-colors" />
        <button onClick={() => setEditing({ name: "", slug: "", price: 0, stock: 0, in_stock: true, featured: false, bestseller: false, is_new: true, is_active: true, gallery_images: [] })}
          className="bg-gold text-primary-foreground px-5 py-2.5 text-xs tracking-widest font-bold flex items-center gap-2 rounded-sm uppercase transition-all hover:shadow-md hover:shadow-gold/10">
          <Plus className="w-4 h-4" /> NEW PRODUCT
        </button>
      </div>

      <div className="border border-border bg-card overflow-x-auto rounded-sm shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-secondary/40 text-xs tracking-widest text-muted-foreground uppercase font-bold border-b border-border">
            <tr>
              <th className="text-left p-4">Product</th>
              <th className="text-left p-4">Price</th>
              <th className="text-left p-4">Stock</th>
              <th className="text-center p-4">Active</th>
              <th className="text-center p-4">Featured</th>
              <th className="text-center p-4">Best</th>
              <th className="text-right p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="border-t border-border hover:bg-secondary/20 transition-colors">
                <td className="p-4">
                  <div className="font-semibold text-foreground">{p.name}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{p.slug} · <span className="text-gold font-medium">{p.category_name || "Uncategorized"}</span></div>
                </td>
                <td className="p-4 font-medium text-foreground">₹{p.price.toLocaleString("en-IN")}</td>
                <td className="p-4">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${p.stock < 10 ? "bg-destructive/10 text-destructive animate-pulse" : "bg-green-500/10 text-green-500"}`}>{p.stock} units</span>
                </td>
                <td className="p-4 text-center"><Toggle on={p.is_active} onChange={(v) => quickToggle(p.id, "is_active", v)} /></td>
                <td className="p-4 text-center"><Toggle on={p.featured} onChange={(v) => quickToggle(p.id, "featured", v)} /></td>
                <td className="p-4 text-center"><Toggle on={p.bestseller} onChange={(v) => quickToggle(p.id, "bestseller", v)} /></td>
                <td className="p-4">
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => setEditing(p)} className="p-2 hover:text-gold transition-colors"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => del(p.id)} className="p-2 hover:text-destructive transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="p-12 text-center text-muted-foreground italic">No matched products found inside the court inventory.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {editing && <ProductEditor row={editing} onClose={() => { setEditing(null); load(); }} />}
    </div>
  );
}

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!on)}
      className={`w-10 h-5 rounded-full transition-colors relative ${on ? "bg-gold" : "bg-muted"}`}>
      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-background transition-transform shadow-sm ${on ? "translate-x-5" : "translate-x-0.5"}`} />
    </button>
  );
}

function ProductEditor({ row, onClose }: { row: Partial<ProductRow>; onClose: () => void }) {
  const [form, setForm] = useState<Partial<ProductRow>>(row);
  const [uploading, setUploading] = useState(false);
  const [galleryUploading, setGalleryUploading] = useState(false);
  const [galleryImages, setGalleryImages] = useState<string[]>(row.gallery_images ?? []);
  
  const fileRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const isNew = !row.id;

  const uploadPrimaryImage = async (file: File) => {
    try {
      setUploading(true);
      const path = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_")}`;
      const { error } = await supabase.storage.from("product-images").upload(path, file, { upsert: true });
      if (error) throw error;

      const { data: pub } = supabase.storage.from("product-images").getPublicUrl(path);
      setForm((f) => ({ ...f, primary_image: pub.publicUrl }));
      toast.success("Hero image updated successfully");
    } catch (err: any) {
      toast.error(err.message || "Primary upload exception encountered.");
    } finally {
      setUploading(false);
    }
  };

  const uploadGalleryImages = async (files: FileList) => {
    try {
      setGalleryUploading(true);
      const incomingUrls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const path = `gallery-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_")}`;
        const { error } = await supabase.storage.from("product-images").upload(path, file, { upsert: true });
        
        if (error) {
          toast.error(`Discarded dynamic file upload: ${file.name}`);
          continue;
        }

        const { data: pub } = supabase.storage.from("product-images").getPublicUrl(path);
        incomingUrls.push(pub.publicUrl);
      }

      if (incomingUrls.length > 0) {
        setGalleryImages((prev) => [...prev, ...incomingUrls]);
        toast.success(`Appended ${incomingUrls.length} secondary angle frames.`);
      }
    } catch (err: any) {
      toast.error("Parallel file storage pipeline error occurred.");
    } finally {
      setGalleryUploading(false);
    }
  };

  const removeGalleryImage = (targetUrl: string) => {
    setGalleryImages((prev) => prev.filter((url) => url !== targetUrl));
    toast.info("Image frame unlinked from active workspace row");
  };

  const save = async () => {
    if (!form.name || !form.slug) {
      return toast.error("Name and slug required");
    }

    const payload = {
      name: form.name,
      slug: form.slug,
      price: Number(form.price ?? 0),
      old_price: form.old_price ? Number(form.old_price) : null,
      stock: Number(form.stock ?? 0),
      in_stock: form.in_stock ?? true,
      featured: !!form.featured,
      bestseller: !!form.bestseller,
      is_new: !!form.is_new,
      is_active: form.is_active ?? true,
      category_name: form.category_name ?? null,
      tagline: form.tagline ?? null,
      description: form.description ?? null,
      primary_image: form.primary_image ?? null,
      brand: form.brand ?? null,
      sku: form.sku ?? null,
      specifications: form.specifications ?? null,
      video_url: form.video_url ?? null,
      gallery_images: galleryImages,
    };

    const { error } = isNew
      ? await supabase.from("products").insert(payload)
      : await supabase.from("products").update(payload).eq("id", row.id!);

    if (error) return toast.error(error.message);

    toast.success(isNew ? "New Product Created" : "Configuration Changes Persisted");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur flex items-start justify-center overflow-y-auto p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl bg-card border border-border my-10 rounded-sm shadow-xl">
        
        <div className="p-5 border-b border-border flex items-center justify-between bg-secondary/10">
          <div className="font-display text-2xl tracking-wide">{isNew ? "NEW PRODUCT PROFILE" : "EDIT PRODUCT PROFILE"}</div>
          <button onClick={onClose}><X className="w-5 h-5" /></button>
        </div>

        <div className="p-5 space-y-5">
          {/* PRIMARY DISPLAY CANVAS IMAGE */}
          {form.primary_image && (
            <div className="aspect-video bg-secondary border border-border overflow-hidden rounded-sm relative shadow-sm">
              <img src={form.primary_image} alt="" className="w-full h-full object-cover" />
              <div className="absolute top-3 left-3 text-[8px] tracking-widest font-bold text-black bg-gold px-2 py-0.5 rounded-sm uppercase">HERO CATALOG VIEW</div>
            </div>
          )}

          {/* DUAL STREAMING UPLOAD ACTIONS NODES */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <input ref={fileRef} type="file" accept="image/*" hidden
                onChange={(e) => e.target.files?.[0] && uploadPrimaryImage(e.target.files[0])} />
              <button onClick={() => fileRef.current?.click()} disabled={uploading}
                className="w-full h-24 border-2 border-dashed border-border hover:border-gold transition-colors text-xs font-bold tracking-widest flex flex-col items-center justify-center gap-2 rounded-sm text-muted-foreground hover:text-foreground">
                {uploading ? <Loader2 className="w-5 h-5 animate-spin text-gold" /> : <Upload className="w-5 h-5 text-gold" />}
                {uploading ? "SYNCING MEDIA CHUNKS…" : "UPLOAD COVER IMAGE"}
              </button>
            </div>

            <div>
              <input ref={galleryRef} type="file" accept="image/*" multiple hidden
                onChange={(e) => e.target.files && uploadGalleryImages(e.target.files)} />
              <button onClick={() => galleryRef.current?.click()} disabled={galleryUploading}
                className="w-full h-24 border-2 border-dashed border-border hover:border-gold transition-colors text-xs font-bold tracking-widest flex flex-col items-center justify-center gap-2 rounded-sm text-muted-foreground hover:text-foreground">
                {galleryUploading ? <Loader2 className="w-5 h-5 animate-spin text-gold" /> : <ImageIcon className="w-5 h-5 text-gold" />}
                {galleryUploading ? "STREAMING BUNDLES…" : "UPLOAD GALLERY ANGLES"}
              </button>
            </div>
          </div>

          {/* DYNAMIC BUNDLED MULTI-ANGLE MEDIA PREVIEW DRAWER */}
          {galleryImages.length > 0 && (
            <div>
              <label className="text-[10px] font-bold tracking-widest text-gold uppercase block mb-2">3D Perspective Alternative Gallery Reel ({galleryImages.length})</label>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 p-3 border border-border bg-background/50 rounded-sm">
                <AnimatePresence>
                  {galleryImages.map((img, idx) => (
                    <motion.div key={img} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                      className="aspect-square object-cover border border-border rounded-sm relative overflow-hidden group/thumb bg-card">
                      <img src={img} className="w-full h-full object-cover" alt="" />
                      <button
                        type="button"
                        onClick={() => removeGalleryImage(img)}
                        className="absolute inset-0 bg-destructive/95 text-white font-bold text-[9px] tracking-widest uppercase flex items-center justify-center opacity-0 group-hover/thumb:opacity-100 transition-opacity"
                      >
                        Delete
                      </button>
                      <div className="absolute bottom-1 right-1 text-[8px] bg-black/70 text-white px-1 font-bold rounded-sm">{idx + 1}</div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}

          <Field label="Name" value={form.name ?? ""} onChange={(v) => setForm({ ...form, name: v, slug: form.slug || v.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") })} />
          <Field label="Slug (URL)" value={form.slug ?? ""} onChange={(v) => setForm({ ...form, slug: v })} />
          <Field label="Category" value={form.category_name ?? ""} onChange={(v) => setForm({ ...form, category_name: v })} />
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Field label="Brand" value={form.brand ?? ""} onChange={(v) => setForm({ ...form, brand: v })} />
            <Field label="SKU" value={form.sku ?? ""} onChange={(v) => setForm({ ...form, sku: v })} />
            <Field label="Video URL" value={form.video_url ?? ""} onChange={(v) => setForm({ ...form, video_url: v })} />
          </div>

          <Field label="Tagline" value={form.tagline ?? ""} onChange={(v) => setForm({ ...form, tagline: v })} />
          
          <div>
            <label className="text-[10px] tracking-widest text-muted-foreground font-bold uppercase">Description</label>
            <textarea value={form.description ?? ""} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3}
              className="w-full bg-background border border-border px-3 py-2 mt-1 focus:border-gold outline-none text-sm rounded-sm transition-colors" />
          </div>

          <div>
            <label className="text-[10px] tracking-widest text-muted-foreground font-bold uppercase">Specifications</label>
            <textarea value={form.specifications ?? ""} onChange={(e) => setForm({ ...form, specifications: e.target.value })} rows={4}
              placeholder='Example structure context parsing: [{"label": "Weight", "value": "88g (4U)"}]'
              className="w-full bg-background border border-border px-3 py-2 mt-1 focus:border-gold outline-none text-xs font-mono rounded-sm transition-colors" />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Field label="Price ₹" type="number" value={String(form.price ?? 0)} onChange={(v) => setForm({ ...form, price: Number(v) })} />
            <Field label="Old Price ₹" type="number" value={String(form.old_price ?? "")} onChange={(v) => setForm({ ...form, old_price: v ? Number(v) : null })} />
            <Field label="Stock" type="number" value={String(form.stock ?? 0)} onChange={(v) => setForm({ ...form, stock: Number(v) })} />
          </div>

          <div className="flex flex-wrap gap-5 pt-3 border-t border-border/60">
            <Check label="Active" v={!!form.is_active} on={(v) => setForm({ ...form, is_active: v })} />
            <Check label="In Stock" v={!!form.in_stock} on={(v) => setForm({ ...form, in_stock: v })} />
            <Check label="Featured" v={!!form.featured} on={(v) => setForm({ ...form, featured: v })} />
            <Check label="Bestseller" v={!!form.bestseller} on={(v) => setForm({ ...form, bestseller: v })} />
            <Check label="New" v={!!form.is_new} on={(v) => setForm({ ...form, is_new: v })} />
          </div>
        </div>

        <div className="p-5 border-t border-border flex justify-end gap-3 bg-secondary/10">
          <button onClick={onClose} className="px-5 py-2 text-xs font-bold tracking-widest border border-border uppercase rounded-sm hover:bg-background transition-colors">Cancel</button>
          <button onClick={save} className="px-6 py-2 text-xs tracking-widest font-bold bg-gold text-primary-foreground uppercase rounded-sm hover:shadow-lg hover:shadow-gold/10 transition-all">SAVE PRODUCT</button>
        </div>
      </motion.div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <label className="text-[10px] tracking-widest text-muted-foreground font-bold uppercase">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full bg-background border border-border px-3 py-2 mt-1 focus:border-gold outline-none text-sm rounded-sm transition-colors" />
    </div>
  );
}

function Check({ label, v, on }: { label: string; v: boolean; on: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer text-xs tracking-wider uppercase font-bold select-none text-foreground/80 hover:text-foreground">
      <Toggle on={v} onChange={on} /> {label}
    </label>
  );
}

function BannersTab() {
  const [items, setItems] = useState<{ id: string; title: string; subtitle: string | null; image_url: string; is_active: boolean }[]>([]);
  const [uploading, setUploading] = useState(false);
  
  const load = async () => {
    const { data } = await supabase.from("banners").select("*").order("sort_order");
    setItems((data as typeof items) ?? []);
  };
  useEffect(() => { load(); }, []);

  const addBanner = async (file: File) => {
    setUploading(true);
    const path = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_")}`;
    const { error: upErr } = await supabase.storage.from("banners").upload(path, file);
    if (upErr) { toast.error(upErr.message); setUploading(false); return; }
    const { data: pub } = supabase.storage.from("banners").getPublicUrl(path);
    await supabase.from("banners").insert({ title: file.name, image_url: pub.publicUrl, sort_order: items.length + 1 });
    setUploading(false); toast.success("Banner added successfully"); load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this banner?")) return;
    await supabase.from("banners").delete().eq("id", id); load();
  };

  return (
    <div>
      <label className="block mb-5">
        <input type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && addBanner(e.target.files[0])} />
        <div className="border-2 border-dashed border-border hover:border-gold border-gold/40 cursor-pointer py-10 text-center text-sm rounded-sm text-muted-foreground hover:text-foreground transition-all">
          <Upload className="w-6 h-6 mx-auto mb-2 text-gold" /> {uploading ? "Uploading media chunks…" : "UPLOAD NEW BANNER"}
        </div>
      </label>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {items.map((b) => (
          <div key={b.id} className="border border-border bg-card overflow-hidden rounded-sm shadow-sm">
            <div className="aspect-video bg-secondary"><img src={b.image_url} alt={b.title} className="w-full h-full object-cover" /></div>
            <div className="p-3 flex justify-between items-center">
              <div className="text-xs truncate max-w-[85%] font-medium">{b.title}</div>
              <button onClick={() => remove(b.id)} className="text-destructive hover:text-destructive/80 p-1 transition-colors"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CategoriesTab() {
  const [items, setItems] = useState<{ id: string; name: string; slug: string; is_active: boolean }[]>([]);
  const [name, setName] = useState("");
  const load = async () => {
    const { data } = await supabase.from("categories").select("*").order("sort_order");
    setItems((data as typeof items) ?? []);
  };
  useEffect(() => { load(); }, []);

  const add = async () => {
    if (!name) return;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const { error } = await supabase.from("categories").insert({ name, slug, sort_order: items.length + 1 });
    if (error) return toast.error(error.message);
    setName(""); load();
  };

  const del = async (id: string) => {
    if (!confirm("Delete category?")) return;
    await supabase.from("categories").delete().eq("id", id); load();
  };

  return (
    <div>
      <div className="flex gap-3 mb-5">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="New category name…"
          className="flex-1 bg-card border border-border px-4 py-2.5 text-sm focus:border-gold outline-none rounded-sm transition-colors" />
        <button onClick={add} className="bg-gold text-primary-foreground px-6 text-xs font-bold tracking-widest uppercase rounded-sm hover:bg-gold/90 transition-colors shadow-sm">ADD</button>
      </div>
      <div className="border border-border bg-card divide-y divide-border rounded-sm shadow-sm">
        {items.map((c) => (
          <div key={c.id} className="p-4 flex items-center justify-between hover:bg-secondary/20 transition-colors">
            <div><div className="font-semibold text-sm text-foreground">{c.name}</div><div className="text-xs text-muted-foreground mt-0.5">{c.slug}</div></div>
            <button onClick={() => del(c.id)} className="text-destructive hover:text-destructive/80 p-2 transition-colors"><Trash2 className="w-4 h-4" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

function OrdersTab() {
  return (
    <div className="border border-border bg-card p-8 rounded-sm shadow-sm">
      <h2 className="font-display text-3xl tracking-wide">Orders</h2>
      <p className="text-muted-foreground mt-2 text-sm">Order management connected to Supabase orders table lines.</p>
      <div className="mt-6"><a href="/admin-orders" className="bg-gold text-primary-foreground px-6 py-3 font-bold tracking-widest text-xs uppercase inline-block rounded-sm hover:shadow-md hover:shadow-gold/10 transition-all">Open Orders Dashboard</a></div>
    </div>
  );
}

function CustomersTab() {
  return (
    <div className="border border-border bg-card p-8 rounded-sm shadow-sm">
      <h2 className="font-display text-3xl tracking-wide">Customers</h2>
      <p className="text-muted-foreground mt-2 text-sm">Customer accounts, balances, and history tracking records.</p>
      <div className="mt-6"><a href="/admin-customers" className="bg-gold text-primary-foreground px-6 py-3 font-bold tracking-widest text-xs uppercase inline-block rounded-sm hover:shadow-md hover:shadow-gold/10 transition-all">Open Customers Dashboard</a></div>
    </div>
  );
}

function PaymentsTab() {
  return (
    <div className="border border-border bg-card p-8 rounded-sm shadow-sm">
      <h2 className="font-display text-3xl tracking-wide">Payments</h2>
      <p className="text-muted-foreground mt-2 text-sm">Razorpay automated gateways audit logs and invoices files tracking.</p>
      <div className="mt-6"><a href="/admin-payments" className="bg-gold text-primary-foreground px-6 py-3 font-bold tracking-widest text-xs uppercase inline-block rounded-sm hover:shadow-md hover:shadow-gold/10 transition-all">Open Payments Dashboard</a></div>
    </div>
  );
}

function AnalyticsTab() {
  const [stats, setStats] = useState({ products: 0, customers: 0, orders: 0, revenue: 0 });

  useEffect(() => {
    (async () => {
      const [products, customers, orders] = await Promise.all([
        supabase.from("products").select("*", { count: "exact", head: true }),
        supabase.from("customers").select("*", { count: "exact", head: true }),
        supabase.from("orders").select("*"),
      ]);

      const revenue = orders.data?.reduce((sum, o: any) => sum + Number(o.amount || 0), 0) ?? 0;

      setStats({
        products: products.count ?? 0,
        customers: customers.count ?? 0,
        orders: orders.data?.length ?? 0,
        revenue,
      });
    })();
  }, []);

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {[
        { title: "PRODUCTS", val: stats.products, prefix: "" },
        { title: "CUSTOMERS", val: stats.customers, prefix: "" },
        { title: "ORDERS", val: stats.orders, prefix: "" },
        { title: "REVENUE", val: stats.revenue, prefix: "₹" },
      ].map((card) => (
        <div key={card.title} className="border border-border bg-card p-6 rounded-sm shadow-sm hover:border-gold/50 transition-colors">
          <div className="text-[10px] tracking-widest text-muted-foreground font-bold">{card.title}</div>
          <div className="font-display text-4xl text-gold mt-3 font-extrabold">{card.prefix}{card.val.toLocaleString("en-IN")}</div>
        </div>
      ))}
    </div>
  );
}