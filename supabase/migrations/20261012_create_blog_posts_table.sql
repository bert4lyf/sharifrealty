-- BLOG POSTS TABLE FOR REAL-TIME MULTI-DEVICE SYNC
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id text PRIMARY KEY,
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  excerpt text NOT NULL DEFAULT '',
  content text NOT NULL DEFAULT '',
  date text NOT NULL DEFAULT CURRENT_DATE::text,
  category text NOT NULL DEFAULT 'General',
  author text NOT NULL DEFAULT 'Majeed Sharif',
  author_role text NOT NULL DEFAULT 'Principal Broker',
  read_time text NOT NULL DEFAULT '4 min read',
  cover_image text NOT NULL DEFAULT '/wp-content/themes/wpresidence/img/defaults/default_property_listings.jpg',
  gallery_images text[] NOT NULL DEFAULT '{}',
  property_specs jsonb,
  tags text[] NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'Published',
  comments integer NOT NULL DEFAULT 0,
  seo_score integer NOT NULL DEFAULT 90,
  views integer NOT NULL DEFAULT 0,
  source_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable Realtime for blog_posts
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.blog_posts;
  END IF;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- Row Level Security
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Allow public read of published blog posts for any device/visitor
CREATE POLICY "Allow public read published posts"
ON public.blog_posts FOR SELECT
USING (status = 'Published');

-- Allow authenticated users or admin to read all
CREATE POLICY "Allow auth read all posts"
ON public.blog_posts FOR SELECT
TO authenticated
USING (true);

-- Allow insert, update, delete for authorized app
CREATE POLICY "Allow app insert blog posts"
ON public.blog_posts FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow app update blog posts"
ON public.blog_posts FOR UPDATE
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow app delete blog posts"
ON public.blog_posts FOR DELETE
USING (true);
