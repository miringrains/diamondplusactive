# Diamond District Course Platform - MVP Build Plan

## 1. Gap Analysis - What Exists vs What's Missing

### ✅ What Currently Exists
- **Authentication**: NextAuth.js with credentials, JWT sessions, role-based access (USER/ADMIN)
- **Registration**: Form with email, password, firstName, lastName, phone
- **GoHighLevel Integration**: Basic implementation (search, create contact, tag management)
- **Database Schema**: Complete with Users, Courses, Lessons, Progress models
- **Admin Course Management**: Basic CRUD pages (create course, add lessons, view courses)
- **Video Infrastructure**: S3/local storage, protected streaming, range request support
- **User Dashboard**: Shows available courses, recent activity, progress percentages
- **Admin Dashboard**: User stats, recent registrations, quick actions
- **Middleware**: Route protection, role-based redirects

### ❌ What's Missing (Critical for MVP)
- **Course/Lesson Viewing Pages**: No `/courses/[slug]` or `/lessons/[id]` pages for users
- **Video Player Component**: Only raw HTML5 video, no player controls/UI
- **Progress Tracking API**: No endpoints to update watch time or completion status
- **GHL Phone Integration**: Phone field collected but not sent to GoHighLevel
- **Admin CRUD Operations**: No edit/delete for courses/lessons, no lesson reordering
- **Error Boundaries**: Basic error handling, needs improvement
- **Loading States**: Missing throughout the application
- **Tests**: No test suite implemented

## 2. Build Plan - Step-by-Step Implementation

### Phase 1: Core Video Learning Experience (Priority 1)
**Timeline: 3-4 days**

#### Step 1.1: Video Player Component
**Files to create/modify:**
- `/src/components/video-player.tsx` (new)
- `/src/lib/plyr.ts` (new - Plyr configuration)
- `package.json` (add plyr and plyr-react dependencies)

**Implementation:**
```typescript
// Modern video player with HLS support, progress tracking
- Plyr.js integration for professional player UI
- HLS.js for adaptive streaming (if using S3/CloudFront)
- Progress event listeners for watch time tracking
- Keyboard shortcuts, playback speed control
- Picture-in-picture support
- Fullscreen mode
```

#### Step 1.2: Course Viewing Page
**Files to create:**
- `/src/app/(dashboard)/courses/[slug]/page.tsx` (new)
- `/src/app/(dashboard)/courses/[slug]/layout.tsx` (new)
- `/src/components/course-sidebar.tsx` (new)

**Features:**
- Course overview with description
- Lesson list with completion indicators
- Next/Previous lesson navigation
- Course progress header
- Responsive sidebar for lesson navigation

#### Step 1.3: Lesson Viewing Page
**Files to create:**
- `/src/app/(dashboard)/lessons/[id]/page.tsx` (new)
- `/src/components/lesson-navigation.tsx` (new)

**Features:**
- Video player integration
- Lesson title and description
- Mark complete button
- Auto-advance to next lesson
- Breadcrumb navigation

#### Step 1.4: Progress Tracking API
**Files to create:**
- `/src/app/api/progress/route.ts` (new)
- `/src/app/api/progress/[lessonId]/route.ts` (new)
- `/src/lib/progress.ts` (new - progress utilities)

**Endpoints:**
```typescript
POST /api/progress - Update watch time
PUT /api/progress/[lessonId] - Mark lesson complete
GET /api/progress/[lessonId] - Get user's progress for lesson
```

### Phase 2: Enhanced Admin Management (Priority 2)
**Timeline: 2-3 days**

#### Step 2.1: Course Edit/Delete Operations
**Files to modify:**
- `/src/app/admin/courses/[courseId]/edit/page.tsx` (new)
- `/src/app/api/admin/courses/[courseId]/route.ts` (new - PUT, DELETE)

**Features:**
- Edit course title, description, slug
- Publish/unpublish toggle
- Delete course with confirmation
- Validation for slug uniqueness

#### Step 2.2: Lesson Management
**Files to create/modify:**
- `/src/app/api/admin/lessons/[lessonId]/route.ts` (new)
- `/src/components/admin/lesson-list.tsx` (new)
- `/src/components/admin/lesson-reorder.tsx` (new)

**Features:**
- Edit lesson title/description
- Delete lesson with confirmation
- Drag-and-drop reordering
- Duration auto-detection from video
- Bulk operations

#### Step 2.3: Video Upload Enhancement
**Files to modify:**
- `/src/components/admin/lesson-upload-form.tsx`
- `/src/app/api/upload/route.ts`

