# 🧭 Debugging & Capstone Defense Guide

This directory contains the master debugging strategies, architectural blueprints, and capstone proposal/defense cheat sheets for the **PAWLSE** application.

---

## 📚 Table of Contents

1. **[[Capstone Defense Cheat Sheet]]**
   * High-stakes architectural cross-examinations (Monolith vs Microservices, Inertia vs REST).
   * Data integrity, race conditions (`lockForUpdate`), soft deletes, and DPA 2012 compliance.
   * AI matching metrics (Precision, Recall, Confusion Matrix) and fake receipt defense.
   * 24 scenario walkthroughs across the 8 primary core modules.
   * Panel trap handling and live demo error recovery protocol.

2. **[[Sub-Modules & Supporting Systems Defense]]**
   * **12 Supporting & Optional Sub-Modules**:
     1. Unified Public Tracking (`/track`) & ID Collision Prevention
     2. Help Desk Ticketing, Priority SLAs & FAQ Deflection
     3. Educational Resources & Hotlink-Protected Downloads
     4. Community Blog, SEO Slugs & Reaction Spam Throttling
     5. Partner & Corporate Sponsor Management (MOA Expirations)
     6. Community Honor Board & Anonymous Donor Toggles
     7. Feeding Schedules, Street Routes & Food Runway Sustainability Math
     8. Safe Role Switching & Impersonation Auditability
     9. Cryptographically Signed URLs (`middleware('signed')`) for Certificates
     10. Pet Bookmarks & Watchlist Status Notification Triggers
     11. Contact Form Honey-pots & Rate-Limiting Protection
     12. Database Backups, Long-Term Archival & Offsite Cloud Storage

3. **[[System Debugging Map]]**
   * Systematic diagnostic workflow for finding and fixing bugs quickly.
   * Frontend (Inertia v3 + React + Wayfinder + Tailwind).
   * Backend (Laravel 12/13 + Herd + Pest).
   * Realtime WebSockets (Laravel Reverb + Echo).
   * Webhooks & Integrations (n8n, PayMongo / PayPal / Maya / GCash, AI services).

4. **[[Config and Settings Reference]]**
   * Complete inventory of configurable parameters.
   * Runtime UI settings via Super Admin (`SystemSetting`).
   * Environment variables (`.env`) and config files (`config/donations.php`, `config/services.php`).

---

## ⚡ The 3 Golden Rules for Defense Day

1. **Values & Limits are Config-Driven**: When asked about changing prices, sponsorship costs, file limits, or AI thresholds, demonstrate that these are decoupled from code into `config/` or the `SystemSetting` database table.
2. **Workflows are Enum & Policy Driven**: When asked to add lifecycle steps (e.g. extra adoption stages), demonstrate that statuses are governed by PHP 8.5 Enums and authorization is encapsulated in Laravel Policies.
3. **Decoupled Architecture**: Controllers orchestrate HTTP requests, Policies guard authorization, Services handle business/AI computation, and Observers emit real-time events.
