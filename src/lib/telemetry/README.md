# OpenTelemetry Integration for Diamond Plus

This directory contains the OpenTelemetry instrumentation setup for the Diamond Plus training platform.

## Overview

OpenTelemetry is configured to help diagnose the video player issues identified in the player audit:
- Resume timing problems
- Double progress tracking
- Missing persistence on navigation
- Race conditions
- API inefficiencies

## Setup

### Environment Variables

```bash
# Enable/disable OpenTelemetry
OTEL_ENABLED=true

# Service identification
OTEL_SERVICE_NAME=diamond-district

# OTLP endpoint (local collector)
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
```

### Files

- `otel-config.ts` - Configuration constants and helpers
- `otel-setup.ts` - Main OpenTelemetry SDK initialization
- `http-instrumentation-config.ts` - Type-safe HTTP instrumentation configuration
- `video-telemetry.ts` - Video player specific telemetry helpers
- `index.ts` - Simple wrapper functions for tracing

## Usage

### Basic API Tracing

```typescript
import { traceAsync } from '@/lib/telemetry';

export async function POST(req: NextRequest) {
  return traceAsync('api.endpoint_name', async () => {
    // Your API logic here
  }, {
    'custom.attribute': 'value',
  });
}
```

### Video Player Telemetry

```typescript
import { VideoTelemetry } from '@/lib/telemetry/video-telemetry';

// In your video player component
const telemetry = new VideoTelemetry(lessonId, userId);

// Start session
telemetry.startSession(initialPosition);

// Track video loaded
telemetry.trackVideoLoaded(duration, loadTimeMs);

// Track resume attempt
telemetry.trackResumeAttempt(targetPos, actualPos, success, timeMs);

// Track progress save
await telemetry.trackProgressSave(position, async () => {
  // Save progress to database
});

// End session
telemetry.endSession(finalPosition, completed);
```

## Viewing Telemetry Data

The OpenTelemetry Collector is configured to:
1. Export traces to `/var/log/otel-collector/traces.json`
2. Log detailed information to stdout

To view traces:
```bash
# View collector logs
systemctl status otel-collector

# View trace data
tail -f /var/log/otel-collector/traces.json | jq .
```

## Production Considerations

1. **Performance**: OpenTelemetry adds minimal overhead when properly configured
2. **Sampling**: Consider implementing sampling for high-traffic endpoints
3. **Storage**: Monitor trace storage size and implement rotation
4. **Security**: Never include sensitive data in span attributes

## Troubleshooting

### OpenTelemetry not initializing
- Check `OTEL_ENABLED=true` in environment
- Verify Next.js `instrumentation.ts` is being loaded
- Check PM2 logs for initialization messages

### No traces appearing
- Verify collector is running: `systemctl status otel-collector`
- Check collector endpoint is reachable
- Look for errors in application logs

### Type errors during build
- All instrumentation hooks use proper TypeScript types
- Type guards ensure safe property access
- Errors are caught and logged without breaking the app
