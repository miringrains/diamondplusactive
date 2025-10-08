#!/bin/bash

# OpenTelemetry Installation Script
# This installs all necessary dependencies for OpenTelemetry instrumentation

echo "Installing OpenTelemetry dependencies..."

# Core packages
npm install --save \
  @opentelemetry/api@^1.9.0 \
  @opentelemetry/sdk-node@^0.52.0 \
  @opentelemetry/auto-instrumentations-node@^0.48.0 \
  @opentelemetry/exporter-trace-otlp-http@^0.52.0 \
  @opentelemetry/exporter-metrics-otlp-http@^0.52.0 \
  @opentelemetry/resources@^1.25.0 \
  @opentelemetry/semantic-conventions@^1.25.0

echo "OpenTelemetry dependencies installed successfully!"
echo ""
echo "To enable OpenTelemetry, add these to your .env.local:"
echo "  OTEL_ENABLED=true"
echo "  OTEL_SERVICE_NAME=diamond-district"
echo "  OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318"
echo ""
echo "To start a local Jaeger instance for testing:"
echo "  docker run -d --name jaeger -p 16686:16686 -p 4318:4318 jaegertracing/all-in-one:latest"
