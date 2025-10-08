# Lesson Page Cleanup - Fixed Video Playback

## Problem
Videos would play for 1 second then stop, even though the test page worked fine.

## Root Cause
The SubLessonViewWrapper was interfering with video playback by:
1. Updating React state every second (`setCurrentPosition`)
2. Running duplicate progress saves
3. Having multiple state updates that caused re-renders

## Changes Made

### 1. Removed handleProgress
- Was updating `currentPosition` state every second
- This caused the entire component tree to re-render constantly
- MuxPlayerEnhanced now handles progress internally

### 2. Removed Duplicate Progress Saving
- Commented out the `saveProgress` function
- Commented out the unload handler
- MuxPlayerEnhanced already has its own progress saving

### 3. Removed State Variables
- Removed `currentPosition` state
- Removed `videoDuration` state
- Removed `playerStateRef`
- These were causing unnecessary re-renders

### 4. Simplified Progress Display
- Set `progressPercentage` to 0 (static)
- The Mux player has its own progress bar

### 5. Fixed Polling Interval
- Added check for `subLesson.muxReadyAt` to prevent unnecessary polling
- Only polls when actually waiting for video processing

## Result
- No more state updates during playback
- No more component re-renders every second
- Video plays continuously without interruption
- Progress is still saved (by MuxPlayerEnhanced)
- Cleaner, simpler code

## What's Handled by MuxPlayerEnhanced
- Progress tracking (localStorage + server)
- Resume position
- Token refresh
- Error handling
- Unload/visibility handling
- All playback controls

The lesson page now just provides the video metadata and lets the player handle everything else.
