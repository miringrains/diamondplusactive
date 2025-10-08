#!/usr/bin/env node

// Test script to verify OpenTelemetry is working
const http = require('http');

console.log('Testing OpenTelemetry integration...\n');

// Check if OTEL is enabled
if (process.env.OTEL_ENABLED !== 'true') {
  console.log('⚠️  OpenTelemetry is DISABLED');
  console.log('   Set OTEL_ENABLED=true in ecosystem.config.js to enable\n');
} else {
  console.log('✅ OpenTelemetry is ENABLED');
}

// Check OTLP endpoint
const otlpEndpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318';
console.log(`📡 OTLP Endpoint: ${otlpEndpoint}`);

// Try to connect to the endpoint
const url = new URL(otlpEndpoint);
const options = {
  hostname: url.hostname,
  port: url.port || 4318,
  path: '/v1/traces',
  method: 'POST',
  timeout: 5000
};

const req = http.request(options, (res) => {
  if (res.statusCode === 415 || res.statusCode === 400) {
    console.log('✅ OTLP endpoint is reachable (responding with expected error for empty request)');
  } else if (res.statusCode === 200) {
    console.log('✅ OTLP endpoint is reachable');
  } else {
    console.log(`⚠️  OTLP endpoint returned status: ${res.statusCode}`);
  }
});

req.on('error', (error) => {
  console.log('❌ Cannot reach OTLP endpoint:', error.message);
  console.log('\nTo set up a local collector, you can use one of these options:');
  console.log('\n1. Use a cloud service like Grafana Cloud (free tier available)');
  console.log('   - Sign up at: https://grafana.com/products/cloud/');
  console.log('   - Update OTEL_EXPORTER_OTLP_ENDPOINT in ecosystem.config.js');
  console.log('\n2. Use Jaeger (requires Docker):');
  console.log('   docker run -d --name jaeger -p 16686:16686 -p 4318:4318 jaegertracing/all-in-one:latest');
  console.log('\n3. Use OpenTelemetry Collector:');
  console.log('   wget https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/v0.102.1/otelcol_0.102.1_linux_amd64.tar.gz');
  console.log('   tar -xvf otelcol_0.102.1_linux_amd64.tar.gz');
  console.log('   ./otelcol --config=config.yaml');
});

req.on('timeout', () => {
  req.destroy();
  console.log('❌ Connection to OTLP endpoint timed out');
});

req.end();

console.log('\n📝 Current OpenTelemetry environment:');
console.log(`   OTEL_ENABLED=${process.env.OTEL_ENABLED || 'false'}`);
console.log(`   OTEL_SERVICE_NAME=${process.env.OTEL_SERVICE_NAME || 'diamond-district'}`);
console.log(`   NODE_ENV=${process.env.NODE_ENV || 'development'}`);

console.log('\n🔧 To enable OpenTelemetry:');
console.log('   1. Edit ecosystem.config.js and set OTEL_ENABLED: "true"');
console.log('   2. Restart the app: pm2 restart diamond-district');
console.log('   3. Check logs: pm2 logs diamond-district | grep OTEL');
