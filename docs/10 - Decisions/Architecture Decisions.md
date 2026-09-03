# 🏛️ Architecture Decision Records (ADRs)

This document catalogs key architectural decisions made in the engineering of **PAWLSE**.

---

# Decision: Monolithic Laravel 13 + Inertia.js v3 + React 19 Stack

## Context
Traditional Single-Page Applications (SPA) with separate REST/GraphQL backends introduce serialization overhead, duplicate routing, complex state stores (Redux), and authentication synchronization issues. Blade views, conversely, lack dynamic modern micro-interactions and component reusability.

## Decision
Adopt **Inertia.js v3** connecting a **Laravel 13** backend monolith directly to a **React 19** frontend with TypeScript and Tailwind CSS v4.

## Reasoning
- Enables full-stack developer velocity: backend controllers return typed props directly to React components without manual API serialization.
- Preserves full SPA fluid navigation without full-page reloads.
- Centralizes routing and authentication in Laravel Fortify and Spatie RBAC.

## Alternatives
- Pure REST API + Next.js / Vite SPA (Rejected due to auth duplication and state synchronization overhead).
- Laravel Blade + Livewire / Alpine.js (Rejected due to team expertise and complex React UI requirements for live maps and AI features).

## Consequences
- **Advantages**: Single codebase, rapid development, type safety via Wayfinder, no client-side caching bugs.
- **Disadvantages**: Tight coupling between frontend pages and backend responses.

## Status
**Accepted**

---

# Decision: Finite State Machine for Adoptions and Donations

## Context
Allowing arbitrary status updates on adoption applications or donations in controllers creates race conditions, illegal state jumps (e.g. from `rejected` directly to `completed`), and inconsistent animal availability states.

## Decision
Encapsulate all state transitions within dedicated domain classes: `AdoptionStatusTransition` and `DonationStatusTransition`.

## Reasoning
- Guarantees valid status transitions according to shelter business rules.
- Automatically handles side-effects (locking `ShelterAnimal` availability, updating `InventoryItem` stock, sending transactional notifications, and logging audit history).

## Alternatives
- Direct `$model->update(['status' => $request->status])` in controllers (Rejected for lack of auditability and risk of data corruption).

## Consequences
- **Advantages**: Strict business validation, complete auditability, maintainable business logic.
- **Disadvantages**: Requires routing all status updates through formal transition services.

## Status
**Accepted**

---

# Decision: 6-Digit Email Verification OTP over Verification URLs

## Context
Standard email verification links can be prematurely invalidated by enterprise spam checkers, preview bots, or device switching when the user opens the email on a mobile device while registering on a desktop.

## Decision
Implement a **6-Digit Numeric Email Verification OTP** system via `EmailVerificationOtpController`.

## Reasoning
- Users can easily read the 6-digit code from any device/email client and enter it on their active session.
- Securely hashed with 10-minute expiry and attempt-rate-limiting.

## Alternatives
- Signed email URL verification (`VerifyEmail::toMailUsing`) (Rejected due to bot click issues and mobile-desktop friction).

## Consequences
- **Advantages**: Frictionless user experience, reliable verification on any device.
- **Disadvantages**: Requires custom OTP database columns and throttling controllers.

## Status
**Accepted**

---

# Decision: In-Database Geospatial Duplicate Detection via Haversine Formula

## Context
During animal emergencies or stray sightings, multiple community members frequently submit reports for the same animal within a short radius, overwhelming rescue volunteers.

## Decision
Embed automatic duplicate checking in `PetReport::checkForDuplicate()` utilizing the mathematical **Haversine Distance Formula** on coordinates within **500 meters** and a **24-hour** window.

## Reasoning
- Runs in-database at creation time without third-party API dependencies or external geocoding subscription costs.
- Automatically flags duplicates with `is_duplicate = true` while linking to the master report (`duplicate_of_id`).

## Alternatives
- External Geocoding & Clustering API (Rejected due to cost and network latency).
- Manual admin duplicate triaging (Rejected due to delay in emergency response).

## Consequences
- **Advantages**: Instant duplicate flagging, zero API cost.
- **Disadvantages**: Requires coordinates or normalized location strings.

## Status
**Accepted**

---

## 🔗 Related Documentation
- [[System Architecture]]
- [[Backend Architecture]]
- [[AdoptionStatusTransition|Services]]
- [[Authentication]]
- [[Rescue Management|Admin Features]]
