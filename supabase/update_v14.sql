-- ============================================================
-- UPDATE V14: Liên kết contacts với user_id
-- ============================================================
ALTER TABLE public.contacts
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Index để query nhanh theo user
CREATE INDEX IF NOT EXISTS contacts_user_id_idx ON public.contacts(user_id);

-- Người dùng đọc tin nhắn của chính mình
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='contacts' AND policyname='contacts_user_select') THEN
    CREATE POLICY "contacts_user_select" ON public.contacts
      FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
  END IF;
END $$;

NOTIFY pgrst, 'reload schema';
