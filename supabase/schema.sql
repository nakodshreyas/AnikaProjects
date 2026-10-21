-- ==============================================================================
-- ANIKA PROJECTS - SUPABASE POSTGRESQL DATABASE & STORAGE SCHEMA
-- ==============================================================================
-- Execute this script in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/ilqhkyrhpwhazyziedsv/sql/new

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. PROJECTS TABLE
CREATE TABLE IF NOT EXISTS public.projects (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('completed', 'upcoming', 'custom')),
    category_label TEXT NOT NULL,
    location TEXT NOT NULL,
    type TEXT NOT NULL,
    units TEXT NOT NULL,
    plot_area TEXT NOT NULL,
    built_up_area TEXT NOT NULL,
    status TEXT NOT NULL,
    status_color TEXT DEFAULT 'emerald',
    image_url TEXT,
    images JSONB DEFAULT '[]'::jsonb,
    image_alt TEXT,
    overview TEXT,
    highlights JSONB DEFAULT '[]'::jsonb,
    floor_plans JSONB DEFAULT '{}'::jsonb,
    engineering_specs JSONB DEFAULT '{}'::jsonb,
    specs JSONB DEFAULT '{}'::jsonb,
    progress INTEGER DEFAULT 100,
    progress_label TEXT,
    next_milestone TEXT,
    rating NUMERIC(2, 1) DEFAULT 5.0,
    review_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. PROJECT UNITS TABLE (REAL-TIME INVENTORY & AVAILABILITY MATRIX)
CREATE TABLE IF NOT EXISTS public.project_units (
    id TEXT PRIMARY KEY,
    project_id TEXT REFERENCES public.projects(id) ON DELETE CASCADE,
    unit_number TEXT NOT NULL,
    type TEXT NOT NULL,
    size TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('available', 'booked', 'sold')),
    price TEXT,
    floor TEXT,
    facing TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. CONTACT LEADS & INQUIRIES TABLE
CREATE TABLE IF NOT EXISTS public.leads (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    interest TEXT NOT NULL,
    timeline TEXT,
    plot_status TEXT,
    message TEXT,
    submitted_at TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'site_visit', 'converted', 'closed')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. REVIEWS & TESTIMONIALS TABLE
