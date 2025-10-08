# QA Resume & Player Checklist

## Test Environment Setup
- [ ] Login as USER (non-admin) account
- [ ] Login as ADMIN account  
- [ ] Test on Desktop (Chrome/Firefox)
- [ ] Test on Mobile Safari

## 1. Resume Functionality

### Test Case 1.1: Basic Resume
**Steps:**
1. Navigate to a lesson as USER
2. Play video to 1:23
3. Navigate away to dashboard
4. Return to the same lesson

**Expected:**
- [ ] Video should automatically seek to ~1:23 (±1 second tolerance)
- [ ] No flash of position 0 before resuming
- [ ] Progress indicator shows correct percentage

### Test Case 1.2: Cross-Session Resume
**Steps:**
1. Play video to 2:45
2. Close browser completely
3. Reopen and navigate to lesson

**Expected:**
- [ ] Video resumes at ~2:45
- [ ] Last watched time displayed correctly

### Test Case 1.3: Mobile Background Resume
**Steps (Mobile Safari):**
1. Play video to 1:00
2. Switch to another app (background the browser)
3. Wait 5 seconds
4. Return to Safari

**Expected:**
- [ ] Progress saved before backgrounding
- [ ] Video resumes at correct position
- [ ] No loss of progress

## 2. Progress Tracking

### Test Case 2.1: Completion Detection
**Steps:**
1. Open a lesson with duration < 2 minutes
2. Seek to 90% of duration
3. Let it play to end

**Expected:**
- [ ] Progress shows "Completed" badge
- [ ] Progress saved as 100%
- [ ] Completion persists after refresh

### Test Case 2.2: Manual Progress Save
**Steps:**
1. Play video for 10 seconds
2. Pause the video
3. Immediately refresh the page

**Expected:**
- [ ] Progress saved at pause point
- [ ] Resume works from paused position

### Test Case 2.3: Invalid Duration Handling
**Steps:**
1. Find/create lesson with missing duration
2. Play video and navigate away
3. Return to lesson

**Expected:**
- [ ] No errors in console
- [ ] Player still functional
- [ ] Progress tracking works based on actual video duration

## 3. Notes Functionality

### Test Case 3.1: Auto-save Notes
**Steps:**
1. Open lesson notes panel
2. Type "Test note 123"
3. Wait 1-2 seconds
4. Check save indicator

**Expected:**
- [ ] "Saving..." appears while typing
- [ ] "Saved • [time]" appears after ~1 second
- [ ] Timestamp updates with each save

### Test Case 3.2: Notes Persistence
**Steps:**
1. Write notes in a lesson
2. Navigate to another lesson
3. Return to first lesson

**Expected:**
- [ ] Notes content preserved exactly
- [ ] No data loss
- [ ] Notes specific to each lesson

### Test Case 3.3: Manual Save
**Steps:**
1. Type notes
2. Click Save button before auto-save
3. Refresh page

**Expected:**
- [ ] Save button disabled when no changes
- [ ] Notes persist after manual save
- [ ] Save indicator updates immediately

## 4. Layout & Responsiveness

### Test Case 4.1: Desktop Layout
**Steps:**
1. View lesson on screen ≥1024px width
2. Check video and notes positioning
3. Scroll down the page

**Expected:**
- [ ] 2-column grid layout
- [ ] Notes panel sticky (stays in view)
- [ ] No overlap between elements
- [ ] Video maintains 16:9 aspect ratio

### Test Case 4.2: Mobile Layout
**Steps:**
1. View lesson on mobile device
2. Check initial layout
3. Tap to expand notes

**Expected:**
- [ ] Single column layout
- [ ] Notes collapsed by default
- [ ] Smooth expand/collapse animation
- [ ] No horizontal scroll

### Test Case 4.3: Responsive Transition
**Steps:**
1. Start on desktop view
2. Resize browser to mobile width
3. Resize back to desktop

**Expected:**
- [ ] Smooth transition between layouts
- [ ] No content loss
- [ ] Notes panel adapts correctly

## 5. Security & Controls

### Test Case 5.1: Download Prevention
**Steps:**
1. Right-click on video
2. Check video controls
3. Inspect browser developer tools

**Expected:**
- [ ] No context menu on right-click
- [ ] No download button in controls
- [ ] Video source protected via API

### Test Case 5.2: Keyboard Controls
**Steps:**
1. Focus on video player
2. Press Space (play/pause)
3. Press arrow keys (seek)

**Expected:**
- [ ] Space toggles play/pause
- [ ] Left/Right arrows seek ±5 seconds
- [ ] Up/Down adjusts volume

## 6. Error Handling

### Test Case 6.1: Network Interruption
**Steps:**
1. Play video and take notes
2. Disconnect network
3. Continue using player

**Expected:**
- [ ] Video continues playing (buffered content)
- [ ] Progress saves fail gracefully
- [ ] No app crashes

### Test Case 6.2: Missing Video
**Steps:**
1. Access lesson with deleted/missing video
2. Check page rendering

**Expected:**
- [ ] "Video Not Available" message
- [ ] Page remains functional
- [ ] Can still access notes

## 7. Performance

### Test Case 7.1: Progress Update Frequency
**Steps:**
1. Open Network tab in dev tools
2. Play video for 30 seconds
3. Count progress API calls

**Expected:**
- [ ] Maximum 6 API calls (every 5 seconds)
- [ ] No duplicate requests
- [ ] Requests include all required fields

### Test Case 7.2: Page Load Speed
**Steps:**
1. Hard refresh lesson page
2. Measure time to interactive

**Expected:**
- [ ] Video player appears < 2 seconds
- [ ] Notes load < 1 second
- [ ] No layout shifts after load

## Summary

**Total Tests:** 24
**Passed:** ___
**Failed:** ___

**Critical Issues:**
- [ ] None found

**Notes:**
_Add any observations or edge cases discovered during testing_