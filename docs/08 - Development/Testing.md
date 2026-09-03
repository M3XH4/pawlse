# 🧪 Testing Guide

PAWLSE employs **Pest PHP v4** for automated backend testing alongside TypeScript type-checking for frontend verification.

---

## 🏛️ Test Suite Structure

```
tests/
├── Feature/
│   ├── AdminAdoptionManagementTest.php
│   ├── AdminAiValidationTest.php
│   ├── AdminDashboardOverviewTest.php
│   ├── AdminDonationMonitoringTest.php
│   ├── AdminReportsAnalyticsTest.php
│   ├── AdoptionFlowTest.php
│   ├── Auth/
│   │   ├── AuthenticationTest.php
│   │   ├── EmailVerificationTest.php
│   │   ├── PasswordConfirmationTest.php
│   │   ├── PasswordResetTest.php
│   │   ├── RegistrationTest.php
│   │   └── TwoFactorChallengeTest.php
│   ├── DashboardPagesTest.php
│   ├── DashboardRoleAccessTest.php
│   ├── DonationFlowTest.php
│   ├── EmailVerificationOtpTest.php
│   ├── EventManagementTest.php
│   ├── NotificationTest.php
│   ├── PetReportTest.php
│   ├── PublicDonationPrivacyTest.php
│   ├── RoleAuthorizationTest.php
│   ├── SuperAdminAnalyticsTest.php
│   ├── SuperAdminAuditLogFiltersTest.php
│   ├── SuperAdminDashboardTest.php
│   └── VolunteerManagementTest.php
└── Unit/
    ├── AdoptionApplicationStatusTransitionTest.php
    └── DonationStatusTransitionTest.php
```

---

## 🏃 Running Tests

```bash
# Run the entire test suite with compact output
php artisan test --compact

# Run a specific test file
php artisan test tests/Feature/DonationFlowTest.php

# Filter tests by name
php artisan test --filter=test_cash_donation_requires_valid_receipt

# Run with coverage report
php artisan test --coverage
```

---

## ✍️ Writing Pest Tests Best Practices

1. **Use Model Factories**: Use predefined factories (`User::factory()`, `ShelterAnimal::factory()`) and states (`User::factory()->admin()->create()`).
2. **Test Authorization**: Always test both positive authorization and unauthorized 403 Forbidden responses across roles.
3. **Assert Database & Notifications**: Use `assertDatabaseHas()`, `Event::fake()`, and `Notification::fake()` to verify transactional integrity.

---

## 🔗 Related Documentation
- [[Development Workflow]]
- [[Authentication]]
- [[Authorization & RBAC]]
