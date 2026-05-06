-- UPDATE V23: Giá dịch vụ HDV có thể chỉnh từ Admin
INSERT INTO public.site_settings (key, label, value) VALUES
  ('price_hdv_ca_nhan', 'Giá HDV Cá Nhân (VND/ngày)',    '500000'),
  ('price_hdv_doan',    'Giá HDV Đoàn (VND/ngày)',        '650000'),
  ('price_hdv_xe_may',  'Giá HDV Xe Máy (VND/ngày)',      '550000')
ON CONFLICT (key) DO NOTHING;
