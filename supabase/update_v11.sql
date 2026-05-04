-- ============================================================
-- UPDATE V11: Audit trail cho guide_schedules
-- ============================================================

-- Thêm cột ghi người tạo vào guide_schedules
ALTER TABLE public.guide_schedules
  ADD COLUMN IF NOT EXISTS created_by      UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS created_by_name TEXT DEFAULT '';

-- Bảng lịch sử thay đổi
CREATE TABLE IF NOT EXISTS public.schedule_logs (
  id          UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  guide_id    UUID    NOT NULL REFERENCES public.guides(id) ON DELETE CASCADE,
  guide_name  TEXT    DEFAULT '',
  date        DATE    NOT NULL,
  action      TEXT    NOT NULL, -- 'blocked' | 'unblocked' | 'booked' | 'cancelled'
  admin_id    UUID,
  admin_name  TEXT    DEFAULT '',
  note        TEXT    DEFAULT '',
  created_at  TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.schedule_logs ENABLE ROW LEVEL SECURITY;

-- Admin đọc log
CREATE POLICY "logs_admin_select" ON public.schedule_logs
  FOR SELECT USING (public.is_admin());

-- Hệ thống ghi log (service role hoặc admin)
CREATE POLICY "logs_admin_insert" ON public.schedule_logs
  FOR INSERT WITH CHECK (public.is_admin());
