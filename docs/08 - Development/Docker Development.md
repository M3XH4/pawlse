# 🐳 Docker Development Guide

This guide provides practical instructions for developing, building, and operating **PAWLSE** using Docker.

---

## 📋 Prerequisites

- [Docker Engine](https://docs.docker.com/engine/install/) (v24.0 or later)
- [Docker Compose](https://docs.docker.com/compose/) (v2.20 or later)
- Git

---

## 🚀 Quick Start (Development Mode)

### 1. Environment Configuration
Create a local `.env` file from `.env.example`:
```bash
cp .env.example .env
```
Ensure database and redis hosts are set to container service names:
```env
DB_CONNECTION=mysql
DB_HOST=mysql
DB_PORT=3306
DB_DATABASE=pawlse
DB_USERNAME=pawlse_user
DB_PASSWORD=pawlse_secret
DB_ROOT_PASSWORD=root_secret

REDIS_HOST=redis
REDIS_PORT=6379
```

### 2. Start the Development Stack
```bash
docker compose up -d
```
This boots:
- **`app`**: PHP-FPM container with source code bind-mounted for live reloading.
- **`nginx`**: Web server available on `http://localhost:8000`.
- **`mysql`**: MySQL 8.0 on `localhost:3306`.
- **`redis`**: Redis 7.0 on `localhost:6379`.
- **`queue`**: Live queue listener (`php artisan queue:listen`).

### 3. Initialize Laravel Application
```bash
# Generate application key
docker compose exec app php artisan key:generate

# Run database migrations and seeders
docker compose exec app php artisan migrate --seed

# Symlink storage directory
docker compose exec app php artisan storage:link
```

Visit **`http://localhost:8000`** in your browser.

---

## 🏗️ Production Stack Simulation

To test the production multi-stage immutable build locally:

### 1. Build Production Images
```bash
docker compose -f compose.production.yaml build
```

### 2. Start Production Containers
```bash
docker compose -f compose.production.yaml up -d
```

### 3. Run Production Migrations & Optimizations
```bash
docker compose -f compose.production.yaml exec app php artisan migrate --force
docker compose -f compose.production.yaml exec app php artisan optimize
```

Access the application at **`http://localhost`** (Port 80).

---

## 🛠️ Common Operations

### Executing Artisan Commands
Run any Laravel artisan command inside the running PHP container:
```bash
docker compose exec app php artisan <command>

# Examples:
docker compose exec app php artisan route:list
docker compose exec app php artisan migrate:status
docker compose exec app php artisan tinker
```

### Managing Composer Dependencies
```bash
# Install a new PHP package
docker compose exec app composer require vendor/package

# Update dependencies
docker compose exec app composer update
```

### Managing Frontend Dependencies & Assets
```bash
# Install npm package
docker compose exec app npm install <package>

# Build assets manually
docker compose exec app npm run build
```

### Inspecting Service Logs
```bash
# View all logs in real-time
docker compose logs -f

# View specific service logs
docker compose logs -f app
docker compose logs -f nginx
docker compose logs -f mysql
docker compose logs -f queue
```

### Checking Service Health & Status
```bash
docker compose ps
```

### Stopping & Restarting Services
```bash
# Stop containers without removing volumes
docker compose stop

# Start stopped containers
docker compose start

# Bring down containers and networks (preserves volumes)
docker compose down

# Bring down containers AND wipe persistent data volumes (CAUTION)
docker compose down -v
```

---

## 🧪 Running Tests in Docker

Execute Pest test suite inside the container:
```bash
docker compose exec app php artisan test --compact
```

---

## 🔍 Troubleshooting & FAQs

### 1. Storage Permission Denied
If you see permission errors writing to `storage/` or `bootstrap/cache`:
```bash
docker compose exec -u root app chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache
docker compose exec -u root app chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache
```

### 2. Database Connection Refused
- Ensure the `mysql` container is healthy (`docker compose ps`).
- Verify `DB_HOST=mysql` is set in `.env` (not `127.0.0.1` inside containers).
- Check MySQL logs: `docker compose logs mysql`.

### 3. Vite Assets Not Updating in Production Image
Production images embed compiled assets from the build stage. To reflect frontend code changes in production mode, rebuild the image:
```bash
docker compose -f compose.production.yaml build --no-cache
docker compose -f compose.production.yaml up -d
```

---

## 🔗 Related Documentation
- [[Container Architecture]]
- [[Development Setup]]
- [[Development Workflow]]
- [[Deployment]]
