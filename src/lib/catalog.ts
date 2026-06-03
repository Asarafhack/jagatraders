import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Product } from "@/data/products";
import { products as seedProducts } from "@/data/products";

// Map seed/local asset paths to imported URLs so DB rows can reference them
import racketPro from "@/assets/product-racket-pro.jpg";
import shuttles from "@/assets/product-shuttles.jpg";
import shoes from "@/assets/product-shoes.jpg";
import bag from "@/assets/product-bag.jpg";
import grip from "@/assets/product-grip.jpg";
import strings from "@/assets/product-strings.jpg";
import jersey from "@/assets/product-jersey.jpg";
import brandRacketAstrox from "@/assets/brand-racket-astrox.png";
import brandRacketNeon from "@/assets/brand-racket-neon.png";
import brandStrings from "@/assets/brand-strings.png";
import brandWristband from "@/assets/brand-wristband.png";
import brandHero from "@/assets/brand-hero-banner.png";
import brandGear from "@/assets/brand-gear.png";
import brandAction from "@/assets/brand-action.png";
import brandDetail from "@/assets/brand-racket-detail.png";

const ASSET_MAP: Record<string, string> = {
  "/src/assets/product-racket-pro.jpg": racketPro,
  "/src/assets/product-shuttles.jpg": shuttles,
  "/src/assets/product-shoes.jpg": shoes,
  "/src/assets/product-bag.jpg": bag,
  "/src/assets/product-grip.jpg": grip,
  "/src/assets/product-strings.jpg": strings,
  "/src/assets/product-jersey.jpg": jersey,
  "/src/assets/brand-racket-astrox.png": brandRacketAstrox,
  "/src/assets/brand-racket-neon.png": brandRacketNeon,
  "/src/assets/brand-strings.png": brandStrings,
  "/src/assets/brand-wristband.png": brandWristband,
  "/src/assets/brand-hero-banner.png": brandHero,
  "/src/assets/brand-gear.png": brandGear,
  "/src/assets/brand-action.png": brandAction,
  "/src/assets/brand-racket-detail.png": brandDetail,
};

export function resolveImage(url?: string | null): string {
  if (!url) return brandRacketAstrox;
  if (ASSET_MAP[url]) return ASSET_MAP[url];
  return url;
}

export type DBProduct = {
  id: string;
  slug: string;
  name: string;
  category_name: string | null;
  tagline: string | null;
  description: string | null;
  price: number;
  old_price: number | null;
  stock: number;
  in_stock: boolean;
  featured: boolean;
  bestseller: boolean;
  is_new: boolean;
  rating: number;
  reviews_count: number;
  specs: { label: string; value: string }[];
  primary_image: string | null;
  is_active: boolean;
};

export function normalize(row: DBProduct): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: (row.category_name ?? "Accessories") as Product["category"],
    price: Number(row.price),
    oldPrice: row.old_price ? Number(row.old_price) : undefined,
    image: resolveImage(row.primary_image),
    rating: Number(row.rating),
    reviews: row.reviews_count,
    inStock: row.in_stock && row.stock > 0,
    featured: row.featured,
    bestseller: row.bestseller,
    isNew: row.is_new,
    tagline: row.tagline ?? "",
    description: row.description ?? "",
    specs: Array.isArray(row.specs) ? row.specs : [],
  };
}

async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });
  if (error) throw error;
  if (!data || data.length === 0) return seedProducts;
  return (data as unknown as DBProduct[]).map(normalize);
}

export function useProducts() {
  return useQuery({ queryKey: ["products"], queryFn: fetchProducts, staleTime: 30_000 });
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: ["product", slug],
    queryFn: async () => {
      const { data } = await supabase.from("products").select("*").eq("slug", slug).maybeSingle();
      if (data) return normalize(data as unknown as DBProduct);
      return seedProducts.find((p) => p.slug === slug) ?? null;
    },
  });
}

export type DBBanner = {
  id: string;
  title: string;
  subtitle: string | null;
  cta_label: string | null;
  cta_link: string | null;
  image_url: string;
  sort_order: number;
  is_active: boolean;
};

export function useBanners() {
  return useQuery({
    queryKey: ["banners"],
    queryFn: async () => {
      const { data } = await supabase.from("banners").select("*").eq("is_active", true).order("sort_order");
      return (data ?? []) as DBBanner[];
    },
    staleTime: 60_000,
  });
}

export type DBCategory = { id: string; name: string; slug: string; image_url: string | null; sort_order: number; is_active: boolean };
export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await supabase.from("categories").select("*").eq("is_active", true).order("sort_order");
      return (data ?? []) as DBCategory[];
    },
    staleTime: 60_000,
  });
}