-- ==============================================================================
-- MIGRATION: CREATE PROJECT VIDEOS TABLE & RLS POLICIES
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.project_videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    youtube_video_id TEXT NOT NULL,
    description TEXT,
    category TEXT,
    display_order INTEGER DEFAULT 0 NOT NULL,
    is_published BOOLEAN DEFAULT false NOT NULL,
    is_featured BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_youtube_video_id UNIQUE (youtube_video_id)
);

-- Index for public website query performance
CREATE INDEX IF NOT EXISTS idx_project_videos_display 
ON public.project_videos (is_published, display_order ASC, created_at DESC);

-- Enable RLS
ALTER TABLE public.project_videos ENABLE ROW LEVEL SECURITY;

-- Clean existing policies for idempotency
DROP POLICY IF EXISTS "Public can view published videos" ON public.project_videos;
DROP POLICY IF EXISTS "Full access to project videos" ON public.project_videos;
DROP POLICY IF EXISTS "Admins have full access to project videos" ON public.project_videos;
DROP POLICY IF EXISTS "Service role full access to project videos" ON public.project_videos;

-- Public read policy: only published videos are visible to public visitors
CREATE POLICY "Public can view published videos" ON public.project_videos 
FOR SELECT TO anon, authenticated 
USING (is_published = true);

-- Service role full access for admin dashboard operations
CREATE POLICY "Service role full access to project videos" ON public.project_videos 
FOR ALL TO service_role 
USING (true) 
WITH CHECK (true);

-- Seed initial verified project reel shorts
INSERT INTO public.project_videos (
    title, youtube_video_id, description, category, display_order, is_published, is_featured
) VALUES
(
    '2 BHK Independent House Walkthrough — Sai Nagar, Akoli',
    '3QhxWd5jeBo',
    'Compact independent villa with custom interior space planning in Sai Nagar, Amravati.',
    'Project Walkthrough',
    1,
    true,
    true
),
(
    'Modern Contemporary Elevation & Living Area Tour',
    '1F7OJ1XTxYc',
    'Double-height ceiling, marble finishes, and open terrace architecture walkthrough.',
    'Property Tour',
    2,
    true,
    true
),
(
    'Camp Road Luxury Bungalows Structural Frame Timelapse',
    'JfcVkQllsmg',
    'RCC column casting, slab reinforcement inspection, and foundation curing in Amravati.',
    'Construction Updates',
    3,
    true,
    false
),
(
    'Turnkey Private Plot Villa Construction Progress',
    'e2qFlgV-7JU',
    'Ground excavation to brickwork completion for custom residential homes in Amravati.',
    'Construction Updates',
    4,
    true,
    false
)
ON CONFLICT (youtube_video_id) DO NOTHING;

NOTIFY pgrst, 'reload schema';
