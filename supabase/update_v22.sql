-- UPDATE V22: Thêm cài đặt phần trăm tiền cọc
INSERT INTO public.site_settings (key, label, value)
VALUES ('deposit_pct', 'Phần trăm tiền cọc (%)', '30')
ON CONFLICT (key) DO NOTHING;
