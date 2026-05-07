-- UPDATE V25: Ảnh polaroid phần Giới Thiệu Cao Bằng
INSERT INTO public.site_settings (key, label, value)
VALUES ('about_image', 'Ảnh Giới Thiệu (Polaroid)', '')
ON CONFLICT (key) DO NOTHING;
