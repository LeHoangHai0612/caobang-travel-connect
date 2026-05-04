-- ============================================================
-- UPDATE V13: Thêm cột reply cho contacts
-- ============================================================

-- Đảm bảo bảng contacts tồn tại (chạy lần đầu nếu chưa có)
CREATE TABLE IF NOT EXISTS public.contacts (
  id         UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  name       TEXT    DEFAULT '',
  email      TEXT    DEFAULT '',
  phone      TEXT    DEFAULT '',
  message    TEXT    NOT NULL,
  is_read    BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- Cho phép ai cũng INSERT (form liên hệ)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='contacts' AND policyname='contacts_public_insert') THEN
    CREATE POLICY "contacts_public_insert" ON public.contacts FOR INSERT WITH CHECK (true);
  END IF;
END $$;

-- Cho phép ai đọc contact của mình theo id (để khách xem reply)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='contacts' AND policyname='contacts_public_select_own') THEN
    CREATE POLICY "contacts_public_select_own" ON public.contacts FOR SELECT USING (true);
  END IF;
END $$;

-- Admin đọc/sửa/xóa tất cả
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='contacts' AND policyname='contacts_admin_all') THEN
    CREATE POLICY "contacts_admin_all" ON public.contacts FOR ALL USING (public.is_admin());
  END IF;
END $$;

-- Thêm cột reply
ALTER TABLE public.contacts
  ADD COLUMN IF NOT EXISTS admin_reply  TEXT        DEFAULT '',
  ADD COLUMN IF NOT EXISTS replied_at   TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS replied_by   TEXT        DEFAULT '';
