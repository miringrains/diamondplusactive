# OpenTelemetry Gaps and Implementation Plan

## Why It Matters

While the current OpenTelemetry setup provides good visibility into HTTP requests and authentication flows, critical gaps exist in video streaming, S3 operations, and external service calls. Addressing these gaps will enable faster troubleshooting of video playback issues and performance bottlenecks.

## Identified Gaps

### 1. Missing Instrumentation

#### P0 - Critical Gaps (Fix Immediately)

**1.1 Video Streaming Endpoints**
- **Gap**: `/api/videos/[filename]/route.ts` only has one `addSpanEvent` for auth failures
- **Impact**: Can't trace video streaming performance, range requests, or S3 redirects
- **Fix**: Add comprehensive tracing for stream operations
```typescript
// Wrap entire handler
return traceAsync('api.videos.stream', async () => {
  // Add events for:
  addSpanEvent('video.access_check', { filename, hasSession });
  addSpanEvent('video.s3_redirect', { s3Key, signedUrl: 'generated' });
  addSpanEvent('video.range_request', { start, end, totalSize });
});
```

**1.2 S3 Operations**
- **Gap**: No instrumentation in `src/lib/s3.ts`
- **Impact**: Can't trace S3 latency, failures, or signed URL generation
- **Fix**: Wrap all S3 operations
```typescript
export async function getSignedVideoUrl(key: string): Promise<string> {
  return traceAsync('s3.get_signed_url', async () => {
    // existing code
  }, { 's3.key': key, 's3.bucket': process.env.S3_BUCKET_NAME });
}
```

**1.3 Upload Pipeline**
- **Gap**: No tracing in `/api/upload/*` endpoints
- **Impact**: Can't diagnose upload failures or performance issues
- **Fix**: Instrument multipart uploads, stream processing, and thumbnail generation

#### P1 - Important Gaps (Fix This Week)

**1.4 GoHighLevel Integration**
- **Gap**: No instrumentation for GHL API calls
- **Impact**: Can't trace registration webhook failures or API latency
- **Fix**: Add HTTP client instrumentation for GHL requests

**1.5 Background Jobs (BullMQ)**
- **Gap**: Limited instrumentation for video processing queues
- **Impact**: Missing visibility into thumbnail generation and FFmpeg operations
- **Fix**: Add custom spans for queue jobs

**1.6 Prisma Query Details**
- **Gap**: Auto-instrumentation exists but lacks query details
- **Impact**: Can't identify slow queries or N+1 problems
- **Fix**: Enable Prisma query logging with trace correlation

#### P2 - Nice to Have (Fix This Month)

**1.7 WebSocket/Real-time Events**
- **Gap**: No tracing for Socket.io connections
- **Impact**: Can't diagnose real-time update issues
- **Fix**: Add Socket.io instrumentation

**1.8 Client-Side Correlation**
- **Gap**: No trace context propagation to frontend
- **Impact**: Can't correlate frontend errors with backend traces
- **Fix**: Add trace headers to API responses

### 2. Configuration Issues

#### P0 - Sampling Strategy
- **Issue**: Using 100% sampling (AlwaysOn)
- **Risk**: High volume will overwhelm storage and processing
- **Fix**: Implement ratio-based sampling for production
```javascript
sampler: new TraceIdRatioBasedSampler(
  process.env.NODE_ENV === 'production' ? 0.1 : 1.0
)
```

#### P1 - Metric Aggregation
- **Issue**: Metrics exported every 10 seconds without aggregation
- **Risk**: High cardinality metrics could cause memory issues
- **Fix**: Add metric views for aggregation

### 3. Operational Gaps

#### P0 - Log Correlation
- **Gap**: Logs don't include trace IDs
- **Impact**: Can't correlate logs with traces for debugging
- **Fix**: Add trace context to console logs
```javascript
const traceId = trace.getActiveSpan()?.spanContext().traceId;
console.log(`[${traceId}] Error:`, error);
```

