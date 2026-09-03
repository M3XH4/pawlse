# 🛣️ Routes

Routing in PAWLSE is defined across `routes/web.php`, `routes/settings.php`, and `routes/console.php`.

---

## 🌐 Public Routes

| Method | URI | Controller Action | Name | Description |
|---|---|---|---|---|
| `GET` | `/` | `HomeController` | `home` | Landing page with hero, statistics, testimonials, urgent needs |
| `GET` | `/about` | `Inertia::render('about')` | `about` | About Iligan Stray Feeders and the PAWLSE mission |
| `GET` | `/adopt` | `AdoptController::index` | `adopt` | Browse adoptable pets with filters and urgent needs |
| `POST` | `/adopt/apply` | `AdoptionApplicationController::store` | `adopt.apply` | Submit adoption application (Auth required) |
| `GET` | `/donate` | `DonateController::index` | `donate` | Donation portal (Cash, In-Kind, Sponsorship) |
| `POST` | `/donate/cash` | `DonateController::storeCash` | `donate.store-cash` | Initiate cash donation |
| `POST` | `/donate/in-kind` | `DonateController::storeInKind` | `donate.store-inkind` | Submit in-kind donation pledge |
| `POST` | `/donate/sponsor` | `DonateController::storeSponsor` | `donate.store-sponsor` | Sponsor a pet/feeding schedule |
| `GET` | `/checkout/{ref}` | `DonateController::checkout` | `donate.checkout` | Payment instructions and QR codes |
| `POST` | `/checkout/{ref}/pay`| `DonateController::pay` | `donate.pay` | Upload payment proof receipt |
| `GET` | `/volunteer` | `VolunteerController::index` | `volunteer` | Volunteer application info and form |
| `POST` | `/volunteer/apply` | `VolunteerController::store` | `volunteer.apply` | Submit volunteer application (Auth required) |
| `GET` | `/volunteer/switch` | `VolunteerController::switchRole` | `volunteer.switch` | Switch active context to Volunteer |
| `GET` | `/volunteer/switch-user`| `VolunteerController::switchUser` | `volunteer.switch-user` | Switch active context to User |
| `GET` | `/rescue` | `Inertia::render('rescue')` | `rescue` | AI rescue reporting interface |
| `POST` | `/pet-reports/rescue`| `PetReportController::storeRescue` | `pet-reports.store-rescue` | Submit rescue report |
| `GET` | `/missing` | `PetReportController::missingIndex` | `missing` | Browse missing and found pet reports |
| `POST` | `/pet-reports/missing`| `PetReportController::storeMissing` | `pet-reports.store-missing` | Report missing/found pet |
| `GET` | `/sos` | `Inertia::render('sos')` | `sos` | Emergency SOS rescue form |
| `POST` | `/pet-reports/sos` | `PetReportController::storeSos` | `pet-reports.store-sos` | Submit high-priority SOS alert |
| `GET` | `/events` | `EventController::index` | `events` | Public calendar of feeding routes & events |
| `POST` | `/events/{event}/join`| `EventController::joinEvent` | `events.join` | Join community event (Auth required) |
| `POST` | `/feeding-schedules/{schedule}/join` | `EventController::joinFeedingRoute` | `feeding-schedules.join` | Join feeding route (Auth required) |
| `POST` | `/ai/predict` | `PetController::predict` | - | AI image classification endpoint |
| `POST` | `/ai/generate-names` | `PetController::generateNames` | - | AI animal name suggestions |

---

## 🔐 Authenticated User Routes (`/account/user/*`)

*Middleware: `['auth', 'verified', RoleMiddleware::using(Role::User)]`*

