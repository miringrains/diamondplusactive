# OpenTelemetry Setup for Diamond District

## Installation

```bash
# Core OpenTelemetry packages
npm install --save \
  @opentelemetry/api \
  @opentelemetry/sdk-node \
  @opentelemetry/auto-instrumentations-node \
  @opentelemetry/exporter-trace-otlp-http \
  @opentelemetry/exporter-metrics-otlp-http \
  @opentelemetry/exporter-logs-otlp-http \
  @opentelemetry/resources \
  @opentelemetry/semantic-conventions

# Optional: For better Next.js support
npm install --save @opentelemetry/instrumentation-http @opentelemetry/instrumentation-fetch
```

## Basic Setup in instrumentation.ts

```typescript
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { Resource } from '@opentelemetry/resources';
import { SEMRESATTRS_SERVICE_NAME, SEMRESATTRS_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Only run OpenTelemetry on the server
    
    const resource = Resource.default().merge(
      new Resource({
        [SEMRESATTRS_SERVICE_NAME]: 'diamond-district',
        [SEMRESATTRS_SERVICE_VERSION]: process.env.npm_package_version || '0.1.0',
        environment: process.env.NODE_ENV || 'development',
      })
    );

    const traceExporter = new OTLPTraceExporter({
      url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318/v1/traces',
    });

    const metricExporter = new OTLPMetricExporter({
      url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318/v1/metrics',
    });

    const sdk = new NodeSDK({
      resource,
      traceExporter,
      metricReader: new PeriodicExportingMetricReader({
        exporter: metricExporter,
        exportIntervalMillis: 10000, // Export metrics every 10 seconds
      }),
      instrumentations: [
        getNodeAutoInstrumentations({
          // Disable fs instrumentation to reduce noise
          '@opentelemetry/instrumentation-fs': {
            enabled: false,
          },
          // Configure Prisma instrumentation
          '@opentelemetry/instrumentation-prisma': {
            enabled: true,
          },
          // Configure Redis instrumentation
          '@opentelemetry/instrumentation-ioredis': {
            enabled: true,
          },
          // Configure HTTP instrumentation
          '@opentelemetry/instrumentation-http': {
            requestHook: (span, request) => {
              // Add custom attributes to HTTP spans
              span.setAttribute('http.request.body.size', request.headers['content-length'] || 0);
            },
            // Ignore health checks and static assets
            ignoreIncomingRequestHook: (request) => {
              const url = request.url;
              return url?.includes('_next/static') || 
                     url?.includes('favicon') ||
                     url === '/api/health';
            },
          },
        }),
      ],
    });

    // Initialize the SDK
    sdk.start();

    // Graceful shutdown
    process.on('SIGTERM', () => {
      sdk.shutdown()
        .then(() => console.log('OpenTelemetry terminated successfully'))
        .catch((error) => console.error('Error terminating OpenTelemetry', error))
        .finally(() => process.exit(0));
    });

    // Keep your existing error handlers
    process.on('unhandledRejection', (reason, promise) => {
      console.error('[Instrumentation] Unhandled Rejection at:', promise, 'reason:', reason);
    });

    process.on('uncaughtException', (error) => {
      console.error('[Instrumentation] Uncaught Exception:', error);
      if (process.env.NODE_ENV !== 'production') {
        process.exit(1);
      }
    });
  }
}
```

## Custom Instrumentation for Video Operations

Create a new file `src/lib/telemetry.ts`:

```typescript
import { trace, metrics, SpanStatusCode } from '@opentelemetry/api';

// Create a tracer for your application
const tracer = trace.getTracer('diamond-district', '0.1.0');
const meter = metrics.getMeter('diamond-district', '0.1.0');

// Create custom metrics
const videoLoadTime = meter.createHistogram('video.load_time', {
  description: 'Time taken to load video',
  unit: 'ms',
});

const progressUpdateCounter = meter.createCounter('progress.updates', {
  description: 'Number of progress updates',
});

const videoBufferingCounter = meter.createCounter('video.buffering_events', {
  description: 'Number of video buffering events',
});

// Helper function to trace async operations
export async function traceAsync<T>(
  name: string,
  fn: () => Promise<T>,
  attributes?: Record<string, any>
): Promise<T> {
  return tracer.startActiveSpan(name, async (span) => {
    try {
      if (attributes) {
        span.setAttributes(attributes);
      }
      const result = await fn();
      span.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (error) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error instanceof Error ? error.message : 'Unknown error',
      });
      span.recordException(error as Error);
      throw error;
    } finally {
      span.end();
    }
  });
}

// Video-specific tracing helpers
export function recordVideoLoad(duration: number, videoId: string) {
  videoLoadTime.record(duration, {
    'video.id': videoId,
  });
}

export function recordProgressUpdate(lessonId: string, userId: string) {
  progressUpdateCounter.add(1, {
    'lesson.id': lessonId,
    'user.id': userId,
  });
}

export function recordBufferingEvent(videoId: string) {
  videoBufferingCounter.add(1, {
    'video.id': videoId,
  });
}
```

