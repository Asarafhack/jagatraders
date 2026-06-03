import { supabase } from "@/integrations/supabase/client";

// ============================================================================
// Elite Unified Typings & Models
// ============================================================================

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: "Rackets" | "Shuttlecocks" | "Footwear" | "Bags" | "Accessories" | "Apparel" | "Strings";
  price: number;
  oldPrice?: number;
  image: string;
  gallery_images?: string[];
  rating: number;
  reviews: number;
  inStock: boolean;
  stock?: number;
  featured?: boolean;
  bestseller?: boolean;
  isNew?: boolean;
  tagline: string;
  description: string;
  specs: { label: string; value: string }[];
  performanceMetrics?: {
    power?: number;   // Metric score 1-100
    control?: number; // Metric score 1-100
    speed?: number;   // Metric score 1-100
    durability?: number;
  };
};

export const categories = [
  "Rackets", "Shuttlecocks", "Footwear", "Bags", "Accessories", "Apparel", "Strings",
] as const;

// ============================================================================
// Runtime In-Memory Performance Cache
// ============================================================================
const _productCache = new Map<string, { data: Product; timestamp: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5-Minute Data Freshness Window

const getCachedItem = (key: string): Product | null => {
  const cached = _productCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }
  return null;
};

const setCachedItem = (key: string, data: Product): void => {
  _productCache.set(key, { data, timestamp: Date.now() });
};

// ============================================================================
// Advanced Data Transformers
// ============================================================================

/**
 * Normalizes complex Supabase database payloads into the strict Product layout interface.
 * Mitigates "Out of Stock" bugs by automatically calculating availability flags from inventory counts.
 */
export const mapDbProductToFrontend = (p: any): Product => {
  if (!p) return null as any;

  // Direct calculation ensures UI inventory sync never conflicts with relational toggles
  const computedStock = p.stock !== undefined ? Math.max(0, Number(p.stock)) : 0;
  const computedInStock = p.in_stock !== undefined ? !!p.in_stock : (computedStock > 0);

  // Generate fallback slugs gracefully on-the-fly to handle database anomalies
  const stabilizedSlug = p.slug || p.name?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || `gear-${p.id}`;

  return {
    id: p.id,
    slug: stabilizedSlug,
    name: p.name || "Premium Court Gear",
    category: (categories.includes(p.category_name) ? p.category_name : "Rackets") as Product["category"],
    price: Math.max(0, Number(p.price || 0)),
    oldPrice: p.old_price && Number(p.old_price) > Number(p.price) ? Number(p.old_price) : undefined,
    image: p.primary_image || p.image || "https://images.unsplash.com/photo-1617396900799-f4ec2b43c7ae?q=80&w=600&auto=format&fit=crop",
    gallery_images: Array.isArray(p.gallery_images) ? p.gallery_images : [],
    rating: Number(p.rating || 0) === 0 ? 5.0 : Math.min(5, Math.max(0, Number(p.rating))),
    reviews: Math.max(0, Number(p.reviews || 0)),
    stock: computedStock,
    inStock: computedInStock && computedStock > 0,
    featured: !!p.featured,
    bestseller: !!p.bestseller,
    isNew: !!p.is_new || !!p.isNew,
    tagline: p.tagline || "Tournament Ready Equipment",
    description: p.description || "Engineered for rapid response, extreme structural handling precision, and competitive court playback control.",
    specs: Array.isArray(p.specs) ? p.specs : [
      { label: "Material", value: "High Modulus Graphite" },
      { label: "Classification", value: "Professional / Tournament" }
    ],
    // Advanced data fields for micro-animation performance meters
    performanceMetrics: p.performance_metrics || {
      power: p.category_name === "Rackets" ? 88 : undefined,
      control: p.category_name === "Rackets" ? 92 : undefined,
      speed: p.category_name === "Rackets" ? 90 : undefined,
      durability: 85
    }
  };
};

// ============================================================================
// Data Pipeline Methods (TanStack Optimized)
// ============================================================================

/**
 * Resolves product configuration models using unique URL Slugs from Supabase.
 * Optimized with an in-memory cache to prevent redundant over-the-wire data fetching.
 */
export const getProductBySlug = async (slug: string): Promise<Product | null> => {
  try {
    if (!slug) return null;

    const cached = getCachedItem(`slug-${slug}`);
    if (cached) return cached;
    
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("slug", slug)
      .eq("is_active", true)
      .maybeSingle();

    if (error || !data) {
      console.warn(`Product lookup yielded no active records matching slug: "${slug}"`);
      return null;
    }
    
    const transformedProduct = mapDbProductToFrontend(data);
    setCachedItem(`slug-${slug}`, transformedProduct);
    
    return transformedProduct;
  } catch (err) {
    console.error("Critical error inside getProductBySlug async pipeline:", err);
    return null;
  }
};

/**
 * Pulls cross-sell items from the same category while excluding the current item.
 */
export const fetchRelatedProducts = async (currentId: string, categoryName: string, limit = 4): Promise<Product[]> => {
  try {
    if (!categoryName) return [];

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .eq("category_name", categoryName)
      .not("id", "eq", currentId)
      .limit(limit);

    if (error || !data) return [];
    return data.map(mapDbProductToFrontend);
  } catch (err) {
    console.error("Critical error inside fetchRelatedProducts execution track:", err);
    return [];
  }
};

/**
 * Fetches all active products from the Supabase registry with support for flexible filtering.
 */
export const fetchAllProducts = async (options?: { category?: string; featured?: boolean }): Promise<Product[]> => {
  try {
    let query = supabase.from("products").select("*").eq("is_active", true);

    if (options?.category && options.category !== "All") {
      query = query.eq("category_name", options.category);
    }
    if (options?.featured) {
      query = query.eq("featured", true);
    }

    const { data, error } = await query.order("created_at", { ascending: false });
    if (error || !data) return [];

    return data.map(mapDbProductToFrontend);
  } catch (err) {
    console.error("Error executing fetchAllProducts workflow loop:", err);
    return [];
  }
};

/**
 * Legacy lookup fallback handler matching via unique record keys.
 */
export const getProductById = async (id: string): Promise<Product | null> => {
  try {
    const cached = getCachedItem(`id-${id}`);
    if (cached) return cached;

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error || !data) return null;
    
    const transformedProduct = mapDbProductToFrontend(data);
    setCachedItem(`id-${id}`, transformedProduct);
    
    return transformedProduct;
  } catch (err) {
    console.error("Error executing getProductById matching database query:", err);
    return null;
  }
};