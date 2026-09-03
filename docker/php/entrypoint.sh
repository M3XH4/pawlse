#!/bin/sh
set -e

# Ensure required storage and bootstrap cache directories exist
mkdir -p /var/www/html/storage/app/public \
         /var/www/html/storage/app/private \
         /var/www/html/storage/app/backups \
         /var/www/html/storage/framework/cache/data \
         /var/www/html/storage/framework/sessions \
         /var/www/html/storage/framework/views \
         /var/www/html/storage/logs \
         /var/www/html/bootstrap/cache

# Create storage symlink if not already created
if [ ! -L /var/www/html/public/storage ]; then
    php artisan storage:link --quiet || true
fi

# Ensure correct permissions for www-data
chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache
chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# Execute the given CMD as www-data or root depending on container context
exec "$@"
