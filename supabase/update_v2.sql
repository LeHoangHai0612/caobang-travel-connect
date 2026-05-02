-- ============================================================
-- UPDATE V2: Chạy file này SAU khi đã chạy schema.sql
-- ============================================================

-- 1. Thêm cột zalo_number vào bảng guides
ALTER TABLE public.guides ADD COLUMN IF NOT EXISTS zalo_number TEXT DEFAULT '';

-- 2. Tạo bảng ảnh thư viện
CREATE TABLE IF NOT EXISTS public.gallery_images (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url  TEXT        NOT NULL DEFAULT '',
  sort_order INTEGER     DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "gallery_public_read" ON public.gallery_images
  FOR SELECT USING (TRUE);

CREATE POLICY "gallery_admin_all" ON public.gallery_images
  FOR ALL USING (auth.role() = 'authenticated');

-- 3. Seed ảnh thư viện
INSERT INTO public.gallery_images (image_url, sort_order) VALUES
  ('https://images.unsplash.com/photo-1602498456745-e9503b30470b?w=600&h=600&fit=crop', 1),
  ('https://images.unsplash.com/photo-1542640244-7e672d6cb466?w=600&h=600&fit=crop',    2),
  ('https://images.unsplash.com/photo-1559563458-527698bf5295?w=600&h=600&fit=crop',    3),
  ('https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&h=600&fit=crop',    4),
  ('https://images.unsplash.com/photo-1512100356356-de1b84283e18?w=600&h=600&fit=crop', 5),
  ('https://images.unsplash.com/photo-1533240332313-0cb496226c4f?w=600&h=600&fit=crop', 6),
  ('https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?w=600&h=600&fit=crop', 7),
  ('https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&h=600&fit=crop', 8)
ON CONFLICT DO NOTHING;
