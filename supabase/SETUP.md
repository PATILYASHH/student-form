# Supabase Setup Guide

## Database Setup

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project: https://app.supabase.com
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"
4. Copy the contents of `supabase/migrations/001_create_admissions_table.sql`
5. Paste and run it
6. Then run `supabase/migrations/002_setup_storage.sql`

### Option 2: Using Supabase CLI

If you have Supabase CLI installed:

```bash
# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

## Storage Bucket Setup

1. Go to Storage in your Supabase dashboard
2. Click "Create bucket"
3. Name it: `uploads`
4. Set it to **Public** bucket
5. Click "Create bucket"
6. Then run the storage policies from `002_setup_storage.sql`

## Environment Variables

Update your `.env` file with your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Get these from: https://app.supabase.com/project/_/settings/api

## Database Structure

### admissions table
- Student information (name, marks, photos, documents)
- Parent/guardian information
- Personal details (address, income, business)
- Bank information
- Application status tracking

### Storage structure
```
uploads/
├── photos/          # Student ID photos
└── marksheets/      # 10th and 12th marksheets
```

## Security

The default policies allow:
- ✅ Anyone can submit applications (INSERT)
- ✅ Anyone can view applications (SELECT) - adjust if needed
- ✅ Only authenticated users can update/delete
- ✅ File uploads are public
- ✅ RLS (Row Level Security) is enabled

**Important**: Adjust the RLS policies based on your security requirements!
