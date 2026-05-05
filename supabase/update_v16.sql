-- ============================================================
-- UPDATE V16: Bảng tours
-- ============================================================
CREATE TABLE IF NOT EXISTS public.tours (
  id          UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  title       TEXT    NOT NULL DEFAULT '',
  description TEXT    DEFAULT '',
  image_url   TEXT    DEFAULT '',
  price_from  INTEGER DEFAULT 0,
  duration    TEXT    DEFAULT '1 ngày',
  group_size  TEXT    DEFAULT '1-10 người',
  highlights  TEXT    DEFAULT '',
  included    TEXT    DEFAULT '',
  guide_count INTEGER DEFAULT 1,
  zalo_number TEXT    DEFAULT '',
  is_active   BOOLEAN DEFAULT true,
  sort_order  INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.tours ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tours_public_select" ON public.tours FOR SELECT USING (true);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='tours' AND policyname='tours_admin_all') THEN
    CREATE POLICY "tours_admin_all" ON public.tours FOR ALL USING (public.is_admin());
  END IF;
END $$;

-- Dữ liệu mẫu
INSERT INTO public.tours (title, description, image_url, price_from, duration, group_size, highlights, included, guide_count, zalo_number, sort_order) VALUES
('Thác Bản Giốc 1 Ngày', 'Khám phá thác nước hùng vĩ nhất Đông Nam Á, trải nghiệm văn hóa người Tày và thưởng thức ẩm thực địa phương.', 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Ban_Gioc%E2%80%93Detian_Falls.jpg/640px-Ban_Gioc%E2%80%93Detian_Falls.jpg', 650000, '1 ngày', '1-15 người', 'Thác Bản Giốc|Động Ngườm Ngao|Làng Tày truyền thống|Ẩm thực địa phương', 'HDV chuyên nghiệp|Xe đưa đón|Vé tham quan|Bảo hiểm du lịch', 1, '0382845666', 1),
('Hành Trình Pác Bó - Lịch Sử', 'Tham quan khu di tích lịch sử Pác Bó, suối Lê-nin, núi Các-Mác và cảm nhận không gian lịch sử thiêng liêng.', 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Pac_Bo_Cave_Cao_Bang.jpg/640px-Pac_Bo_Cave_Cao_Bang.jpg', 500000, '1 ngày', '1-20 người', 'Hang Pác Bó|Suối Lê-nin|Núi Các-Mác|Bảo tàng Hồ Chí Minh', 'HDV lịch sử|Vé tham quan|Xe đưa đón', 1, '0382845666', 2),
('Khám Phá Hồ Thang Hen', 'Chuỗi 36 hồ nước kỳ ảo trên núi cao, phong cảnh thay đổi theo mùa tạo nên bức tranh thiên nhiên tuyệt đẹp.', 'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=640&h=400&fit=crop', 550000, '1 ngày', '1-12 người', 'Hồ Thang Hen|Đỉnh núi|Bản làng dân tộc|Chụp ảnh panorama', 'HDV trekking|Bảo hiểm|Đồ ăn trưa', 1, '0382845666', 3),
('Phượt Xe Máy 3 Ngày', 'Hành trình xe máy khám phá toàn bộ Cao Bằng: Thác Bản Giốc, Pác Bó, Hồ Thang Hen, Núi Mắt Thần.', 'https://images.unsplash.com/photo-1602498456745-e9503b30470b?w=640&h=400&fit=crop', 1800000, '3 ngày 2 đêm', '2-8 người', 'Thác Bản Giốc|Pác Bó|Hồ Thang Hen|Núi Mắt Thần|Làng đá Khuổi Ky', 'HDV xe máy|Chỗ nghỉ đêm|Ăn sáng|Bảo hiểm|Thuê xe máy', 2, '0382845666', 4),
('Tours Nhóm Lớn & MICE', 'Gói dịch vụ chuyên biệt cho nhóm lớn, sự kiện công ty, hội nghị và hoạt động xây dựng đội ngũ. Chúng tôi xử lý tất cả các công việc hậu cần cho nhóm có kích thước bất kỳ.', 'https://images.unsplash.com/photo-1542640244-7e672d6cb466?w=640&h=400&fit=crop', 0, 'Linh hoạt', '15+ người', 'Team building|Hội nghị|Gala dinner|Tham quan theo yêu cầu', 'Lên kế hoạch trọn gói|HDV đội nhóm|Xe riêng|Chỗ ở cao cấp|Ăn uống', 3, '0382845666', 5),
('Tours Tùy Chỉnh', 'Thiết kế lộ trình riêng theo sở thích của bạn. Lựa chọn điểm đến, thời gian và phong cách du lịch phù hợp nhất.', 'https://images.unsplash.com/photo-1559563458-527698bf5295?w=640&h=400&fit=crop', 0, 'Tùy chỉnh', 'Bất kỳ', 'Điểm đến theo yêu cầu|Lộ trình riêng|Phong cách riêng', 'Tư vấn miễn phí|HDV phù hợp|Giá linh hoạt', 1, '0382845666', 6)
ON CONFLICT DO NOTHING;

NOTIFY pgrst, 'reload schema';
