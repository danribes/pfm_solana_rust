# Task 7.1.1: Public Landing Page Development
# Simplified Dockerfile for development testing

FROM node:18-alpine

WORKDIR /app

# Install curl for health checks
RUN apk add --no-cache curl

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for development)
RUN npm install

# Copy all source files
COPY . .

# Create a simple entrypoint script
RUN echo '#!/bin/sh' > /entrypoint.sh && \
    echo 'npm run dev' >> /entrypoint.sh && \
    chmod +x /entrypoint.sh

EXPOSE 3003

# Health check for container monitoring
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:3003/api/health || exit 1

CMD ["/entrypoint.sh"]
