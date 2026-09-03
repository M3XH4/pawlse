# 💻 Development Setup

This guide provides instructions for setting up, running, and developing the **PAWLSE** application locally.

---

## 📋 Prerequisites

Ensure the following dependencies are installed on your workstation:

- **PHP**: `^8.3` or `8.5` (with extensions: `pdo_mysql`, `mbstring`, `openssl`, `bcmath`, `curl`, `gd`, `fileinfo`)
- **Composer**: `^2.7.0`
- **Node.js**: `^20.x` or `^22.x` (LTS)
- **NPM** / **pnpm**
- **MySQL**: `^8.0`
- **Laravel Herd** (Recommended for macOS/Windows) or Docker/Sail

---

## 🚀 Quickstart Installation

Follow these steps to clone and initialize the local development environment:

### 1. Clone the Repository
```bash
git clone <repository-url> pawlse
cd pawlse
```

### 2. Install Backend Dependencies
```bash
composer install
```

### 3. Environment Configuration
Copy the example environment file:
```bash
cp .env.example .env
```
Generate the application encryption key:
```bash
php artisan key:generate
```

Configure your local database in `.env`:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=pawlse
DB_USERNAME=root
DB_PASSWORD=
```

### 4. Database Migrations & Seeding
Run migrations and populate seeders for roles, test users, animals, and system settings:
```bash
php artisan migrate:fresh --seed
```

> [!NOTE]
> Default seeded test accounts:
> - **Super Admin**: `superadmin@pawlse.test` (Password: `password`)
> - **Admin**: `admin@pawlse.test` (Password: `password`)
> - **Volunteer**: `volunteer@pawlse.test` (Password: `password`)
> - **User**: `user@pawlse.test` (Password: `password`)

### 5. Storage Symlink
Create the public storage symlink for uploaded pet photos, adoption documents, and payment receipts:
```bash
php artisan storage:link
```

### 6. Install Frontend Dependencies
```bash
npm install
```

---

## 🏃 Running the Application

### Development Mode (Concurrent)
Run the complete development stack (Laravel HTTP server, Queue listener, and Vite HMR):
```bash
npm run dev
# or with composer:
composer run dev
```

If using **Laravel Herd**:
- The backend is automatically served at `http://pawlse.test`
- Run the Vite dev server in a terminal:
```bash
npm run dev
```

---

## 🧪 Quality Assurance & Scripts

| Command | Purpose |
|---|---|
| `npm run lint` | Run ESLint with auto-fix across TypeScript/React files |
| `npm run lint:check` | Check TypeScript/React code without modifying |
| `npm run format` | Run Prettier formatter on `resources/` |
| `npm run types:check` | Verify TypeScript compilation (`tsc --noEmit`) |
| `vendor/bin/pint --format agent` | Format PHP code using Laravel Pint |
| `php artisan test --compact` | Run Pest PHP test suite |
| `npm run build` | Compile production frontend assets |

---

## 🔗 Related Documentation
- [[Project Overview]]
- [[Technology Stack]]
- [[Development Workflow]]
- [[Testing]]
- [[Troubleshooting]]
