-- Chạy nếu form đặt lịch bị lỗi "không thể lưu"
-- Đảm bảo bảng bookings cho phép public insert

-- Bật RLS nếu chưa bật
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Cho phép bất kỳ ai (kể cả chưa đăng nhập) đặt lịch
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'bookings' AND policyname = 'bookings_public_insert'
  ) THEN
    CREATE POLICY "bookings_public_insert" ON public.bookings
      FOR INSERT WITH CHECK (TRUE);
  END IF;
END;
$$;

-- Cho phép admin đọc tất cả booking
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'bookings' AND policyname = 'bookings_admin_read'
  ) THEN
    CREATE POLICY "bookings_admin_read" ON public.bookings
      FOR SELECT USING (auth.role() = 'authenticated');
  END IF;
END;
$$;
