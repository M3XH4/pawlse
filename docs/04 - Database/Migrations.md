# 📜 Migrations

The database structure in PAWLSE is version-controlled via 31 sequential Laravel migration files located in `database/migrations/`.

---

## 📋 Migration Execution Timeline

```mermaid
timeline
    title Database Evolution
    Base Setup : 0001_01_01_000000_create_users_table
               : 0001_01_01_000001_create_cache_table
               : 0001_01_01_000002_create_jobs_table
    Auth & RBAC: 2025_08_14_add_two_factor_columns_to_users_table
               : 2026_08_24_add_role_to_users_table
               : 2026_08_25_create_permission_tables
               : 2026_08_25_add_email_verification_otp_fields_to_users_table
    Donations & Adoptions : 2026_08_25_create_donation_tables
                          : 2026_08_25_create_adoption_applications_table
                          : 2026_08_25_add_adoption_fields_to_shelter_animals_table
                          : 2026_08_25_create_adoption_application_files_table
    Volunteers & Inventory: 2026_08_25_create_events_table
                          : 2026_08_25_create_volunteer_applications_table
                          : 2026_08_25_create_feeding_schedules_table
                          : 2026_08_25_create_certificates_table
                          : 2026_08_25_create_assigned_tasks_table
                          : 2026_08_25_create_inventory_tables
    Rescues & Pet Reports : 2026_08_25_create_pet_reports_table
                          : 2026_08_25_create_pet_report_photos_table
    Governance & AI       : 2026_08_25_create_audit_logs_table
                          : 2026_08_25_create_system_settings_table
                          : 2026_08_25_create_ai_prediction_logs_table
                          : 2026_08_25_create_login_attempts_table
                          : 2026_08_25_add_soft_deletes_to_tables
                          : 2026_08_25_create_backups_table
                          : 2026_08_26_add_ai_fields_to_pet_reports_table
                          : 2026_08_29_create_inventory_batches_table
```

---

## 🛠️ Common Migration Commands

| Command | Description |
|---|---|
| `php artisan migrate` | Run outstanding database migrations |
| `php artisan migrate:status` | Check the execution status of all migrations |
| `php artisan migrate:fresh --seed` | Wipe database, rerun all migrations, and seed sample records |
| `php artisan migrate:rollback` | Roll back the last migration batch |

---

## 🔗 Related Documentation
- [[Database Overview]]
- [[Schema]]
- [[Tables]]
- [[Development Setup]]
