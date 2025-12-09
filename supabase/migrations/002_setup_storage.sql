-- Storage Configuration for Student Admission Files
-- Run this SQL in your Supabase SQL Editor

-- Ensure the bucket exists first
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'uploads',
  'uploads',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public reads" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes" ON storage.objects;

-- Policy: Allow public to upload files
CREATE POLICY "Allow public uploads"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'uploads');

-- Policy: Allow public to read uploaded files
CREATE POLICY "Allow public reads"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'uploads');

-- Policy: Allow authenticated users to update files
CREATE POLICY "Allow authenticated updates"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'uploads')
WITH CHECK (bucket_id = 'uploads');

-- Policy: Allow authenticated users to delete files
CREATE POLICY "Allow authenticated deletes"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'uploads');

-- Optional: Add file size limit (example: 10MB)
-- This needs to be set in the Supabase dashboard under Storage settings
