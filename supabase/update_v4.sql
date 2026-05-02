-- ============================================================
-- UPDATE V4: Bảng cài đặt website (site_settings)
-- Chạy SAU khi đã chạy schema.sql, update_v2.sql, update_v3.sql
-- ============================================================

CREATE TABLE IF NOT EXISTS public.site_settings (
  key        TEXT PRIMARY KEY,
  value      TEXT NOT NULL DEFAULT '',
  label      TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Thêm cột label nếu chưa có (fix khi bảng đã tồn tại từ lần chạy trước)
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS label TEXT NOT NULL DEFAULT '';

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Ai cũng có thể đọc (để render ảnh trên trang chủ)
CREATE POLICY "settings_public_read" ON public.site_settings
  FOR SELECT USING (TRUE);

-- Chỉ admin đã đăng nhập mới được sửa
CREATE POLICY "settings_admin_write" ON public.site_settings
  FOR ALL USING (auth.role() = 'authenticated');

-- Seed giá trị mặc định
INSERT INTO public.site_settings (key, label, value) VALUES
  ('hero_bg',  'Ảnh nền Hero (trang chủ)',        'https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Ban_Gioc%E2%80%93Detian_Falls.jpg/1280px-Ban_Gioc%E2%80%93Detian_Falls.jpg'),
  ('login_bg', 'Ảnh nền trang Đăng nhập',         'https://images.unsplash.com/photo-1602498456745-e9503b30470b?w=800&q=60')
ON CONFLICT (key) DO NOTHING;
