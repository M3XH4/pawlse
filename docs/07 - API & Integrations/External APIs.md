# 🌐 External APIs & Integrations

This document details the external microservices, payment gateways, and third-party APIs integrated with PAWLSE.

---

## 🤖 1. AI Vision & Identification Microservice

PAWLSE communicates with the **PAWLSE-AI** microservice via REST HTTP calls (see [[AI Architecture]] and [[AI Microservice & Model Pipeline]]).

```mermaid
sequenceDiagram
    participant Laravel as 🐘 PAWLSE Backend (PetController)
    participant FastAPI as 🐍 Python AI Microservice (FastAPI)
    participant YOLO as 🎯 YOLOv8n (Pet Localization)
    participant Model as 🔬 EfficientNet-B0 Dual-Head Model

    Laravel->>FastAPI: POST /predict (Multipart image stream)
    FastAPI->>YOLO: Detect and localize cat & dog crops
    loop For Each Detected Animal
        FastAPI->>Model: Tensor image preprocessing & forward pass
        Model-->>FastAPI: Raw probabilities [species, breed]
        FastAPI->>FastAPI: Estimate visual age group & generate name suggestions
    end
    FastAPI-->>Laravel: JSON { total_animals_detected, animals: [...] }
    Laravel->>Laravel: Record AiPredictionLog & Link to PetReport
```

### Configuration (`config/services.php` & `.env`)
- `services.ai.url`: Endpoint URL of the Python AI service (default: `http://127.0.0.1:8000`).
- **Timeout**: 120 seconds configured in `Http::timeout(120)`.
- **System Settings Guard**: Governed by `ai_enabled`, `ai_reporting_enabled`, and `ai_confidence_threshold`.

---

## 💳 2. Payment Providers & Gateways

PAWLSE supports both direct manual receipt verification and prepared automated webhook integrations.

### Integrated Providers (`App\Enums\PaymentProvider`):
1. **GCash** (Direct QR & Reference Number)
2. **Maya** (Direct QR & Reference Number)
3. **Bank Transfer** (BDO / BPI / UnionBank manual deposit receipts)
4. **Automated Gateway (PayMongo / Xendit)**:
   - `PaymentWebhookController` is structured to consume incoming charge/event webhooks.
   - Idempotency records prevent double-crediting via the `idempotency_records` table.

---

## 🗺️ 3. Map & Geocoding Services

- Rescue location coordinates are parsed using regex or browser Geolocation API (`navigator.geolocation.getCurrentPosition`).
- Real-time duplicate calculation uses internal **Haversine Distance calculations** without incurring external third-party geocoding API costs.

---

## 🔗 Related Documentation
- [[AI Architecture]]
- [[AI Microservice & Model Pipeline]]
- [[AI Rescue & Multi-Species Identification]]
- [[API Overview]]
- [[Email & Notifications]]
- [[Donation Monitoring|Admin Features]]
- [[Controllers]]
