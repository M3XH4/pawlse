# 🔍 System Debugging Map: Step-by-Step Diagnostic Procedures

This guide details exactly where to look, what commands to run, and how to isolate problems across each tier of the PAWLSE application.

---

## ⚡ The 30-Second Triage Checklist

When something breaks, do these 3 checks in order:

1. **Check the Laravel Log**:
   ```powershell
   Get-Content storage/logs/laravel.log -Tail 30
   ```
   Or stream it live during manual testing:
   ```powershell
   php artisan pail
   ```
2. **Check Browser DevTools**:
   * **Console Tab**: JavaScript/React runtime exceptions, hydration errors.
   * **Network Tab** (Filter by `Fetch/XHR`): Check HTTP status codes (`422`, `403`, `404`, `500`) and the JSON response payload.
3. **Run the Targeted Test**:
   ```powershell
   php artisan test --compact --filter=SpecificTestName
   ```

---

## 🖥️ Tier 1: Frontend & Inertia React Debugging

### Common Scenarios

#### 1. Form Fails to Submit or "Nothing Happens"
* **Diagnosis**: Laravel returned a `422 Unprocessable Entity` validation error.
* **Where to Look**:
  * Open DevTools &rarr; Network &rarr; Click the red POST request &rarr; **Response** tab.
  * In React, inspect `$page.props.errors` or check form input error states.
* **Fix**: Ensure your React component handles `errors` passed down from `useForm()`:
  ```tsx
  const { data, setData, post, processing, errors } = useForm({ ... });
  // Make sure errors.field_name is rendered!
  ```

#### 2. Stale or Missing Page Props
* **Diagnosis**: The controller did not pass the required prop to `Inertia::render('...', [...])`.
* **Where to Look**:
  * Check the Controller method returning `Inertia::render()`.
  * In the browser console, run:
    ```js
    JSON.parse(document.getElementById('app').dataset.page).props
    ```
  * Or check `HandleInertiaRequests.php` for shared global props (like `auth.user`, `flash`, or `unreadNotifications`).

#### 3. Wayfinder Route Generation Mismatch
* **Diagnosis**: In TypeScript, calling an action or route helper throws a TypeError or missing parameter error.
* **Where to Look**:
  * Look at `routes/web.php` for named routes: `->name('adoptions.show')`.
  * Wayfinder generates TypeScript functions in `resources/js/actions` and `resources/js/routes`.
  * If routes were recently added or changed, regenerate by building or checking the dev server.

---

## ⚙️ Tier 2: Backend & Database Debugging

### Common Scenarios

#### 1. 403 Forbidden Errors
* **Diagnosis**: A Laravel Authorization Policy rejected the request.
* **Where to Look**:
  * Inspect `app/Policies/` for the relevant model (e.g. `AdoptionApplicationPolicy.php`).
  * Check user roles assigned in the database:
    ```powershell
    php artisan tinker --execute 'App\Models\User::find(1)->roles->pluck("name");'
    ```

#### 2. Inspecting Database Records on the Fly
* Instead of running raw SQL in MySQL/PostgreSQL, use Tinker without mutating data:
  ```powershell
  # Check latest adoption application
  php artisan tinker --execute 'App\Models\AdoptionApplication::latest()->first();'

  # Check system settings
  php artisan tinker --execute 'App\Models\SystemSetting::all();'
  ```

#### 3. Route & Middleware Diagnostics
* Check what controller or middleware handles an endpoint:
  ```powershell
  php artisan route:list --path=adopt
  php artisan route:list --name=admin
  ```

---

## 📡 Tier 3: Realtime & WebSockets Debugging

### Key Components
* **Server**: Laravel Reverb (`config/reverb.php`)
* **Observer**: `app/Observers/RealtimeActivityObserver.php`
* **Broadcaster Service**: `app/Services/RealtimeEventBroadcaster.php`
* **Client Echo**: `resources/js/echo.ts` and `resources/js/lib/realtime-page-sync.ts`

### Common Scenarios

#### 1. Notifications or Dashboard Counters Don't Update Live
1. **Is Reverb Running?**
   ```powershell
   php artisan reverb:start
   ```
2. **Check Browser Console**: Look for Echo connection messages or WebSocket handshake failures (e.g., `WebSocket connection to 'ws://127.0.0.1:8080/app/...' failed`).
3. **Verify Observer**: Check if the model has the `RealtimeActivityObserver` registered in `AppServiceProvider.php` or model boot method.

---

## 🧪 Tier 4: Testing & Verification Workflow

Every time you modify code or prepare for a defense run:

```powershell
# 1. Run quick compact test on the specific module
php artisan test --compact --filter=AdoptionFlowTest

# 2. Format dirty PHP files to project standards (Laravel Pint)
vendor/bin/pint --dirty --format agent

# 3. Check git status to ensure only intended files changed
git status
```
