# n8n Integration Guide

This guide describes the API contracts, webhook specifications, environment configurations, and workflow structures connecting Pawlse and n8n.

---

## 1. Environment Configuration

The following environment variables configure the n8n integration in `.env`:

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `N8N_ENABLED` | Global toggle to enable/disable outbound webhooks | `true` (prod) / `false` (dev) |
| `N8N_BASE_URL` | Base URL of the n8n server | `http://n8n:5678` (Docker) or `http://localhost:5678` |
| `N8N_WEBHOOK_SECRET` | Shared secret key for HMAC-SHA256 signature signing | `[random-64-character-hex]` |
| `AUTOMATION_API_KEY` | Secret key required for inbound `/api/automation/*` calls | `[random-64-character-hex]` |
| `N8N_TIMEOUT` | HTTP request timeout in seconds | `5` |
| `N8N_RETRIES` | Max HTTP retry attempts before queuing failure | `3` |
| `FORWARD_N8N_PORT` | Local host port for accessing n8n UI | `5678` |

---

## 2. Inbound Automation Endpoints

All inbound automation endpoints require the `X-Automation-Key` header (or `Authorization: Bearer <key>`) and are rate-limited to 60 requests per minute.

### `GET /api/automation/statistics`
Provides aggregated summary statistics designed for scheduled reporting and analytics workflows.

#### Response Format (`200 OK`)
```json
{
  "status": "ok",
  "timestamp": "2026-09-03T15:30:00Z",
  "environment": "production",
  "summary": {
    "rescues": {
      "total": 48,
      "pending": 3,
      "in_progress": 2,
      "resolved": 43,
      "last_7_days": 6,
      "last_30_days": 21
    },
    "adoptions": {
      "total_applications": 32,
      "pending": 4,
      "approved": 24,
      "rejected": 4,
      "last_7_days": 3
    },
    "donations": {
      "total_cash_amount": 125400.0,
      "verified_cash_count": 58,
      "verified_inkind_count": 19,
      "last_7_days_cash_amount": 14500.0
    },
    "volunteers": {
      "active_count": 16,
      "pending_applications": 2,
      "approved_total": 16
    },
    "shelter_animals": {
      "total": 28,
      "available": 14,
      "adopted": 14
    }
  }
}
```

---

### `GET /api/automation/backup-status`
Provides database backup system health status for automated failure monitoring and administrator alerts.

#### Response Format (`200 OK`)
```json
{
  "status": "healthy",
  "timestamp": "2026-09-03T15:30:00Z",
  "is_healthy": true,
  "message": "Backup system is healthy.",
  "settings": {
    "auto_enabled": true,
    "interval": "daily",
    "retention_days": 30
  },
  "backups_summary": {
    "total_count": 14,
    "latest_backup": {
      "id": 14,
      "filename": "backup-mysql-2026-09-03_00-00-00.sql",
      "disk": "local",
      "size_bytes": 4829104,
      "size_formatted": "4.61 MB",
      "status": "completed",
      "created_at": "2026-09-03T00:00:05Z",
      "age_hours": 15
    }
  }
}
```

### `GET /api/automation/inventory-alerts`
Provides low stock alerts and expiring inventory batch warnings for automated shelter supply monitoring.

#### Response Format (`200 OK`)
```json
{
  "status": "ok",
  "timestamp": "2026-09-04T04:40:00Z",
  "has_alerts": true,
  "low_stock_count": 2,
  "expiring_batches_count": 1,
  "low_stock_items": [
    {
      "id": 1,
      "name": "Dog Kibble Adult (15kg)",
      "category": "Food",
      "quantity": 2,
      "min_threshold": 5,
      "unit": "bags"
    }
  ],
  "expiring_batches": []
}
```

---

## 3. Outbound Events & Webhooks

The following events are dispatched by Pawlse to n8n:

### 1. `volunteer.application.submitted`
- **Trigger**: Fired when a user submits a volunteer application (`VolunteerController@store`).
- **Endpoint**: `/webhook/pawlse/volunteer-submitted`
- **Data fields**: `application_id`, `reference_number`, `user_id`, `full_name`, `email`, `role`, `submitted_at`.

### 2. `volunteer.application.approved`
- **Trigger**: Fired when an admin approves a volunteer application (`VolunteerManagementController@approve`).
- **Endpoint**: `/webhook/pawlse/volunteer-approved`
- **Data fields**: `application_id`, `reference_number`, `user_id`, `full_name`, `email`, `role`, `status`, `reviewed_at`.

### 3. `volunteer.application.rejected`
- **Trigger**: Fired when an admin rejects a volunteer application (`VolunteerManagementController@reject`).
- **Endpoint**: `/webhook/pawlse/volunteer-rejected`
- **Data fields**: `application_id`, `reference_number`, `user_id`, `full_name`, `email`, `role`, `status`, `rejection_reason`, `reviewed_at`.

### 4. `adoption.application.submitted`
- **Trigger**: Fired when a user submits an adoption application (`AdoptionApplicationController@store`).
- **Endpoint**: `/webhook/pawlse/adoption-submitted`
- **Data fields**: `application_id`, `user_id`, `applicant_name`, `applicant_email`, `applicant_phone`, `pet_id`, `pet_name`, `pet_breed`, `preferred_date`, `submitted_at`.

### 5. `adoption.application.status_updated`
- **Trigger**: Fired when an admin updates adoption status (approved/rejected/scheduled in `AdoptionManagementController@updateStatus`).
- **Endpoint**: `/webhook/pawlse/adoption-status-updated`
- **Data fields**: `application_id`, `user_id`, `applicant_name`, `applicant_email`, `pet_name`, `status`, `rejection_reason`, `notes`, `updated_at`.

### 6. `pet.rescue.submitted`
- **Trigger**: Fired when a stray rescue or SOS pet report is submitted (`PetReportController@storeRescue`).
- **Endpoint**: `/webhook/pawlse/rescue-submitted`
- **Data fields**: `report_id`, `type`, `animal_type`, `breed`, `location`, `contact_name`, `contact_phone`, `contact_email`, `is_duplicate`, `submitted_at`.

### 7. `donation.received`
- **Trigger**: Fired when a cash, in-kind, or sponsor donation is initiated (`DonateController`).
- **Endpoint**: `/webhook/pawlse/donation-received`
- **Data fields**: `donation_id`, `donor_name`, `donor_email`, `type`, `amount`, `status`, `reference_number`, `submitted_at`.

---

## 4. Email Integration Strategy (Laravel vs n8n)

- **Laravel Responsibilities**:
  - Direct transactional security emails (e.g. Email verification OTP codes, password resets, 2FA tokens).
  - In-app notification records (database channel) for dashboard alerts.
- **n8n Responsibilities**:
  - External lifecycle notification pipelines (Volunteer welcome series, applicant confirmations, donor receipts).
  - Multi-service notifications (email alerts to admins, Slack/Discord rescue alerts).
  - Scheduled periodic summary reports and inventory/backup health checks.
