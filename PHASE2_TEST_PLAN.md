# Diamond District - Phase 2 Admin Features Test Plan

## Admin Login Fix ✅

### What Was Fixed:
1. **Converted to Server Actions**: Login now uses Next.js 14 App Router server actions pattern
2. **Removed Client-Side Redirect**: No more `useEffect` or `useSession` hooks
3. **Middleware Handles Redirect**: After successful login, middleware redirects based on role
4. **Proper Error Handling**: Server action returns error messages for invalid credentials

### How It Works Now:
1. User submits login form → Server action authenticates
2. On success → Redirects to "/" → Middleware checks role
3. If ADMIN → Redirects to "/admin"
4. If USER → Redirects to "/dashboard"

### Test Steps:
1. Go to https://watch.zerotodiamond.com/login
2. Login with admin credentials
3. Should automatically redirect to /admin dashboard
4. Logout and login with regular user
5. Should automatically redirect to /dashboard

## Phase 2 Features to Test

### 1. Course Management (CRUD)

#### Create Course
- [ ] Navigate to /admin/courses
- [ ] Click "Create Course"
- [ ] Fill in title, description, slug
- [ ] Submit and verify course created

#### Edit Course  
- [ ] From course list, click "Edit" on a course
- [ ] Goes to /admin/courses/[id]/edit
- [ ] Update title, description, slug
- [ ] Toggle published status
- [ ] Save changes and verify

#### Delete Course
- [ ] On edit page, click "Delete Course"
- [ ] Confirm deletion dialog
- [ ] Verify course and all lessons deleted
- [ ] Redirects to course list

### 2. Lesson Management

#### Add Lessons
- [ ] From course page, use "Add New Lesson" form
- [ ] Upload video file
- [ ] Enter lesson title
- [ ] Verify lesson added to list

#### Delete Lessons
- [ ] Click trash icon on lesson
- [ ] Confirm deletion
- [ ] Verify lesson removed
- [ ] Check order numbers adjust

#### Reorder Lessons
- [ ] Drag lesson by grip handle
- [ ] Drop in new position
- [ ] Verify order saves
- [ ] Refresh and check order persists

### 3. User Management

#### View Users
- [ ] Navigate to /admin/users
- [ ] See user statistics cards
- [ ] View user list table

#### Search Users
- [ ] Use search box
- [ ] Search by name, email, phone
- [ ] Verify filtering works
- [ ] Check result count updates

#### User Details
- [ ] See user role badges
- [ ] Email verification status
- [ ] GHL sync indicator
- [ ] Lesson progress count
- [ ] Join date

### 4. Settings Page

#### Platform Info
- [ ] Navigate to /admin/settings
- [ ] View platform URL
- [ ] Check environment (production)
- [ ] See admin email

#### Integration Status
- [ ] Database connection status
- [ ] Auth configuration status
- [ ] GoHighLevel connection
- [ ] AWS S3 status
- [ ] SMTP status

#### Configuration Display
- [ ] Masked sensitive data
- [ ] Environment variable guide
- [ ] Service indicators

## Test Data Setup

### Create Test Admin
```sql
-- If needed, create test admin
UPDATE users 
SET role = 'ADMIN' 
WHERE email = 'your-admin@email.com';
```

### Create Test Course
1. Login as admin
2. Go to /admin/courses
3. Create course:
   - Title: "Test Admin Features"
   - Description: "Testing Phase 2 functionality"
   - Slug: "test-admin-features"

### Upload Test Videos
1. Go to course management page
2. Upload at least 3 videos
3. Test reordering
4. Test deletion

## Edge Cases to Test

### Authentication
- [ ] Try accessing /admin without login (should redirect to /login)
- [ ] Try accessing /admin as regular user (should redirect to /dashboard)
- [ ] Login with wrong password (should show error)
- [ ] Session persistence after browser refresh

### Course Management
- [ ] Try duplicate slug (should show error)
- [ ] Delete course with lessons (should cascade delete)
- [ ] Very long course title/description
- [ ] Special characters in slug

### Lesson Management
- [ ] Upload non-video file (should reject)
- [ ] Reorder with only 1 lesson
- [ ] Delete all lessons from course
- [ ] Multiple quick reorders

### User Management
- [ ] Search with no results
- [ ] User with no name
- [ ] User with no phone
- [ ] Unverified email users

## Performance Checks

- [ ] Course list loads quickly with many courses
- [ ] User search responsive with many users
- [ ] Lesson reorder saves within 2 seconds
- [ ] No console errors during operations

## Mobile Testing

- [ ] Admin dashboard responsive
- [ ] Course management on mobile
- [ ] User table horizontal scroll
- [ ] Settings page readable

## Success Criteria

Phase 2 is complete when:
1. ✅ Admin login redirects to /admin dashboard
2. ✅ Full CRUD for courses works
3. ✅ Lesson management with reordering works
4. ✅ User management page functional
5. ✅ Settings page shows all integrations
6. ✅ All features work on mobile
7. ✅ No critical errors in console

## Known Issues
- Some ESLint warnings (unused vars) - non-critical
- Video duration not auto-detected (manual entry needed)
- Edit lesson details not implemented (only delete)

## Next Steps
After Phase 2 testing complete:
1. Implement lesson edit functionality
2. Add video duration detection
3. Add bulk operations
4. Implement advanced analytics
5. Add export functionality