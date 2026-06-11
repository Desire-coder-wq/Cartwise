# Multi-stage build for optimal size
FROM node:18-alpine AS build-stage

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build with production API URL
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# Production stage with nginx
FROM nginx:alpine

# Install curl for healthcheck
RUN apk add --no-cache curl

# Copy custom nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built files
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Create health check endpoint
RUN echo '{"status":"ok"}' > /usr/share/nginx/html/health.json

EXPOSE 80

# FIXED: Changed --cmd to CMD (no dash)
HEALTHCHECK --interval=30s --timeout=3s CMD curl -f http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]