# Member Portal Dockerfile for PFM Community Management

FROM node:18-alpine

# Set environment variables
ENV NODE_ENV=development
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3002

# Create app directory
WORKDIR /app

# Install dependencies for native modules and health checks
RUN apk add --no-cache \
    curl \
    bash

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy shared components and types (wallet infrastructure)
COPY ../shared /shared

# Copy application code
COPY . .

# Create symbolic link to shared components for wallet infrastructure
RUN ln -sf /shared ./node_modules/@pfm/shared

# Create non-root user for security
RUN addgroup -g 1001 -S nextjs && \
    adduser -S nextjs -u 1001

# Change ownership of app directory
RUN chown -R nextjs:nextjs /app
USER nextjs

# Expose port
EXPOSE 3002

# Health check endpoint
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:3002/api/health || exit 1

# Start the member portal with container-specific settings
CMD ["npm", "run", "dev:container"] 