#### P1 - Alerting
- **Gap**: No alerts based on trace data
- **Impact**: Issues not proactively detected
- **Fix**: Add alerts for error rates, latency thresholds

## Implementation Tickets

### Ticket 1: Instrument Video Streaming (P0)
**Effort**: 4 hours
**Owner**: Backend Team
**Tasks**:
1. Add `traceAsync` wrapper to `/api/videos/[filename]/route.ts`
2. Add span events for S3 redirects, range requests, auth checks
3. Include video metadata (filename, size, format) as attributes
4. Test with trace viewer

### Ticket 2: Instrument S3 Operations (P0)
**Effort**: 3 hours
**Owner**: Backend Team
**Tasks**:
1. Wrap all functions in `src/lib/s3.ts` with tracing
2. Add attributes for bucket, key, operation type
3. Measure S3 operation latency
4. Add error handling with span status

### Ticket 3: Add Upload Tracing (P0)
**Effort**: 4 hours
**Owner**: Backend Team
**Tasks**:
1. Instrument `/api/upload/stream/route.ts`
2. Add progress events for multipart uploads
3. Trace thumbnail generation in background jobs
4. Include file metadata as attributes

### Ticket 4: Implement Sampling (P0)
**Effort**: 2 hours
**Owner**: DevOps
**Tasks**:
1. Add TraceIdRatioBasedSampler to otel-setup.ts
2. Configure different ratios for dev/staging/prod
3. Add head-based sampling rules for critical endpoints
4. Test sampling behavior

### Ticket 5: Add Log Correlation (P0)
**Effort**: 3 hours
**Owner**: Backend Team
**Tasks**:
1. Create winston logger with OTel transport
2. Add trace ID injection to log formatter
3. Update all console.log to use logger
4. Verify logs show trace IDs

### Ticket 6: Instrument GoHighLevel (P1)
**Effort**: 3 hours
**Owner**: Backend Team
**Tasks**:
1. Add tracing to GHL API client
2. Include webhook type, contact ID as attributes
3. Trace OAuth token refresh
4. Add retry/failure events

### Ticket 7: Enhance Prisma Tracing (P1)
**Effort**: 2 hours
**Owner**: Backend Team
**Tasks**:
1. Enable Prisma query event logging
2. Correlate queries with active spans
3. Add query duration metrics
4. Identify slow query patterns

### Ticket 8: Create Dashboards (P1)
**Effort**: 4 hours
**Owner**: DevOps
**Tasks**:
1. Set up Grafana dashboards for key metrics
2. Create alerts for error rates > 5%
3. Add P95 latency monitoring
4. Configure trace retention policies

## Quick Wins (Do Today)

1. **Add Missing Span Events**
   - Add events to existing traced functions
   - No new wrappers needed, just `addSpanEvent()` calls

2. **Fix Trace Viewer Filter**
   - Add event type filter to trace viewer
   - Add time range selector

3. **Enable Debug Logging**
   - Set OTEL_LOG_LEVEL=debug in dev
   - Helps diagnose instrumentation issues

## Success Metrics

- **Coverage**: 95% of API endpoints have tracing
- **Latency**: < 1% overhead from instrumentation  
- **Mean Time to Diagnose**: < 5 minutes for auth/video issues
- **Storage**: < 1GB/day of trace data with sampling

## Rollout Plan

### Week 1
- Implement P0 tickets (video, S3, uploads, sampling)
- Deploy to staging for testing
- Monitor performance impact

### Week 2
- Fix any issues from Week 1
- Implement P1 tickets (GHL, Prisma, logs)
- Create initial dashboards

### Week 3
- Deploy to production with 10% sampling
- Monitor and adjust sampling rates
- Train team on trace viewer usage

### Week 4
- Implement P2 tickets if time allows
- Document runbooks with trace examples
- Set up automated alerts
