-- UPDATE V26: Cho phép admin UPDATE bookings (fix RLS)
DO $$ BEGIN
  -- Admin có thể update bất kỳ booking nào
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'bookings' AND policyname = 'Admin can update bookings'
  ) THEN
    CREATE POLICY "Admin can update bookings" ON public.bookings
    FOR UPDATE USING (
      EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE id = auth.uid() AND is_admin = true
      )
    );
  END IF;

  -- Admin có thể đọc tất cả bookings
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'bookings' AND policyname = 'Admin can read all bookings'
  ) THEN
    CREATE POLICY "Admin can read all bookings" ON public.bookings
    FOR SELECT USING (
      EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE id = auth.uid() AND is_admin = true
      )
    );
  END IF;
END $$;