**Features:**
- Upload progress with percentage
- File validation (size, format)
- Thumbnail generation
- S3 multipart upload for large files
- Error recovery

### Phase 3: GoHighLevel Integration Enhancement (Priority 3)
**Timeline: 1-2 days**

#### Step 3.1: Phone Number Sync
**Files to modify:**
- `/src/lib/gohighlevel.ts`
- `/src/app/api/auth/register/route.ts`

**Implementation:**
```typescript
// Update contact with phone number
async updateContact(contactId: string, data: {
  phone?: string
  // other fields
})
```

#### Step 3.2: Course Enrollment Tracking
**Files to create:**
- `/src/lib/ghl-events.ts` (new)

**Features:**
- Track course starts in GHL
- Track course completions
- Custom field updates
- Tag management for course progress

#### Step 3.3: Error Recovery
**Implementation:**
- Retry logic with exponential backoff
- Queue failed syncs for later retry
- Admin notification of sync failures
- Manual sync button in admin

### Phase 4: User Experience Enhancements (Priority 4)
**Timeline: 2 days**

#### Step 4.1: Loading States & Skeletons
**Files to create:**
- `/src/components/ui/skeleton.tsx`
- `/src/components/loading-states.tsx`

**Implementation:**
- Course card skeletons
- Video player loading state
- Dashboard loading skeleton
- Form submission states

#### Step 4.2: Error Boundaries
**Files to create:**
- `/src/components/error-boundary.tsx`
- `/src/app/error.tsx`
- `/src/app/not-found.tsx`

**Features:**
- Graceful error handling
- User-friendly error messages
- Retry mechanisms
- Error logging to server

#### Step 4.3: Toast Notifications
**Files to modify:**
- All form submissions
- All API interactions

**Implementation:**
- Success messages for all actions
- Error messages with actionable info
- Progress notifications for long operations
- Offline state detection

### Phase 5: Testing & Quality Assurance (Priority 5)
**Timeline: 2 days**

#### Step 5.1: Unit Tests
**Files to create:**
- `/src/__tests__/` directory structure
- `jest.config.js`
- `jest.setup.js`

**Coverage:**
- Authentication flows
- API endpoints
- Utility functions
- Component rendering

#### Step 5.2: E2E Tests
**Files to create:**
- `/cypress/` or `/playwright/` directory
- Test specifications

**Scenarios:**
- User registration flow
- Course viewing flow
- Progress tracking
- Admin operations

#### Step 5.3: Manual QA Checklist
**Documentation:**
- Registration with GHL sync
- Video playback on all devices
- Progress tracking accuracy
- Admin CRUD operations

## 3. Integration Details

### GoHighLevel
| Configuration | Value | Notes |
|--------------|-------|-------|
| API Endpoint | `https://rest.gohighlevel.com/v1` | REST API v1 |
| Auth Header | `Authorization: Bearer {GHL_PRIVATE_KEY}` | Private integration key (pit-xxx format) |
| Location Header | `x-location-id: {GHL_LOCATION_ID}` | Required for all requests |
| Tag Name | `free course` | Auto-created if not exists |
| Retry Strategy | 3 attempts with exponential backoff | 1s, 2s, 4s delays |
| Fallback | Allow registration but log failure | Don't block user registration |

### AWS S3
| Configuration | Value | Notes |
|--------------|-------|-------|
| Bucket | `{S3_BUCKET_NAME}` | Must have proper CORS configuration |
| Region | `{AWS_REGION}` | e.g., us-east-1 |
| Signed URL Expiry | 3600 seconds (1 hour) | For video streaming |
| Upload Size Limit | 5GB | Use multipart for files > 100MB |
| CORS Headers | `Accept-Ranges, Content-Range` | Required for video seeking |
| CloudFront | Optional CDN | Reduces S3 bandwidth costs |

### NextAuth.js
| Configuration | Value | Notes |
|--------------|-------|-------|
| Session Strategy | JWT | No database sessions |
| Callback URL | `https://watch.zerotodiamond.com/api/auth/callback/credentials` | Production URL |
| Secret | `{NEXTAUTH_SECRET}` | Strong random string |
| Token Expiry | 30 days | Configurable |
| Admin Detection | First user or ADMIN_EMAIL | Auto-assigns ADMIN role |

### Database (PostgreSQL)
| Configuration | Value | Notes |
|--------------|-------|-------|
| Connection String | `{DATABASE_URL}` | Include connection pooling |
| Migrations | Prisma Migrate | Auto-run in production |
| Backup Strategy | Daily automated backups | DigitalOcean managed DB recommended |
| Connection Pool | 10 connections | Adjust based on traffic |

