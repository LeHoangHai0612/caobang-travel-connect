-- ============================================================
-- FIX: Contacts table - đảm bảo đủ cột và reload schema cache
-- ============================================================

-- Thêm cột nếu chưa có (safe với IF NOT EXISTS)
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS name        TEXT DEFAULT '';
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS email       TEXT DEFAULT '';
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS phone       TEXT DEFAULT '';
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS is_read     BOOLEAN DEFAULT false;
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS admin_reply TEXT DEFAULT '';
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS replied_at  TIMESTAMPTZ;
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS replied_by  TEXT DEFAULT '';

-- Reload schema cache của PostgREST (fix lỗi "column not found")
NOTIFY pgrst, 'reload schema';
