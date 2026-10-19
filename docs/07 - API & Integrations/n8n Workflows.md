# n8n Workflow Directory & Node Pipeline Documentation

Complete documentation for all 15 production workflows in the Pawlse automation suite.

---

## Complete Workflow Directory

### 1. `PAWLSE - Volunteer - Application Submitted`
* **File**: `n8n/workflows/volunteer-application-submitted.json`
* **Trigger**: Webhook `POST /webhook/pawlse/volunteer-submitted`
* **Flow**: `Webhook Trigger` $\rightarrow$ `Format Payload` $\rightarrow$ `Send Applicant Email` $\rightarrow$ `Log Result`
* **Recipient**: Volunteer Applicant

### 2. `PAWLSE - Volunteer - Approved`
* **File**: `n8n/workflows/volunteer-application-approved.json`
* **Trigger**: Webhook `POST /webhook/pawlse/volunteer-approved`
* **Flow**: `Webhook Trigger` $\rightarrow$ `Format Approval Data` $\rightarrow$ `Send Approval Email` $\rightarrow$ `Log Result`
* **Recipient**: Approved Volunteer

### 3. `PAWLSE - Volunteer - Rejected`
* **File**: `n8n/workflows/volunteer-application-rejected.json`
* **Trigger**: Webhook `POST /webhook/pawlse/volunteer-rejected`
* **Flow**: `Webhook Trigger` $\rightarrow$ `Format Rejection Data` $\rightarrow$ `Send Rejection Notice` $\rightarrow$ `Log Result`
* **Recipient**: Rejected Applicant

### 4. `PAWLSE - Adoption - Application Submitted`
* **File**: `n8n/workflows/adoption-application-submitted.json`
* **Trigger**: Webhook `POST /webhook/pawlse/adoption-submitted`
* **Flow**: `Webhook Trigger` $\rightarrow$ `Format Application Data` $\rightarrow$ `Send Confirmation Email` $\rightarrow$ `Log Result`
* **Recipient**: Adopter

### 5. `PAWLSE - Adoption - Status Updated`
* **File**: `n8n/workflows/adoption-application-status-updated.json`
* **Trigger**: Webhook `POST /webhook/pawlse/adoption-status-updated`
* **Flow**: `Webhook Trigger` $\rightarrow$ `Format Status Update` $\rightarrow$ `Send Status Email` $\rightarrow$ `Log Result`
* **Recipient**: Adopter

### 6. `PAWLSE - Rescue - Emergency Report Dispatched`
* **File**: `n8n/workflows/rescue-report-submitted.json`
* **Trigger**: Webhook `POST /webhook/pawlse/rescue-submitted`
* **Flow**: `Webhook Trigger` $\rightarrow$ `Format Alert Payload` $\rightarrow$ `Notify Rescue Team` $\rightarrow$ `Log Alert Sent`
* **Recipient**: Emergency Field Rescue Team & Administrators

### 7. `PAWLSE - Donation - Contribution Received & Receipted`
* **File**: `n8n/workflows/donation-received.json`
* **Trigger**: Webhook `POST /webhook/pawlse/donation-received`
* **Flow**: `Webhook Trigger` $\rightarrow$ `Format Donation Receipt` $\rightarrow$ `Send Donor Receipt` $\rightarrow$ `Log Receipt Sent`
* **Recipient**: Donor

### 8. `PAWLSE - Form - Public Volunteer Inquiry & Feedback`
* **File**: `n8n/workflows/form-volunteer-inquiry.json`
* **Trigger**: n8n Form Trigger `GET/POST /form/pawlse-volunteer-inquiry`
* **Flow**: `n8n Form Trigger` $\rightarrow$ `Record In Laravel` $\rightarrow$ `Send Acknowledgment Email` $\rightarrow$ `Respond to Submitter`
* **Recipient**: Public Inquirer & Admin Audit

### 9. `PAWLSE - Form - External Stray Sighting Intake`
* **File**: `n8n/workflows/form-stray-sighting.json`
* **Trigger**: n8n Form Trigger `GET/POST /form/pawlse-stray-sighting`
* **Flow**: `n8n Form Trigger` $\rightarrow$ `Sync Sighting to Pawlse` $\rightarrow$ `Alert Rescue Coordinators` $\rightarrow$ `Show Confirmation Screen`
* **Recipient**: Community Reporter & Rescue Field Team

### 10. `PAWLSE - Form - Corporate Sponsor Pledge`
* **File**: `n8n/workflows/form-corporate-sponsor-pledge.json`
* **Trigger**: n8n Form Trigger `GET/POST /form/pawlse-sponsor-pledge`
* **Flow**: `n8n Form Trigger` $\rightarrow$ `Record Pledge In Laravel` $\rightarrow$ `Email Pledge Receipt` $\rightarrow$ `Thank You Screen`
* **Recipient**: Corporate Sponsor & Sponsorship Coordinator

### 11. `PAWLSE - Feeding - Scheduled Route Reminder`
* **File**: `n8n/workflows/scheduled-feeding-reminder.json`
* **Trigger**: Cron Schedule (Daily 6:00 AM PST / `0 6 * * *`)
* **Flow**: `Schedule Trigger` $\rightarrow$ `Fetch Today's Feeding Routes` $\rightarrow$ `Has Routes Scheduled?` $\rightarrow$ `Send Feeding Route Brief`
* **Recipient**: Volunteers & Feeding Coordinators

### 12. `PAWLSE - Inventory - Low Stock & Expiry Alert`
* **File**: `n8n/workflows/low-inventory-alerts.json`
* **Trigger**: Cron Schedule (Daily 7:00 AM PST / `0 7 * * *`)
* **Flow**: `Schedule Trigger` $\rightarrow$ `Fetch Inventory Alerts` $\rightarrow$ `Has Low Stock / Expiring?` $\rightarrow$ `Send Inventory Alert Email`
* **Recipient**: Shelter Supply Managers

### 13. `PAWLSE - Admin - Scheduled Operations Report`
* **File**: `n8n/workflows/scheduled-system-report.json`
* **Trigger**: Cron Schedule (Weekly Mon 8:00 AM PST / `0 8 * * 1`)
* **Flow**: `Schedule Trigger` $\rightarrow$ `Fetch Platform Statistics` $\rightarrow$ `Format Summary Digest` $\rightarrow$ `Send Executive Email`
* **Recipient**: Super Admin & Executive Directors

### 14. `PAWLSE - Backup - Health Monitor & Alert`
* **File**: `n8n/workflows/backup-monitoring.json`
* **Trigger**: Cron Schedule (Daily 6:00 AM PST / `0 6 * * *`)
* **Flow**: `Schedule Trigger` $\rightarrow$ `Fetch Backup Status` $\rightarrow$ `Is Backup Healthy?` $\rightarrow$ `Send Unhealthy Alert`
* **Recipient**: System Super Admin & DevOps

### 15. `PAWLSE - System - Centralized Error Handler`
* **File**: `n8n/workflows/system-centralized-error-handler.json`
* **Trigger**: n8n Error Trigger
* **Flow**: `Error Trigger` $\rightarrow$ `Format Error Incident` $\rightarrow$ `Dispatch Incident Email` $\rightarrow$ `Log Incident`
* **Recipient**: DevOps & Technical Lead
