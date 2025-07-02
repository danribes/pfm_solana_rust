#!/bin/bash
# SSL Monitoring Service Entrypoint
# Task 6.6.3: SSL/TLS Certificate Management & Security

set -euo pipefail

# Initialize logging
exec > >(tee -a /var/log/ssl-monitor/entrypoint.log)
exec 2>&1

echo "[$(date)] Starting SSL monitoring service..."

# Wait for certificates to be available
while [[ ! -d /etc/letsencrypt/live ]]; do
    echo "[$(date)] Waiting for certificates directory..."
    sleep 30
done

# Start monitoring based on command
case "${1:-monitor}" in
    "monitor")
        echo "[$(date)] Starting continuous SSL monitoring..."
        while true; do
            /usr/local/bin/ssl-scripts/certificate-monitor.sh check
            sleep "${CHECK_INTERVAL:-3600}"
        done
        ;;
    "check")
        echo "[$(date)] Running one-time SSL check..."
        /usr/local/bin/ssl-scripts/certificate-monitor.sh check
        ;;
    "test")
        echo "[$(date)] Running SSL monitoring test..."
        /usr/local/bin/ssl-scripts/certificate-monitor.sh test-notifications
        ;;
    *)
        echo "Usage: $0 [monitor|check|test]"
        exit 1
        ;;
esac
