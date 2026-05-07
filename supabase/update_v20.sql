-- UPDATE V20: Bảng quản lý nội dung Cẩm Nang
CREATE TABLE IF NOT EXISTS public.cam_nang_tips (
  id         UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  icon       TEXT NOT NULL DEFAULT 'fa-lightbulb',
  tag        TEXT NOT NULL DEFAULT 'Mẹo Hay',
  color      TEXT NOT NULL DEFAULT '#265C59',
  title      TEXT NOT NULL,
  description TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  is_active  BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO public.cam_nang_tips (icon, tag, color, title, description, sort_order) VALUES
  ('fa-calendar-sun',       'Thời Điểm',  '#f59e0b', 'Mùa Đẹp Nhất',             'Tháng 9–11: lúa chín vàng, thác đầy nước, thời tiết mát mẻ. Tháng 3–4: hoa tam giác mạch nở rộ trên các sườn núi.', 1),
  ('fa-bowl-food',          'Ẩm Thực',   '#ef4444', 'Đặc Sản Không Thể Bỏ Qua', 'Bánh coóng phù, phở chua, lợn quay lá mắc mật, hạt dẻ Trùng Khánh — hương vị đặc trưng chỉ có ở Cao Bằng.',        2),
  ('fa-motorcycle',         'Di Chuyển',  '#8b5cf6', 'Phương Tiện Phù Hợp',      'Xe máy là lựa chọn tốt nhất. Đường đèo quanh co nhưng cảnh đẹp hùng vĩ — thuê xe tại thị xã hoặc đi cùng HDV.',   3),
  ('fa-camera-retro',       'Nhiếp Ảnh', '#06b6d4', 'Góc Chụp Ảnh Đẹp Nhất',   'Cầu treo Bản Giốc, thuyền trên sông Quây Sơn, ruộng bậc thang Phia Oắc — ánh sáng buổi sáng sớm là lý tưởng nhất.', 4),
  ('fa-hand-holding-heart', 'Văn Hóa',   '#10b981', 'Tôn Trọng Phong Tục',      'Dân tộc Tày, Nùng chiếm đa số. Hỏi phép trước khi chụp ảnh, tìm hiểu phong tục trước khi đến thăm bản làng.',      5),
  ('fa-shield-halved',      'An Toàn',   '#f97316', 'Lưu Ý Quan Trọng',         'Mang theo thuốc chống muỗi, kem chống nắng và giày trekking chắc chắn. Đặt HDV địa phương để đảm bảo an toàn tối đa.', 6)
ON CONFLICT DO NOTHING;

ALTER TABLE public.cam_nang_tips ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'cam_nang_tips' AND policyname = 'Public read cam_nang_tips') THEN
    CREATE POLICY "Public read cam_nang_tips" ON public.cam_nang_tips FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'cam_nang_tips' AND policyname = 'Admin manage cam_nang_tips') THEN
    CREATE POLICY "Admin manage cam_nang_tips" ON public.cam_nang_tips FOR ALL USING (true);
  END IF;
END $$;
