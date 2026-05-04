-- ============================================================
-- UPDATE V12: Lưu thông tin người hủy booking
-- ============================================================

ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS cancelled_by_name TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS cancelled_note     TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS cancelled_at       TIMESTAMPTZ;
