# ==============================================================================
# Stage 1: Frontend Asset Compilation (Node.js 22 LTS)
# ==============================================================================
FROM node:22-alpine AS frontend-builder

WORKDIR /app

# Install npm dependencies using lockfile
COPY package.json package-lock.json ./
RUN npm ci

# Copy application assets and TypeScript configs for Vite
COPY vite.config.ts tsconfig.json components.json ./
COPY resources ./resources
COPY routes ./routes
COPY app ./app
COPY config ./config

# Build production assets into public/build
RUN npm run build

# ==============================================================================
# Stage 2: Nginx Web Server
# ==============================================================================
FROM nginx:alpine

# Copy Nginx virtual host configuration
COPY docker/nginx/default.conf /etc/nginx/conf.d/default.conf

# Copy public directory and compiled assets
COPY public /var/www/html/public
COPY --from=frontend-builder /app/public/build /var/www/html/public/build

# Set correct permissions
RUN chown -R nginx:nginx /var/www/html/public \
    && chmod -R 755 /var/www/html/public

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
