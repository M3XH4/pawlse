<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

function createDashboardNotification(User $user, array $data = [], bool $read = false): string
{
    $notification = $user->notifications()->create([
        'id' => (string) Str::uuid(),
        'type' => 'dashboard.test',
        'data' => [
            'title' => 'Dashboard Alert',
            'message' => 'A role-specific dashboard notification.',
            'url' => route('account.user.index'),
            'icon' => 'system',
            ...$data,
        ],
        'read_at' => $read ? now() : null,
    ]);

    return $notification->id;
}

test('dashboard redirects authenticated users to their role dashboard', function (string $state, string $routeName) {
    $user = User::factory()->{$state}()->create();

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertRedirect(route($routeName));
})->with([
    ['user', 'account.user.index'],
    ['volunteer', 'account.volunteer.index'],
    ['admin', 'account.admin.dashboard'],
    ['superAdmin', 'account.super-admin.dashboard'],
]);

test('role dashboards share notifications and chrome props', function (string $state, string $routeName, string $component, string $role) {
    $user = User::factory()->{$state}()->create();
    createDashboardNotification($user);

    $this->actingAs($user)
        ->get(route($routeName))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component($component)
            ->where('dashboardRole', $role)
            ->has('dashboardChrome.greeting')
            ->has('dashboardChrome.dateLabel')
            ->has('dashboardNotifications', 1)
            ->where('dashboardNotifications.0.title', 'Dashboard Alert')
            ->where('dashboardNotifications.0.read', false)
            ->has('dashboardNotifications.0.readUrl')
            ->has('dashboardNotificationActions.markAllReadUrl'),
        );
})->with([
    ['user', 'account.user.index', 'user/bookmark', 'user'],
    ['volunteer', 'account.volunteer.index', 'volunteer/profile-information', 'volunteer'],
    ['admin', 'account.admin.dashboard', 'admin/dashboard', 'admin'],
    ['superAdmin', 'account.super-admin.dashboard', 'super-admin/dashboard', 'super-admin'],
]);

test('users cannot access other role dashboards', function (string $state, string $routeName) {
    $user = User::factory()->{$state}()->create();

    $this->actingAs($user)
        ->get(route($routeName))
        ->assertForbidden();
})->with([
    ['user', 'account.volunteer.index'],
    ['user', 'account.admin.dashboard'],
    ['user', 'account.super-admin.dashboard'],
    ['volunteer', 'account.user.index'],
    ['volunteer', 'account.admin.dashboard'],
    ['volunteer', 'account.super-admin.dashboard'],
    ['admin', 'account.user.index'],
    ['admin', 'account.volunteer.index'],
    ['admin', 'account.super-admin.dashboard'],
]);

test('super admins can access admin dashboards but admins cannot access super admin dashboards', function () {
    $superAdmin = User::factory()->superAdmin()->create();
    $admin = User::factory()->admin()->create();

    $this->actingAs($superAdmin)
        ->get(route('account.admin.dashboard'))
        ->assertOk();

    $this->actingAs($admin)
        ->get(route('account.super-admin.dashboard'))
        ->assertForbidden();
});

test('dashboard notification read actions are scoped to the authenticated user', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();
    $notificationId = createDashboardNotification($user);
    $otherNotificationId = createDashboardNotification($otherUser);

    $this->actingAs($user)
        ->patch(route('account.notifications.read', $notificationId))
        ->assertRedirect();

    expect($user->notifications()->findOrFail($notificationId)->read())->toBeTrue();

    $this->actingAs($user)
        ->patch(route('account.notifications.read', $otherNotificationId))
        ->assertNotFound();
});

test('dashboard notification read all marks only the authenticated users notifications', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();
    $notificationId = createDashboardNotification($user);
    $otherNotificationId = createDashboardNotification($otherUser);

    $this->actingAs($user)
        ->patch(route('account.notifications.read-all'))
        ->assertRedirect();

    expect($user->notifications()->findOrFail($notificationId)->read())->toBeTrue()
        ->and($otherUser->notifications()->findOrFail($otherNotificationId)->read())->toBeFalse();
});
