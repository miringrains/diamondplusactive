# OpenTelemetry Setup Guide

## Packages

### Core OpenTelemetry Dependencies
```json
{
  "@opentelemetry/api": "^1.9.0",
  "@opentelemetry/sdk-node": "^0.52.1",
  "@opentelemetry/resources": "^1.30.1",
  "@opentelemetry/semantic-conventions": "^1.36.0"
}
```

### Instrumentation Packages
```json
{
  "@opentelemetry/auto-instrumentations-node": "^0.48.0",
  "@opentelemetry/winston-transport": "^0.14.0"
}
```

### Exporters
```json
{
  "@opentelemetry/exporter-trace-otlp-http": "^0.52.1",
  "@opentelemetry/exporter-metrics-otlp-http": "^0.52.1",
  "@opentelemetry/exporter-jaeger": "^2.0.1"
}
```

## Initialization Order

### 1. Entry Point: `src/instrumentation.ts`
This file is loaded by Next.js before any other code:
```typescript
// Loaded automatically by Next.js when present
// Checks OTEL_ENABLED env var
// Dynamically imports telemetry setup if enabled
```

### 2. SDK Setup: `src/lib/telemetry/otel-setup.ts`
```typescript
// Creates NodeSDK with:
// - Resource attributes (service name, version, environment)
// - OTLP exporters for traces and metrics
// - Auto-instrumentations for Node.js libraries
// - Graceful shutdown handlers
```

### 3. Configuration: `src/lib/telemetry/otel-config.ts`
```typescript
// Centralized config for:
// - Service identification
// - Resource attributes
// - URL ignore patterns
// - API endpoint categorization
```

## Environment Variables

### Development (.env.local)
```bash
# Enable OpenTelemetry
OTEL_ENABLED=true

# Service identification
OTEL_SERVICE_NAME=diamond-district
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318

# Optional: Custom headers for auth
OTEL_EXPORTER_OTLP_HEADERS={}

# Resource attributes (auto-populated from PM2)
# service.instance.id=${pm_id}
```

### Staging (.env.staging)
```bash
OTEL_ENABLED=true
OTEL_SERVICE_NAME=diamond-district-staging
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
NODE_ENV=staging
```

### Production (ecosystem.config.js)
```javascript
env: {
  NODE_ENV: 'production',
  PORT: 3000,
  OTEL_ENABLED: 'true',
  OTEL_SERVICE_NAME: 'diamond-district',
  OTEL_EXPORTER_OTLP_ENDPOINT: 'http://localhost:4318',
  OTEL_RESOURCE_ATTRIBUTES: `service.instance.id=${process.env.pm_id || 0}`,
}
```

## Resource Attributes

Automatically set by the SDK:
```javascript
{
  'service.name': 'diamond-district',
  'service.version': '0.1.0',
  'service.namespace': 'video-platform',
  'deployment.environment': process.env.NODE_ENV || 'development',
  'service.instance.id': process.env.pm_id || process.pid.toString(),
  'host.name': 'watch.zerotodiamond.com',
}
```

## Exporter Configuration

### OTLP HTTP Exporter
- **Traces Endpoint**: `${OTEL_EXPORTER_OTLP_ENDPOINT}/v1/traces`
- **Metrics Endpoint**: `${OTEL_EXPORTER_OTLP_ENDPOINT}/v1/metrics`
- **Timeout**: 10000ms
- **Protocol**: HTTP/JSON
- **Compression**: None (can be enabled if needed)

### Batch Processing
- **Metric Export Interval**: 10000ms (10 seconds)
- **Trace Batching**: Handled by SDK defaults

## Sampling Policy

Currently using **AlwaysOn** sampling (100% of traces captured).

To implement sampling in production:
```javascript
import { TraceIdRatioBasedSampler } from '@opentelemetry/sdk-trace-base';

// In otel-setup.ts
const sdk = new NodeSDK({
  // ... other config
  sampler: new TraceIdRatioBasedSampler(0.1), // 10% sampling
});
```

## Context Propagation

### Default Propagators
- W3C Trace Context (traceparent header)
- W3C Baggage

### Headers Used
```
traceparent: 00-${traceId}-${spanId}-${flags}
tracestate: vendor-specific trace info
baggage: key=value pairs for context
```

## Safe Enable/Disable

### To Enable OpenTelemetry
1. Set environment variable: `OTEL_ENABLED=true`
2. Ensure collector is running: `systemctl status otel-collector`
3. Restart application: `pm2 restart diamond-district`

### To Disable OpenTelemetry
1. Set environment variable: `OTEL_ENABLED=false`
2. Restart application: `pm2 restart diamond-district`
3. No code changes required - instrumentation won't load

### Gradual Rollout
```javascript
// In otel-config.ts, add feature flag
isEnabled: () => {
  const enabledForPercent = Math.random() < 0.1; // 10% of instances
  return process.env.OTEL_ENABLED === 'true' && enabledForPercent;
}
```

## Verification Steps

### 1. Check Initialization
```bash
# Check PM2 logs for OTEL messages
pm2 logs diamond-district --lines 100 | grep OTEL

# Should see:
# [OTEL] Initializing with service name: diamond-district
# [OTEL] OTLP Endpoint: http://localhost:4318
# [OTEL] OpenTelemetry initialized successfully
```

### 2. Verify Collector
```bash
# Check collector status
systemctl status otel-collector

# Check collector logs
journalctl -u otel-collector -f

# Verify port is listening
netstat -tlnp | grep 4318
```

### 3. Test Trace Generation
```bash
# Use the test endpoint
curl https://watch.zerotodiamond.com/api/test-otel

# Check for traces
tail -f /var/log/otel-collector/traces.json | jq .
```

### 4. Trace Viewer
Navigate to: https://watch.zerotodiamond.com/trace-viewer.html
- Should see recent traces
- Check for your test trace
- Verify events and attributes

## Trace Walkthrough

### Complete User Session Trace
```bash
# 1. Login
curl -X POST https://watch.zerotodiamond.com/api/auth/callback/credentials \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}' \
  -c cookies.txt

# 2. Access Dashboard (authenticated)
curl https://watch.zerotodiamond.com/dashboard \
  -b cookies.txt

# 3. Play Video
curl https://watch.zerotodiamond.com/api/videos/lesson-intro.mp4 \
  -b cookies.txt \
  -H "Range: bytes=0-1048576"

# 4. Update Progress
curl -X POST https://watch.zerotodiamond.com/api/progress \
  -b cookies.txt \
  -H "Content-Type: application/json" \
  -d '{"lessonId":"cme2v1b7y0001s0bot041ssso","watchTime":30,"positionSeconds":30}'
```

Expected trace sequence:
1. `auth.credentials.authorize` - Authentication
2. `http.request` - Dashboard page load
3. `api.video.stream` - Video access with auth check
4. `api.progress.update` - Progress save with events

## Common Issues

### No Traces Appearing
1. Check `OTEL_ENABLED=true` in environment
2. Verify collector is running
3. Check for initialization errors in logs
4. Ensure Next.js instrumentation.ts is loaded

### Missing Spans
1. Some operations may need manual instrumentation
2. Check if auto-instrumentation covers the library
3. Verify span is not filtered by ignore patterns

### Performance Impact
1. Monitor CPU/memory with tracing enabled
2. Implement sampling if overhead is high
3. Disable expensive instrumentations (fs, net, dns)

### Type Errors
1. All OpenTelemetry imports should match versions
2. Use type guards for request/response objects
3. Wrap instrumentation in try-catch blocks
