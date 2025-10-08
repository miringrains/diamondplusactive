# Vidstack Investigation Report

## Summary

We investigated switching from our current video player (Plyr) to Vidstack to solve the video resume issue. However, we encountered significant compatibility issues that make Vidstack unsuitable for our current tech stack.

## Issues Found

### 1. React Version Incompatibility
- Diamond District uses React 19.1.0
- Vidstack requires React ^18.0.0
- This caused peer dependency conflicts during installation

### 2. Missing Dependencies
- Vidstack requires additional packages: `maverick.js` and `vidstack`
- Even after installing these, we encountered import errors

### 3. Build Failures
```
Attempted import error: 'createLiteReactElement' is not exported from 'maverick.js/react'
```
- This indicates a version mismatch between Vidstack and its dependencies
- The error persists even with all dependencies installed

## Why Vidstack Looked Promising

1. **Modern Architecture**: Built specifically for React with proper state management
2. **Built-in Features**: Native HLS support, reliable seeking, storage API
3. **Active Development**: Regular updates and responsive maintainer

## Current Solution Analysis

Our existing `VideoIsland` component already implements many best practices:

1. **DOM Isolation**: Video player runs outside React's control
2. **No SSR**: Dynamic import with `ssr: false`
3. **Proper Cleanup**: Handles unmount and BFCache correctly
4. **Re-sign Logic**: Handles expired S3 URLs with single retry

## The Real Resume Problem

After investigation, the video resume issue isn't about the player library - it's about:

1. **Browser Restrictions**: Programmatic seeking before user interaction
2. **Timing Issues**: When to apply the seek (canplay vs loadeddata vs ready)
3. **HLS Buffering**: Need segments loaded before seeking works

## Alternative Solutions

### 1. React Player (15k+ stars)
- Mature, widely used
- Supports many sources
- Good documentation
- Works with React 19

### 2. Video.js with Plugins
- Battle-tested
- `videojs-resume` plugin exists
- Extensive ecosystem

### 3. Enhanced Current Solution
Instead of switching players, we could:
- Add a user-friendly "Continue from X:XX" button as fallback
- Implement server-side position tracking for cross-device resume
- Use more aggressive retry logic for seeking

## Recommendation

**Keep the current VideoIsland implementation** but enhance it with:

1. **User Interaction Fallback**: Show a "Continue watching" button if auto-resume fails
2. **Better Timing**: Use multiple events (loadeddata, canplay, durationchange) to find the right moment to seek
3. **Server-Side State**: Store playback state server-side for true cross-device resume

The core issue isn't the player - it's the fundamental browser restrictions around programmatic video control. No player library can fully solve this without user interaction as a fallback.

## Conclusion

Vidstack is an excellent player but not compatible with our current React version. Downgrading React would be a major breaking change affecting the entire application. Our current solution with Plyr + VideoIsland pattern is actually quite robust and follows best practices for avoiding React hydration issues.
