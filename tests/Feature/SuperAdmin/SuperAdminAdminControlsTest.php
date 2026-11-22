<?php

use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(RoleSeeder::class);
    $this->superAdmin = User::factory()->superAdmin()->create();
    $this->admin = User::factory()->admin()->create();
    $this->regularUser = User::factory()->create();
});

dataset('superAdminControlRoutes', [
    'animal-records' => ['account.super-admin.animal-records', 'super-admin/animal-records', '/account/super-admin/animal-records'],
    'rescue-management' => ['account.super-admin.rescue-management', 'super-admin/rescue-management', '/account/super-admin/rescue-management'],
    'ai-validation' => ['account.super-admin.ai-validation', 'super-admin/ai-validation', '/account/super-admin/ai-validation'],
    'adoption-management' => ['account.super-admin.adoption-management', 'super-admin/adoption-management', '/account/super-admin/adoption-management'],
    'foster-management' => ['account.super-admin.foster-management', 'super-admin/foster-management', '/account/super-admin/foster-management'],
    'volunteer-management' => ['account.super-admin.volunteer-management', 'super-admin/volunteer-management', '/account/super-admin/volunteer-management'],
    'donation-monitoring' => ['account.super-admin.donation-monitoring', 'super-admin/donation-monitoring', '/account/super-admin/donation-monitoring'],
    'events' => ['account.super-admin.events', 'super-admin/events', '/account/super-admin/events'],
    'blog-management' => ['account.super-admin.blog-management', 'super-admin/blog-management', '/account/super-admin/blog-management'],
]);

test('super admin can access all admin controls tabs within super admin layout and elevated context', function (string $routeName, string $expectedComponent, string $expectedBasePath) {
    $this->actingAs($this->superAdmin)
        ->get(route($routeName))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component($expectedComponent)
            ->where('isSuperAdmin', true)
            ->where('basePath', $expectedBasePath)
        );
})->with('superAdminControlRoutes');

test('regular admin and standard users cannot access super admin controls routes', function (string $routeName) {
    $this->actingAs($this->admin)
        ->get(route($routeName))
        ->assertForbidden();

    $this->actingAs($this->regularUser)
        ->get(route($routeName))
        ->assertForbidden();
})->with('superAdminControlRoutes');