## Update Your Video Player Component

```typescript
import { traceAsync, recordVideoLoad, recordBufferingEvent } from '@/lib/telemetry';

// In your video player component
const handleVideoReady = async () => {
  const loadStartTime = performance.now();
  
  await traceAsync('video.initialize', async () => {
    // Your existing video initialization code
    if (player && initialTime > 0) {
      await traceAsync('video.seek_to_resume', async () => {
        player.currentTime = initialTime;
      }, {
        'video.initial_time': initialTime,
        'video.url': url,
      });
    }
  });
  
  const loadDuration = performance.now() - loadStartTime;
  recordVideoLoad(loadDuration, lessonId);
};
```

## Update Your API Routes

```typescript
// In your progress API route
import { traceAsync } from '@/lib/telemetry';

export async function POST(req: NextRequest) {
  return traceAsync('api.progress.update', async () => {
    // Your existing code
    const session = await auth();
    // ... rest of your code
  }, {
    'http.method': 'POST',
    'http.route': '/api/progress',
  });
}
```

## Environment Variables

Add to your `.env.local`:

```bash
# OpenTelemetry Configuration
OTEL_SERVICE_NAME=diamond-district
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf
OTEL_TRACES_EXPORTER=otlp
OTEL_METRICS_EXPORTER=otlp
OTEL_LOGS_EXPORTER=otlp
```

## PM2 Configuration Update

Update your `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'diamond-district',
    script: './node_modules/next/dist/bin/next',
    args: 'start',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      PORT: 3000,
      NODE_ENV: 'production',
      // Important: Each PM2 instance needs a unique service instance ID
      OTEL_RESOURCE_ATTRIBUTES: `service.instance.id=${process.env.pm_id || 0}`
    },
    max_memory_restart: '2G',
    node_args: '--max-old-space-size=2048',
    // Ensure proper shutdown for OpenTelemetry
    kill_timeout: 10000,
    wait_ready: true,
    listen_timeout: 10000,
  }]
}
```

## Backend Options

1. **Jaeger** (Simple, good for development):
   ```bash
   docker run -d --name jaeger \
     -p 16686:16686 \
     -p 4318:4318 \
     jaegertracing/all-in-one:latest
   ```

2. **Grafana Cloud** (Managed, production-ready):
   - Sign up for free tier at grafana.com
   - Update OTEL_EXPORTER_OTLP_ENDPOINT with their endpoint
   - Add authentication headers

3. **SigNoz** (Open-source, full-stack):
   ```bash
   git clone -b main https://github.com/SigNoz/signoz.git
   cd signoz/deploy/
   ./install.sh
   ```

## Monitoring Your Specific Issues

With OpenTelemetry, you'll be able to see:

1. **Resume Timing Issues**: Exact timing of metadata load vs seek operations
2. **Double Progress Tracking**: Duplicate API calls will show as separate spans
3. **Race Conditions**: Concurrent operations will be visible in the trace timeline
4. **API Inefficiencies**: Database query times, N+1 queries, slow endpoints
5. **Video Performance**: Load times, buffering events, seek performance

## Best Practices

1. **Don't over-instrument**: Auto-instrumentation covers most cases
2. **Use semantic conventions**: Follow OpenTelemetry naming standards
3. **Sample in production**: Set sampling rate to avoid overwhelming your backend
4. **Add business context**: Include user IDs, video IDs, lesson IDs in spans
5. **Monitor costs**: Telemetry data can grow quickly

## Troubleshooting Tips

1. **Spans not showing up**: Check if NEXT_RUNTIME === 'nodejs'
2. **PM2 issues**: Each cluster instance needs unique attributes
3. **High memory usage**: Reduce batch size or increase export interval
4. **Missing Prisma queries**: Ensure Prisma client is created after SDK initialization
