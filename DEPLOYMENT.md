# Netlify Deployment Guide

## Prerequisites
- A Netlify account (sign up at https://netlify.com)
- Git repository (GitHub, GitLab, or Bitbucket)
- Supabase project with migrations applied

## Step 1: Push Code to Git Repository

If you haven't already, initialize git and push to your repository:

```bash
git init
git add .
git commit -m "Initial commit - Student Admission Portal"
git branch -M main
git remote add origin YOUR_REPOSITORY_URL
git push -u origin main
```

## Step 2: Connect to Netlify

1. Go to https://app.netlify.com
2. Click "Add new site" → "Import an existing project"
3. Choose your Git provider (GitHub/GitLab/Bitbucket)
4. Select your repository
5. Netlify will auto-detect the build settings from `netlify.toml`

## Step 3: Configure Environment Variables

In Netlify dashboard:
1. Go to **Site settings** → **Environment variables**
2. Add these variables:

```
VITE_SUPABASE_URL=https://sznezecabndaeqcqhbqd.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN6bmV6ZWNhYm5kYWVxY3FoYnFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyMDIwNjEsImV4cCI6MjA4MDc3ODA2MX0.KjnimRg_DDmzeAFx0uusrCbkxA4l8GxHExfplFLYUNo
```

## Step 4: Deploy

1. Click "Deploy site"
2. Netlify will build and deploy your application
3. You'll get a URL like: `https://YOUR-SITE-NAME.netlify.app`

## Step 5: Configure Supabase for Production

After deployment, update Supabase to allow requests from your Netlify domain:

1. Go to Supabase Dashboard → **Authentication** → **URL Configuration**
2. Add your Netlify URL to **Site URL**: `https://YOUR-SITE-NAME.netlify.app`
3. Add to **Redirect URLs**: `https://YOUR-SITE-NAME.netlify.app/**`

4. Go to **Storage** → **Policies**
5. Verify RLS policies allow your domain

## Step 6: Run Database Migrations

If not done already:
1. Go to Supabase Dashboard → **SQL Editor**
2. Run migrations in order:
   - `supabase/migrations/001_create_admissions_table.sql`
   - `supabase/migrations/002_setup_storage.sql`
   - `supabase/migrations/003_fix_ifsc_constraint.sql`
   - `supabase/migrations/004_add_auth_tracking.sql`

## Step 7: Test the Deployment

1. Visit your Netlify URL
2. Test form submission
3. Test file uploads
4. Test student login with generated credentials
5. Test admin login: `nckcollageadmin@gmail.com` / `nckbcs@123`
6. Test admin dashboard filtering and sorting

## Custom Domain (Optional)

To use your own domain:
1. Go to **Domain settings** in Netlify
2. Click "Add custom domain"
3. Follow instructions to update DNS records
4. Update Supabase URL configurations with your custom domain

## Continuous Deployment

Every push to your main branch will automatically trigger a new deployment on Netlify.

## Build Configuration

The following files handle deployment:
- `netlify.toml` - Build commands and redirect rules
- `public/_redirects` - SPA routing fallback
- `.env` - Environment variables (DO NOT commit this file)

## Troubleshooting

### Build Fails
- Check build logs in Netlify dashboard
- Verify all dependencies are in `package.json`
- Ensure environment variables are set correctly

### 404 Errors on Routes
- Verify `_redirects` file is in `public/` folder
- Check `netlify.toml` redirect rules

### Supabase Connection Issues
- Verify environment variables are set in Netlify
- Check Supabase URL configuration includes Netlify domain
- Verify CORS settings in Supabase

### File Upload Issues
- Check Supabase Storage policies
- Verify RLS policies allow public uploads
- Check file size limits (currently 10MB)

## Security Notes

**Important**: Before production:
1. Use proper password hashing (bcryptjs is already installed)
2. Implement rate limiting for login attempts
3. Add CAPTCHA to prevent spam submissions
4. Review and tighten RLS policies
5. Enable Supabase auth instead of custom auth
6. Add input sanitization for XSS prevention

## Admin Credentials

- Email: `nckcollageadmin@gmail.com`
- Password: `nckbcs@123`

**Change these in production!**

## Support

For issues:
- Check Netlify deploy logs
- Review Supabase logs in dashboard
- Check browser console for client errors
