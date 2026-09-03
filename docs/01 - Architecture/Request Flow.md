# 🔁 Request Flow

This document outlines how HTTP requests, Inertia visits, form submissions, and background notifications flow through the **PAWLSE** full-stack pipeline.

---

## 🌊 Complete End-to-End Request Flow

```mermaid
sequenceDiagram
    autonumber
    actor User as 👤 Client Browser (React 19)
    participant Inertia as ⚡ Inertia.js v3 Engine
    participant Router as 🛣️ Laravel Router (web.php)
    participant MW as 🛡️ Middleware (Auth, Role, Inertia)
    participant Ctrl as 🎮 Controller
    participant Domain as 🧩 Domain / Service / Model
    participant DB as 💾 MySQL Database
    participant AI as 🤖 FastAPI AI Service

    alt 1. Page Visit / Navigation
        User->>Inertia: Click Navigation Link / Visit URL
        Inertia->>Router: GET /account/admin/rescue-management (X-Inertia header)
        Router->>MW: Check Auth & Spatie Role (Admin/SuperAdmin)
        MW->>MW: Share global props (HandleInertiaRequests)
        MW->>Ctrl: Invoke RescueManagementController::index()
        Ctrl->>Domain: Query PetReport::with(['photos', 'user'])
        Domain->>DB: Execute SQL SELECT
        DB-->>Domain: Return Eloquent Collections
        Domain-->>Ctrl: Formatted DTO / Array Data
        Ctrl-->>Inertia: Inertia::render('admin/rescue-management', $props)
        Inertia-->>User: Swap React page component & hydrate props
    else 2. Form Submission (e.g., Rescue Report with AI)
        User->>Inertia: Submit Rescue Form with Image File
        Inertia->>Router: POST /ai/predict
        Router->>Ctrl: PetController::predict()
        Ctrl->>AI: POST /predict (Multipart file upload)
        AI-->>Ctrl: JSON {species: 'dog', breed: 'Aspin', confidence: 0.92}
        Ctrl->>DB: INSERT INTO ai_prediction_logs
        Ctrl-->>User: Return Prediction JSON
        User->>Inertia: Confirm & Submit Final Report (useForm POST /pet-reports/rescue)
        Inertia->>Router: POST /pet-reports/rescue
        Router->>Ctrl: PetReportController::storeRescue()
        Ctrl->>Domain: PetReport::create() & checkForDuplicate()
        Domain->>DB: Calculate Haversine distance on recent reports
        Domain->>DB: INSERT INTO pet_reports & pet_report_photos
        Ctrl-->>Inertia: Redirect back with flash message & notification
        Inertia-->>User: Display Success Modal / Toast Notification
    end
```

---

## 🔍 Step-by-Step Flow Breakdown

### 1. Inbound Request Handling
- **Request Ingress**: The browser dispatches an HTTP request.
- **Inertia Detection**: If the request includes the `X-Inertia: true` header, Laravel knows to return a lightweight JSON payload containing the component name and updated props rather than a full HTML document.
- **Routing**: `routes/web.php` maps the URI and HTTP verb to the appropriate controller method.

### 2. Middleware Pipeline
Requests pass through a sequential middleware chain:
1. `Illuminate\Session\Middleware\StartSession`: Initializes session storage.
2. `Illuminate\Auth\Middleware\Authenticate` (`auth`): Ensures the user is logged in.
3. `Illuminate\Auth\Middleware\EnsureEmailIsVerified` (`verified`): Verifies OTP completion.
4. `Spatie\Permission\Middleware\RoleMiddleware`: Validates that the authenticated user possesses the required role (`User`, `Volunteer`, `Admin`, or `SuperAdmin`).
5. `App\Http\Middleware\HandleInertiaRequests`: Resolves shared props (`auth.user`, unread notifications count, theme colors, sidebar state).

### 3. Controller & Business Logic
- **Controller**: Extracts validated request data using Form Requests (e.g., `StoreAdoptionApplicationRequest`, `StoreCashDonationRequest`).
- **Domain Operations**: Invokes domain transition classes (such as `AdoptionStatusTransition` or `DonationStatusTransition`) to ensure valid lifecycle updates.
- **Model Interactions**: Eloquent models execute database queries with relationships, soft deletes, and timestamp tracking.

### 4. Response & Client Hydration
- The controller returns an `Inertia::render('page/name', $props)` response.
- On client receipt, Inertia dynamically mounts the target React component from `resources/js/pages/` and passes the fresh server props without losing client-side state.

---

## 🔗 Related Documentation
- [[System Architecture]]
- [[Backend Architecture]]
- [[Frontend Architecture]]
- [[Controllers]]
- [[Middleware]]
