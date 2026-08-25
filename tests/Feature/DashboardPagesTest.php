<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

test('all user dashboard pages are reachable for users', function (string $routeName, string $component) {
    $this->actingAs(User::factory()->create())
        ->get(route($routeName))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component($component));
})->with([
    ['account.user.index', 'user/bookmark'],
    ['account.user.bookmark', 'user/bookmark'],
    ['account.user.rescue-reports', 'user/rescue-reports'],
    ['account.user.adoption-applications', 'user/adoption-applications'],
    ['account.user.donations', 'user/donations'],
    ['account.user.missing-found', 'user/missing-found'],
    ['account.user.notifications', 'user/notifications'],
    ['account.user.account-settings', 'user/account-settings'],
]);

test('all volunteer dashboard pages are reachable for volunteers', function (string $routeName, string $component) {
    $this->actingAs(User::factory()->volunteer()->create())
        ->get(route($routeName))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component($component));
})->with([
    ['account.volunteer.index', 'volunteer/profile-information'],
    ['account.volunteer.profile', 'volunteer/profile-information'],
    ['account.volunteer.status', 'volunteer/volunteer-status'],
    ['account.volunteer.assigned-tasks', 'volunteer/assigned-tasks'],
    ['account.volunteer.participation-history', 'volunteer/participation-history'],
    ['account.volunteer.certificates', 'volunteer/certificates'],
    ['account.volunteer.rescue-reports', 'volunteer/rescue-reports'],
    ['account.volunteer.notifications', 'volunteer/notifications'],
    ['account.volunteer.account-settings', 'volunteer/account-settings'],
]);

test('all admin dashboard pages are reachable for admins', function (string $routeName, string $component) {
    $this->actingAs(User::factory()->admin()->create())
        ->get(route($routeName))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component($component));
})->with([
    ['account.admin.dashboard', 'admin/dashboard'],
    ['account.admin.rescue-management', 'admin/rescue-management'],
    ['account.admin.ai-validation', 'admin/ai-validation'],
    ['account.admin.adoption-management', 'admin/adoption-management'],
    ['account.admin.volunteer-management', 'admin/volunteer-management'],
    ['account.admin.donation-monitoring', 'admin/donation-monitoring'],
    ['account.admin.events', 'admin/events'],
    ['account.admin.reports-analytics', 'admin/reports-analytics'],
    ['account.admin.notifications', 'admin/notifications'],
    ['account.admin.account-settings', 'admin/account-settings'],
]);

test('all super admin dashboard pages are reachable for super admins', function (string $routeName, string $component) {
    $this->actingAs(User::factory()->superAdmin()->create())
        ->get(route($routeName))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component($component));
})->with([
    ['account.super-admin.dashboard', 'super-admin/dashboard'],
    ['account.super-admin.admin-management', 'super-admin/admin-management'],
    ['account.super-admin.audit-logs', 'super-admin/audit-logs'],
    ['account.super-admin.archives', 'super-admin/archives'],
    ['account.super-admin.security-access', 'super-admin/security-access'],
    ['account.super-admin.advanced-analytics', 'super-admin/advanced-analytics'],
    ['account.super-admin.backup-restore', 'super-admin/backup-restore'],
    ['account.super-admin.ai-configuration', 'super-admin/ai-configuration'],
    ['account.super-admin.system-settings', 'super-admin/system-settings'],
    ['account.super-admin.notifications', 'super-admin/notifications'],
    ['account.super-admin.account-settings', 'super-admin/account-settings'],
]);