## 4. Risks & Mitigation Strategies

### Critical Risks

#### 1. GoHighLevel API Failures
**Risk:** API downtime or rate limiting blocks user registration
**Mitigation:**
- Implement retry logic with exponential backoff
- Queue failed syncs for background processing
- Allow registration to proceed, sync later
- Monitor API health with alerts
- Cache tag IDs to reduce API calls

#### 2. Video Streaming Performance
**Risk:** Large videos cause buffering or high bandwidth costs
**Mitigation:**
- Implement HLS adaptive streaming
- Use CloudFront CDN for S3 videos
- Compress videos before upload (ffmpeg)
- Implement video quality settings
- Monitor bandwidth usage

#### 3. Session Security
**Risk:** JWT tokens could be compromised
**Mitigation:**
- Use strong NEXTAUTH_SECRET
- Implement token rotation
- Add IP validation for admin accounts
- Monitor suspicious login patterns
- Implement 2FA for admin accounts (future)

#### 4. Data Loss
**Risk:** Accidental deletion of courses/lessons
**Mitigation:**
- Soft delete implementation
- Confirmation dialogs for destructive actions
- Database backups every 6 hours
- Admin audit logs
- Restore functionality

### Testing Checklist

#### User Registration & GHL Sync
- [ ] New user registration creates GHL contact
- [ ] Existing email in GHL adds tag correctly
- [ ] Phone number syncs to GHL
- [ ] Admin accounts skip GHL sync
- [ ] GHL API failure doesn't block registration
- [ ] Duplicate email prevention works

#### Video Playback
- [ ] Videos play on Chrome, Safari, Firefox
- [ ] Seeking works without re-authentication
- [ ] S3 signed URLs expire and refresh
- [ ] Local video fallback works
- [ ] Mobile playback functions
- [ ] Progress saves every 10 seconds

#### Progress Tracking
- [ ] Watch time updates accurately
- [ ] Completion status saves
- [ ] Progress persists across sessions
- [ ] Dashboard percentages calculate correctly
- [ ] Continue watching links work

#### Admin Operations
- [ ] Course CRUD operations work
- [ ] Lesson upload handles large files
- [ ] Lesson reordering saves correctly
- [ ] Delete confirmations prevent accidents
- [ ] Published toggle affects visibility

#### Security
- [ ] Unauthenticated users can't access videos
- [ ] Non-admins can't access admin routes
- [ ] SQL injection prevention (Prisma)
- [ ] XSS prevention (React)
- [ ] CSRF protection (NextAuth)

### Monitoring Requirements

#### Application Monitoring
- Error tracking (Sentry or similar)
- Performance monitoring (APM)
- Uptime monitoring (Pingdom/UptimeRobot)
- Database query performance
- API response times

#### Business Metrics
- User registration rate
- Course completion rate
- Video engagement metrics
- GHL sync success rate
- Upload success rate

#### Alerts
- GHL API failures > 5 in 1 hour
- Database connection failures
- S3 upload failures
- Server CPU > 80%
- Disk space < 10GB

## Implementation Priority Order

1. **Week 1:** Phase 1 (Video Learning Experience)
2. **Week 2:** Phase 2 (Admin Management) + Phase 3 (GHL Enhancement)
3. **Week 3:** Phase 4 (UX) + Phase 5 (Testing)

## Next Immediate Actions

1. Install required dependencies:
```bash
npm install plyr plyr-react hls.js react-beautiful-dnd @tanstack/react-query
npm install --save-dev @testing-library/react jest @types/jest
```

2. Create missing route directories:
```bash
mkdir -p src/app/\(dashboard\)/courses/\[slug\]
mkdir -p src/app/\(dashboard\)/lessons/\[id\]
mkdir -p src/app/api/progress
```

3. Set up environment variables:
```env
# Required for MVP
GHL_PRIVATE_KEY=pit-xxx
GHL_LOCATION_ID=xxx
DATABASE_URL=postgresql://...
NEXTAUTH_URL=https://watch.zerotodiamond.com
NEXTAUTH_SECRET=xxx

# Optional but recommended
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx
S3_BUCKET_NAME=xxx
```

4. Begin with Phase 1, Step 1.1 (Video Player Component)

## Success Criteria

The MVP is complete when:
1. Users can register and are synced to GoHighLevel
2. Users can browse and watch course videos
3. Progress is tracked and displayed accurately
4. Admins can fully manage courses and lessons
5. All critical paths have error handling
6. The system is deployed and accessible at watch.zerotodiamond.com
7. Basic monitoring and alerts are in place