CREATE TABLE IF NOT EXISTS public.reviews (
    id TEXT PRIMARY KEY,
    author TEXT NOT NULL,
    initials TEXT NOT NULL,
    project_or_area TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    rating NUMERIC(2, 1) DEFAULT 5.0,
    date TEXT NOT NULL,
    verified BOOLEAN DEFAULT true,
    user_submitted BOOLEAN DEFAULT false,
    show_on_public BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5b. PROJECT VIDEOS TABLE (YOUTUBE VIDEO GALLERY & PORTFOLIO)
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

CREATE INDEX IF NOT EXISTS idx_project_videos_display 
ON public.project_videos (is_published, display_order ASC, created_at DESC);

-- 6. DYNAMIC SQL EXECUTION RPC FUNCTION (Permits schema operations via Service Role Key)
CREATE OR REPLACE FUNCTION public.execute_sql(sql_query TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    EXECUTE sql_query;
    RETURN jsonb_build_object('success', true);
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- 7. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_videos ENABLE ROW LEVEL SECURITY;

-- Clean existing policies for idempotency
DROP POLICY IF EXISTS "Public can view projects" ON public.projects;
DROP POLICY IF EXISTS "Full access to projects" ON public.projects;
DROP POLICY IF EXISTS "Public can view project units" ON public.project_units;
DROP POLICY IF EXISTS "Full access to project units" ON public.project_units;
DROP POLICY IF EXISTS "Public can view approved reviews" ON public.reviews;
DROP POLICY IF EXISTS "Public can submit reviews" ON public.reviews;
DROP POLICY IF EXISTS "Full access to reviews" ON public.reviews;
DROP POLICY IF EXISTS "Public can submit contact leads" ON public.leads;
DROP POLICY IF EXISTS "Public can view leads" ON public.leads;
DROP POLICY IF EXISTS "Full access to leads" ON public.leads;
DROP POLICY IF EXISTS "Public can view published videos" ON public.project_videos;
DROP POLICY IF EXISTS "Full access to project videos" ON public.project_videos;
DROP POLICY IF EXISTS "Admins have full access to project videos" ON public.project_videos;
DROP POLICY IF EXISTS "Service role full access to project videos" ON public.project_videos;

-- Public read policies
CREATE POLICY "Public can view projects" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Public can view project units" ON public.project_units FOR SELECT USING (true);
CREATE POLICY "Public can view approved reviews" ON public.reviews FOR SELECT USING (show_on_public = true);
CREATE POLICY "Public can view published videos" ON public.project_videos FOR SELECT TO anon, authenticated USING (is_published = true);

-- Public insert policies
CREATE POLICY "Public can submit contact leads" ON public.leads FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can view leads" ON public.leads FOR SELECT USING (true);
CREATE POLICY "Public can submit reviews" ON public.reviews FOR INSERT WITH CHECK (true);

-- Authenticated / Service role management policies
CREATE POLICY "Full access to projects" ON public.projects FOR ALL USING (true);
CREATE POLICY "Full access to project units" ON public.project_units FOR ALL USING (true);
CREATE POLICY "Full access to leads" ON public.leads FOR ALL USING (true);
CREATE POLICY "Full access to reviews" ON public.reviews FOR ALL USING (true);
CREATE POLICY "Service role full access to project videos" ON public.project_videos FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 8. SUPABASE STORAGE BUCKET FOR PROJECT PHOTOS
INSERT INTO storage.buckets (id, name, public) 
VALUES ('project-images', 'project-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public can read project images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload project images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update project images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete project images" ON storage.objects;

CREATE POLICY "Public can read project images" ON storage.objects
FOR SELECT USING (bucket_id = 'project-images');

CREATE POLICY "Anyone can upload project images" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'project-images');

CREATE POLICY "Anyone can update project images" ON storage.objects
FOR UPDATE USING (bucket_id = 'project-images');

CREATE POLICY "Anyone can delete project images" ON storage.objects
FOR DELETE USING (bucket_id = 'project-images');

-- 9. INITIAL SEED DATA FOR PROJECTS
INSERT INTO public.projects (
    id, title, category, category_label, location, type, units, plot_area, built_up_area, status, status_color, image_url, images, overview, rating, review_count
) VALUES 
(
    'sai-nagar-row-houses',
    'Sai Nagar Modern Row Houses',
    'completed',
    'Completed & Handed Over',
    'Sai Nagar, Akoli Road, Amravati',
    '2 BHK Independent Row House Villas',
    '3 Units',
    '~700 sq ft per unit',
    '~1,100 sq ft built-up each',
    'Handed Over',
    'emerald',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85',
    '["https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85", "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=85", "https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=1200&q=85"]'::jsonb,
    'Three thoughtfully planned 2 BHK modern row houses constructed as compact, self-contained independent villas on dedicated freehold plots in Sai Nagar, Akoli.',
    5.0,
    3
),
(
    'camp-road-luxury-bungalows',
    'Camp Road Extension Luxury Bungalows',
    'upcoming',
    'Under Planning · Advance Booking',
    'Camp Road Extension, Amravati',
    '3 BHK Contemporary Luxury Residences',
    '4 Exclusive Units',
    '1,200 – 1,500 sq ft plot sizes',
    '1,850 – 2,200 sq ft built-up',
    'Under Planning',
    'amber',
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=85',
    '["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=85", "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=85"]'::jsonb,
    'A boutique enclave of 4 independent luxury bungalows designed with clean contemporary lines, expansive double-glazed windows, private open-to-sky terrace pergola.',
    4.9,
    2
),
(
    'turnkey-private-plot-construction',
    'Turnkey Private Plot Home Construction',
    'custom',
    'Custom Build on Your Land',
    'Available across all Amravati Zones',
    'Bespoke Bungalows & Custom Row Houses',
    'Custom 1-on-1 Engagements',
    'Custom (500 sq ft to 5,000+ sq ft)',
    'Custom tailored to FAR & Municipal Bye-laws',
    'Available',
    'blue',
    'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=85',
    '["https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=85", "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=85"]'::jsonb,
    'Own a plot anywhere in Amravati? Anika Projects executes your entire dream house from foundational soil excavation to final keys in hand.',
    5.0,
    4
)
ON CONFLICT (id) DO NOTHING;

-- 10. INITIAL SEED DATA FOR PROJECT UNITS
INSERT INTO public.project_units (id, project_id, unit_number, type, size, status, price, floor, facing)
VALUES 
('sn-1', 'sai-nagar-row-houses', 'Row House 1 (Corner)', '2 BHK Independent Villa', '1,100 sq ft built-up', 'sold', '₹38.5 L', 'G+1 Duplex', 'East Facing'),
('sn-2', 'sai-nagar-row-houses', 'Row House 2 (Middle)', '2 BHK Independent Villa', '1,100 sq ft built-up', 'sold', '₹36.0 L', 'G+1 Duplex', 'East Facing'),
('sn-3', 'sai-nagar-row-houses', 'Row House 3 (End)', '2 BHK Independent Villa', '1,100 sq ft built-up', 'available', '₹37.5 L', 'G+1 Duplex', 'North-East'),
('cr-1', 'camp-road-luxury-bungalows', 'Bungalow 1 (Corner)', '3 BHK Contemporary Luxury Residence', '2,200 sq ft', 'booked', '₹72.0 L', 'G+1 + Terrace', 'East Facing'),
('cr-2', 'camp-road-luxury-bungalows', 'Bungalow 2', '3 BHK Contemporary Luxury Residence', '2,050 sq ft', 'available', '₹68.5 L', 'G+1 + Terrace', 'North Facing'),
('cr-3', 'camp-road-luxury-bungalows', 'Bungalow 3', '3 BHK Contemporary Luxury Residence', '2,100 sq ft', 'available', '₹69.0 L', 'G+1 + Terrace', 'East Facing'),
('cr-4', 'camp-road-luxury-bungalows', 'Bungalow 4', '3 BHK Contemporary Luxury Residence', '2,250 sq ft', 'sold', '₹74.0 L', 'G+1 + Terrace', 'North-East')
ON CONFLICT (id) DO NOTHING;

-- 11. INITIAL SEED REVIEWS
INSERT INTO public.reviews (id, author, initials, project_or_area, title, message, rating, date, verified, show_on_public)
VALUES
('rev-1', 'Pramod Kale', 'PK', 'Sai Nagar Row House 1', 'Exceptional structural quality', 'Handover was completed exactly on schedule. The concrete finishing and brickwork quality exceeded expectations.', 5.0, '15 Jan 2026', true, true),
('rev-2', 'Dr. Sneha Rathod', 'SR', 'Camp Road Bungalow', 'Transparent BOQ and clear approvals', 'Every rupee spent was itemized with no surprise escalation. Very professional team in Amravati.', 5.0, '28 Feb 2026', true, true)
ON CONFLICT (id) DO NOTHING;

-- 11b. INITIAL SEED PROJECT REELS & SHORTS
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

-- 12. NOTIFY POSTGREST SCHEMA RELOAD
NOTIFY pgrst, 'reload schema';
