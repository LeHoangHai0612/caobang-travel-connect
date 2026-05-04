-- ============================================================
-- UPDATE V9: RLS policies cho Admin đọc contacts & user_profiles
-- Chạy trong Supabase SQL Editor
-- ============================================================

-- Hàm kiểm tra admin (dùng trong các policy)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM public.user_profiles WHERE id = auth.uid()),
    false
  );
$$;

-- ── CONTACTS ────────────────────────────────────────────────
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- Cho phép bất kỳ ai gửi liên hệ (form trên website)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'contacts' AND policyname = 'contacts_public_insert') THEN
    CREATE POLICY "contacts_public_insert" ON public.contacts FOR INSERT WITH CHECK (true);
  END IF;
END $$;

-- Admin đọc tất cả tin nhắn liên hệ
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'contacts' AND policyname = 'contacts_admin_select') THEN
    CREATE POLICY "contacts_admin_select" ON public.contacts FOR SELECT USING (public.is_admin());
  END IF;
END $$;

-- Admin cập nhật (mark read/unread)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'contacts' AND policyname = 'contacts_admin_update') THEN
    CREATE POLICY "contacts_admin_update" ON public.contacts FOR UPDATE USING (public.is_admin());
  END IF;
END $$;

-- Admin xóa
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'contacts' AND policyname = 'contacts_admin_delete') THEN
    CREATE POLICY "contacts_admin_delete" ON public.contacts FOR DELETE USING (public.is_admin());
  END IF;
END $$;

-- ── USER_PROFILES ────────────────────────────────────────────
-- Admin đọc tất cả profiles
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_profiles' AND policyname = 'profiles_admin_select') THEN
    CREATE POLICY "profiles_admin_select" ON public.user_profiles FOR SELECT USING (public.is_admin() OR auth.uid() = id);
  END IF;
END $$;

-- Admin cập nhật (set is_admin, points)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_profiles' AND policyname = 'profiles_admin_update') THEN
    CREATE POLICY "profiles_admin_update" ON public.user_profiles FOR UPDATE USING (public.is_admin() OR auth.uid() = id);
  END IF;
END $$;

-- ── STORAGE: bucket audio ────────────────────────────────────
-- Chạy thủ công trong Supabase Dashboard → Storage → New bucket
-- Tên: audio, Public: true
-- Sau đó chạy lệnh sau để cho phép admin upload:

INSERT INTO storage.buckets (id, name, public) VALUES ('audio', 'audio', true)
  ON CONFLICT (id) DO UPDATE SET public = true;

CREATE POLICY "audio_admin_upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'audio' AND public.is_admin());

CREATE POLICY "audio_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'audio');
