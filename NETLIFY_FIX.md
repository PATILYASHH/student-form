# Netlify White Screen Fix Guide

## Common Causes & Solutions

### 1. Missing Environment Variables ⚠️ MOST COMMON

**Problem**: Environment variables not set in Netlify
**Solution**:
1. Go to Netlify Dashboard → Site settings → Environment variables
2. Add these variables:
   - Key: `VITE_SUPABASE_URL`
     Value: `https://sznezecabndaeqcqhbqd.supabase.co`
   - Key: `VITE_SUPABASE_ANON_KEY`
     Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN6bmV6ZWNhYm5kYWVxY3FoYnFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyMDIwNjEsImV4cCI6MjA4MDc3ODA2MX0.KjnimRg_DDmzeAFx0uusrCbkxA4l8GxHExfplFLYUNo`
3. **Important**: After adding variables, trigger a new deploy:
   - Go to Deploys → Trigger deploy → Deploy site

### 2. Build Errors

**Check Build Logs**:
1. Go to Netlify Dashboard → Deploys
2. Click on the failed deploy
3. Check the build log for errors

**Common Issues**:
- Missing dependencies → Run `npm install` locally first
- TypeScript errors → Fix errors shown in logs
- Build timeout → Increase build timeout in Site settings

### 3. Routing Issues (404 on refresh)

**Solution**: Already fixed with `_redirects` file and `netlify.toml`
- Verify `public/_redirects` contains: `/*    /index.html   200`
- Verify `netlify.toml` has redirect rules

### 4. JavaScript/Console Errors

**How to Check**:
1. Open deployed site
2. Press F12 to open Developer Tools
3. Check Console tab for errors
4. Check Network tab for failed requests

**Common Errors**:
- CORS errors → Update Supabase settings
- 401/403 errors → Check Supabase RLS policies
- Module not found → Clear cache and rebuild

### 5. Supabase Connection Issues

**Fix Supabase Settings**:
1. Go to Supabase Dashboard → Settings → API
2. Verify URL matches: `https://sznezecabndaeqcqhbqd.supabase.co`
3. Verify anon key is correct

**Update CORS**:
1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Add your Netlify URL to Site URL
3. Add to Redirect URLs: `https://your-site.netlify.app/**`

### 6. Force Rebuild

Sometimes you just need a fresh build:
1. Go to Netlify Dashboard → Deploys
2. Click "Trigger deploy" → "Clear cache and deploy site"

### 7. Check Build Command

Verify in Netlify:
1. Site settings → Build & deploy → Build settings
2. Build command should be: `npm run build`
3. Publish directory should be: `dist`

## Quick Diagnosis Steps

### Step 1: Check Browser Console
Open your deployed site and press F12:
```
If you see: "Missing VITE_SUPABASE_URL" 
→ Add environment variables in Netlify (Solution #1)

If you see: CORS errors
→ Update Supabase URL configuration (Solution #5)

If you see: 404 errors
→ Check redirects are configured (Solution #3)
```

### Step 2: Test Build Locally
```bash
# Build the project locally
npm run build

# Preview the build
npm run preview
```

If local build works but Netlify doesn't → Environment variable issue

### Step 3: Check Netlify Deploy Log
Look for these patterns:
- "Build failed" → Fix the error shown
- "Deploy succeeded" but white screen → Environment variables missing
- "Command not found" → Check build settings

## Testing Checklist After Deploy

- [ ] Site loads (not white screen)
- [ ] Can submit admission form
- [ ] File uploads work
- [ ] Student login works
- [ ] Admin login works (nckcollageadmin@gmail.com / nckbcs@123)
- [ ] Dashboard navigation works
- [ ] Refresh page doesn't give 404

## Emergency Fix

If nothing works, try this complete reset:

```bash
# 1. Clean everything locally
rm -rf node_modules dist .netlify
npm install
npm run build

# 2. Test locally
npm run preview

# 3. If local works, commit and push
git add .
git commit -m "Fix deployment issues"
git push

# 4. In Netlify: Clear cache and deploy
```

## Still Not Working?

1. **Check Netlify Function Logs**: Deploys → Functions (if any errors)
2. **Verify Domain**: Make sure you're visiting the correct URL
3. **Browser Cache**: Try in incognito mode
4. **DNS Propagation**: If using custom domain, wait 24-48 hours

## Contact Support

If issue persists:
1. Screenshot of browser console errors
2. Screenshot of Netlify build log
3. Screenshot of environment variables (hide sensitive values)
4. Share Netlify deploy URL

## Working Configuration

Your site should work with these settings:

**netlify.toml**:
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

**Environment Variables**:
- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY

**Build Output**: Should see `dist/` folder with:
- index.html
- assets/ (CSS, JS files)
- vite.svg

Good luck! 🚀
