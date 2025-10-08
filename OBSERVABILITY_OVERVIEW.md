# OpenTelemetry Observability Overview

## Why It Matters

OpenTelemetry provides deep visibility into the Diamond District video platform's performance, helping diagnose authentication issues, video streaming problems, and API inefficiencies. With distributed tracing, we can track requests across service boundaries and identify bottlenecks in real-time.

## What We Collect

### 1. Traces
- **HTTP Requests**: All incoming API calls and outgoing service requests
- **Database Operations**: Prisma queries via auto-instrumentation
- **Authentication Flow**: NextAuth callbacks, session validation, credential verification
- **Video Operations**: Custom instrumentation for video loading, resuming, and progress tracking
- **Background Jobs**: Redis/BullMQ queue operations

### 2. Metrics
- **Video Player Metrics**:
  - `video.load_time_ms`: Time for video to be ready for playback
  - `video.resume_time_ms`: Time to resume at saved position
  - `video.buffering_events_total`: Count of buffering events
  - `video.resume_failures_total`: Failed resume attempts
- **Progress Tracking**:
  - `progress.save_time_ms`: Time to save progress to database
  - `progress.updates_total`: Total progress updates

### 3. Events and Attributes
- **Authentication Events**: `auth.failed`, `auth.credentials.missing`, `auth.session.created`
- **Video Events**: `video.loaded`, `video.resume_attempt`, `video.buffering`
- **Progress Events**: `progress.data_received`, `progress.auto_complete_triggered`

## Where It Goes

### Local Development
- **Endpoint**: `http://localhost:4318` (OTLP HTTP)
- **Storage**: Console output or local file

### Production
- **Collector**: OpenTelemetry Collector at `http://localhost:4318`
- **Storage**: `/var/log/otel-collector/traces.json` (rotating files)
- **Format**: JSON with structured trace data

## How to Read Traces

### 1. Via Trace Viewer (Recommended)
Navigate to `https://watch.zerotodiamond.com/trace-viewer.html`
- Real-time trace viewing with auto-refresh
- Filter by lesson ID, user ID, or trace count
- Visual indicators for auth failures and errors
- Event timeline for each trace

### 2. Via Command Line
```bash
# Watch live traces
tail -f /var/log/otel-collector/traces.json | jq .

# Search for specific operations
grep -A10 -B10 "api.progress" /var/log/otel-collector/traces.json | jq .

# Count errors
jq -r '.resourceSpans[].scopeSpans[].spans[] | select(.status.code==2)' /var/log/otel-collector/traces.json | wc -l
```

### 3. Understanding Trace Structure
```json
{
  "name": "api.progress.update",
  "spanId": "abc123...",
  "traceId": "def456...",
  "duration": 45.23,  // milliseconds
  "attributes": {
    "http.method": "POST",
    "http.route": "/api/progress",
    "user.id": "user123",
    "lesson.id": "lesson456"
  },
  "events": [
    {
      "name": "progress.data_received",
      "attributes": {
        "watchTime": 120,
        "positionSeconds": 120,
        "completed": false
      }
    }
  ],
  "status": {
    "code": 0  // 0=OK, 2=ERROR
  }
}
```

## Key Trace Patterns

### 1. Successful Video Play
```
[NextAuth Session Check] → [Video API Access] → [S3 Signed URL] → [Progress Update]
```

### 2. Auth Failure Pattern
```
[Request] → [NextAuth Check] → [auth.failed event] → [401 Response]
```

### 3. Progress Save Flow
```
[POST /api/progress] → [Session Validation] → [Prisma Upsert] → [Response]
```

## Troubleshooting with Traces

### Authentication Issues
Look for:
- `auth.failed` events with `hasCookie: false`
- `middleware.redirect` events indicating auth redirects
- Status code 401 on video/API endpoints

### Video Playback Issues
Look for:
- Large gaps between `video.loaded` and `video.resume_attempt`
- `video.resume_position_mismatch` events
- Multiple `video.buffering` events in succession

### Performance Issues
Look for:
- Spans with duration > 1000ms
- Database queries taking > 100ms
- Multiple duplicate API calls (check trace IDs)

## Best Practices

1. **Correlation**: Use trace IDs to follow requests across services
2. **Filtering**: Use the trace viewer's filters to focus on specific users/lessons
3. **Time Windows**: Check traces around the time issues were reported
4. **Event Patterns**: Look for unusual event sequences or missing events
5. **Error Rates**: Monitor the error stats in the trace viewer dashboard

## Security Considerations

- No sensitive data (passwords, tokens) in trace attributes
- User IDs are included but not PII
- Video URLs are traced but S3 signed URLs expire
- Traces are stored locally on the server, not sent to external services
