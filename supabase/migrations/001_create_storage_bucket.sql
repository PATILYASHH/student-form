-- Create the uploads storage bucket
-- This must be run before the storage policies in 002_setup_storage.sql

-- Insert the bucket into storage.buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'uploads',
  'uploads',
  true,  -- Make bucket public
  5242880,  -- 5MB file size limit
  ARRAY['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'application/pdf']  -- Allowed file types
)
ON CONFLICT (id) DO NOTHING;

-- Note: If the bucket already exists, this will do nothing
