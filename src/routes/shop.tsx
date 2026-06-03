import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { ProductCard } from "@/components/ProductCard";
import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Grid, List, Search, SlidersHorizontal, RotateCcw } from "lucide-react";

const searchSchema = z.object({
  category: z.string().optional(),
  sort: z.enum(["featured", "price-asc", "price-desc", "rating"]).optional(),
  q: z.string().optional(),
  brand: z.string().optional(),
  maxPrice: z.number().optional(),
  inStockOnly: z.boolean().optional(),
  page: z.number().optional(),
});

type ShopSearch = z.infer<typeof searchSchema>;

export const Route = createFileRoute("/shop")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Shop — Jaga Traders" },
      {
        name: "description",
        content: "Browse premium rackets, shuttles, footwear, apparel and accessories.",
      },
    ],
  }),
  component: Shop,
});

function Shop() {
  const { 
    category, 
    sort = "featured", 
    q = "", 
    brand = "all", 
    maxPrice = 50000, 
    inStockOnly = false,
    page = 1 
  } = Route.useSearch();

  const navigate = useNavigate({ from: "/shop" });

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("is_active", true);

    if (error) {
      console.error(error);
      return;
    }

    const mappedProducts = (data || []).map((p: any) => ({
      ...p,
      image: p.primary_image,
      oldPrice: p.old_price,
      category: p.category_name,
    }));

    setProducts(mappedProducts);

    // Generate accurate distinct lookup tags straight from collection parameters
    setCategories([...new Set(mappedProducts.map((p) => p.category).filter(Boolean))] as string[]);
    setBrands([...new Set(mappedProducts.map((p) => p.brand).filter(Boolean))] as string[]);
  };

  // Synchronous State updates driven through URL parameters for query stability
  const updateSearch = (updates: Partial<ShopSearch>) => {
    navigate({
      search: (prev) => ({ 
        ...prev, 
        ...updates,
        page: updates.page !== undefined ? updates.page : 1 // Reset pagination indexes on active filter operations
      }),
    });
  };

  const handleResetFilters = () => {
    navigate({
      search: () => ({
        sort: "featured",
        q: "",
        brand: "all",
        maxPrice: 50000,
        inStockOnly: false,
        page: 1
      })
    });
  };

  const filtered = useMemo(() => {
    let list = [...products];

    if (category) {
      list = list.filter((p) => p.category === category);
    }

    if (brand && brand !== "all") {
      list = list.filter((p) => p.brand?.toLowerCase() === brand.toLowerCase());
    }

    if (q) {
      list = list.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()));
    }

    if (inStockOnly) {
      list = list.filter((p) => p.in_stock || p.inStock);
    }

    list = list.filter((p) => p.price <= maxPrice);

    if (sort === "price-asc") {
      list.sort((a, b) => a.price - b.price);
    } else if (sort === "price-desc") {
      list.sort((a, b) => b.price - a.price);
    } else if (sort === "rating") {
      list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    return list;
  }, [products, category, sort, q, brand, maxPrice, inStockOnly]);

  // Client Side Pagination Slice
  const perPage = 12;
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginatedProducts = useMemo(() => {
    const start = (page - 1) * perPage;
    return filtered.slice(start, start + perPage);
  }, [filtered, page]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 min-h-[80vh]">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-8 border-b border-border">
        <div>
          <div className="text-xs tracking-widest text-gold mb-2">ARCHIVE COLLECTION</div>
          <h1 className="font-display text-4xl md:text-5xl tracking-wide">
            {category ? category.toUpperCase() : "ALL PRODUCTS"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Showing {filtered.length} products total
          </p>
        </div>

        {/* CONTROLS */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="lg:hidden flex items-center gap-2 border border-border px-4 py-2.5 bg-card text-sm"
          >
            <SlidersHorizontal className="w-4 h-4" /> Filters
          </button>

          <select
            value={sort}
            onChange={(e) => updateSearch({ sort: e.target.value as any })}
            className="bg-card border border-border px-4 py-2.5 text-sm font-medium focus:border-gold outline-none"
          >
            <option value="featured">Featured</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>

          <div className="hidden sm:flex items-center border border-border bg-card">
            <button
              onClick={() => setView("grid")}
              className={`p-2.5 transition-colors ${view === "grid" ? "text-gold bg-background" : "text-muted-foreground"}`}
              aria-label="Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView("list")}
              className={`p-2.5 transition-colors ${view === "list" ? "text-gold bg-background" : "text-muted-foreground"}`}
              aria-label="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-8 mt-8">
        {/* SIDEBAR FILTERS - DESKTOP */}
        <aside className={`lg:block space-y-8 ${showMobileFilters ? "block fixed inset-0 z-50 bg-background p-6 overflow-y-auto" : "hidden"}`}>
          {showMobileFilters && (
            <div className="flex justify-between items-center mb-6 lg:hidden">
              <h2 className="font-display text-2xl">FILTERS</h2>
              <button onClick={() => setShowMobileFilters(false)} className="text-gold font-bold">CLOSE</button>
            </div>
          )}

          {/* SEARCH */}
          <div className="space-y-2">
            <label className="text-xs font-bold tracking-widest text-muted-foreground block">SEARCH</label>
            <div className="relative">
              <input
                type="text"
                value={q}
                onChange={(e) => updateSearch({ q: e.target.value })}
                placeholder="Search catalog..."
                className="w-full bg-card border border-border pl-10 pr-4 py-2.5 text-sm focus:border-gold outline-none"
              />
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-3.5" />
            </div>
          </div>

          {/* BRANDS FILTER */}
          <div className="space-y-2">
            <label className="text-xs font-bold tracking-widest text-muted-foreground block">BRAND</label>
            <select
              value={brand}
              onChange={(e) => updateSearch({ brand: e.target.value })}
              className="w-full bg-card border border-border px-4 py-2.5 text-sm focus:border-gold outline-none"
            >
              <option value="all">All Brands</option>
              {brands.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          {/* PRICE SLIDER */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold tracking-widest text-muted-foreground">MAX PRICE</label>
              <span className="text-xs font-bold text-gold">₹{maxPrice.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="0"
              max="50000"
              step="500"
              value={maxPrice}
              onChange={(e) => updateSearch({ maxPrice: Number(e.target.value) })}
              className="w-full h-1 bg-border rounded-lg appearance-none cursor-pointer accent-gold"
            />
          </div>

          {/* STOCK STATUS TOGGLE */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="stockToggle"
              checked={inStockOnly}
              onChange={(e) => updateSearch({ inStockOnly: e.target.checked })}
              className="w-4 h-4 rounded border-border text-gold focus:ring-gold bg-card accent-gold cursor-pointer"
            />
            <label htmlFor="stockToggle" className="text-xs font-bold tracking-widest text-muted-foreground cursor-pointer select-none">
              IN STOCK ONLY
            </label>
          </div>

          {/* RESET BUTTON */}
          <button
            onClick={() => {
              handleResetFilters();
              setShowMobileFilters(false);
            }}
            className="w-full border border-border py-2.5 text-xs font-bold tracking-widest hover:border-gold hover:text-gold flex items-center justify-center gap-2 transition-colors bg-card"
          >
            <RotateCcw className="w-3.5 h-3.5" /> RESET FILTERS
          </button>
        </aside>

        {/* PRODUCTS STREAM VIEWPORT */}
        <main className="lg:col-span-3">
          {paginatedProducts.length > 0 ? (
            <div>
              <div className={view === "grid" 
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" 
                : "flex flex-col gap-4"
              }>
                {paginatedProducts.map((product) => (
                  <div key={product.id} className={view === "list" ? "[&>div]:flex [&>div]:md:flex-row [&>div]:flex-col [&>div]:pb-0 [&>div]:h-auto [&>div_a]:md:w-64 [&>div_a]:w-full [&>div_div.p-4]:flex-1 [&>div_div.absolute.bottom-0]:relative [&>div_div.absolute.bottom-0]:translate-y-0 [&>div_div.absolute.bottom-0]:w-auto [&>div_div.absolute.bottom-0]:mt-4" : ""}>
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>

              {/* PAGINATION SECTION */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-12 border-t border-border pt-8">
                  <button
                    disabled={page <= 1}
                    onClick={() => updateSearch({ page: page - 1 })}
                    className="px-4 py-2 border border-border text-sm font-semibold disabled:opacity-40 disabled:hover:border-border transition-colors hover:border-gold"
                  >
                    PREV
                  </button>
                  {[...Array(totalPages)].map((_, idx) => {
                    const pageNum = idx + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => updateSearch({ page: pageNum })}
                        className={`w-10 h-10 border text-sm font-semibold transition-colors ${
                          page === pageNum ? "bg-gold text-primary-foreground border-gold" : "border-border hover:border-gold"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button
                    disabled={page >= totalPages}
                    onClick={() => updateSearch({ page: page + 1 })}
                    className="px-4 py-2 border border-border text-sm font-semibold disabled:opacity-40 disabled:hover:border-border transition-colors hover:border-gold"
                  >
                    NEXT
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* EMPTY OUTCOME PANEL */
            <div className="text-center py-24 border border-dashed border-border bg-card rounded-lg px-4">
              <div className="text-4xl mb-4">🏸</div>
              <h3 className="font-display text-2xl tracking-wide">NO PRODUCTS FOUND</h3>
              <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
                We couldn't match any items to your exact filters. Try adjusting your parameter bars or text keywords.
              </p>
              <button
                onClick={handleResetFilters}
                className="mt-6 bg-gold text-primary-foreground px-6 py-3 text-xs font-bold tracking-widest transition-shadow hover:shadow-gold"
              >
                CLEAR ALL FILTERS
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}