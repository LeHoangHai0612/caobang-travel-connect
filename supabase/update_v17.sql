-- UPDATE V17: Thêm booking_bg vào site_settings
INSERT INTO public.site_settings (key, label, value)
VALUES ('booking_bg', 'Ảnh nền trang đặt lịch', 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1600&q=75')
ON CONFLICT (key) DO NOTHING;
