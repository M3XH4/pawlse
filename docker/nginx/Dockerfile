# ==============================================================================
# Stage 1: Frontend Asset Compilation (Node.js 22 LTS - glibc)
# ==============================================================================
FROM node:22-slim AS frontend-builder

WORKDIR /app

# Install npm dependencies using lockfile
COPY package.json package-lock.json* ./
RUN npm install --no-audit --no-fund

# Copy full application codebase
COPY . .

# Set DOCKER_BUILD flag so Wayfinder utilizes generated types during asset bundling
ENV DOCKER_BUILD=1

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
