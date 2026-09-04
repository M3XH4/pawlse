# Pawlse Automation Architecture & System Design

This document details the architectural foundation, boundaries, security models, and lifecycle orchestration connecting the **Pawlse (Iligan Stray Feeders)** Laravel application to its self-hosted **n8n automation engine**.

---

## 1. System Philosophy & Separation of Concerns

```text
                    ILIGAN STRAY FEEDERS (PAWLSE)

                         Laravel 13
                            │
              ┌─────────────┴─────────────┐
              │                           │
        Application                   Events / API
          Logic                           │
              │                           ▼
              │                     Self-Hosted n8n
              │                           │
              │              ┌────────────┼────────────┐
              │              │            │            │
              │            Email      Public Forms   Reports
              │              │            │            │
              └──────────────┴────────────┴────────────┘
```

* **Laravel Owns the Core Application**:
  * Business rules, state machine transitions, and database integrity.
  * Authentication, session management, Fortify, 2FA, and Spatie RBAC authorization.
  * Critical security transactional emails (Email OTP verification, password resets, 2FA tokens).
  * In-app notification bell database records.
* **n8n Owns the Automation & External Pipelines**:
  * External lifecycle communications (Volunteer welcome packets, adopter confirmations, donation receipts).
  * Native hosted public intake forms (Volunteer questions, stray sightings, sponsor pledges).
  * Scheduled reporting pipelines and proactive health monitoring (Daily 6AM backup checks, daily 7AM supply alerts, weekly executive reports).
  * Centralized error and incident handling.

---

## 2. Communication Topology & Timezone

1. **Docker Internal Network (`pawlse-network`)**:
   * Outbound webhooks from Laravel reach n8n directly via `http://n8n:5678/webhook/pawlse/...`.
   * Inbound API requests from n8n reach Laravel via `http://nginx/api/automation/...`.
2. **Timezone Configuration**:
   * Application and n8n schedules operate in **`Asia/Manila` (PST / UTC+8)** to align with Philippine morning operations and volunteer hours.

---

## 3. Workflow Categories

### Category A: Outbound Application Webhooks
* `PAWLSE - Volunteer - Application Submitted`
* `PAWLSE - Volunteer - Approved`
* `PAWLSE - Volunteer - Rejected`
* `PAWLSE - Adoption - Application Submitted`
* `PAWLSE - Adoption - Status Updated`
* `PAWLSE - Rescue - Emergency Report Dispatched`
* `PAWLSE - Donation - Contribution Received & Receipted`

### Category B: Native n8n Public Forms
* `PAWLSE - Form - Public Volunteer Inquiry & Feedback`
* `PAWLSE - Form - External Stray Sighting Intake`
* `PAWLSE - Form - Corporate Sponsor Pledge`

### Category C: Scheduled Cron Workflows
* `PAWLSE - Feeding - Scheduled Route Reminder` (Daily 6:00 AM PST)
* `PAWLSE - Inventory - Low Stock & Expiry Alert` (Daily 7:00 AM PST)
* `PAWLSE - Admin - Scheduled Operations Report` (Weekly Mon 8:00 AM PST)
* `PAWLSE - Backup - Health Monitor & Alert` (Daily 6:00 AM PST)

### Category D: Global Incident Catcher
* `PAWLSE - System - Centralized Error Handler`
