# Diamond District - Phase 1 Smoke Test Plan

## Test Environment
- **URL**: https://watch.zerotodiamond.com (or local http://localhost:3000)
- **Test Accounts**: Create one admin and one regular user
- **Prerequisites**: At least one course with 2+ video lessons

## 1. User Registration & GoHighLevel Sync

### Test Steps:
1. Navigate to `/register`
2. Fill in all fields:
   - Email: test@example.com
   - Password: TestPass123!
   - First Name: Test
   - Last Name: User
   - Phone: +1234567890
3. Submit registration

### Expected Results:
- [ ] User created in local database
- [ ] User redirected to dashboard
- [ ] GoHighLevel contact created (check GHL dashboard)
- [ ] Contact has "free course" tag
- [ ] Phone number synced to GHL

### Edge Cases:
- [ ] Register with existing email (should fail)
- [ ] Register admin user (should skip GHL sync)
- [ ] Register without phone (should still work)

## 2. Video Player Functionality

### Test Steps:
1. Login as regular user
2. Navigate to a course page `/courses/[slug]`
3. Click on a lesson
4. Test video player controls:
   - Play/Pause
   - Seek forward/backward
   - Volume control
   - Fullscreen
   - Playback speed
   - Keyboard shortcuts (space, f, arrows)

### Expected Results:
- [ ] Video loads and plays
- [ ] Controls responsive
- [ ] Progress saves every 15 seconds
- [ ] Video resumes from last position on refresh
- [ ] HLS streams work (if configured)
- [ ] Error message if video fails to load

## 3. Progress Tracking

### Test Steps:
1. Watch a lesson for 30+ seconds
2. Navigate away and return
3. Watch to 90% completion
4. Check dashboard for progress

### Expected Results:
- [ ] Progress saved automatically
- [ ] Resume from last position works
- [ ] Auto-marked complete at 90%
- [ ] Dashboard shows correct progress %
- [ ] "Continue watching" links work

### API Testing:
```bash
# Test progress API (replace with actual values)
curl -X GET https://watch.zerotodiamond.com/api/progress/[lessonId] \
  -H "Cookie: [session-cookie]"
```

## 4. Course & Lesson Navigation

### Test Steps:
1. Navigate to `/dashboard`
2. Click on a course
3. Navigate through lessons using:
   - Lesson list on course page
   - Previous/Next buttons
   - Breadcrumb navigation

### Expected Results:
- [ ] All navigation methods work
- [ ] Course page shows all lessons
- [ ] Completion indicators accurate
- [ ] Progress bars display correctly
- [ ] Mobile responsive design

## 5. Authentication & Authorization

### Test Steps:
1. Try accessing `/lessons/[id]` without login
2. Login as regular user, try `/admin`
3. Login as admin, access admin panel

### Expected Results:
- [ ] Unauthenticated redirects to login
- [ ] Regular users can't access admin
- [ ] Admin users see admin dashboard
- [ ] Session persists across refreshes

## 6. Video Access Security

### Test Steps:
1. Copy video URL from network tab
2. Logout and try accessing URL directly
3. Try accessing `/api/videos/[filename]` without auth

### Expected Results:
- [ ] Direct video access blocked
- [ ] 401 error for unauthenticated requests
- [ ] S3 signed URLs expire (if using S3)

## 7. Performance & Error Handling

### Test Steps:
1. Disable network mid-video
2. Test with slow 3G throttling
3. Upload large video as admin
4. Test concurrent users

### Expected Results:
- [ ] Graceful error messages
- [ ] Loading states display
- [ ] No console errors
- [ ] Page loads under 3 seconds
- [ ] Video buffers appropriately

## 8. Mobile Testing

### Devices to Test:
- [ ] iPhone Safari
- [ ] Android Chrome
- [ ] iPad landscape/portrait

### Expected Results:
- [ ] Video player works on all devices
- [ ] Touch controls responsive
- [ ] Navigation works on mobile
- [ ] No horizontal scroll

## Regression Tests

### After Each Deploy:
1. [ ] Logo displays correctly
2. [ ] Login/logout flow works
3. [ ] Static assets load (CSS/JS)
4. [ ] Database migrations applied
5. [ ] Environment variables set

## Known Issues to Verify Fixed
- [ ] Logo visibility (was blocked by middleware)
- [ ] Admin redirect after login
- [ ] Video player null checks
- [ ] Progress not saving

## Performance Benchmarks
- First Load: < 3 seconds
- Video Start: < 5 seconds
- API Response: < 500ms
- Build Size: < 300KB for lesson page

## Test Data Setup

### SQL to Create Test Course:
```sql
-- Create test course
INSERT INTO courses (id, title, description, slug, published) 
VALUES ('test-course-1', 'Test Course', 'Test Description', 'test-course', true);

-- Create test lessons
INSERT INTO lessons (id, title, "videoUrl", duration, "order", "courseId") VALUES
('lesson-1', 'Lesson 1', '/api/videos/test1.mp4', 300, 1, 'test-course-1'),
('lesson-2', 'Lesson 2', '/api/videos/test2.mp4', 600, 2, 'test-course-1');
```

## Smoke Test Checklist Summary

**MUST PASS before Phase 2:**
- [ ] User registration with GHL sync
- [ ] Video playback on all devices
- [ ] Progress tracking saves and resumes
- [ ] Course/lesson navigation works
- [ ] Authentication protects content
- [ ] Build deploys without errors

**Log any failures with:**
- Browser/Device
- Console errors
- Network errors
- Steps to reproduce

## Next Steps After Testing
1. Fix any critical bugs found
2. Deploy to production
3. Monitor error logs
4. Begin Phase 2 (Admin CRUD enhancements)