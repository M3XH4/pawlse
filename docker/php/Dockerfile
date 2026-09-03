# ==============================================================================
# Stage 1: Frontend Asset Compilation (Node.js 22 LTS)
# ==============================================================================
FROM node:22-alpine AS frontend-builder

WORKDIR /app

# Install npm dependencies using lockfile
COPY package.json package-lock.json ./
RUN npm ci

# Copy application assets, TypeScript configs, and PHP routes/templates for Wayfinder/Vite
COPY vite.config.ts tsconfig.json components.json ./
COPY resources ./resources
COPY routes ./routes
COPY app ./app
COPY config ./config

# Build production frontend bundle into public/build
RUN npm run build

# ==============================================================================
# Stage 2: Composer Dependency Installation
# ==============================================================================
FROM composer:2 AS composer-builder

WORKDIR /app

COPY composer.json composer.lock ./

RUN composer install \
    --no-dev \
    --no-interaction \
    --prefer-dist \
    --optimize-autoloader \
    --no-scripts \
    --ignore-platform-reqs

# ==============================================================================
# Stage 3: Production PHP-FPM Runtime Image
# ==============================================================================
FROM php:8.3-fpm-alpine AS production

# Install PHP extension installer helper
COPY --from=mlocati/php-extension-installer /usr/bin/install-php-extensions /usr/local/bin/

# Install essential system packages & PHP extensions
RUN apk add --no-cache \
        bash \
        curl \
        fcgi \
        su-exec \
        tzdata \
    && install-php-extensions \
        bcmath \
        exif \
        gd \
        intl \
        mbstring \
        opcache \
        pcntl \
        pdo_mysql \
        pdo_sqlite \
        redis \
        zip

# Copy PHP and PHP-FPM configuration
COPY docker/php/php.ini $PHP_INI_DIR/conf.d/99-pawlse.ini
COPY docker/php/www.conf /usr/local/etc/php-fpm.d/zz-pawlse.conf
COPY docker/php/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# Set working directory
WORKDIR /var/www/html

# Copy application codebase
COPY . .

# Copy vendor dependencies from composer-builder
COPY --from=composer-builder /app/vendor ./vendor

# Copy compiled frontend assets from frontend-builder
COPY --from=frontend-builder /app/public/build ./public/build

# Ensure correct permissions
RUN mkdir -p storage/logs \
             storage/framework/cache/data \
             storage/framework/sessions \
             storage/framework/views \
             storage/app/public \
             storage/app/private \
             storage/app/backups \
             bootstrap/cache \
    && chown -R www-data:www-data /var/www/html \
    && chmod -R 775 storage bootstrap/cache

EXPOSE 9000

ENTRYPOINT ["entrypoint.sh"]
CMD ["php-fpm"]

# ==============================================================================
# Stage 4: Development Image
# ==============================================================================
FROM production AS development

COPY --from=composer:2 /usr/bin/composer /usr/local/bin/composer

USER root
