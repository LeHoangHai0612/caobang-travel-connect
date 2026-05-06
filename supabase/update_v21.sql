-- UPDATE V21: Thêm image_url và content cho cam_nang_tips
ALTER TABLE public.cam_nang_tips
  ADD COLUMN IF NOT EXISTS image_url TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS content   TEXT DEFAULT '';
