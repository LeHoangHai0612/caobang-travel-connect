-- ============================================================
-- UPDATE V15: is_blocked cho user_profiles
-- ============================================================
ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT false;

NOTIFY pgrst, 'reload schema';
