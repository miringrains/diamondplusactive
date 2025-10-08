# Research Notes - Lesson Features Implementation

## References
1. [Next.js App Router - Client Components](https://nextjs.org/docs/app/building-your-application/rendering/client-components)
2. [MDN - HTMLMediaElement controlsList](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/controlsList)
3. [HTML5 Media Events](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement#events)
4. [React - Optimistic Updates](https://react.dev/reference/react/useOptimistic)
5. [Web.dev - Media Session API](https://web.dev/articles/media-session)
6. [Plyr.io Documentation](https://github.com/sampotts/plyr#options)

## Key Decisions

### 1. Server/Client Boundary
- Server Component fetches all data and performs auth/permission checks
- Client Component receives serializable props only (no functions/dates)
- Video URL normalization happens server-side

### 2. No-Download Measures
- `controlsList="nodownload"` removes download button in Chrome/Edge
- `onContextMenu={e => e.preventDefault()}` blocks right-click menu
- Plyr: `disableContextMenu: true` and hide download in controls array
- Note: These are deterrents only; tech-savvy users can still download

### 3. Progress Tracking
- Throttle updates to every 5-10 seconds using `lodash.throttle`
- Store both `positionSeconds` and percentage for flexibility
- Mark complete at ≥90% watched OR when `ended` event fires
- Use `lastWatched` timestamp for staleness checks

### 4. Notes Autosave
- Debounce at 1000ms for balance between responsiveness and server load
- Use optimistic UI with "Saving..." → "Saved" states
- Store draft in localStorage as backup for network failures

### 5. Accessibility
- Space for play/pause, arrows for seek, up/down for volume
- `aria-live="polite"` for save status announcements
- Focus management on modal/panel toggles
- Proper labels for all interactive elements