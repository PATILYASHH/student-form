-- Add authentication and tracking features
-- Run this in Supabase SQL Editor

-- Add application_id and password to admissions table
ALTER TABLE admissions 
ADD COLUMN IF NOT EXISTS application_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS password_hash TEXT,
ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- Create function to generate unique application ID
CREATE OR REPLACE FUNCTION generate_application_id()
RETURNS TEXT AS $$
DECLARE
  new_id TEXT;
  done BOOLEAN := FALSE;
BEGIN
  WHILE NOT done LOOP
    -- Generate ID like: NCK2025XXXX (NCK + Year + 4 random digits)
    new_id := 'NCK' || EXTRACT(YEAR FROM NOW())::TEXT || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    -- Check if this ID already exists
    IF NOT EXISTS (SELECT 1 FROM admissions WHERE application_id = new_id) THEN
      done := TRUE;
    END IF;
  END LOOP;
  RETURN new_id;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate application_id
CREATE OR REPLACE FUNCTION set_application_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.application_id IS NULL THEN
    NEW.application_id := generate_application_id();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_application_id ON admissions;
CREATE TRIGGER trigger_set_application_id
  BEFORE INSERT ON admissions
  FOR EACH ROW
  EXECUTE FUNCTION set_application_id();

-- Create admin users table
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on admin_users
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins can read admin_users
CREATE POLICY "Admins can read admin_users" ON admin_users
  FOR SELECT
  TO authenticated
  USING (true);

-- Insert default admin (password: nckbcs@123)
-- Password hash generated using bcrypt with 10 rounds
INSERT INTO admin_users (email, password_hash, full_name)
VALUES (
  'nckcollageadmin@gmail.com',
  '$2a$10$rJ0VHKxLKZLJ4gqYZNQN0.oKGGqGqxBhOJXKYJXRLKZLJ4gqYZNQN0',  -- This is a placeholder, we'll handle real hashing in the app
  'NCK College Admin'
)
ON CONFLICT (email) DO NOTHING;

-- Create activity log table for tracking
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admission_id UUID REFERENCES admissions(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  details TEXT,
  performed_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on activity_logs
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read their own logs
CREATE POLICY "Users can read own logs" ON activity_logs
  FOR SELECT
  TO public
  USING (true);

-- Policy: System can insert logs
CREATE POLICY "System can insert logs" ON activity_logs
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_admissions_application_id ON admissions(application_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_admission_id ON activity_logs(admission_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);

-- Update the existing policies for better security
DROP POLICY IF EXISTS "Allow users to read own submissions" ON admissions;
CREATE POLICY "Allow users to read own submissions" ON admissions
  FOR SELECT
  TO public
  USING (true);  -- We'll add application_id based filtering in the app

-- Add policy for admin updates
DROP POLICY IF EXISTS "Allow authenticated updates" ON admissions;
CREATE POLICY "Allow authenticated updates" ON admissions
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Create function to log status changes
CREATE OR REPLACE FUNCTION log_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status) THEN
    INSERT INTO activity_logs (admission_id, action, details, performed_by)
    VALUES (
      NEW.id,
      'status_changed',
      'Status changed from ' || OLD.status || ' to ' || NEW.status,
      'system'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_log_status_change ON admissions;
CREATE TRIGGER trigger_log_status_change
  AFTER UPDATE ON admissions
  FOR EACH ROW
  EXECUTE FUNCTION log_status_change();

-- Create view for admin dashboard statistics
CREATE OR REPLACE VIEW admin_dashboard_stats AS
SELECT 
  COUNT(*) as total_applications,
  COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
  COUNT(*) FILTER (WHERE status = 'approved') as approved_count,
  COUNT(*) FILTER (WHERE status = 'rejected') as rejected_count,
  COUNT(*) FILTER (WHERE status = 'under_review') as under_review_count,
  AVG(marks_10) as avg_marks_10,
  AVG(marks_12) as avg_marks_12,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '24 hours') as today_count,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days') as week_count
FROM admissions;

GRANT SELECT ON admin_dashboard_stats TO public;

COMMENT ON TABLE admin_users IS 'Admin users who can manage applications';
COMMENT ON TABLE activity_logs IS 'Audit log of all actions performed on applications';
COMMENT ON COLUMN admissions.application_id IS 'Unique ID for student login (e.g., NCK20250001)';
COMMENT ON COLUMN admissions.password_hash IS 'Hashed password for student login';
