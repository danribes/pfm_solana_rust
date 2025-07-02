# SSL Monitoring Service Dockerfile
# Task 6.6.3: SSL/TLS Certificate Management & Security

FROM alpine:3.18

# Install required packages
RUN apk add --no-cache \
    bash \
    curl \
    openssl \
    jq \
    ca-certificates \
    tzdata \
    python3 \
    py3-pip \
    && rm -rf /var/cache/apk/*

# Install Python packages for SSL monitoring
RUN pip3 install --no-cache-dir \
    requests \
    pyyaml \
    cryptography

# Create monitoring user
RUN addgroup -g 1000 sslmonitor && \
    adduser -D -u 1000 -G sslmonitor sslmonitor

# Create necessary directories
RUN mkdir -p /var/log/ssl-monitor \
             /var/lib/ssl-metrics \
             /etc/ssl-monitor \
             /usr/local/bin/ssl-scripts && \
    chown -R sslmonitor:sslmonitor /var/log/ssl-monitor \
                                   /var/lib/ssl-metrics \
                                   /etc/ssl-monitor

# Copy monitoring scripts
COPY scripts/ssl/ /usr/local/bin/ssl-scripts/
COPY infra/ssl/monitoring/entrypoint.sh /entrypoint.sh

# Make scripts executable
RUN chmod +x /usr/local/bin/ssl-scripts/*.sh \
             /entrypoint.sh

# Switch to monitoring user
USER sslmonitor

# Health check
HEALTHCHECK --interval=1h --timeout=30s --start-period=1m --retries=3 \
    CMD /usr/local/bin/ssl-scripts/certificate-monitor.sh check || exit 1

# Set working directory
WORKDIR /home/sslmonitor

# Entry point
ENTRYPOINT ["/entrypoint.sh"]
CMD ["monitor"]
