# 🗄️ Database Overview

PAWLSE uses **MySQL 8.0+** as its primary relational database management system, configured for ACID compliance, referential integrity, and performant indexing.

---

## 🏛️ Database Architecture

```mermaid
erDiagram
    USERS ||--o{ PET_REPORTS : reports
    USERS ||--o{ ADOPTION_APPLICATIONS : submits
    USERS ||--o{ VOLUNTEER_APPLICATIONS : submits
    USERS ||--o{ ASSIGNED_TASKS : performs
    USERS ||--o{ DONATIONS : makes
    USERS ||--o{ CERTIFICATES : receives
    USERS ||--o{ AUDIT_LOGS : triggers

    SHELTER_ANIMALS ||--o{ ADOPTION_APPLICATIONS : has
    SHELTER_ANIMALS ||--o{ ANIMAL_DONATION_NEEDS : requires

    PET_REPORTS ||--o{ PET_REPORT_PHOTOS : contains
    PET_REPORTS ||--o{ ASSIGNED_TASKS : generates
    PET_REPORTS ||--o| AI_PREDICTION_LOGS : references

    DONATIONS ||--o| PAYMENTS : processes
    DONATIONS ||--o| IN_KIND_DONATIONS : tracks
    DONATIONS ||--o| FEEDING_SPONSORSHIPS : sponsors
    DONATIONS ||--o{ DONATION_STATUS_HISTORIES : tracks

    INVENTORY_ITEMS ||--o{ INVENTORY_BATCHES : groups
    INVENTORY_ITEMS ||--o{ INVENTORY_LOGS : records

    EVENTS ||--o{ FEEDING_SCHEDULES : coordinates
```

---

## 🔑 Key Database Characteristics

1. **Strict Foreign Keys & Cascade Integrity**: Foreign key constraints protect relational integrity across applications, payments, assigned tasks, and logs.
2. **Soft Deletion Architecture**: Core tables (`users`, `shelter_animals`, `pet_reports`, `adoption_applications`, `donations`, `events`, `inventory_items`) implement Laravel `SoftDeletes` (`deleted_at` timestamp). This supports safe archiving, restoration, and permanent deletion by Super Admins.
3. **Audit Logging & Immutability**: Critical security logs (`audit_logs`, `login_attempts`, `ai_prediction_logs`, `donation_status_histories`) maintain immutable transaction histories.
4. **Geospatial & Index Optimizations**: Spatial coordinate lookup and composite indexes on `(animal_type, status, created_at)` enable fast Haversine distance duplicate checking.

---

## 🔗 Related Documentation
- [[Schema]]
- [[Tables]]
- [[Relationships]]
- [[Migrations]]
- [[Super Admin Features|Archives & Backups]]