| Method | URI | Controller Action | Name |
|---|---|---|---|
| `GET` | `/account/user` | `Inertia::render('user/bookmark')` | `account.user.index` |
| `GET` | `/account/user/bookmark` | `Inertia::render('user/bookmark')` | `account.user.bookmark` |
| `GET` | `/account/user/rescue-reports` | `PetReportController::userReports` | `account.user.rescue-reports` |
| `GET` | `/account/user/adoption-applications` | `AdoptionApplicationController::index` | `account.user.adoption-applications` |
| `GET` | `/account/user/donations` | `DonationController::index` | `account.user.donations` |
| `GET` | `/account/user/missing-found` | `PetReportController::userMissingFoundReports` | `account.user.missing-found` |
| `GET` | `/account/user/notifications` | `Inertia::render('user/notifications')` | `account.user.notifications` |
| `GET` | `/account/user/account-settings` | `AccountSettingsController::index` | `account.user.account-settings` |
| `GET` | `/account/user/volunteer-status` | `VolunteerDashboardController::userStatus` | `account.user.volunteer-status` |

---

## 🙋 Volunteer Routes (`/account/volunteer/*`)

*Middleware: `['auth', 'verified', RoleMiddleware::using(Role::Volunteer)]`*

| Method | URI | Controller Action | Name |
|---|---|---|---|
| `GET` | `/account/volunteer` | `VolunteerDashboardController::profile` | `account.volunteer.index` |
| `GET` | `/account/volunteer/profile` | `VolunteerDashboardController::profile` | `account.volunteer.profile` |
| `POST`| `/account/volunteer/profile` | `VolunteerDashboardController::updateProfile` | `account.volunteer.profile.update` |
| `GET` | `/account/volunteer/status` | `VolunteerDashboardController::status` | `account.volunteer.status` |
| `GET` | `/account/volunteer/assigned-tasks` | `VolunteerDashboardController::assignedTasks` | `account.volunteer.assigned-tasks` |
| `GET` | `/account/volunteer/participation-history` | `VolunteerDashboardController::participationHistory` | `account.volunteer.participation-history` |
| `GET` | `/account/volunteer/certificates` | `VolunteerDashboardController::certificates` | `account.volunteer.certificates` |
| `GET` | `/account/volunteer/rescue-reports` | `PetReportController::volunteerReports` | `account.volunteer.rescue-reports` |
| `POST`| `/account/volunteer/rescue-reports/{report}/status` | `PetReportController::updateStatus` | `account.volunteer.rescue-reports.update-status` |
| `GET` | `/account/volunteer/notifications` | `Inertia::render('volunteer/notifications')` | `account.volunteer.notifications` |

---

## 🛠️ Admin Routes (`/account/admin/*`)

*Middleware: `['auth', 'verified', RoleMiddleware::using([Role::Admin, Role::SuperAdmin])]`*

