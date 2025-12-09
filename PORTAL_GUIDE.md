# Student Admission Portal - Complete Setup Guide

## 🎉 Features Implemented

### For Students:
- **Apply Online**: Fill admission form with all required documents
- **Auto-Generated Credentials**: Get Application ID and Password after submission
- **Track Application**: Login to view real-time application status
- **Activity Timeline**: See all updates and changes to your application
- **Admin Messages**: View notes and feedback from administrators

### For Admin:
- **Dashboard Overview**: View statistics and all applications
- **Filter & Sort**: Sort by marks (10th/12th), date, name, or status
- **Search**: Find applications by name, ID, or email
- **Manage Applications**: Approve, reject, or set to under review
- **Add Notes**: Leave messages for students

## 🚀 Database Setup

### Run this SQL in Supabase (Important!):

```sql
-- Copy and paste the entire content of:
-- supabase/migrations/004_add_auth_tracking.sql
```

Or run in terminal:
```bash
supabase db push
```

## 🔑 Login Credentials

### Admin Login:
- **Email**: `nckcollageadmin@gmail.com`
- **Password**: `nckbcs@123`

### Student Login:
- Students get their credentials after submitting the admission form
- **Application ID**: Format like `NCK20250001`
- **Password**: 6-character random code

## 📱 How to Use

### For New Students:
1. Go to `/login`
2. Click "Apply for Admission"
3. Fill out the complete admission form
4. After submission, **SAVE YOUR CREDENTIALS** (Application ID + Password)
5. Click "Go to Login" and login with your credentials
6. View your application status on the student dashboard

### For Admin:
1. Go to `/login`
2. Switch to "Admin Login"
3. Enter admin credentials
4. View all applications
5. Use filters to sort by marks or status
6. Click "Manage" on any application to approve/reject/review

## 🗂️ Routes

- `/login` - Login page (students & admin)
- `/apply` - Admission application form
- `/student/dashboard` - Student dashboard (protected)
- `/admin/dashboard` - Admin dashboard (protected)

## 📊 Application Statuses

- **Pending**: Newly submitted applications
- **Under Review**: Being reviewed by admin
- **Approved**: Application accepted
- **Rejected**: Application not accepted

## 🎨 Features

✅ Responsive design (mobile, tablet, desktop)
✅ Real-time application tracking
✅ File uploads (photo + marksheets)
✅ Auto-generated unique Application IDs
✅ Activity logging for audit trail
✅ Admin notes for student communication
✅ Advanced filtering and sorting
✅ Search functionality
✅ Secure authentication
✅ Beautiful UI with animations

## 🔧 Environment Variables

Make sure your `.env` file is configured:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📝 Testing Flow

1. **Submit Application**:
   - Go to `/apply`
   - Fill form with test data
   - Upload test files
   - Submit and note the credentials

2. **Student Login**:
   - Use generated Application ID and Password
   - View application status
   - Check timeline

3. **Admin Login**:
   - Login with admin credentials
   - View all applications
   - Filter by marks (try sorting by 10th or 12th marks)
   - Manage an application (approve/reject)
   - Add admin notes

4. **Back to Student**:
   - Refresh student dashboard
   - See status update
   - View admin notes

## 🛠️ Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Access at http://localhost:3000 (or 3001 if 3000 is in use)
```

## 🎯 Next Steps (Optional Enhancements)

- Add email notifications
- Add document verification
- Add payment gateway for application fees
- Add multi-step form progress indicator
- Add forgot password functionality
- Add export to Excel for admin
- Add print application feature
- Add interview scheduling

## 📞 Support

For any issues:
1. Check browser console for errors
2. Verify Supabase migration ran successfully
3. Check environment variables
4. Ensure storage bucket "uploads" exists

Enjoy your complete admission portal! 🎓
