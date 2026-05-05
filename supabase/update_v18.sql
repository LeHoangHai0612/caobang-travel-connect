-- UPDATE V18: Thêm ảnh nền cho tất cả các section
INSERT INTO public.site_settings (key, label, value) VALUES
  ('whyus_bg',       'Ảnh nền - Tại Sao Chọn Chúng Tôi',   'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1600&q=75'),
  ('team_bg',        'Ảnh nền - Đội Ngũ Hướng Dẫn Viên',   'https://images.unsplash.com/photo-1512314889357-e157c22f938d?w=1600&q=75'),
  ('tours_bg',       'Ảnh nền - Các Gói Tour',              'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?w=1600&q=75'),
  ('gallery_bg',     'Ảnh nền - Thư Viện Ảnh',             'https://images.unsplash.com/photo-1542640244-7e672d6cb466?w=1600&q=75'),
  ('testimonials_bg','Ảnh nền - Đánh Giá Khách Hàng',      'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1600&q=75'),
  ('sos_bg',         'Ảnh nền - Hotline Khẩn Cấp',         'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1600&q=75')
ON CONFLICT (key) DO NOTHING;
