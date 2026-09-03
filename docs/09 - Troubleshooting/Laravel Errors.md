# 🐘 Laravel Errors & Troubleshooting

Diagnostic guide for Laravel backend, routing, and permission issues in PAWLSE.

---

# Problem: Unauthorized / 403 Forbidden on Admin or Super Admin Routes

## Symptoms
An authenticated user navigating to `/account/admin/*` or `/account/super-admin/*` receives a `403 User does not have the right roles.` error.

## Cause
The user has not been granted the corresponding Spatie role (`admin` or `super-admin`) in the `model_has_roles` database table.

## Solution
Assign the required role via tinker or during database seeding:
```bash
php artisan tinker --execute '$u = App\Models\User::where("email", "your@email.com")->first(); $u->syncRoles(["admin", "super-admin"]);'
```
Or re-run the role seeder:
```bash
php artisan db:seed --class=RoleSeeder
```

## Prevention
Ensure `CreateNewUser` assigns the default `user` role, and role elevations are processed exclusively through the Super Admin User Management panel.

## Related
* [[Authorization & RBAC]]
* [[Super Admin Features]]

---

# Problem: OTP Verification Limit Reached / Cooldown Active

## Symptoms
User cannot verify their account or resend OTP code due to throttling limits.

## Cause
Exceeded 5 incorrect attempts (`hasReachedEmailVerificationOtpAttemptLimit()`) or requested resend before 60-second cooldown elapsed.

## Solution
Reset OTP counters via tinker for the affected user:
```bash
php artisan tinker --execute '$u = App\Models\User::where("email", "user@email.com")->first(); $u->clearEmailVerificationOtp(); $u->sendEmailVerificationNotification();'
```

## Prevention
Inform users in the UI of the 60-second cooldown countdown and remaining attempts.

## Related
* [[Authentication]]
* [[Email & Notifications]]

---

# Problem: Haversine Duplicate Calculation Errors

## Symptoms
New rescue reports fail to save or trigger coordinate parsing exceptions.

## Cause
Location string format does not match `'latitude, longitude'` regex pattern or contains invalid characters.

## Solution
Ensure `PetReport::getCoordinates()` gracefully falls back to `null` and performs substring matching on `location` text if coordinates are absent.

## Prevention
Sanitize location inputs and enforce standard geolocation coordinate formatting on the frontend.

## Related
* [[Rescue Management|Admin Features]]
* [[Models]]
