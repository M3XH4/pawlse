<?php

namespace App\Http\Middleware;

use App\Models\CareSustainability;
use App\Models\SystemSetting;
use App\Services\NotificationPayloadFormatter;
use App\Support\UserFriendlyErrorResolver;
use Illuminate\Http\Request;
use Illuminate\Notifications\DatabaseNotification;
use Inertia\Inertia;
use Inertia\Middleware;
use Inertia\Support\SessionKey;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $dashboardRole = $this->dashboardRole($request);
        $dashboardNotifications = $dashboardRole === null
            ? []
            : $this->dashboardNotifications($request);

        $dashboardChrome = $dashboardRole === null
            ? null
            : [
                'greeting' => match (true) {
                    now()->hour < 12 => 'Good Morning',
                    now()->hour < 17 => 'Good Afternoon',
                    default => 'Good Evening',
                },
                'dateLabel' => now()->timezone(config('app.timezone'))->format('l, F j, Y'),
            ];

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'isMaintenanceMode' => fn () => (bool) rescue(fn () => SystemSetting::getValue('system_settings')['maintenance_mode'] ?? false, false, false),
            'careSustainability' => fn () => rescue(fn () => CareSustainability::current()->toPublicArray(), null, false),
            'auth' => [
                'user' => $request->user(),
            ],
            'can_switch_to_volunteer' => $request->user()
                ? rescue(fn () => $request->user()->volunteerApplications()->where('status', 'approved')->exists(), false, false)
                : false,
            'is_foster_parent' => $request->user()
                ? rescue(fn () => $request->user()->isApprovedFosterParent(), false, false)
                : false,
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'dashboardRole' => $dashboardRole,
            'dashboardNotifications' => $dashboardNotifications,
            'dashboardNotificationActions' => ($request->user() === null || $dashboardRole === null)
                ? null
                : [
                    'markAllReadUrl' => route('account.notifications.read-all'),
                    'clearAllUrl' => route('account.notifications.clear-all'),
                ],
            'unreadNotificationCount' => $dashboardRole === null ? 0 : ($request->user()?->unreadNotifications()->count() ?? 0),
            'dashboardChrome' => $dashboardChrome,
            'adminNotifications' => $dashboardNotifications,
            'adminChrome' => $dashboardChrome,
            'flash' => fn () => $this->resolveSessionFlash($request),
        ];
    }

    /**
     * Bridge standard Laravel session flashes ('toast', 'error', 'warning', 'success', 'info')
     * into Inertia v3 flash data so every redirect across the app displays a clear toast.
     */
    protected function reflash(Request $request): void
    {
        if ($request->hasSession()) {
            $newFlashKeys = $request->session()->get('_flash.new', []);
            $flashedInCurrentRequest = is_array($newFlashKeys)
                && in_array(SessionKey::FLASH_DATA, $newFlashKeys, true);
            $flashed = Inertia::getFlashed($request);

            if (! $flashedInCurrentRequest || ! isset($flashed['toast'])) {
                $toastPayload = $this->extractNormalizedToastFromSession($request, true);
                if ($toastPayload !== null) {
                    Inertia::flash('toast', $toastPayload);
                }
            }
        }

        parent::reflash($request);
    }

    /**
     * @return array{toast: array<string, mixed>|null, error: string|null, warning: string|null, success: string|null, info: string|null}
     */
    private function resolveSessionFlash(Request $request): array
    {
        if (! $request->hasSession()) {
            return [
                'toast' => null,
                'error' => null,
                'warning' => null,
                'success' => null,
                'info' => null,
            ];
        }

        return [
            'toast' => $this->extractNormalizedToastFromSession($request),
            'error' => is_string($request->session()->get('error')) ? $request->session()->get('error') : null,
            'warning' => is_string($request->session()->get('warning')) ? $request->session()->get('warning') : null,
            'success' => is_string($request->session()->get('success')) ? $request->session()->get('success') : null,
            'info' => is_string($request->session()->get('info')) ? $request->session()->get('info') : null,
        ];
    }

    /**
     * @return array{type: 'success'|'error'|'warning'|'info', title: string, message: string, description?: string}|null
     */
    private function extractNormalizedToastFromSession(Request $request, bool $preferNewlyFlashed = false): ?array
    {
        if (! $request->hasSession()) {
            return null;
        }

        $session = $request->session();
        $newFlashKeys = $preferNewlyFlashed && is_array($session->get('_flash.new'))
            ? $session->get('_flash.new')
            : [];

        if ($newFlashKeys !== []) {
            if (in_array('toast', $newFlashKeys, true) && $session->has('toast')) {
                return UserFriendlyErrorResolver::normalizeToast($session->get('toast'));
            }

            foreach (['error', 'warning', 'success', 'info'] as $type) {
                if (in_array($type, $newFlashKeys, true) && $session->has($type)) {
                    $val = $session->get($type);
                    if ((is_string($val) && trim($val) !== '') || is_array($val)) {
                        return UserFriendlyErrorResolver::normalizeToast($val, $type);
                    }
                }
            }
        }

        if ($session->has('toast')) {
            return UserFriendlyErrorResolver::normalizeToast($session->get('toast'));
        }

        foreach (['error', 'warning', 'success', 'info'] as $type) {
            if ($session->has($type)) {
                $val = $session->get($type);
                if (is_string($val) && trim($val) !== '') {
                    return UserFriendlyErrorResolver::normalizeToast($val, $type);
                }
                if (is_array($val)) {
                    return UserFriendlyErrorResolver::normalizeToast($val, $type);
                }
            }
        }

        return null;
    }

    private function dashboardRole(Request $request): ?string
    {
        return match (true) {
            $request->is('account/super-admin*') => 'super-admin',
            $request->is('account/admin*') => 'admin',
            $request->is('account/volunteer*') => 'volunteer',
            $request->is('account/user*') => 'user',
            default => null,
        };
    }

    /**
     * @return list<array{id: string, title: string, description: string, time: string, url: string, icon: string, category: string, read: bool, readUrl: string, deleteUrl: string, createdAt: string|null}>
     */
    private function dashboardNotifications(Request $request): array
    {
        $user = $request->user();

        if ($user === null) {
            return [];
        }

        return $user->notifications()
            ->latest()
            ->limit(30)
            ->get()
            ->map(fn (DatabaseNotification $notification): array => NotificationPayloadFormatter::format($notification))
            ->all();
    }
}
