# 📦 Models

PAWLSE features 29 Eloquent models defined in `app/Models/`, encapsulating domain logic, relationships, attribute casting, and lifecycle hooks.

---

## 📋 Comprehensive Model Index

| Model | Table | Key Relationships & Description |
|---|---|---|
| **`User`** | `users` | Core authenticatable user. Has roles (Spatie), OTP verification, 2FA, has many `volunteerApplications`, `assignedTasks`, `certificates`, `petReports`, `auditLogs`. |
| **`PetReport`** | `pet_reports` | Rescue and missing pet reports. Belongs to `user`, `assignedVolunteer`, `aiPredictionLog`, `duplicateOf`. Has many `photos`, `duplicates`, `assignedTasks`. Contains geospatial duplicate detection hook. |
| **`PetReportPhoto`** | `pet_report_photos` | Photos uploaded with a rescue report. Belongs to `petReport`. |
| **`ShelterAnimal`** | `shelter_animals` | Animals housed in the shelter ready for or undergoing adoption. Has many `adoptionApplications`, `animalDonationNeeds`. Supports soft deletes. |
| **`AnimalDonationNeed`**| `animal_donation_needs` | Specific medical/food supply targets linked to a pet. Belongs to `shelterAnimal`. |
| **`AdoptionApplication`**| `adoption_applications`| Formal adoption requests submitted by users. Belongs to `user`, `shelterAnimal`, `reviewedBy`. Has many `files`. |
| **`AdoptionApplicationFile`**| `adoption_application_files`| Valid IDs, proof of income, and home environment photos. Belongs to `adoptionApplication`. |
| **`Donation`** | `donations` | Master donation record (cash, in-kind, sponsorship). Belongs to `user`, `payment`, `inKindDonation`, `feedingSponsorship`, `verifiedBy`. Has many `statusHistories`, `auditLogs`. |
| **`Payment`** | `payments` | Monetary payment ledger record. Belongs to `user`. Has one `donation`, `paymentProof`. |
| **`PaymentProof`** | `payment_proofs` | Receipt screenshot and transaction reference. Belongs to `payment`, `verifiedBy`. |
| **`PaymentWebhookEvent`**| `payment_webhook_events`| Raw audit trail of third-party gateway webhooks. |
| **`InKindDonation`** | `in_kind_donations` | Non-monetary donation items (pet food, medicine, cages). Belongs to `inventoryItem`. Has one `donation`. |
| **`FeedingSponsorship`**| `feeding_sponsorships` | Direct sponsorships for feeding schedules or animals. Belongs to `feedingSchedule`. Has one `donation`. |
| **`DonationStatusHistory`**| `donation_status_histories`| Immutable timeline of donation review status changes. Belongs to `donation`, `changedBy`. |
| **`DonationAuditLog`** | `donation_audit_logs` | Audit trail for changes to donation records. Belongs to `donation`, `user`. |
| **`InventoryItem`** | `inventory_items` | Tracked shelter supplies. Has many `batches`, `logs`. |
| **`InventoryBatch`** | `inventory_batches` | Item batches with specific expiration dates, quantities, and statuses (`good`, `low`, `critical`, `depleted`). Belongs to `inventoryItem`. |
| **`InventoryLog`** | `inventory_logs` | Stock adjustment and usage logs. Belongs to `inventoryItem`, `user`. |
| **`VolunteerApplication`**| `volunteer_applications`| User applications to join shelter volunteer ranks. Belongs to `user`, `reviewedBy`. |
| **`AssignedTask`** | `assigned_tasks` | Rescue, feeding, or event tasks assigned to volunteers. Belongs to `user` (volunteer), `petReport`, `assignedBy`. |
| **`Certificate`** | `certificates` | Digital recognition certificates issued to volunteers. Belongs to `user` (volunteer), `issuedBy`. |
| **`Event`** | `events` | Community events, adoption drives, and fundraisers. Has many `attendees`. |
| **`FeedingSchedule`** | `feeding_schedules` | Scheduled stray feeding routes. Belongs to `coordinator`. Has many `sponsorships`. |
| **`AuditLog`** | `audit_logs` | System-wide audit log recording `action`, `model_type`, `model_id`, `changes`, `ip_address`, `user_agent`. Belongs to `user`. |
| **`LoginAttempt`** | `login_attempts` | Auth attempt monitoring table (`email`, `ip_address`, `status`, `user_agent`). |
| **`AiPredictionLog`** | `ai_prediction_logs` | Log of AI image classifications (`input_data`, `output_data`, `confidence`, `is_accurate`). |
| **`Backup`** | `backups` | Database snapshot files (`filename`, `disk`, `size_bytes`, `type`, `status`). |
| **`SystemSetting`** | `system_settings` | Key-value configuration store with helper `SystemSetting::getValue($key, $default)`. |
| **`IdempotencyRecord`**| `idempotency_records`| Prevents duplicate payments and concurrent webhooks. |

---

## 🔗 Related Documentation
- [[Database Overview]]
- [[Tables]]
- [[Relationships]]
- [[Migrations]]
- [[Controllers]]
