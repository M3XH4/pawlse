# 📑 Database Tables Reference

Below is the complete dictionary of database tables in the PAWLSE ecosystem.

---

## 📋 Master Table Directory

| Table Name | Entity Represented | Soft Delete? | Primary Index |
|---|---|---|---|
| `users` | User Accounts & Authentication Credentials | Yes (`deleted_at`) | `id` (BIGINT) |
| `roles` | Spatie RBAC Roles (`user`, `volunteer`, `admin`, `super-admin`) | No | `id` |
| `permissions` | Spatie System Permissions | No | `id` |
| `model_has_roles` | User-to-Role pivot | No | `(role_id, model_type, model_id)` |
| `login_attempts` | Security & Failed Login Monitoring | No | `id` |
| `pet_reports` | Rescue, Missing, Found, and SOS Reports | Yes (`deleted_at`) | `id` |
| `pet_report_photos`| Uploaded rescue incident photos | No | `id` |
| `ai_prediction_logs`| AI Classification Logs & Accuracy Ratings | No | `id` |
| `shelter_animals` | In-Shelter Animals for Adoption | Yes (`deleted_at`) | `id` |
| `animal_donation_needs`| Dedicated supply/medical goals for pets | No | `id` |
| `adoption_applications`| Multi-step adoption applications | Yes (`deleted_at`) | `id` |
| `adoption_application_files`| Attached verification documents (IDs, proofs)| No | `id` |
| `donations` | Master ledger for Cash, In-Kind, Sponsorship | Yes (`deleted_at`) | `id` |
| `payments` | Financial payment transactions | No | `id` |
| `payment_proofs` | Receipt images uploaded for manual review | No | `id` |
| `in_kind_donations` | Donated items (kibble, vitamins, cages) | No | `id` |
| `feeding_sponsorships`| Direct sponsorships of routes/animals | No | `id` |
| `donation_status_histories`| Status audit trail for donations | No | `id` |
| `donation_audit_logs`| Granular attribute modification log | No | `id` |
| `inventory_items` | Tracked medical & food stock items | Yes (`deleted_at`) | `id` |
| `inventory_batches`| Batches with expiration dates and quantities | No | `id` |
| `inventory_logs` | Stock level addition/depletion ledger | No | `id` |
| `volunteer_applications`| User applications to become volunteers | No | `id` |
| `assigned_tasks` | Assigned rescue, feeding, and shelter tasks | No | `id` |
| `certificates` | Certificates of appreciation issued | No | `id` |
| `events` | Community events & adoption drives | Yes (`deleted_at`) | `id` |
| `feeding_schedules`| Stray feeding routes & timetables | No | `id` |
| `audit_logs` | Platform-wide operational audit log | No | `id` |
| `system_settings` | Dynamic JSON configuration pairs | No | `id` |
| `backups` | Database backup metadata & files | No | `id` |
| `notifications` | Database notifications table | No | `id` (UUID) |

---

## 🔗 Related Documentation
- [[Database Overview]]
- [[Schema]]
- [[Relationships]]
- [[Migrations]]
