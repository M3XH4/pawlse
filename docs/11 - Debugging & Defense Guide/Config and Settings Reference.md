# ⚙️ Config and Settings Reference

This document catalogs all configurable parameters in PAWLSE, distinguishing between runtime UI settings (Super Admin), environment variables (`.env`), and application config files (`config/*.php`).

---

## 🎛️ 1. Runtime UI Settings (`SystemSetting` Model)

These parameters are stored in the database and can be edited live via the Super Admin Dashboard without code deployments or server restarts.

### AI Configuration (`/super-admin/ai-configuration`)
Key in DB: `ai_settings`

| Parameter | Type | Default | Description |
|---|---|---|---|
| `ai_enabled` | `boolean` | `true` | Master switch for all AI inference features. |
| `ai_reporting_enabled` | `boolean` | `true` | Enables AI suggestions during citizen pet report submission. |
| `ai_identifying_enabled`| `boolean` | `true` | Enables automatic breed/species identification from photos. |
| `ai_confidence_threshold` | `float` | `0.70` | Confidence cutoff (0.0 to 1.0). Matches below this require manual admin triage. |
| `ai_auto_validation` | `boolean` | `false` | When true, matches exceeding threshold are automatically approved without human review. |

### System Settings (`/super-admin/system-settings`)
Key in DB: `system_settings`

| Parameter | Type | Default | Description |
|---|---|---|---|
| `app_name` | `string` | `PAWLSE` | Organization / branding name shown across headers and emails. |
| `contact_email` | `string` | `support@pawlse.test` | Support email displayed in contact modals and footer. |
| `contact_phone` | `string` | `09123456789` | Emergency hotline number. |
| `registration_enabled`| `boolean`| `true` | When false, new user registrations are temporarily suspended. |
| `maintenance_mode` | `boolean` | `false` | Puts the public app in read-only/maintenance banner mode. |

---

## 💳 2. Financial & Payment Configuration (`config/donations.php`)

All donation, payment gateway, and sponsorship parameters are defined in `config/donations.php` and can be overridden via `.env`.

| Config Key | Env Variable | Default | Purpose |
|---|---|---|---|
| `currency` | `DONATION_CURRENCY` | `'PHP'` | Currency code for receipts and displays. |
| `feeding_day_amount` | `DONATION_FEEDING_DAY_AMOUNT` | `3500` | Target cost (in ₱) for a full 1-day stray feeding sponsorship. |
| `monthly_goal_amount` | `DONATION_MONTHLY_GOAL_AMOUNT` | `50000` | Monthly campaign goal displayed on the progress bar. |
| `proof_max_kilobytes` | `DONATION_PROOF_MAX_KB` | `5120` (5MB) | Maximum allowed file size for donor payment receipt uploads. |

### Payment Methods Array (`payment_methods`)
Each payment method (GCash, Bank Transfer, PayPal, Maya) has modular settings:
- `enabled`: `boolean` (toggle method on/off in checkout)
- `label`: Display name
- `account_name`: Official account title (e.g. "Iligan Stray Feeders")
- `account_number_masked`: Display masked number (e.g. `093* ****547`)
- `account_number`: Raw number for clipboard copy
- `qr_url`: Asset URL for QR image (e.g. `/images/gcash-qr.jpg`)

---

## 🔐 3. Authentication & Roles (`app/Enums/Role.php`)

User permissions are governed by Spatie Laravel-Permission seeded via `RoleSeeder.php`:

| Role Name | Identifier | Intended Responsibilities |
|---|---|---|
| **Super Admin** | `super_admin` | Full system control: AI thresholds, user management, audit logs, backups, system settings. |
| **Admin** | `admin` | Shelter operations: Review adoptions, verify donations, manage shelter animals & rescues. |
| **Volunteer** | `volunteer` | Fieldwork: Event participation, task tracking, community outreach. |
| **Adopter / Public** | `adopter` / `user` | Citizens: Submit adoptions, file rescue/missing reports, sponsor meals, donate. |
