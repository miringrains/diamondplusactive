# Diamond District Tech Stack & Production Lessons Learned

## ⚠️ CRITICAL: THIS IS A PRODUCTION ENVIRONMENT
**NEVER** treat this as a development environment. Real users are accessing this system.

## Tech Stack

### Frontend
- **Next.js 15.4.5** - React framework with App Router
- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Mux Player** (@mux/mux-player-react) - Video playback

### Backend
- **Next.js API Routes** - Server endpoints
- **Prisma** - ORM for database
- **PostgreSQL** - Database (Supabase hosted)
- **NextAuth.js** - Authentication
- **JWT** - Signed video playback tokens

### Infrastructure
- **PM2** - Production process manager
- **Nginx** - Reverse proxy server
- **Ubuntu Server** - Operating system
- **Let's Encrypt** - SSL certificates
- **DigitalOcean** - Cloud hosting

### Video Infrastructure
- **Mux** - Video hosting and streaming
- **Signed Playback** - JWT-based video security
- **HLS** - HTTP Live Streaming protocol

## Component Relationships

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser                              │
├─────────────────────────────────────────────────────────────┤
│  SubLessonViewWrapper.tsx                                   │
│    ├── Fetches: /api/mux/playback-token                   │
│    ├── Renders: MuxPlayerEnhanced                         │
│    └── Props: playbackId, startTime, isSubLesson=true     │
├─────────────────────────────────────────────────────────────┤
│  MuxPlayerEnhanced.tsx                                      │
│    ├── Uses: @mux/mux-player-react                        │
│    ├── Manages: Token refresh, progress tracking          │
│    ├── Saves to: localStorage (client-side)               │
│    └── POSTs to: /api/progress/sub-lessons/[id]           │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    Nginx (Port 443)                         │
│    Proxy: https://watch.zerotodiamond.com → 127.0.0.1:3000│
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                 Next.js Server (Port 3000)                  │
├─────────────────────────────────────────────────────────────┤
│  /api/mux/playback-token                                    │
│    └── Creates JWT with: kid in header, aud="v"           │
├─────────────────────────────────────────────────────────────┤
│  /api/progress/sub-lessons/[subLessonId]                   │
│    └── Updates: positionSeconds, watchTime, completed      │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    External Services                        │
├─────────────────────────────────────────────────────────────┤
│  Mux Video Streaming                                        │
│    └── Validates JWT and serves HLS manifest              │
├─────────────────────────────────────────────────────────────┤
│  Supabase PostgreSQL                                        │
│    └── Stores progress, user data, course content         │
└─────────────────────────────────────────────────────────────┘
```

## Critical Production Lessons - WHAT NEVER TO DO

### 1. **NEVER** Assume It's Development
- **Issue**: Making breaking changes thinking it's a test environment
- **Reality**: Real users are watching videos and paying for courses
- **Always**: Test locally first, deploy carefully

### 2. **NEVER** Use `pm2 restart` Without Rebuilding
- **Issue**: Code changes weren't taking effect
- **Why**: Next.js production requires `npm run build` before restart
- **Correct**: `pm2 stop app && npm run build && pm2 start app`

### 3. **NEVER** Use `localhost` in Nginx Proxy
- **Issue**: 502 Bad Gateway errors due to IPv6/IPv4 resolution
- **Why**: `localhost` resolves to both `[::1]` and `127.0.0.1`
- **Always**: Use explicit `127.0.0.1` for proxy_pass

### 4. **NEVER** Put JWT `kid` in Payload
- **Issue**: Mux 403 errors - couldn't validate tokens
- **Why**: Mux expects `kid` in JWT header, not payload
- **Correct**: Use `keyid` option in jsonwebtoken.sign()

### 5. **NEVER** Use Wrong Audience Claim
- **Issue**: Mux rejected tokens with `aud: "video"`
- **Why**: Mux expects `aud: "v"` for video playback
- **Always**: Check Mux docs for exact requirements

### 6. **NEVER** Set Video Position Twice
- **Issue**: Video plays, pauses, restarts
- **Why**: Setting both `startTime` prop AND manually setting `currentTime`
- **Correct**: Use only `startTime` prop, let MuxPlayer handle it

### 7. **NEVER** Mix State and Refs for Initial Values
- **Issue**: Re-renders causing position jumps
- **Why**: State changes trigger re-renders affecting props
- **Correct**: Use `useRef` for stable initial values

### 8. **NEVER** Ignore Schema Validation Errors
- **Issue**: 400 Bad Request on progress endpoints
- **Why**: Required fields in Zod schema but optional in request
- **Always**: Make fields optional if they might be undefined

### 9. **NEVER** Mix Progress Endpoints
- **Issue**: Wrong endpoint for sub-lessons vs regular lessons
- **Why**: Different endpoints handle different content types
- **Correct**: Pass `isSubLesson` prop to determine endpoint

### 10. **NEVER** Debug in Production First
- **Issue**: Wasting time on deployed environment issues
- **Always**: Reproduce locally, test thoroughly, then deploy

### 11. **NEVER** Have Duplicate State Management
- **Issue**: Video pausing every second due to duplicate progress saving
- **Why**: Both MuxPlayerEnhanced and parent saving to same endpoint
- **Correct**: Single source of truth for state management

### 12. **NEVER** Apply startTime Continuously
- **Issue**: Video restarting on play after pause
- **Why**: startTime prop being evaluated on every render
- **Correct**: Only apply startTime on initial mount

### 13. **NEVER** Use Event Handlers in Server Components
- **Issue**: Build failures with onError in SSR
- **Why**: Server components can't have interactive handlers
- **Correct**: Make component client-side with "use client"

## Current Video Stopping Issue - Potential Causes

Based on our findings, the video stopping could be due to:

1. **Network Buffering**
   - HLS adaptive streaming adjusting quality
   - Solution: Check Mux player buffer settings

2. **Token Expiration**
   - Default TTL is 3600 seconds (1 hour)
   - Solution: Implement token refresh before expiry

3. **Progress Save Conflicts**
   - Frequent saves might interrupt playback
   - Solution: Increase debounce time for progress updates

4. **Browser Resource Management**
   - Background tab throttling
   - Solution: Handle visibility change events properly

5. **Mux Player Configuration**
   - Missing or incorrect player settings
   - Solution: Review Mux player props and options

## Deployment Checklist

Before ANY production change:
- [ ] Test locally with production-like data
- [ ] Check all environment variables
- [ ] Run build process locally
- [ ] Test API endpoints
- [ ] Verify database migrations
- [ ] Plan rollback strategy
- [ ] Monitor after deployment

## Monitoring Commands

```bash
# Check application status
pm2 status
pm2 logs diamond-district --lines 50

# Check nginx status
systemctl status nginx
tail -f /var/log/nginx/error.log

# Test endpoints
curl -I https://watch.zerotodiamond.com
curl https://watch.zerotodiamond.com/api/auth/session

# Check port binding
ss -tlnp | grep 3000
```

## Video Streaming Best Practices

### NEVER Ignore These Settings
1. **Always set `preload`** - Default might not buffer enough
2. **Debounce progress saves** - 2s is too frequent, use 15s+
3. **Handle tab visibility** - Browsers pause hidden videos
4. **Implement retry logic** - Networks are unreliable
5. **Monitor buffer health** - Low buffer = stopping risk

### Debugging Video Issues
```javascript
// Add these event listeners
onWaiting={() => console.warn('Buffering'))
onStalled(() => console.warn('Network stall'))
onError={(e) => console.error('Error:', e))
```

## Emergency Procedures

If something breaks:
1. `pm2 logs diamond-district` - Check for errors
2. `pm2 restart diamond-district` - Quick restart
3. `git stash && git pull && npm install && npm run build && pm2 restart diamond-district` - Full redeploy
4. Check nginx: `systemctl restart nginx`
5. Rollback if needed: `git checkout <last-working-commit>`
