# 🐘 Laravel Structure

PAWLSE follows modern **Laravel 13** structural conventions with domain-driven modularity.

---

## 📂 Application Directory Map

```
app/
├── Actions/
│   └── Fortify/
│       ├── CreateNewUser.php           # User registration pipeline & default User role assignment
│       └── ResetUserPassword.php       # Password reset handler
├── Adoptions/
│   └── AdoptionStatusTransition.php   # Finite-state machine for adoption application review
├── Concerns/
│   ├── PasswordValidationRules.php     # Shared password strength rules
│   └── ProfileValidationRules.php      # User profile validation rules
├── Console/
│   └── Commands/
│       └── AutoBackupCommand.php       # Scheduled database backup artisan command (pawlse:auto-backup)
├── Donations/
│   ├── DonationStatusTransition.php    # Finite-state machine for cash & in-kind donations
│   └── RecordsDonationActivity.php     # Trait for logging donation verification audit events
├── Enums/                              # 17 PHP 8 Enums
│   ├── AdoptionApplicationStatus.php
│   ├── AdoptionDocumentKind.php
│   ├── AnimalAgeCategory.php
│   ├── AnimalGender.php
│   ├── AnimalType.php
│   ├── AuditAction.php
│   ├── DonationStatus.php
│   ├── DonationType.php
│   ├── InKindStatus.php
│   ├── NeedPriority.php
│   ├── NeedStatus.php
│   ├── PaymentMethod.php
│   ├── PaymentProvider.php
│   ├── PaymentStatus.php
│   ├── Role.php
│   ├── ShelterAnimalStatus.php
│   └── SocialProvider.php
├── Exceptions/
│   └── InvalidDonationTransitionException.php # Domain exception for illegal donation transitions
├── Http/
│   ├── Controllers/                    # Modular controllers (Admin, SuperAdmin, User, Volunteer, Public)
│   ├── Middleware/
│   │   ├── HandleAppearance.php        # Theme cookie & dark mode handler
│   │   └── HandleInertiaRequests.php   # Inertia shared props & notification injector
│   └── Requests/                       # Dedicated Form Requests with validation rules
├── Listeners/
│   ├── LogFailedLogin.php              # Tracks failed auth attempts in login_attempts table
│   └── LogSuccessfulLogin.php          # Logs successful logins
├── Models/                             # 29 Eloquent models
├── Notifications/                      # 16 Database & Mail notifications
├── Payments/
│   └── PaymentGatewayManager.php       # Payment provider coordinator & reference generator
├── Policies/                           # Authorization policies
│   ├── AdoptionApplicationPolicy.php
│   ├── DonationPolicy.php
│   └── ShelterAnimalPolicy.php
├── Providers/
│   ├── AppServiceProvider.php          # Global bindings, rate limiters, policy registrations
│   └── FortifyServiceProvider.php      # Fortify view customization & OTP hook
└── Support/
    ├── AdminNotifications.php          # Admin notification dispatch helpers
    ├── DashboardNotifications.php      # User & volunteer dashboard notification formatting
    └── DonationReference.php           # Generates unique donation reference codes
```

---

## 🧩 Architectural Highlights

1. **Fortify Integration with OTP**: Traditional email verification links are replaced by a 6-digit numeric OTP workflow configured in `FortifyServiceProvider` and handled by `EmailVerificationOtpController`.
2. **Spatie Laravel-Permission**: Role-based access control utilizes the `HasRoles` trait on the `User` model, registering `user`, `volunteer`, `admin`, and `super-admin` roles via `RoleSeeder`.
3. **Domain State Transitions**: Rather than performing inline database status modifications inside controllers, state updates are encapsulated in dedicated transition classes (`AdoptionStatusTransition`, `DonationStatusTransition`) with audit logging.
4. **Wayfinder TypeScript Generation**: Route definitions in `routes/web.php` are parsed by Laravel Wayfinder to generate type-safe TypeScript action proxies located in `resources/js/actions/`.

---

## 🔗 Related Documentation
- [[Routes]]
- [[Controllers]]
- [[Models]]
- [[Middleware]]
- [[Services]]
- [[Validation]]
