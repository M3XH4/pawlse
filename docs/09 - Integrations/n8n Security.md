# n8n Security, Authentication & Idempotency Architecture

This document covers the security protocols, signature validations, credential segregation, and replay protections implemented across the **Pawlse $\leftrightarrow$ n8n** pipeline.

---

## 1. Outbound Webhook Security (HMAC-SHA256 Signatures)

All webhooks dispatched from Laravel contain the header:
```http
X-Pawlse-Signature: t=1756972800,v1=a1b2c3d4e5f6...
X-Pawlse-Event-Id: 9d90fb3e-72b1-4f15-992d-45607db71789
```

### Signature Computation
$$\text{Signature} = \text{HMAC-SHA256}\left(t \,\|\, \text{json\_payload},\, \text{N8N\_WEBHOOK\_SECRET}\right)$$

### Replay Attack Prevention
* The timestamp `t` must fall within $\pm 300\text{ seconds}$ (5 minutes) of current server time.
* The `X-Pawlse-Event-Id` UUID guarantees single-execution idempotency across retries.

---

## 2. Inbound API Security (`X-Automation-Key`)

Inbound requests from n8n to Laravel are guarded by the `VerifyAutomationApiKey` middleware:
* Compares request header `X-Automation-Key` against `AUTOMATION_API_KEY` using constant-time string comparison (`hash_equals`) to prevent timing attacks.
* Rate-limited to 60 requests/minute per IP address (`throttle:60,1`).
* If unconfigured in `.env`, endpoints safely return `503 Service Unavailable`.

---

## 3. Secret Segregation & Git Protection

* No secrets, SMTP keys, or database passwords exist in JSON workflow files.
* Workflows use n8n expression bindings (`{{ $env.VARIABLE_NAME }}`).
* `.env` and `.n8n/` are excluded via `.gitignore`.
