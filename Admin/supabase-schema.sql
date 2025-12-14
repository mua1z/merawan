-- Supabase Database Schema
-- Run this SQL in your Supabase SQL Editor to create the necessary tables

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT,
    bio_en TEXT,
    bio_om TEXT,
    bio_am TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create experiences table
CREATE TABLE IF NOT EXISTS experiences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    title_en TEXT,
    title_om TEXT,
    title_am TEXT,
    period TEXT,
    description TEXT,
    description_en TEXT,
    description_om TEXT,
    description_am TEXT,
    image_url TEXT,
    tags TEXT[],
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create initiatives table
CREATE TABLE IF NOT EXISTS initiatives (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    title_en TEXT,
    title_om TEXT,
    title_am TEXT,
    description TEXT,
    description_en TEXT,
    description_om TEXT,
    description_am TEXT,
    image_url TEXT,
    impact TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create storage bucket for images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('site-images', 'site-images', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies (allow public read, authenticated write)
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'site-images');
CREATE POLICY "Authenticated users can upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'site-images' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update" ON storage.objects FOR UPDATE USING (bucket_id = 'site-images' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete" ON storage.objects FOR DELETE USING (bucket_id = 'site-images' AND auth.role() = 'authenticated');

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE initiatives ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Public experiences are viewable by everyone" ON experiences FOR SELECT USING (true);
CREATE POLICY "Public initiatives are viewable by everyone" ON initiatives FOR SELECT USING (true);

-- Create policies for authenticated write access (you'll need to set up authentication)
-- For now, we'll allow inserts/updates/deletes for authenticated users
-- You should replace this with proper authentication in production
CREATE POLICY "Authenticated users can insert profiles" ON profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can update profiles" ON profiles FOR UPDATE USING (true);
CREATE POLICY "Authenticated users can delete profiles" ON profiles FOR DELETE USING (true);

CREATE POLICY "Authenticated users can insert experiences" ON experiences FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can update experiences" ON experiences FOR UPDATE USING (true);
CREATE POLICY "Authenticated users can delete experiences" ON experiences FOR DELETE USING (true);

CREATE POLICY "Authenticated users can insert initiatives" ON initiatives FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can update initiatives" ON initiatives FOR UPDATE USING (true);
CREATE POLICY "Authenticated users can delete initiatives" ON initiatives FOR DELETE USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_experiences_updated_at BEFORE UPDATE ON experiences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_initiatives_updated_at BEFORE UPDATE ON initiatives
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

