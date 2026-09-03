# 📋 Validation & Form Requests

PAWLSE enforces strict request validation through dedicated **Form Request** classes and reusable concern traits in `app/Http/Requests/` and `app/Concerns/`.

---

## 📂 Form Requests Catalog

### 1. Adoption Requests
- **`StoreAdoptionApplicationRequest`**:
  - Validates applicant full name, contact info, housing status (owned vs. rented), landlord pet permissions, household members, other pets owned, and document attachments (valid ID, proof of income, home photos).
- **`ReviewAdoptionApplicationRequest`**:
  - Validates reviewer actions (`approve`, `reject`, `schedule_home_visit`, `request_info`), home visit date, and rejection reason.

### 2. Donation Requests
- **`StoreCashDonationRequest`**:
  - Validates donation amount (`min:10`), payment provider (`gcash`, `maya`, `bank_transfer`), donor privacy preference (`is_anonymous`), email, phone, and optional message.
- **`StoreInKindDonationRequest`**:
  - Validates item category (`food`, `medical`, `supplies`), item description, quantity, estimated value, drop-off date, and donor contact information.
- **`StoreSponsorshipDonationRequest`**:
  - Validates sponsored target (`pet_id` or `feeding_schedule_id`), recurring frequency, and payment details.
- **`VerifyDonationRequest` & `RejectDonationRequest`**:
  - Validates verification status, administrative notes, and rejection explanations.
- **`RequestDonationResubmissionRequest`**:
  - Validates resubmission instructions sent to the donor.

### 3. Pet & Rescue Requests
- **`StoreRescueReportRequest`**:
  - Validates report type (`rescue`, `injured`, `emergency`), location text, coordinates (`lat,lng`), condition description, uploaded photos (max 5 photos, max 10MB each), and AI prediction log ID linkage.
- **`StoreMissingReportRequest`**:
  - Validates pet name, species (`cat`, `dog`), breed, gender, last seen date/location, distinct markings, and contact numbers.
- **`StoreAdoptablePetRequest` & `UpdateAdoptablePetRequest`**:
  - Validates animal name, type, age category, gender, size, health status, vaccination details, spay/neuter status, story description, and primary photo.

### 4. Authentication & Settings Requests
- **`VerifyEmailOtpRequest`**:
  - Validates the 6-digit numeric OTP string (`digits:6`).
- **`PasswordValidationRules` (Concern)**:
  - Requires minimum length, mixed-case characters, numbers, and symbols.
- **`ProfileValidationRules` (Concern)**:
  - Validates name, unique email excluding current user, phone format, location, and avatar image constraints.

---

## 🔗 Related Documentation
- [[Controllers]]
- [[Authentication]]
- [[Adoption Management|Admin Features]]
- [[Rescue Management|Admin Features]]
