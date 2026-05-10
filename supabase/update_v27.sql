-- UPDATE V27: Đánh dấu HDV nổi bật
ALTER TABLE public.guides
  ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
