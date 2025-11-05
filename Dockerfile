# frontend/Dockerfile
FROM node:22-alpine AS build

WORKDIR /app

# Accept build arguments for environment variables
ARG VITE_API_BASE_URL
ARG VITE_BASE_URL

# Set environment variables during build
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_BASE_URL=$VITE_BASE_URL

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source files
COPY . .

# Build the application
RUN npx vite build

# Production stage
FROM nginx:alpine

# Install curl for health checks
RUN apk add --no-cache curl

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built files from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:80 || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]