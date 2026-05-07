-- UPDATE V24: Hero video background
INSERT INTO public.site_settings (key, label, value)
VALUES ('hero_video', 'Video nền Hero (URL mp4)', '')
ON CONFLICT (key) DO NOTHING;