| Method | URI | Controller Action | Name |
|---|---|---|---|
| `GET` | `/account/admin/dashboard` | `DashboardController::index` | `account.admin.dashboard` |
| `GET` | `/account/admin/rescue-management` | `RescueManagementController::index` | `account.admin.rescue-management` |
| `POST`| `/account/admin/rescue-management/{report}/assign` | `RescueManagementController::assignVolunteer` | `account.admin.rescue-management.assign` |
| `POST`| `/account/admin/rescue-management/{report}/status` | `RescueManagementController::updateStatus` | `account.admin.rescue-management.update-status` |
| `POST`| `/account/admin/rescue-management/{report}/duplicate` | `RescueManagementController::resolveDuplicate` | `account.admin.rescue-management.resolve-duplicate` |
| `GET` | `/account/admin/ai-validation` | `AiValidationController::index` | `account.admin.ai-validation` |
| `POST`| `/account/admin/ai-validation/{report}/approve` | `AiValidationController::approve` | `account.admin.ai-validation.approve` |
| `POST`| `/account/admin/ai-validation/{report}/reject` | `AiValidationController::reject` | `account.admin.ai-validation.reject` |
| `GET` | `/account/admin/adoption-management` | `AdoptionManagementController::index` | `account.admin.adoption-management` |
| `POST`| `/account/admin/adoption-management/applications/{application}/status` | `AdoptionManagementController::updateStatus` | `account.admin.adoption-management.update-status` |
| `POST`| `/account/admin/adoption-management/pets` | `AdoptablePetController::store` | `account.admin.adoption-management.pets.store` |
| `POST`| `/account/admin/adoption-management/pets/{pet}/needs` | `AdoptablePetController::storeNeed` | `account.admin.adoption-management.pets.needs.store` |
| `PUT` | `/account/admin/adoption-management/needs/{need}` | `AdoptablePetController::updateNeed` | `account.admin.adoption-management.needs.update` |
| `DELETE`| `/account/admin/adoption-management/needs/{need}`| `AdoptablePetController::destroyNeed`| `account.admin.adoption-management.needs.destroy`|
| `GET` | `/account/admin/volunteer-management` | `VolunteerManagementController::index` | `account.admin.volunteer-management` |
| `POST`| `/account/admin/volunteer-management/applications/{application}/approve` | `VolunteerManagementController::approve` | `account.admin.volunteer-management.approve` |
| `POST`| `/account/admin/volunteer-management/applications/{application}/reject` | `VolunteerManagementController::reject` | `account.admin.volunteer-management.reject` |
| `POST`| `/account/admin/volunteer-management/assign` | `VolunteerManagementController::assignTask` | `account.admin.volunteer-management.assign` |
| `POST`| `/account/admin/volunteer-management/tasks/{task}/status` | `VolunteerManagementController::updateTaskStatus` | `account.admin.volunteer-management.update-task-status` |
| `POST`| `/account/admin/volunteer-management/issue-certificate` | `VolunteerManagementController::issueCertificate` | `account.admin.volunteer-management.issue-certificate` |
| `GET` | `/account/admin/donation-monitoring` | `DonationMonitoringController::index` | `account.admin.donation-monitoring` |
| `POST`| `/account/admin/donation-monitoring/donations/{donation}/verify-cash` | `DonationMonitoringController::verifyCash` | `account.admin.donation-monitoring.verify-cash` |
| `POST`| `/account/admin/donation-monitoring/donations/{donation}/reject` | `DonationMonitoringController::rejectDonation` | `account.admin.donation-monitoring.reject` |
| `POST`| `/account/admin/donation-monitoring/in-kind/{donation}/verify` | `DonationMonitoringController::verifyInKind` | `account.admin.donation-monitoring.in-kind.verify` |
| `POST`| `/account/admin/donation-monitoring/inventory` | `DonationMonitoringController::storeInventoryItem` | `account.admin.donation-monitoring.inventory.store` |
| `PUT` | `/account/admin/donation-monitoring/inventory/{item}` | `DonationMonitoringController::updateInventoryItem`| `account.admin.donation-monitoring.inventory.update`|
| `DELETE`| `/account/admin/donation-monitoring/inventory/{item}`| `DonationMonitoringController::destroyInventoryItem`| `account.admin.donation-monitoring.inventory.destroy`|
| `POST`| `/account/admin/donation-monitoring/inventory/{item}/batches` | `DonationMonitoringController::storeBatch` | `account.admin.donation-monitoring.inventory.batches.store` |
| `POST`| `/account/admin/donation-monitoring/inventory/batches/{batch}/adjust` | `DonationMonitoringController::adjustBatchStock` | `account.admin.donation-monitoring.inventory.batches.adjust` |
| `GET` | `/account/admin/events` | `EventManagementController::index` | `account.admin.events` |
| `POST`| `/account/admin/events` | `EventManagementController::storeEvent` | `account.admin.events.store` |
| `PUT` | `/account/admin/events/{event}` | `EventManagementController::updateEvent` | `account.admin.events.update` |
| `POST`| `/account/admin/events/{event}/toggle` | `EventManagementController::toggleEventStatus` | `account.admin.events.toggle` |
| `DELETE`| `/account/admin/events/{event}` | `EventManagementController::destroyEvent` | `account.admin.events.destroy` |
| `POST`| `/account/admin/feeding-schedules` | `EventManagementController::storeFeedingSchedule` | `account.admin.feeding-schedules.store` |
| `PUT` | `/account/admin/feeding-schedules/{schedule}` | `EventManagementController::updateFeedingSchedule` | `account.admin.feeding-schedules.update` |
| `DELETE`| `/account/admin/feeding-schedules/{schedule}` | `EventManagementController::destroyFeedingSchedule` | `account.admin.feeding-schedules.destroy` |
| `GET` | `/account/admin/reports-analytics` | `ReportsAnalyticsController::index` | `account.admin.reports-analytics` |
| `GET` | `/account/admin/reports-analytics/export` | `ReportsAnalyticsController::export` | `account.admin.reports-analytics.export` |

