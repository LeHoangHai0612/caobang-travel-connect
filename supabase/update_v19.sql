-- UPDATE V19: Thêm ảnh nền section Cẩm Nang
INSERT INTO public.site_settings (key, label, value)
VALUES ('cam_nang_bg', 'Ảnh nền - Cẩm Nang Du Lịch', 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=1600&q=75')
ON CONFLICT (key) DO NOTHING;
