# Build stage
FROM node:20-alpine as build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production
RUN npm install @rollup/rollup-linux-arm64-musl --save-dev

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine as production

# Install curl for health checks
RUN apk add --no-cache curl && \
    rm -rf /var/cache/apk/*

# Copy built assets from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:80 || exit 1

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
