# Diamond District Observability Documentation

This directory contains comprehensive documentation and tools for the OpenTelemetry observability setup in the Diamond District video platform.

## 📚 Documentation Files

### 1. [OBSERVABILITY_OVERVIEW.md](./OBSERVABILITY_OVERVIEW.md)
**What it covers**: High-level overview of what we collect, where it goes, and how to read traces
- Types of telemetry data (traces, metrics, events)
- How to access and interpret trace data
- Common troubleshooting patterns
- Security considerations

### 2. [OTEL_SETUP.md](./OTEL_SETUP.md)
**What it covers**: Technical setup guide and configuration reference
- Package inventory and versions
- Initialization sequence and entry points
- Environment variable configuration
- Safe enable/disable procedures
- Verification steps and trace walkthrough

### 3. [OTEL_GAPS_AND_PLAN.md](./OTEL_GAPS_AND_PLAN.md)
**What it covers**: Gap analysis and prioritized implementation plan
- Missing instrumentation (P0/P1/P2 priorities)
- Configuration issues to address
- Detailed implementation tickets with effort estimates
- Rollout plan and success metrics

## 🛠️ Tools and Scripts

### Smoke Test Script
**Location**: `scripts/otel-check.ts`
**Usage**: `npm run otel:check`
**Purpose**: Verify OpenTelemetry is working end-to-end by creating a test trace with nested spans

### Trace Viewer
**URL**: https://watch.zerotodiamond.com/trace-viewer.html
**Purpose**: Web-based UI for viewing and filtering traces in real-time

## 📊 Dashboard Configurations

Pre-configured Grafana dashboards in `dashboards/`:
- `api-latency-errors.json` - API performance and error tracking
- `database-performance.json` - Prisma query performance
- `video-streaming.json` - Video delivery and progress metrics
- `external-services.json` - S3 and GoHighLevel monitoring

## 🔧 Collector Configuration

**Location**: `collector/otel-collector.example.yaml`
**Purpose**: Example OpenTelemetry Collector configuration with:
- OTLP receivers for traces and metrics
- Processing pipelines with batching and filtering
- Multiple export options (file, Jaeger, Prometheus)
- Production-ready settings with comments

## 🚀 Quick Start

### Enable OpenTelemetry
```bash
# Set in environment or .env file
OTEL_ENABLED=true
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318

# Restart the application
pm2 restart diamond-district
```

### Verify It's Working
```bash
# Run smoke test
npm run otel:check

# Check logs for initialization
pm2 logs diamond-district | grep OTEL

# View traces
tail -f /var/log/otel-collector/traces.json | jq .
```

### Debug Common Issues
```bash
# Check collector status
systemctl status otel-collector

# Test a specific endpoint
curl https://watch.zerotodiamond.com/api/test-otel

# View in trace viewer
open https://watch.zerotodiamond.com/trace-viewer.html
```

## 📈 Current Status

### ✅ What's Working
- Core OpenTelemetry SDK setup
- HTTP request tracing with custom attributes
- Authentication flow instrumentation
- Progress API tracing
- Basic video telemetry class
- Local file-based trace storage

### ⚠️ Gaps to Address (See [OTEL_GAPS_AND_PLAN.md](./OTEL_GAPS_AND_PLAN.md))
- Video streaming endpoint instrumentation
- S3 operation tracing
- Upload pipeline visibility
- GoHighLevel API tracking
- Production sampling strategy
- Log correlation with trace IDs

## 📞 Support

For questions or issues:
1. Check the trace viewer for recent errors
2. Review relevant documentation file
3. Run the smoke test to verify basic functionality
4. Check collector logs for export issues

## 🔒 Security Notes

- No sensitive data (passwords, tokens) in traces
- User IDs included but no PII
- S3 signed URLs expire automatically
- Traces stored locally, not sent externally
