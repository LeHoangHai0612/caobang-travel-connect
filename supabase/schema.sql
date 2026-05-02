-- ============================================================
-- SCHEMA: Cao Bằng Eco Tour
-- Chạy file này trong Supabase SQL Editor để tạo toàn bộ schema
-- ============================================================

-- 1. BẢNG HƯỚNG DẪN VIÊN
CREATE TABLE IF NOT EXISTS public.guides (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  name        TEXT        NOT NULL,
  specialty   TEXT        DEFAULT '',
  role        TEXT        DEFAULT 'Chuyên gia HDV Sinh Thái',
  rating      NUMERIC(3,1) DEFAULT 5.0 CHECK (rating >= 0 AND rating <= 5),
  image_url   TEXT        DEFAULT '',
  is_active   BOOLEAN     DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 2. BẢNG ĐIỂM ĐẾN
CREATE TABLE IF NOT EXISTS public.destinations (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  title       TEXT        NOT NULL,
  description TEXT        DEFAULT '',
  image_url   TEXT        DEFAULT '',
  sort_order  INTEGER     DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 3. BẢNG ĐÁNH GIÁ
CREATE TABLE IF NOT EXISTS public.reviews (
  id                UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  reviewer_name     TEXT        NOT NULL,
  reviewer_location TEXT        DEFAULT '',
  stars             NUMERIC(3,1) DEFAULT 5.0 CHECK (stars >= 0 AND stars <= 5),
  review_text       TEXT        DEFAULT '',
  avatar_url        TEXT        DEFAULT '',
  is_approved       BOOLEAN     DEFAULT TRUE,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- 4. BẢNG ĐẶT LỊCH HDV
CREATE TABLE IF NOT EXISTS public.bookings (
  id             UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  package_type   TEXT        NOT NULL DEFAULT '',
  client_name    TEXT        NOT NULL DEFAULT '',
  email          TEXT        DEFAULT '',
  phone          TEXT        DEFAULT '',
  preferred_date DATE,
  message        TEXT        DEFAULT '',
  status         TEXT        DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- 5. BẢNG LIÊN HỆ
CREATE TABLE IF NOT EXISTS public.contacts (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  name       TEXT        DEFAULT '',
  email      TEXT        DEFAULT '',
  phone      TEXT        DEFAULT '',
  message    TEXT        DEFAULT '',
  is_read    BOOLEAN     DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE public.guides       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts     ENABLE ROW LEVEL SECURITY;

-- Công khai đọc HDV đang hoạt động
CREATE POLICY "guides_public_read" ON public.guides
  FOR SELECT USING (is_active = TRUE);

-- Công khai đọc tất cả điểm đến
CREATE POLICY "destinations_public_read" ON public.destinations
  FOR SELECT USING (TRUE);

-- Công khai đọc đánh giá đã duyệt
CREATE POLICY "reviews_public_read" ON public.reviews
  FOR SELECT USING (is_approved = TRUE);

-- Ai cũng có thể gửi đặt lịch
CREATE POLICY "bookings_public_insert" ON public.bookings
  FOR INSERT WITH CHECK (TRUE);

-- Ai cũng có thể gửi liên hệ
CREATE POLICY "contacts_public_insert" ON public.contacts
  FOR INSERT WITH CHECK (TRUE);

-- Admin (đã đăng nhập) có thể quản lý tất cả
CREATE POLICY "guides_admin_all"       ON public.guides       FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "destinations_admin_all" ON public.destinations FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "reviews_admin_all"      ON public.reviews      FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "bookings_admin_select"  ON public.bookings     FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "contacts_admin_select"  ON public.contacts     FOR SELECT USING (auth.role() = 'authenticated');

-- ============================================================
-- DỮ LIỆU MẪU (SEED DATA)
-- ============================================================

-- Hướng dẫn viên
INSERT INTO public.guides (name, specialty, role, rating, image_url) VALUES
  ('A Tùng',   'HDV · Văn Hóa Nùng',        'Chuyên gia HDV Sinh Thái', 5.0, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face'),
  ('Chị Hoa',  'HDV · Văn Hóa Tày',          'Chuyên gia HDV Sinh Thái', 5.0, 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face'),
  ('Anh Minh', 'HDV · Trekking & Sinh Thái', 'Chuyên gia HDV Sinh Thái', 4.9, 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face'),
  ('Chị Lan',  'HDV · Lịch Sử & Di Tích',   'Chuyên gia HDV Sinh Thái', 5.0, 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=face'),
  ('Anh Hùng', 'HDV · Xe Máy Trekking',      'Chuyên gia HDV Xe Máy',   4.8, 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=face'),
  ('Chị Mai',  'HDV · Ẩm Thực & Văn Hóa',   'Chuyên gia HDV Sinh Thái', 5.0, 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face'),
  ('Anh Việt', 'HDV · Cắm Trại Rừng',        'Chuyên gia HDV Sinh Thái', 4.9, 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&crop=face'),
  ('Chị Thu',  'HDV · Homestay & Bản Làng',  'Chuyên gia HDV Sinh Thái', 5.0, 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=face')
ON CONFLICT DO NOTHING;

-- Điểm đến
INSERT INTO public.destinations (title, description, image_url, sort_order) VALUES
  ('Thác Bản Giốc',    'Thác Bản Giốc là một trong những thác nước lớn và đẹp nhất Đông Nam Á, nằm trên sông Quây Sơn giáp biên giới.',                                     'https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Ban_Gioc%E2%80%93Detian_Falls.jpg/640px-Ban_Gioc%E2%80%93Detian_Falls.jpg', 1),
  ('Di Tích Pác Bó',   'Di tích lịch sử thiêng liêng, nơi Chủ tịch Hồ Chí Minh ở và làm việc, gắn với suối Lê-nin và núi Các-Mác.',                                          'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Pac_Bo_Cave_Cao_Bang.jpg/640px-Pac_Bo_Cave_Cao_Bang.jpg',                2),
  ('Động Ngườm Ngao',  'Hang động nguyên sinh kỳ vĩ với hàng nghìn nhũ đá muôn hình vạn trạng, nằm cách Thác Bản Giốc chỉ 3km.',                                             'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=640&h=400&fit=crop',                                                  3),
  ('Núi Mắt Thần',     'Kỳ quan địa chất độc đáo với hồ nước trên đỉnh núi, nhìn như con mắt từ trên cao, thu hút du khách toàn cầu.',                                        'https://images.unsplash.com/photo-1553881651-43e20b703aff?w=640&h=400&fit=crop',                                                  4),
  ('Hồ Thang Hen',     'Chuỗi 36 hồ nước tuyệt đẹp nằm trên núi cao, phong cảnh thay đổi theo mùa tạo nên bức tranh thiên nhiên hùng vĩ.',                                   'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=640&h=400&fit=crop',                                                  5),
  ('Làng Đá Khuổi Ky', 'Làng cổ truyền của dân tộc Tày với những ngôi nhà xây hoàn toàn bằng đá, lưu giữ văn hóa bản địa đặc sắc.',                                          'https://images.unsplash.com/photo-1559563458-527698bf5295?w=640&h=400&fit=crop',                                                  6)
ON CONFLICT DO NOTHING;

-- Đánh giá khách hàng
INSERT INTO public.reviews (reviewer_name, reviewer_location, stars, review_text, avatar_url) VALUES
  ('Kiên Đỗ',    'Du khách từ Hà Nội · Tháng 3/2024',    5.0, '"Chuyến đi Cao Bằng của tôi trở nên hoàn hảo nhờ anh A Tùng. Anh ấy không chỉ là hướng dẫn viên mà còn như người bạn đồng hành, kể những câu chuyện thú vị về văn hóa người Nùng mà không sách nào có được."',           'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face'),
  ('Kim Vang',   'Du khách từ TP.HCM · Tháng 2/2024',    5.0, '"Tôi đã đặt tour cùng Chị Hoa và hoàn toàn bị chinh phục. Từ Thác Bản Giốc đến Động Ngườm Ngao, mọi trải nghiệm đều được sắp xếp chu đáo. Chắc chắn sẽ quay lại lần sau!"',                                           'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop&crop=face'),
  ('Alex Khánh', 'Du khách quốc tế · Tháng 1/2024',      5.0, '"Hành trình phượt xe máy 3 ngày cùng Anh Hùng thật sự là trải nghiệm đáng nhớ trong đời. Cung đường đẹp mê hồn, đồ ăn địa phương ngon tuyệt và sự nhiệt tình của HDV làm tôi vô cùng ấn tượng."',                   'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100&h=100&fit=crop&crop=face'),
  ('Hương Trần', 'Du khách từ Đà Nẵng · Tháng 4/2024',   5.0, '"Gia đình tôi 5 người đặt tour đoàn, mọi thứ từ lịch trình, ăn uống đến chỗ nghỉ đều được sắp xếp hoàn hảo. HDV rất kiên nhẫn với các bé. Cảm ơn Cao Bằng Eco Tour!"',                                              'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=100&h=100&fit=crop&crop=face'),
  ('Minh Tuấn',  'Du khách từ Hải Phòng · Tháng 5/2024', 4.5, '"Tour Hồ Thang Hen và Làng Khuổi Ky thật ấn tượng. Chị Thu giải thích mọi thứ rất tỉ mỉ, giúp tôi hiểu sâu hơn về văn hóa dân tộc Tày. Phong cảnh đẹp không kém gì Hà Giang!"',                                      'https://images.unsplash.com/photo-1504276048855-f3d60e69632f?w=100&h=100&fit=crop&crop=face'),
  ('Ngọc Ánh',   'Du khách từ Cần Thơ · Tháng 6/2024',   5.0, '"Chuyến đi Pác Bó cùng Chị Lan thực sự cảm động. Được nghe kể về lịch sử qua lời HDV địa phương khiến tôi hiểu và trân trọng hơn giá trị lịch sử của nơi đây. Rất đáng để ghé thăm!"',                               'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=100&h=100&fit=crop&crop=face')
ON CONFLICT DO NOTHING;
