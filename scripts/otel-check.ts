#!/usr/bin/env npx ts-node

/**
 * OpenTelemetry Smoke Test Script
 * 
 * This script verifies that OpenTelemetry is properly configured and exporting traces.
 * It creates a test trace with nested spans and an external HTTP call.
 * 
 * Usage:
 *   npm run otel:check
 *   # or directly:
 *   OTEL_ENABLED=true npx ts-node scripts/otel-check.ts
 */

import { trace, context, SpanStatusCode, SpanKind } from '@opentelemetry/api';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { Resource } from '@opentelemetry/resources';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';

// Configuration
const OTEL_ENDPOINT = process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318';
const SERVICE_NAME = 'diamond-district-smoke-test';

console.log('🔍 OpenTelemetry Smoke Test');
console.log('===========================');
console.log(`Endpoint: ${OTEL_ENDPOINT}`);
console.log(`Service: ${SERVICE_NAME}`);
console.log('');

// Initialize OpenTelemetry
const provider = new NodeTracerProvider({
  resource: new Resource({
    'service.name': SERVICE_NAME,
    'service.version': '1.0.0',
    'deployment.environment': 'test',
  }),
});

// Configure exporter
const exporter = new OTLPTraceExporter({
  url: `${OTEL_ENDPOINT}/v1/traces`,
  headers: {},
  timeoutMillis: 5000,
});

// Add span processor
provider.addSpanProcessor(new BatchSpanProcessor(exporter));

// Register provider
provider.register();

// Register instrumentations
registerInstrumentations({
  instrumentations: [
    new HttpInstrumentation({
      requestHook: (span, request) => {
        span.setAttribute('test.instrumented', true);
      },
    }),
  ],
});

// Get tracer
const tracer = trace.getTracer('smoke-test', '1.0.0');

// Helper to wait
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Main test function
async function runSmokeTest() {
  const testTraceId = Math.random().toString(36).substring(2, 15);
  
  console.log('🚀 Starting test trace...');
  console.log(`Test ID: ${testTraceId}`);
  
  // Create root span
  const rootSpan = tracer.startSpan('smoke-test.root', {
    kind: SpanKind.SERVER,
    attributes: {
      'test.id': testTraceId,
      'test.type': 'smoke',
    },
  });
  
  const rootContext = trace.setSpan(context.active(), rootSpan);
  
  try {
    await context.with(rootContext, async () => {
      // Add event
      rootSpan.addEvent('test.started', {
        'test.step': 'initialization',
      });
      
      // Nested span 1: Database simulation
      await tracer.startActiveSpan('smoke-test.database', 
        { kind: SpanKind.CLIENT },
        async (dbSpan) => {
          try {
            dbSpan.setAttribute('db.system', 'postgresql');
            dbSpan.setAttribute('db.operation', 'SELECT');
            
            await sleep(50); // Simulate DB query
            
            dbSpan.addEvent('db.query.executed', {
              'db.rows_affected': 5,
            });
            
            dbSpan.setStatus({ code: SpanStatusCode.OK });
          } finally {
            dbSpan.end();
          }
        }
      );
      
      // Nested span 2: External HTTP call
      await tracer.startActiveSpan('smoke-test.http', 
        { kind: SpanKind.CLIENT },
        async (httpSpan) => {
          try {
            httpSpan.setAttribute('http.method', 'GET');
            httpSpan.setAttribute('http.url', 'https://api.github.com/zen');
            
            console.log('📡 Making external HTTP call...');
            const response = await fetch('https://api.github.com/zen');
            const text = await response.text();
            
            httpSpan.setAttribute('http.status_code', response.status);
            httpSpan.addEvent('http.response.received', {
              'response.size': text.length,
              'response.preview': text.substring(0, 50),
            });
            
            console.log(`✅ HTTP Response: "${text}"`);
            
            httpSpan.setStatus({ code: SpanStatusCode.OK });
          } catch (error) {
            httpSpan.recordException(error as Error);
            httpSpan.setStatus({ 
              code: SpanStatusCode.ERROR,
              message: (error as Error).message,
            });
            throw error;
          } finally {
            httpSpan.end();
          }
        }
      );
      
      // Nested span 3: Processing simulation
      await tracer.startActiveSpan('smoke-test.processing', 
        { kind: SpanKind.INTERNAL },
        async (procSpan) => {
          try {
            procSpan.setAttribute('processing.items', 100);
            
            for (let i = 0; i < 3; i++) {
              await sleep(30);
              procSpan.addEvent('processing.batch.completed', {
                'batch.number': i + 1,
                'batch.size': 33,
              });
            }
            
            procSpan.setStatus({ code: SpanStatusCode.OK });
          } finally {
            procSpan.end();
          }
        }
      );
      
      rootSpan.addEvent('test.completed', {
        'test.status': 'success',
      });
      
      rootSpan.setStatus({ code: SpanStatusCode.OK });
    });
    
  } catch (error) {
    rootSpan.recordException(error as Error);
    rootSpan.setStatus({ 
      code: SpanStatusCode.ERROR,
      message: (error as Error).message,
    });
    throw error;
  } finally {
    rootSpan.end();
  }
  
  // Wait for export
  console.log('\n⏳ Waiting for trace export...');
  await sleep(2000);
  
  // Flush and shutdown
  await provider.forceFlush();
  await provider.shutdown();
  
  console.log('\n📊 Trace Summary:');
  console.log(`- Root Span ID: ${rootSpan.spanContext().spanId}`);
  console.log(`- Trace ID: ${rootSpan.spanContext().traceId}`);
  console.log(`- Total Spans: 4 (root + 3 nested)`);
  console.log(`- External Calls: 1 (GitHub API)`);
  
  console.log('\n🔍 To view this trace:');
  console.log(`1. Open: https://watch.zerotodiamond.com/trace-viewer.html`);
  console.log(`2. Or check: tail -f /var/log/otel-collector/traces.json | grep "${rootSpan.spanContext().traceId}"`);
  
  console.log('\n✅ Smoke test completed successfully!');
}

// Run the test
runSmokeTest().catch((error) => {
  console.error('\n❌ Smoke test failed:', error);
  process.exit(1);
});
