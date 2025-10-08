# Netflix-Style Cross-Device Playback Position Sync

## How Netflix and Major Streaming Services Handle Playback Position

### Architecture Overview

Netflix and similar platforms use a **server-centric approach** with these key components:

1. **Real-time Position Updates**
   - Updates sent every 5-10 seconds during playback
   - Updates sent on pause, seek, and close
   - Debounced to prevent server overload

2. **Server-Side Storage**
   - PostgreSQL/DynamoDB for persistent storage
   - Redis for real-time caching
   - WebSocket/Server-Sent Events for instant sync

3. **Cross-Device Sync**
   - Position tied to user account, not device
   - Last update timestamp determines priority
   - Conflict resolution: newest position wins

## Implementation Strategy

### 1. Database Schema
```sql
-- Update video_progress table
ALTER TABLE video_progress ADD COLUMN device_id VARCHAR(255);
ALTER TABLE video_progress ADD COLUMN last_heartbeat TIMESTAMP;
ALTER TABLE video_progress ADD COLUMN playback_state VARCHAR(20); -- playing, paused, stopped
ALTER TABLE video_progress ADD COLUMN playback_speed FLOAT DEFAULT 1.0;

-- Create heartbeat tracking
CREATE TABLE playback_heartbeats (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  lesson_id UUID NOT NULL,
  position_seconds INT NOT NULL,
  device_id VARCHAR(255),
  timestamp TIMESTAMP DEFAULT NOW(),
  INDEX idx_user_lesson (user_id, lesson_id)
);
```

### 2. Real-time Sync Architecture

```
┌─────────────────┐     WebSocket/SSE     ┌─────────────────┐
│   Browser 1     │◄──────────────────────►│                 │
│  (Desktop)      │                        │                 │
└─────────────────┘                        │                 │
                                          │   API Server    │
┌─────────────────┐     WebSocket/SSE     │                 │
│   Browser 2     │◄──────────────────────►│                 │
│   (Mobile)      │                        │                 │
└─────────────────┘                        └────────┬────────┘
                                                    │
                                                    ▼
                                          ┌─────────────────┐
                                          │     Redis       │
                                          │  (Real-time     │
                                          │    Cache)       │
                                          └────────┬────────┘
                                                    │
                                                    ▼
                                          ┌─────────────────┐
                                          │   PostgreSQL    │
                                          │  (Persistent    │
                                          │    Storage)     │
                                          └─────────────────┘
```

### 3. Update Strategy

**Immediate Updates (< 500ms)**
- On pause
- On seek
- On tab/window close (beforeunload)
- On video end

**Throttled Updates (every 10s)**
- During continuous playback
- Batched with other telemetry

**Debounced Updates (300ms delay)**
- During rapid seeking
- During scrubbing

### 4. Client Implementation

```typescript
class PlaybackSyncManager {
  private ws: WebSocket | null = null
  private updateQueue: PositionUpdate[] = []
  private throttledUpdate: Function
  private deviceId: string
  
  constructor() {
    this.deviceId = this.getOrCreateDeviceId()
    this.throttledUpdate = throttle(this.sendUpdate, 10000)
    this.initWebSocket()
  }
  
  // Send immediate update for important events
  sendImmediate(position: number, state: 'playing' | 'paused') {
    this.sendUpdate(position, state, true)
  }
  
  // Queue update for throttled sending
  queueUpdate(position: number) {
    this.throttledUpdate(position, 'playing', false)
  }
  
  private async sendUpdate(position: number, state: string, immediate: boolean) {
    const update = {
      position,
      state,
      deviceId: this.deviceId,
      timestamp: Date.now(),
      immediate
    }
    
    // Send via WebSocket if available
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'position_update', ...update }))
    }
    
    // Always persist via HTTP as fallback
    await fetch('/api/progress/sync', {
      method: 'POST',
      body: JSON.stringify(update)
    })
  }
}
```

### 5. Server Implementation

```typescript
// WebSocket handler
ws.on('message', async (data) => {
  const { type, position, lessonId, userId, deviceId } = JSON.parse(data)
  
  if (type === 'position_update') {
    // Update Redis immediately
    await redis.set(
      `playback:${userId}:${lessonId}`,
      JSON.stringify({ position, deviceId, timestamp: Date.now() }),
      'EX', 3600 // 1 hour expiry
    )
    
    // Broadcast to other devices
    broadcastToUserDevices(userId, lessonId, { position, deviceId })
    
    // Persist to database (can be async)
    queueDatabaseUpdate(userId, lessonId, position)
  }
})
```

### 6. Conflict Resolution

When multiple devices update position:
1. **Timestamp-based**: Most recent update wins
2. **State priority**: Pause events override playing events
3. **Grace period**: 5-second window for "simultaneous" updates

### 7. Performance Optimizations

1. **Redis for Hot Data**
   - Current playback positions
   - Active device sessions
   - Recent update history

2. **Database for Cold Storage**
   - Historical progress
   - Analytics data
   - Backup for Redis

3. **CDN Edge Workers**
   - Regional position caching
   - Reduced latency for global users

## Migration Plan

1. **Phase 1**: Add server-side sync alongside localStorage
2. **Phase 2**: Migrate existing localStorage data to server
3. **Phase 3**: Use localStorage only as offline fallback
4. **Phase 4**: Full server-side with real-time sync

## Benefits

- **True Cross-Device Sync**: Watch on phone, continue on TV
- **Multiple Users**: Family members don't affect each other
- **Analytics**: Track viewing patterns and engagement
- **Reliability**: Server is source of truth, not browser
- **Performance**: Redis caching for instant loads
