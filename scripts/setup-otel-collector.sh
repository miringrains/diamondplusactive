#!/bin/bash

# Script to set up OpenTelemetry Collector

echo "Setting up OpenTelemetry Collector..."

# Create directory for OTEL
mkdir -p /opt/otel-collector
cd /opt/otel-collector

# Download OpenTelemetry Collector
echo "Downloading OpenTelemetry Collector..."
wget -q https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/v0.102.1/otelcol_0.102.1_linux_amd64.tar.gz

# Extract
echo "Extracting..."
tar -xzf otelcol_0.102.1_linux_amd64.tar.gz

# Create a basic configuration
cat > config.yaml << 'EOF'
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
      http:
        endpoint: 0.0.0.0:4318

processors:
  batch:
    timeout: 1s
    send_batch_size: 1024

exporters:
  debug:
    verbosity: detailed
  file:
    path: /var/log/otel-collector/traces.json
    rotation:
      max_megabytes: 10
      max_days: 3
      max_backups: 3
      localtime: true

service:
  pipelines:
    traces:
      receivers: [otlp]
      processors: [batch]
      exporters: [debug, file]
    metrics:
      receivers: [otlp]
      processors: [batch]
      exporters: [debug, file]
EOF

# Create log directory
mkdir -p /var/log/otel-collector

# Create systemd service
cat > /etc/systemd/system/otel-collector.service << 'EOF'
[Unit]
Description=OpenTelemetry Collector
After=network.target

[Service]
Type=simple
User=root
ExecStart=/opt/otel-collector/otelcol --config=/opt/otel-collector/config.yaml
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

echo "OpenTelemetry Collector installed!"
echo ""
echo "To start the collector:"
echo "  systemctl daemon-reload"
echo "  systemctl start otel-collector"
echo "  systemctl enable otel-collector"
echo ""
echo "To check status:"
echo "  systemctl status otel-collector"
echo ""
echo "Traces will be saved to: /var/log/otel-collector/traces.json"
