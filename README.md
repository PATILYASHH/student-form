# Student Admission Form - React + TypeScript + Supabase

A comprehensive, responsive student admission form built with React, TypeScript, and Supabase for data storage.

## Features

### Form Sections

1. **Student Information**
   - Student name, 10th & 12th marks (percentage)
   - File uploads: Student photo, 10th marksheet, 12th marksheet
   - Blood group, disability status, caste, religion
   - Contact number, email, Aadhaar number

2. **Parents Information**
   - Father's name, mother's name, guardian name (optional)
   - Parent contact details and education

3. **Personal Information**
   - Complete address
   - Annual household income
   - Parent's business/occupation

4. **Bank Information**
   - Bank account number, IFSC code, bank name

5. **Agreements**
   - Terms acceptance
   - Data consent

## Technology Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Database & Storage**: Supabase
- **Styling**: Pure CSS (responsive design)

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Supabase account

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
cd student-form
npm install
```

### 2. Supabase Setup

#### Create a Supabase Project
1. Go to [Supabase](https://supabase.com)
2. Create a new project
3. Note your project URL and anon key

#### Create the Storage Bucket
1. Go to Storage in your Supabase dashboard
2. Create a new bucket called `uploads`
3. Set it to **Public** (or configure policies as needed)

#### Create the Database Table

Run this SQL in your Supabase SQL Editor:

```sql
-- Create admissions table
CREATE TABLE admissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Student Information
  student_name TEXT NOT NULL,
  marks_10 DECIMAL(5,2) NOT NULL,
  marks_12 DECIMAL(5,2) NOT NULL,
  photo_path TEXT NOT NULL,
  marksheet_10_path TEXT NOT NULL,
  marksheet_12_path TEXT NOT NULL,
  blood_group TEXT,
  disability_status TEXT,
  caste TEXT,
  religion TEXT,
  contact_number TEXT NOT NULL,
  email TEXT NOT NULL,
  aadhaar_number TEXT NOT NULL,
  
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
  ifsc_code TEXT NOT NULL,
  bank_name TEXT NOT NULL,
  
  -- Agreements
  terms_accepted BOOLEAN NOT NULL DEFAULT FALSE,
  data_consent BOOLEAN NOT NULL DEFAULT FALSE,
  
  -- Status
  status TEXT DEFAULT 'pending'
);

-- Create index for faster queries
CREATE INDEX idx_admissions_status ON admissions(status);
CREATE INDEX idx_admissions_email ON admissions(email);
CREATE INDEX idx_admissions_created_at ON admissions(created_at DESC);

-- Enable Row Level Security
ALTER TABLE admissions ENABLE ROW LEVEL SECURITY;

-- Create policy to allow inserts
CREATE POLICY "Allow public inserts" ON admissions
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Create policy to allow reads (adjust as needed)
CREATE POLICY "Allow public reads" ON admissions
  FOR SELECT
  TO public
  USING (true);
```

#### Configure Storage Policies

In Supabase Storage, add policies for the `uploads` bucket:

```sql
-- Allow public uploads
CREATE POLICY "Allow public uploads"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'uploads');

-- Allow public reads
CREATE POLICY "Allow public reads"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'uploads');
```

### 3. Configure Environment Variables

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Edit `.env` and add your Supabase credentials:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Run the Development Server

```bash
npm run dev
```

The application will open at `http://localhost:3000`

## Build for Production

```bash
npm run build
```

The production build will be in the `dist/` folder.

## Project Structure

```
student-form/
├── src/
│   ├── components/
│   │   └── AdmissionForm.tsx      # Main form component
│   ├── lib/
│   │   └── supabase.ts            # Supabase client configuration
│   ├── App.tsx                     # Root component
│   ├── App.css                     # Application styles
│   ├── main.tsx                    # Entry point
│   └── index.css                   # Global styles
├── index.html                      # HTML template
├── package.json                    # Dependencies
├── tsconfig.json                   # TypeScript config
├── vite.config.ts                  # Vite configuration
└── .env.example                    # Environment variables template
```

## Form Validation

The form includes validation for:
- All required fields marked with *
- File uploads (photo and marksheets)
- Email format
- Number ranges for marks (0-100)
- Checkbox agreements (required)

## File Upload

Files are uploaded to Supabase Storage with:
- Unique filenames (timestamp + random string)
- Organized in folders: `photos/` and `marksheets/`
- Maximum file size: 5MB (configurable)
- Accepted formats: Images (JPG, PNG) and PDF for marksheets

## Data Storage

Form data is stored in the `admissions` table with:
- All form field values
- File paths for uploaded documents
- Default `status` field set to "pending"
- Timestamps for record creation

## Responsive Design

The form is fully responsive and works on:
- Desktop (optimal at 800px width)
- Tablet (adaptive layout)
- Mobile (stacked single-column layout)

## Security Considerations

⚠️ **Important**: For production use:
1. Implement proper authentication
2. Configure Row Level Security (RLS) policies
3. Add rate limiting
4. Validate file types and sizes on the backend
5. Sanitize user inputs
6. Use environment variables for sensitive data

## Troubleshooting

### Files not uploading
- Check that the `uploads` bucket exists in Supabase Storage
- Verify storage policies allow public uploads
- Check file size limits

### Database insert fails
- Verify the `admissions` table schema matches the form data
- Check RLS policies allow inserts
- Review browser console for error messages

### Environment variables not working
- Ensure `.env` file is in the root directory
- Restart the dev server after changing `.env`
- Variables must start with `VITE_` prefix

## License

MIT

## Support

For issues or questions, please create an issue in the repository.
