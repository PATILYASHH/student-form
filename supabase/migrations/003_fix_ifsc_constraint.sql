-- Fix IFSC code constraint to be more flexible
-- Run this in Supabase SQL Editor

-- Drop the existing constraint
ALTER TABLE admissions DROP CONSTRAINT IF EXISTS admissions_ifsc_code_check;

-- Add a more flexible constraint (just check it's not empty and reasonable length)
ALTER TABLE admissions ADD CONSTRAINT admissions_ifsc_code_check 
CHECK (LENGTH(ifsc_code) >= 11 AND LENGTH(ifsc_code) <= 11);

-- Or if you want to be more lenient, just ensure it's not empty:
-- ALTER TABLE admissions ADD CONSTRAINT admissions_ifsc_code_check 
-- CHECK (LENGTH(TRIM(ifsc_code)) > 0);
