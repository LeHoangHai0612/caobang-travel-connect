-- ============================================================
-- UPDATE V5: Thêm thông tin chi tiết cho hướng dẫn viên
-- ============================================================
ALTER TABLE public.guides
  ADD COLUMN IF NOT EXISTS bio              TEXT    DEFAULT '',
  ADD COLUMN IF NOT EXISTS years_experience INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS languages        TEXT    DEFAULT 'Tiếng Việt';
