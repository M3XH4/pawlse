# 🧩 Sub-Modules & Supporting Systems Defense Guide

While capstone defense panels begin with the primary workflows (Adoptions, Donations, Rescues), high-scoring candidates are tested on the **sub-modules, supporting features, and edge cases**. 

This document covers the **12 supporting & optional sub-modules** in PAWLSE with their technical architecture, file locations, anticipated panel problems, and battle-tested solutions.

---

## 📑 Sub-Module Index

1. [Sub-Module 1: Unified Public Tracking System (`/track`)](#sub-module-1-unified-public-tracking-system-track)
2. [Sub-Module 2: Help Desk, Ticketing & Frequent Problems](#sub-module-2-help-desk-ticketing--frequent-problems)
3. [Sub-Module 3: Educational Resources & Secure Document Downloads](#sub-module-3-educational-resources--secure-document-downloads)
4. [Sub-Module 4: Community Blog, Reactions & User Stories](#sub-module-4-community-blog-reactions--user-stories)
5. [Sub-Module 5: Partner Management & Corporate Sponsors](#sub-module-5-partner-management--corporate-sponsors)
6. [Sub-Module 6: Community Honor Board & Badges](#sub-module-6-community-honor-board--badges)
7. [Sub-Module 7: Feeding Schedules, Street Routes & Care Sustainability](#sub-module-7-feeding-schedules-street-routes--care-sustainability)
8. [Sub-Module 8: Role Switching & Persona Impersonation](#sub-module-8-role-switching--persona-impersonation)
9. [Sub-Module 9: Signed URLs & Public Certificate Verification](#sub-module-9-signed-urls--public-certificate-verification)
10. [Sub-Module 10: Pet Bookmarks & User Watchlists](#sub-module-10-pet-bookmarks--user-watchlists)
11. [Sub-Module 11: Contact Form Inquiries & Rate Limiting](#sub-module-11-contact-form-inquiries--rate-limiting)
12. [Sub-Module 12: Database Backups, Archival & Retention](#sub-module-12-database-backups-archival--retention)

---

## Sub-Module 1: Unified Public Tracking System (`/track`)

### 📍 Key Files
- **Controller**: `app/Http/Controllers/PublicTrackingController.php`
- **Frontend Pages**: `resources/js/pages/track.tsx`, `resources/js/pages/adopt/track.tsx`
- **Supported Models**: `AdoptionApplication`, `PetReport` (Rescue & Missing), `Donation`, `Certificate`

### 🎯 Problems & Technical Solutions

#### Problem 1.1: Multi-Model Tracking Collision
* **Panel Question**: *"You have a single search bar on `/track`. What happens if an adoption tracking number accidentally matches a rescue report reference or donation receipt code?"*
* **Technical Solution**:
  * Reference numbers use **Domain-Specific Prefixes**:
    * `ADP-YYYYMMDD-XXXX` for Adoption Applications.
    * `RSC-YYYYMMDD-XXXX` for Emergency Rescues.
    * `MIS-YYYYMMDD-XXXX` for Missing Pet reports.
    * `DON-YYYYMMDD-XXXX` for Donations.
    * `CERT-XXXXXX` for Volunteer Certificates.
  * In `PublicTrackingController.php`, the controller inspects the prefix and routes the query exclusively to the relevant Eloquent model, eliminating cross-model ID collisions.

#### Problem 1.2: Information Leakage to Strangers
* **Panel Question**: *"If someone guesses my tracking code on the public `/track` page, can they see my home address, contact number, or full legal name?"*
* **Technical Solution**:
  * Public tracking endpoints apply **Data Scrubbing / API Resource Sanitization**:
    * Names are masked (e.g. `J*** D**`).
    * Full physical addresses are stripped, displaying only the Barangay or City.
    * Sensitive reviewer notes remain internal; only the high-level public milestone (e.g. `Under Review`, `Approved`, `Dispatched`) is exposed.

---

## Sub-Module 2: Help Desk, Ticketing & Frequent Problems

### 📍 Key Files
- **Controllers**: `app/Http/Controllers/HelpDeskController.php`, `app/Http/Controllers/Admin/HelpDeskController.php`, `app/Http/Controllers/SuperAdmin/HelpDeskController.php`
- **Models**: `app/Models/HelpDeskTicket.php`, `app/Models/HelpDeskReply.php`, `app/Models/FrequentProblem.php`
- **Frontend**: `resources/js/pages/admin/help-desk.tsx`, `resources/js/components/contact/contact-modal.tsx`

### 🎯 Problems & Technical Solutions

#### Problem 2.1: Deflecting Repetitive Tickets (FAQ Deflection)
* **Panel Question**: *"Shelter staff are overwhelmed by repeated questions like 'How much is the adoption fee?'. How does the system reduce ticket volume?"*
* **Technical Solution**:
  * The `FrequentProblem` model powers an auto-deflection mechanism.
  * When a citizen types a subject or keyword in the help desk modal, fuzzy search suggests matching verified answers from `frequent_problems` before allowing them to submit a ticket.

#### Problem 2.2: Ticket SLA / Stagnant Ticket Auto-Escalation
* **Panel Question**: *"What prevents an emergency or urgent citizen inquiry from being forgotten for weeks?"*
* **Technical Solution**:
  * `HelpDeskTicket` includes `priority` (`Low`, `Medium`, `High`, `Urgent`) and `status` (`open`, `in_progress`, `resolved`, `closed`).
  * High-priority tickets open for more than 48 hours without a staff reply automatically escalate to the Super Admin via notification badges.

---

## Sub-Module 3: Educational Resources & Secure Document Downloads

### 📍 Key Files
- **Controllers**: `app/Http/Controllers/ResourceDownloadController.php`, `app/Http/Controllers/SuperAdmin/ResourceManagementController.php`
- **Model**: `app/Models/ResourceFile.php`
- **Route**: `GET /resources/{resourceFile}/download`

### 🎯 Problems & Technical Solutions

#### Problem 3.1: Hotlinking and Unauthorized Direct File Access
* **Panel Question**: *"Can an external website hotlink to your shelter's adoption contracts or medical PDFs and drain your server bandwidth?"*
* **Technical Solution**:
  * Files are stored in non-public storage disks (`storage/app/private/resources/`).
  * `ResourceDownloadController.php` serves downloads through `Storage::download()`, validating the request, enforcing rate-limiting, and incrementing the `download_count` metric on `ResourceFile`.

#### Problem 3.2: Malicious Resource Upload by Compromised Admins
* **Panel Question**: *"What if an admin uploads an infected PDF with embedded JavaScript or executable payloads?"*
* **Technical Solution**:
  * In `ResourceManagementController.php`, uploads validate binary MIME types (`application/pdf`, `application/msword`) and strip original filenames, replacing them with sanitized hashes.

---

## Sub-Module 4: Community Blog, Reactions & User Stories

### 📍 Key Files
- **Controllers**: `app/Http/Controllers/BlogController.php`, `app/Http/Controllers/Admin/BlogManagementController.php`, `app/Http/Controllers/UserStoryController.php`
- **Models**: `app/Models/BlogPost.php`, `app/Models/BlogPostReaction.php`
- **Frontend**: `resources/js/pages/blog/`

### 🎯 Problems & Technical Solutions

#### Problem 4.1: Reaction Spamming (Clickjacking / Bot Hearts)
* **Panel Question**: *"What prevents a user or bot from spamming 10,000 'heart' or 'paw' reactions on a blog post to inflate stats?"*
* **Technical Solution**:
  * `BlogPostReaction` has a database composite unique key: `unique(['blog_post_id', 'user_id', 'reaction_type'])`.
  * For guest visitors, reactions are tracked by hashed IP/session cookie with Redis rate-limiting (`throttle:30,1`).
  * Clicking an active reaction acts as a toggle (un-reacts) rather than stacking duplicate counts.

#### Problem 4.2: Draft Leaks and SEO Slugs
* **Panel Question**: *"How do you prevent unapproved adoption stories from showing up in public Google search results or URL guessing?"*
* **Technical Solution**:
  * `BlogPost::published()` query scope enforces `is_published = true` and `published_at <= now()`.
  * Slugs are generated via `Str::slug($title)` and unique database index constraints prevent URL collisions.

---

## Sub-Module 5: Partner Management & Corporate Sponsors

### 📍 Key Files
- **Controller**: `app/Http/Controllers/SuperAdmin/PartnerManagementController.php`
- **Model**: `app/Models/Partner.php`
- **Frontend**: `resources/js/components/admin/partner-modal.tsx`, homepage partner showcase

### 🎯 Problems & Technical Solutions

#### Problem 5.1: Expired MOA / Partnership Display
* **Panel Question**: *"If a corporate pet food sponsorship MOA expired last month, does their logo automatically stay on the website?"*
* **Technical Solution**:
  * The `Partner` model includes `contract_start` and `contract_end` timestamps and `is_active` boolean.
  * Public queries automatically scope:
    ```php
    Partner::where('is_active', true)
        ->where(fn($q) => $q->whereNull('contract_end')->orWhere('contract_end', '>=', now()))
        ->orderBy('tier_priority');
    ```

#### Problem 5.2: Broken Image Links for External Partner Logos
* **Panel Question**: *"If an external partner deletes their logo URL, does it break your UI with an ugly broken image icon?"*
* **Technical Solution**:
  * Logos are uploaded and persisted locally/on cloud storage upon partner registration rather than using hotlinked URLs.
  * The React frontend includes fallback `onError={(e) => e.currentTarget.src = '/images/placeholder-partner.svg'}` handlers.

---

## Sub-Module 6: Community Honor Board & Badges

### 📍 Key Files
- **Controllers**: `app/Http/Controllers/HonorController.php`, `app/Http/Controllers/SuperAdmin/CommunityHonorController.php`
- **Model**: `app/Models/CommunityHonor.php`
- **Frontend**: `resources/js/pages/honor.tsx`

### 🎯 Problems & Technical Solutions

#### Problem 6.1: Anonymity Preference for High-Value Donors
* **Panel Question**: *"What if a wealthy donor sponsors ₱100,000 for stray feeding but explicitly requests NOT to be displayed on the public Honor Board for privacy/safety reasons?"*
* **Technical Solution**:
  * `Donation` and `CommunityHonor` records include an `is_anonymous` boolean.
  * When `is_anonymous === true`, the public board displays *"Generous Anonymous Guardian"* and hides profile avatars and usernames.

#### Problem 6.2: Automated Badge Assignment vs. Admin Discretion
* **Panel Question**: *"Are badges (e.g. 'Top Volunteer of the Month') purely calculated by code, or can shelter directors manually bestow honorary awards?"*
* **Technical Solution**:
  * **Hybrid Architecture**:
    * Quantitative badges (`50+ Hours Served`, `Consistent Feeder`) are automatically evaluated by background jobs.
    * Special community honors (`Heroic Rescuer Award`) can be manually conferred by Admins with customized citations through `CommunityHonorController.php`.

---

## Sub-Module 7: Feeding Schedules, Street Routes & Care Sustainability

### 📍 Key Files
- **Controllers**: `app/Http/Controllers/EventController.php` (routes: `feeding-schedules.join`, `leave`)
- **Models**: `app/Models/FeedingSchedule.php`, `app/Models/CareSustainability.php`, `app/Models/CareSustainabilityHistory.php`
- **Frontend**: `resources/js/pages/events.tsx`, `resources/js/components/foster/foster-care-view.tsx`

### 🎯 Problems & Technical Solutions

#### Problem 7.1: Street Feeding Route Abandonment
* **Panel Question**: *"What if a volunteer joins a designated street feeding route for Barangay San Miguel, but drops out 1 hour before scheduled feeding?"*
* **Technical Solution**:
  * `EventController::leaveFeedingRoute()` verifies the remaining assigned volunteers.
  * If assigned volunteers drop below the required minimum quota (`min_feeders`), an automated urgent dispatch alert is sent to nearby standby volunteers.

#### Problem 7.2: Care Sustainability Projections (Food Buffer Math)
* **Panel Question**: *"How does the shelter predict whether it has enough food for 80 shelter animals over the next 3 weeks?"*
* **Technical Solution**:
  * In `CareSustainability.php`, daily consumption is calculated:
    $$\text{Daily Kilograms Needed} = \sum (\text{Animal Count} \times \text{Portion Size per Species/Weight})$$
  * The system divides `Total Usable Food Inventory (kg)` by `Daily Kilograms Needed` to calculate the **Sustainability Runway (in Days)**. If runway $< 14$ days, it triggers automated donation appeals.

---

## Sub-Module 8: Role Switching & Persona Impersonation

### 📍 Key Files
- **Controller**: `app/Http/Controllers/VolunteerController.php` (methods: `switchRole`, `switchUser`)
- **Middleware**: `auth`, Spatie permission guards
- **Routes**: `POST /volunteer/switch`, `POST /volunteer/switch-user`

### 🎯 Problems & Technical Solutions

#### Problem 8.1: Privilege Escalation Exploits via Role Switching
* **Panel Question**: *"You have a feature that switches roles. Can a regular user or volunteer call `/volunteer/switch` to turn themselves into a Super Admin?"*
* **Technical Solution**:
  * In `VolunteerController.php`, `switchRole` strictly verifies the user's actual database role before switching persona views:
    ```php
    public function switchRole(Request $request)
    {
        $user = $request->user();
        if (! $user->hasRole('volunteer') && ! $user->hasRole('admin')) {
            abort(403, 'Unauthorized persona transition.');
        }
        // Only toggles active session context between allowed roles
        session(['active_persona' => $request->target_persona]);
    }
    ```
  * Session-based persona changes only affect UI presentation; actual backend route authorization checks the persistent Spatie database role (`$user->hasRole()`), making privilege escalation impossible.

#### Problem 8.2: Audit Trail Identity Confusion
* **Panel Question**: *"If an admin switches to a volunteer persona to log hours, who is recorded in the audit logs?"*
* **Technical Solution**:
  * `AuditLog` captures `user_id` (the true authenticated primary key) and `impersonated_as` / `active_persona`, ensuring that accountability always points to the physical account holder.

---

## Sub-Module 9: Signed URLs & Public Certificate Verification

### 📍 Key Files
- **Controller**: `app/Http/Controllers/EventController.php` (route: `certificates.public.show`), `app/Http/Controllers/PublicTrackingController.php`
- **Middleware**: `middleware('signed')`
- **Frontend Page**: `resources/js/pages/public-certificate.tsx`

### 🎯 Problems & Technical Solutions

#### Problem 9.1: Tampering with Certificate Parameters in the URL
* **Panel Question**: *"If your certificate verification URL is public, what stops someone from changing `id=12` to `id=15` in their browser to steal someone else's honors?"*
* **Technical Solution**:
  * URLs use Laravel's **HMAC Cryptographic Signatures**:
    ```php
    URL::signedRoute('certificates.public.show', ['certificate' => $cert->id]);
    ```
  * The `signed` middleware validates the `signature` query parameter against the application `APP_KEY`. Modifying any character in the URL produces an immediate `403 Invalid Signature` error.

#### Problem 9.2: Expiration of Time-Sensitive Signed Verification Links
* **Panel Question**: *"Should certificate verification links expire after 30 days?"*
* **Technical Solution**:
  * Permanent credentials (like graduation or service certificates) use standard non-expiring signed URLs or permanent hash lookups (`hash: sha256(id + issued_at)`).
  * Time-sensitive verification (such as temporary volunteer day-passes) use `temporarySignedRoute()` with a predefined TTL.

---

## Sub-Module 10: Pet Bookmarks & User Watchlists

### 📍 Key Files
- **Controller**: `app/Http/Controllers/PetController.php` / user bookmark actions
- **Frontend**: `resources/js/pages/user/bookmark.tsx`
- **Models**: `User`, `ShelterAnimal` (Many-to-Many relationship)

### 🎯 Problems & Technical Solutions

#### Problem 10.1: Bookmarked Pet Status Changes (Notification Trigger)
* **Panel Question**: *"If a citizen bookmarked a puppy, what happens when that puppy gets adopted by someone else?"*
* **Technical Solution**:
  * When `ShelterAnimal` status changes to `Adopted`, an Eloquent Observer dispatches a database notification to all users who have that animal in their bookmarks table, updating their badge: *"A pet on your watchlist has found a forever home!"*

#### Problem 10.2: Orphaned Bookmarks for Deleted Animal Records
* **Panel Question**: *"What happens if a shelter animal record is deleted? Does the user's bookmarks page crash?"*
* **Technical Solution**:
  * Foreign key constraint: `$table->foreignId('shelter_animal_id')->constrained()->cascadeOnDelete();`.
  * The query uses `with(['shelterAnimal'])` with eager loading and filters out null relations: `whereHas('shelterAnimal')`.

---

## Sub-Module 11: Contact Form Inquiries & Rate Limiting

### 📍 Key Files
- **Controller**: `app/Http/Controllers/ContactController.php`
- **Model**: `app/Models/ContactMessage.php`
- **Route**: `POST /contact` with `middleware('throttle:5,1')`
- **Frontend**: `resources/js/components/contact/contact-modal.tsx`

### 🎯 Problems & Technical Solutions

#### Problem 11.1: Denial of Service / Mailgun Quota Drainage via Contact Form
* **Panel Question**: *"What prevents an attacker from writing a Python script that submits your contact form 5,000 times an hour, exhausting your email server quota?"*
* **Technical Solution**:
  * **Layer 1: IP Rate Limiting**: The route is locked with `middleware('throttle:5,1')` (maximum 5 requests per minute per IP).
  * **Layer 2: Honeypot Protection**: A hidden form field (`website` or `confirm_email`) that only bots fill in. If populated, the request is silently dropped (`200 OK` returned without saving or sending mail).
  * **Layer 3: Asynchronous Queued Mails**: Mails implement `ShouldQueue`, ensuring web requests never block or exhaust PHP worker threads.

---

## Sub-Module 12: Database Backups, Archival & Retention

### 📍 Key Files
- **Controllers**: `app/Http/Controllers/SuperAdmin/BackupController.php`, `app/Http/Controllers/SuperAdmin/ArchiveController.php`
- **Model**: `app/Models/Backup.php`
- **Frontend**: `resources/js/pages/super-admin/audit-logs.tsx`

### 🎯 Problems & Technical Solutions

#### Problem 12.1: Performance Degradation from Huge Historical Audit Logs
* **Panel Question**: *"After 2 years, your `audit_logs` table will have 500,000 rows. Won't querying the admin dashboard slow down significantly?"*
* **Technical Solution**:
  * Handled via `SuperAdmin/ArchiveController.php`.
  * Audit logs older than 180 days are periodically partitioned or exported into compressed JSON/CSV archival storage, keeping the active hot table small and performant.

#### Problem 12.2: Ransomware / Storage Disk Failure on Backups
* **Panel Question**: *"What if the server disk gets corrupted or encrypted by malware? Your local backups in `storage/app/backups` are lost too!"*
* **Technical Solution**:
  * Pawlse supports offsite disk synchronization (`config/filesystems.php`). Backups are streamed directly to remote S3-compatible cloud object storage with versioning enabled, ensuring immutable disaster recovery.
