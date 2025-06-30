FROM node:18-alpine

# Install necessary packages
RUN apk add --no-cache \
    curl \
    ca-certificates \
    supervisor

WORKDIR /app

# Create package.json for log shipper
COPY package*.json ./
RUN npm ci --only=production

# Copy application files
COPY . .

# Create necessary directories
RUN mkdir -p /var/log/supervisor

# Copy supervisor configuration
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Set proper permissions
RUN chmod +x ./log-shipper.js

# Create non-root user
RUN addgroup -g 1001 -S logshipper && \
    adduser -S logshipper -u 1001 -G logshipper

USER logshipper

EXPOSE 3002

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"] 