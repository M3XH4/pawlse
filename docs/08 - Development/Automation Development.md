# Automation Development & Setup Guide

This guide explains how to start, configure, test, and develop n8n automation workflows locally with the Pawlse application.

---

## 1. Quick Start (Docker Environment)

To run the complete Pawlse stack including n8n in Docker:

```bash
# 1. Start all containers (app, nginx, mysql, redis, queue, n8n)
docker compose up -d

# 2. Access n8n web UI
# Open your browser and navigate to:
http://localhost:5678
```

### Initial n8n Setup
1. On first launch, follow n8n's web setup to create your local owner account.
2. Under **Workflows**, click **Add Workflow** $\rightarrow$ **Import from File...**
3. Select the JSON workflow definitions from the project directory:
   - `n8n/workflows/volunteer-application-submitted.json`
   - `n8n/workflows/volunteer-application-approved.json`
   - `n8n/workflows/scheduled-system-report.json`
   - `n8n/workflows/backup-monitoring.json`
4. Toggle each imported workflow to **Active**.

---

## 2. Local Environment Variables Setup

Ensure your local `.env` contains the required keys:

```env
# n8n Automation
N8N_ENABLED=true
N8N_BASE_URL=http://n8n:5678
N8N_WEBHOOK_SECRET=your-local-dev-webhook-secret
AUTOMATION_API_KEY=your-local-dev-automation-api-key
FORWARD_N8N_PORT=5678
```

---

## 3. Testing Workflows Locally

### Testing Outbound Webhooks (Laravel $\rightarrow$ n8n)
1. In n8n, open the **Volunteer Application Submitted** workflow.
2. Submit a volunteer application from the frontend at `http://localhost/volunteer` (or through the test suite).
3. The Laravel queue worker will process `SendN8nWebhookJob` and post to `http://n8n:5678/webhook/pawlse/volunteer-submitted`.
4. Inspect the execution log in n8n to view the incoming payload and formatted output.

### Testing Inbound API (n8n $\rightarrow$ Laravel)
Test that n8n can query statistics and backup health directly with cURL:

```bash
# Test Statistics
curl -H "X-Automation-Key: your-local-dev-automation-api-key" \
     http://localhost:8000/api/automation/statistics

# Test Backup Status
curl -H "X-Automation-Key: your-local-dev-automation-api-key" \
     http://localhost:8000/api/automation/backup-status
```

---

## 4. Creating New Workflows

When adding a new automation:
1. **Define the Domain Event**: Create a strongly typed Laravel event in `app/Events/` (e.g. `PetRescuedEvent`).
2. **Listen and Queue**: Create a listener in `app/Listeners/` that dispatches `SendN8nWebhookJob::dispatch('event.name', $payload)`.
3. **Register Endpoint in Config**: Add the default webhook path to `config/n8n.php`.
4. **Create the n8n Workflow**: Design the workflow in n8n UI, export as JSON, and commit to `n8n/workflows/<workflow-name>.json`.
5. **Add Automated Feature Tests**: Write tests in `tests/Feature/` verifying HMAC generation, event dispatch, and job handling.

---

## 5. Production Considerations

- **Secure Network**: Keep n8n and Laravel internal ports within the Docker bridge network (`pawlse-network`) without exposing raw database or PHP-FPM ports to the public internet.
- **Reverse Proxy / HTTPS**: In production, serve n8n behind Nginx or Cloudflare with SSL/TLS termination and strong encryption.
- **Secrets Management**: Generate 64-character random cryptographic strings for `N8N_WEBHOOK_SECRET` and `AUTOMATION_API_KEY` using `openssl rand -hex 32`. Never commit secrets to Git.
