# 📄 Pages

The page views of PAWLSE reside in `resources/js/pages/`, organized by access level and role.

---

## 🗺️ Page Directory Structure

```
resources/js/pages/
├── about.tsx                       # About Us & Mission statement
├── adopt.tsx                       # Pet adoption gallery with filter drawer & urgent needs
├── checkout.tsx                    # Cash donation checkout QR view & proof upload
├── donate.tsx                      # Public donation portal (Cash, In-Kind, Sponsor)
├── events.tsx                      # Community events & feeding route schedules
├── missing.tsx                     # Missing & found pets community board
├── not-found.tsx                   # 404 Error page
├── rescue.tsx                      # AI rescue reporting interface with camera/file upload
├── sos.tsx                         # Emergency SOS dispatch form
│
├── admin/                          # Admin Management Pages
│   ├── account-settings.tsx
│   ├── adoption-management.tsx     # Adoption applications & adoptable pet management
│   ├── ai-validation.tsx           # AI classification review queue
│   ├── dashboard.tsx               # Admin overview with metric cards & charts
│   ├── donation-monitoring.tsx     # Cash receipts, in-kind verification, inventory
│   ├── events.tsx                  # Event creation & feeding schedule calendar
│   ├── notifications.tsx           # Admin notification center
│   ├── reports-analytics.tsx       # Analytics charts & CSV export
│   ├── rescue-management.tsx       # Rescue dispatch, volunteer assignment, duplicates
│   └── volunteer-management.tsx    # Volunteer approvals, task tracking, certificates
│
├── auth/                           # Authentication Pages
│   ├── confirm-password.tsx
│   ├── forgot-password.tsx
│   ├── login.tsx                   # User login with Remember Me
│   ├── register.tsx                # Registration form
│   ├── reset-password.tsx          # Password reset form
│   ├── two-factor-challenge.tsx    # 2FA code / recovery code prompt
│   └── verify-email.tsx            # 6-digit Email OTP entry view
│
├── settings/                       # User Settings Pages
│   ├── appearance.tsx              # Theme switcher (Light, Dark, System)
│   ├── profile.tsx                 # Profile info & avatar upload
│   └── security.tsx                # Password change & 2FA configuration
│
├── super-admin/                    # Super Admin Pages
│   ├── account-settings.tsx
│   ├── admin-management.tsx        # Staff & admin role assignment
│   ├── advanced-analytics.tsx      # Comprehensive platform telemetry
│   ├── ai-configuration.tsx        # AI thresholds & prediction log reviewer
│   ├── archives.tsx                # Soft-delete archive manager with restore/force delete
│   ├── audit-logs.tsx              # System audit trail viewer
│   ├── backup-restore.tsx          # Database backup creation & restore panel
│   ├── dashboard.tsx               # Super Admin executive dashboard
│   ├── notifications.tsx           # Super Admin notification center
│   ├── security-access.tsx         # Security audit & login attempts log
│   ├── system-settings.tsx         # Shelter details, emergency contacts, maintenance mode
│   └── user-management.tsx         # User directory & role controls
│
├── user/                           # Authenticated Public User Pages
│   ├── account-settings.tsx
│   ├── adoption-applications.tsx   # User's adoption application tracker
│   ├── bookmark.tsx                # Bookmarked pets & saved reports
│   ├── dashboard.tsx               # User dashboard overview
│   ├── donations.tsx               # User's donation history & receipts
│   ├── missing-found.tsx           # User's submitted missing pet reports
│   ├── notifications.tsx           # User notification center
│   ├── rescue-reports.tsx          # User's submitted rescue reports
│   └── volunteer-status.tsx        # Volunteer application status tracker
│
└── volunteer/                      # Approved Volunteer Pages
    ├── account-settings.tsx
    ├── assigned-tasks.tsx          # Active & completed rescue/feeding tasks
    ├── certificates.tsx            # Digital certificates of appreciation
    ├── notifications.tsx           # Volunteer notification center
    ├── participation-history.tsx   # Historical task completion log
    ├── profile-information.tsx     # Volunteer skills & availability profile
    ├── rescue-reports.tsx          # Field rescue task reporting & status updates
    └── volunteer-status.tsx        # Active badge & membership credentials
```

---

## 🔗 Related Documentation
- [[React Structure]]
- [[Layouts]]
- [[Components]]
- [[User Features]]
- [[Volunteer Features]]
- [[Admin Features]]
- [[Super Admin Features]]
