-- ============================================================
-- UPDATE V7: Thêm user_id vào bảng reviews
-- ============================================================
ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Cho phép người dùng đọc đánh giá của chính họ (kể cả chưa duyệt)
CREATE POLICY "users_read_own_reviews" ON public.reviews
  FOR SELECT USING (auth.uid() = user_id);
