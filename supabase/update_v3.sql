-- ============================================================
-- UPDATE V3: Hệ thống tích điểm & thành viên
-- Chạy file này SAU khi đã chạy schema.sql và update_v2.sql
-- ============================================================

-- 1. Bảng hồ sơ người dùng
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT NOT NULL DEFAULT '',
  phone       TEXT NOT NULL DEFAULT '',
  points      INTEGER NOT NULL DEFAULT 0 CHECK (points >= 0),
  tier        TEXT NOT NULL DEFAULT 'bronze'
                CHECK (tier IN ('bronze', 'silver', 'gold', 'diamond')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger tự tạo profile khi đăng ký tài khoản
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.user_profiles (id) VALUES (NEW.id)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger tự cập nhật updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS cho user_profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_select_own_profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users_update_own_profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);


-- 2. Thêm cột mới vào bảng bookings
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS user_id        UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS guide_id       UUID REFERENCES public.guides(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS points_earned  INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS discount_pct   NUMERIC(4,2) NOT NULL DEFAULT 0.00;

CREATE INDEX IF NOT EXISTS bookings_user_id_idx  ON public.bookings(user_id);
CREATE INDEX IF NOT EXISTS bookings_guide_id_idx ON public.bookings(guide_id);

-- Cho phép người dùng đăng nhập xem lịch đặt của mình
CREATE POLICY "users_select_own_bookings" ON public.bookings
  FOR SELECT USING (auth.uid() = user_id);

-- 3. Phân quyền Admin
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT false;

-- ⚠️  SAU KHI CHẠY: cấp quyền admin cho tài khoản của bạn
-- Thay 'email-cua-ban@example.com' bằng email thực tế
-- UPDATE public.user_profiles SET is_admin = true
-- WHERE id = (SELECT id FROM auth.users WHERE email = 'email-cua-ban@example.com');

