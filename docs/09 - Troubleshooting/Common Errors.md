# 🛠️ Common Errors & Troubleshooting

Quick-reference diagnostic guide for general full-stack issues across the PAWLSE application.

---

# Problem: Vite Manifest Missing Exception

## Symptoms
Laravel throws `Illuminate\Foundation\ViteException: Unable to locate file in Vite manifest: resources/js/app.tsx`.

## Cause
The Vite development server is not running or the production manifest (`public/build/manifest.json`) has not been compiled.

## Solution
1. In development, ensure the Vite development server is active:
   ```bash
   npm run dev
   ```
2. In production or test environments, build the frontend assets:
   ```bash
   npm run build
   ```

## Prevention
Run `npm run build` as part of your deployment and CI scripts.

## Related
* [[Vite|Technology Stack]]
* [[React Errors]]
* [[Inertia Errors]]

---

# Problem: 419 Page Expired / CSRF Token Mismatch

## Symptoms
Submitting forms or making actions throws a `419 Page Expired` error modal in Inertia.

## Cause
The user's session expired, or the CSRF token became out of sync due to long idle periods or multiple tabs.

## Solution
1. Refresh the page to reload the session and CSRF cookie.
2. In development, clear application cookies and sessions:
   ```bash
   php artisan session:clear
   ```

## Prevention
Ensure Inertia's `useForm` hook is used for form submissions, as it automatically includes the CSRF header on XHR requests.

## Related
* [[Inertia Errors]]
* [[Authentication]]

---

# Problem: Storage Images (Avatars/Pet Photos) 404 Not Found

## Symptoms
Uploaded pet photos or user avatars fail to render, returning 404 HTTP errors.

## Cause
The public storage symbolic link (`public/storage` ➔ `storage/app/public`) has not been created or was broken.

## Solution
Re-create the storage symlink:
```bash
php artisan storage:link
```

## Prevention
Always run `php artisan storage:link` after fresh checkouts or server deployments.

## Related
* [[Development Setup]]
* [[Laravel Errors]]
