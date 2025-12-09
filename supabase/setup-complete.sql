-- ================================================
-- STUDENT ADMISSION SYSTEM - COMPLETE SETUP
-- ================================================
-- Copy this entire file and run it in Supabase SQL Editor
-- Go to: https://app.supabase.com → Your Project → SQL Editor → New Query
-- ================================================

-- ================================================
-- STEP 1: CREATE STORAGE BUCKET
-- ================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'uploads',
  'uploads',
  true,  -- Public bucket
  10485760,  -- 10MB max file size
  ARRAY['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'application/pdf'];

-- ================================================
-- STEP 2: CREATE STORAGE POLICIES
-- ================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public reads" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes" ON storage.objects;

-- Policy: Allow anyone to upload files
CREATE POLICY "Allow public uploads"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'uploads');

-- Policy: Allow anyone to read files
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

-- ================================================
-- STEP 3: CREATE ADMISSIONS TABLE
-- ================================================

CREATE TABLE IF NOT EXISTS admissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Student Information
  student_name TEXT NOT NULL,
  marks_10 DECIMAL(5,2) NOT NULL CHECK (marks_10 >= 0 AND marks_10 <= 100),
  marks_12 DECIMAL(5,2) NOT NULL CHECK (marks_12 >= 0 AND marks_12 <= 100),
  photo_path TEXT NOT NULL,
  marksheet_10_path TEXT NOT NULL,
  marksheet_12_path TEXT NOT NULL,
  blood_group TEXT,
  disability_status TEXT,
  caste TEXT,
  religion TEXT,
  contact_number TEXT NOT NULL,
  email TEXT NOT NULL,
  aadhaar_number TEXT NOT NULL CHECK (LENGTH(aadhaar_number) = 12),
  
  -- Parents Information
  father_name TEXT NOT NULL,
  mother_name TEXT,
  guardian_name TEXT,
  parent_contact_number TEXT,
  parent_email TEXT,
  parent_education TEXT,
  
  -- Personal Information
  address TEXT NOT NULL,
  annual_household_income DECIMAL(15,2),
  parent_business TEXT,
  
  -- Bank Information
  bank_account_number TEXT NOT NULL,
  ifsc_code TEXT NOT NULL CHECK (LENGTH(ifsc_code) = 11),
  bank_name TEXT NOT NULL,
  
  -- Agreements
  terms_accepted BOOLEAN NOT NULL DEFAULT FALSE,
  data_consent BOOLEAN NOT NULL DEFAULT FALSE,
  
  -- Application Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'under_review'))
);

-- ================================================
-- STEP 4: CREATE INDEXES
-- ================================================

CREATE INDEX IF NOT EXISTS idx_admissions_status ON admissions(status);
CREATE INDEX IF NOT EXISTS idx_admissions_email ON admissions(email);
CREATE INDEX IF NOT EXISTS idx_admissions_created_at ON admissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admissions_student_name ON admissions(student_name);
CREATE INDEX IF NOT EXISTS idx_admissions_student_name_fts ON admissions USING gin(to_tsvector('english', student_name));

-- ================================================
-- STEP 5: CREATE UPDATED_AT TRIGGER
-- ================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_admissions_updated_at ON admissions;
CREATE TRIGGER update_admissions_updated_at 
    BEFORE UPDATE ON admissions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ================================================
-- STEP 6: ENABLE ROW LEVEL SECURITY
-- ================================================

ALTER TABLE admissions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public inserts" ON admissions;
DROP POLICY IF EXISTS "Allow users to read own submissions" ON admissions;
DROP POLICY IF EXISTS "Allow authenticated updates" ON admissions;
DROP POLICY IF EXISTS "Allow authenticated deletes" ON admissions;

-- Policy: Allow anyone to submit application
CREATE POLICY "Allow public inserts" ON admissions
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Policy: Allow anyone to read applications (adjust based on your needs)
CREATE POLICY "Allow users to read own submissions" ON admissions
  FOR SELECT
  TO public
  USING (true);

-- Policy: Only authenticated users can update
CREATE POLICY "Allow authenticated updates" ON admissions
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy: Only authenticated users can delete
CREATE POLICY "Allow authenticated deletes" ON admissions
  FOR DELETE
  TO authenticated
  USING (true);

-- ================================================
-- STEP 7: CREATE STATISTICS VIEW
-- ================================================

CREATE OR REPLACE VIEW admission_statistics AS
SELECT 
  COUNT(*) as total_applications,
  COUNT(*) FILTER (WHERE status = 'pending') as pending,
  COUNT(*) FILTER (WHERE status = 'approved') as approved,
  COUNT(*) FILTER (WHERE status = 'rejected') as rejected,
  COUNT(*) FILTER (WHERE status = 'under_review') as under_review,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days') as last_7_days,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '30 days') as last_30_days
FROM admissions;

GRANT SELECT ON admission_statistics TO public;

-- ================================================
-- STEP 8: ADD TABLE COMMENTS
-- ================================================

COMMENT ON TABLE admissions IS 'Student admission applications with all required information';
COMMENT ON COLUMN admissions.status IS 'Application status: pending, approved, rejected, under_review';
COMMENT ON COLUMN admissions.photo_path IS 'Path to student photo in Supabase Storage';
COMMENT ON COLUMN admissions.marksheet_10_path IS 'Path to 10th marksheet in Supabase Storage';
COMMENT ON COLUMN admissions.marksheet_12_path IS 'Path to 12th marksheet in Supabase Storage';

-- ================================================
-- SETUP COMPLETE! 🎉
-- ================================================
-- Your database is now ready to use.
-- Update your .env file with Supabase credentials and start the app!
-- ================================================
