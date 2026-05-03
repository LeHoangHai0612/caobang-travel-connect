-- ============================================================
-- UPDATE V8: Trigger đọc full_name và phone từ user metadata
-- Chạy trong Supabase SQL Editor
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, full_name, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', '')
  )
  ON CONFLICT (id) DO UPDATE
    SET full_name = COALESCE(EXCLUDED.full_name, ''),
        phone     = COALESCE(EXCLUDED.phone, '');
  RETURN NEW;
END;
$$;
