# n8n Integration & API Reference

This document outlines the API endpoints, webhook schemas, and environment configurations connecting **Laravel 13** with **self-hosted n8n**.

---

## 1. Inbound Automation API Endpoints (n8n $\rightarrow$ Laravel)

All requests must include the header:
```http
X-Automation-Key: <AUTOMATION_API_KEY>
Accept: application/json
```

### 1. `GET /api/automation/statistics`
Returns real-time aggregated metrics across rescues, adoptions, donations, active volunteers, and shelter animals.

### 2. `GET /api/automation/backup-status`
Returns database backup system status, file sizes, execution status, and age threshold verification.

### 3. `GET /api/automation/inventory-alerts`
Returns low-stock shelter supplies (`quantity <= min_threshold`) and expiring inventory batches ($\le 30$ days).

### 4. `GET /api/automation/feeding/upcoming`
Returns today's active feeding route zones, assigned volunteers, and stray targets.

### 5. `POST /api/automation/external-intake`
Accepts public intake submissions from n8n Form Triggers (`volunteer_inquiry`, `stray_sighting`, `corporate_sponsor_pledge`).

---

## 2. Outbound Webhooks (Laravel $\rightarrow$ n8n)

Every webhook payload dispatches with standard JSON structure:
```json
{
  "event": "volunteer.application.submitted",
  "event_id": "9d90fb3e-72b1-4f15-992d-45607db71789",
  "timestamp": "2026-09-04T09:30:00+08:00",
  "source": "pawlse",
  "data": { ... }
}
```

Dispatched events:
* `volunteer.application.submitted` $\rightarrow$ `/webhook/pawlse/volunteer-submitted`
* `volunteer.application.approved` $\rightarrow$ `/webhook/pawlse/volunteer-approved`
* `volunteer.application.rejected` $\rightarrow$ `/webhook/pawlse/volunteer-rejected`
* `adoption.application.submitted` $\rightarrow$ `/webhook/pawlse/adoption-submitted`
* `adoption.application.status_updated` $\rightarrow$ `/webhook/pawlse/adoption-status-updated`
* `pet.rescue.submitted` $\rightarrow$ `/webhook/pawlse/rescue-submitted`
* `donation.received` $\rightarrow$ `/webhook/pawlse/donation-received`
