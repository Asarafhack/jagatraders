
-- ============ CATEGORIES ============
CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  image_url text,
  sort_order int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.categories TO anon, authenticated;
GRANT ALL ON public.categories TO authenticated, service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Categories public read" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admins manage categories" ON public.categories FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER categories_updated BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ PRODUCTS ============
CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  category_name text,
  tagline text,
  description text,
  price numeric(10,2) NOT NULL DEFAULT 0,
  old_price numeric(10,2),
  stock int NOT NULL DEFAULT 0,
  in_stock boolean NOT NULL DEFAULT true,
  featured boolean NOT NULL DEFAULT false,
  bestseller boolean NOT NULL DEFAULT false,
  is_new boolean NOT NULL DEFAULT false,
  rating numeric(2,1) NOT NULL DEFAULT 4.5,
  reviews_count int NOT NULL DEFAULT 0,
  specs jsonb NOT NULL DEFAULT '[]'::jsonb,
  primary_image text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX products_category_idx ON public.products(category_id);
CREATE INDEX products_active_idx ON public.products(is_active);
GRANT SELECT ON public.products TO anon, authenticated;
GRANT ALL ON public.products TO authenticated, service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Products public read" ON public.products FOR SELECT USING (is_active = true OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins manage products" ON public.products FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER products_updated BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ PRODUCT IMAGES ============
CREATE TABLE public.product_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  url text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  is_primary boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX product_images_product_idx ON public.product_images(product_id);
GRANT SELECT ON public.product_images TO anon, authenticated;
GRANT ALL ON public.product_images TO authenticated, service_role;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Product images public read" ON public.product_images FOR SELECT USING (true);
CREATE POLICY "Admins manage product images" ON public.product_images FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- ============ BANNERS ============
CREATE TABLE public.banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  subtitle text,
  cta_label text,
  cta_link text,
  image_url text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.banners TO anon, authenticated;
GRANT ALL ON public.banners TO authenticated, service_role;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Banners public read" ON public.banners FOR SELECT USING (is_active = true OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins manage banners" ON public.banners FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER banners_updated BEFORE UPDATE ON public.banners
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ REVIEWS ============
CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  rating int NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title text,
  comment text,
  is_approved boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX reviews_product_idx ON public.reviews(product_id);
GRANT SELECT ON public.reviews TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.reviews TO authenticated;
GRANT ALL ON public.reviews TO service_role;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Reviews public read" ON public.reviews FOR SELECT USING (is_approved = true OR public.has_role(auth.uid(),'admin') OR auth.uid() = user_id);
CREATE POLICY "Users insert own review" ON public.reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own review" ON public.reviews FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins manage reviews" ON public.reviews FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- ============ COUPONS ============
CREATE TABLE public.coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  description text,
  discount_type text NOT NULL DEFAULT 'percent',
  discount_value numeric(10,2) NOT NULL,
  min_order numeric(10,2) DEFAULT 0,
  max_uses int,
  used_count int NOT NULL DEFAULT 0,
  expires_at timestamptz,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.coupons TO anon, authenticated;
GRANT ALL ON public.coupons TO authenticated, service_role;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Coupons public read active" ON public.coupons FOR SELECT USING (is_active = true);
CREATE POLICY "Admins manage coupons" ON public.coupons FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- ============ STORAGE BUCKETS ============
INSERT INTO storage.buckets (id, name, public) VALUES
  ('product-images','product-images', true),
  ('banners','banners', true),
  ('categories','categories', true),
  ('logos','logos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read product-images" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
CREATE POLICY "Admins write product-images" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'product-images' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins update product-images" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'product-images' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins delete product-images" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'product-images' AND public.has_role(auth.uid(),'admin'));

CREATE POLICY "Public read banners" ON storage.objects FOR SELECT USING (bucket_id = 'banners');
CREATE POLICY "Admins write banners" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'banners' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins update banners" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'banners' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins delete banners" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'banners' AND public.has_role(auth.uid(),'admin'));

CREATE POLICY "Public read categories bucket" ON storage.objects FOR SELECT USING (bucket_id = 'categories');
CREATE POLICY "Admins write categories bucket" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'categories' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins update categories bucket" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'categories' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins delete categories bucket" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'categories' AND public.has_role(auth.uid(),'admin'));

CREATE POLICY "Public read logos" ON storage.objects FOR SELECT USING (bucket_id = 'logos');
CREATE POLICY "Admins write logos" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'logos' AND public.has_role(auth.uid(),'admin'));