---

## 👑 Super Admin Routes (`/account/super-admin/*`)

*Middleware: `['auth', 'verified', RoleMiddleware::using(Role::SuperAdmin)]`*

| Method | URI | Controller Action | Name |
|---|---|---|---|
| `GET` | `/account/super-admin/dashboard` | `SuperAdminDashboardController::index` | `account.super-admin.dashboard` |
| `GET` | `/account/super-admin/user-management` | `UserManagementController::index` | `account.super-admin.user-management` |
| `POST`| `/account/super-admin/user-management` | `UserManagementController::store` | `account.super-admin.user-management.store` |
| `PUT` | `/account/super-admin/user-management/{user}` | `UserManagementController::update` | `account.super-admin.user-management.update` |
| `DELETE`| `/account/super-admin/user-management/{user}` | `UserManagementController::destroy` | `account.super-admin.user-management.destroy` |
| `POST`| `/account/super-admin/user-management/{id}/restore` | `UserManagementController::restore` | `account.super-admin.user-management.restore` |
| `GET` | `/account/super-admin/audit-logs` | `AuditLogController::index` | `account.super-admin.audit-logs` |
| `GET` | `/account/super-admin/archives` | `ArchiveController::index` | `account.super-admin.archives` |
| `POST`| `/account/super-admin/archives/{type}/{id}/restore` | `ArchiveController::restore` | `account.super-admin.archives.restore` |
| `DELETE`| `/account/super-admin/archives/{type}/{id}/force` | `ArchiveController::forceDelete` | `account.super-admin.archives.force-delete` |
| `GET` | `/account/super-admin/security-access` | `SecurityController::index` | `account.super-admin.security-access` |
| `GET` | `/account/super-admin/backup-restore` | `BackupController::index` | `account.super-admin.backup-restore` |
| `POST`| `/account/super-admin/backup-restore/run` | `BackupController::runBackup` | `account.super-admin.backup-restore.run` |
| `POST`| `/account/super-admin/backup-restore/{backup}/restore`| `BackupController::restoreBackup` | `account.super-admin.backup-restore.restore` |
| `DELETE`| `/account/super-admin/backup-restore/{backup}` | `BackupController::destroyBackup` | `account.super-admin.backup-restore.destroy` |
| `GET` | `/account/super-admin/ai-configuration` | `AiConfigController::index` | `account.super-admin.ai-configuration` |
| `POST`| `/account/super-admin/ai-configuration/settings` | `AiConfigController::updateSettings` | `account.super-admin.ai-configuration.settings` |
| `GET` | `/account/super-admin/system-settings` | `SystemSettingsController::index` | `account.super-admin.system-settings` |
| `POST`| `/account/super-admin/system-settings` | `SystemSettingsController::update` | `account.super-admin.system-settings.update` |
| `GET` | `/account/super-admin/analytics` | `AnalyticsController::index` | `account.super-admin.analytics` |
| `GET` | `/account/super-admin/analytics/export` | `AnalyticsController::export` | `account.super-admin.analytics.export` |

---

## 🔗 Related Documentation
- [[Controllers]]
- [[Middleware]]
- [[Authentication]]
- [[Authorization & RBAC]]
