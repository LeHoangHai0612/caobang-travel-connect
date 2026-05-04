-- ============================================================
-- UPDATE V10: Bảng lịch làm việc của HDV (guide_schedules)
-- Chạy trong Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS public.guide_schedules (
  id         UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  guide_id   UUID    NOT NULL REFERENCES public.guides(id) ON DELETE CASCADE,
  date       DATE    NOT NULL,
  status     TEXT    NOT NULL DEFAULT 'blocked', -- 'booked' | 'blocked'
  note       TEXT    DEFAULT '',
  booking_id UUID    REFERENCES public.bookings(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(guide_id, date)
);

ALTER TABLE public.guide_schedules ENABLE ROW LEVEL SECURITY;

-- Mọi người đều đọc được (booking form cần check lịch)
CREATE POLICY "schedules_public_select" ON public.guide_schedules
  FOR SELECT USING (true);

-- Chỉ admin mới chặn/xóa thủ công
CREATE POLICY "schedules_admin_insert" ON public.guide_schedules
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "schedules_admin_update" ON public.guide_schedules
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "schedules_admin_delete" ON public.guide_schedules
  FOR DELETE USING (public.is_admin());
