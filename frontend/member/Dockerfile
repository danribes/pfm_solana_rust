# Member Portal Dockerfile for PFM Community Management

FROM node:20-alpine

# Set environment variables
ENV NODE_ENV=development
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3002

# Create app directory
WORKDIR /app

# Install dependencies for native modules and health checks
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    linux-headers \
    eudev-dev \
    curl \
    bash

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy application code
COPY . .

# Change ownership of app directory
RUN chown -R node:node /app
USER node

# Expose port
EXPOSE 3002

# Simple health check for development
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:3002/ || exit 1

# Start the member portal with container-specific settings
CMD ["npm", "run", "dev:container"] 