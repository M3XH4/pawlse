<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Illuminate\Notifications\DatabaseNotification;
use Inertia\Middleware;

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
            'auth' => [
                'user' => $request->user(),
            ],
            'can_switch_to_volunteer' => $request->user()
                ? $request->user()->volunteerApplications()->where('status', 'approved')->exists()
                : false,
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'dashboardRole' => $dashboardRole,
            'dashboardNotifications' => $dashboardNotifications,
            'dashboardNotificationActions' => $request->user() === null
                ? null
                : [
                    'markAllReadUrl' => route('account.notifications.read-all'),
                    'clearAllUrl' => route('account.notifications.clear-all'),
                ],
            'unreadNotificationCount' => $request->user()?->unreadNotifications()->count() ?? 0,
            'dashboardChrome' => $dashboardChrome,
            'adminNotifications' => $dashboardNotifications,
            'adminChrome' => $dashboardChrome,
        ];
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
            ->map(fn (DatabaseNotification $notification): array => [
                'id' => $notification->id,
                'title' => (string) ($notification->data['title'] ?? 'Notification'),
                'description' => (string) ($notification->data['message'] ?? $notification->data['description'] ?? ''),
                'time' => $notification->created_at?->diffForHumans() ?? '',
                'url' => (string) ($notification->data['url'] ?? url()->current()),
                'icon' => (string) ($notification->data['icon'] ?? 'system'),
                'category' => (string) ($notification->data['category'] ?? $notification->data['icon'] ?? 'system'),
                'read' => $notification->read(),
                'readUrl' => route('account.notifications.read', $notification),
                'deleteUrl' => route('account.notifications.destroy', $notification),
                'createdAt' => $notification->created_at?->toIso8601String(),
            ])
            ->all();
    }
}
