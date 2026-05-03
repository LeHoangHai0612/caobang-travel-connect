-- ============================================================
-- UPDATE V6: Thêm ảnh nền section Điểm Đến và Bảng Giá vào settings
-- ============================================================

INSERT INTO public.site_settings (key, label, value) VALUES
  ('destinations_bg', 'Ảnh nền section Điểm Đến', 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=1600&q=75'),
  ('pricing_bg',      'Ảnh nền section Bảng Giá',  'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1600&q=75')
ON CONFLICT (key) DO NOTHING;
