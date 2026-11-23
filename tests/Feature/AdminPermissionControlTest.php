<?php

use App\Enums\Role;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->seed(RoleSeeder::class);
});

it('allows super admin to update role permissions and enforces them on admin routes', function () {
    $superAdmin = User::factory()->create(['role' => Role::SuperAdmin->value]);
    $superAdmin->assignRole(Role::SuperAdmin->value);

    $admin = User::factory()->create(['role' => Role::Admin->value]);
    $admin->assignRole(Role::Admin->value);

    // Initially admin can view donation monitoring
    $this->actingAs($admin)
        ->get('/account/admin/donation-monitoring')
        ->assertOk();

    // Super Admin removes donations.view from the admin role
    $remainingPermissions = array_values(array_diff(
        $admin->getAllPermissions()->pluck('name')->toArray(),
        ['donations.view']
    ));

    $this->actingAs($superAdmin)
        ->put('/account/super-admin/roles/admin/permissions', [
            'permissions' => $remainingPermissions,
        ])
        ->assertRedirect();

    // Admin is now blocked from donation monitoring
    $this->actingAs($admin->fresh())
        ->get('/account/admin/donation-monitoring')
        ->assertForbidden();

    // Shared Inertia auth.user.permissions reflects the removal
    $this->actingAs($admin->fresh())
        ->get('/account/admin/dashboard')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('auth.user.permissions', fn ($perms) => ! in_array('donations.view', $perms->toArray(), true))
        );
});

it('allows super admin to revoke specific permissions per user without affecting other admins', function () {
    $superAdmin = User::factory()->create(['role' => Role::SuperAdmin->value]);
    $superAdmin->assignRole(Role::SuperAdmin->value);

    $adminA = User::factory()->create(['role' => Role::Admin->value]);
    $adminA->assignRole(Role::Admin->value);

    $adminB = User::factory()->create(['role' => Role::Admin->value]);
    $adminB->assignRole(Role::Admin->value);

    $this->actingAs($superAdmin)
        ->put("/account/super-admin/user-management/{$adminA->id}", [
            'name' => $adminA->name,
            'email' => $adminA->email,
            'role' => Role::Admin->value,
            'verified' => true,
            'permissions' => [],
            'revoked_permissions' => ['pets.view', 'pets.delete'],
        ])
        ->assertRedirect();

    expect($adminA->fresh()->hasPermissionTo('pets.view'))->toBeFalse();
    expect($adminA->fresh()->hasPermissionTo('pets.delete'))->toBeFalse();
    expect($adminA->fresh()->getAllPermissions()->pluck('name')->toArray())->not->toContain('pets.view', 'pets.delete');

    // Admin A is blocked from animal records, Admin B still has access
    $this->actingAs($adminA->fresh())
        ->get('/account/admin/animal-records')
        ->assertForbidden();

    $this->actingAs($adminB)
        ->get('/account/admin/animal-records')
        ->assertOk();
});

it('allows super admin to grant direct permission overrides to an admin', function () {
    $superAdmin = User::factory()->create(['role' => Role::SuperAdmin->value]);
    $superAdmin->assignRole(Role::SuperAdmin->value);

    $admin = User::factory()->create(['role' => Role::Admin->value]);
    $admin->assignRole(Role::Admin->value);

    expect($admin->hasPermissionTo('events.approve'))->toBeFalse();

    $this->actingAs($superAdmin)
        ->put("/account/super-admin/user-management/{$admin->id}", [
            'name' => $admin->name,
            'email' => $admin->email,
            'role' => Role::Admin->value,
            'verified' => true,
            'permissions' => ['events.approve'],
            'revoked_permissions' => [],
        ])
        ->assertRedirect();

    expect($admin->fresh()->hasPermissionTo('events.approve'))->toBeTrue();

    $this->actingAs($admin->fresh())
        ->get('/account/admin/dashboard')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('auth.user.permissions', fn ($perms) => in_array('events.approve', $perms->toArray(), true))
        );
});

it('always grants super admin access to ai validation and all admin routes', function () {
    $superAdmin = User::factory()->create(['role' => Role::SuperAdmin->value]);
    $superAdmin->assignRole(Role::SuperAdmin->value);

    $this->actingAs($superAdmin)
        ->get('/account/admin/ai-validation')
        ->assertOk();

    $this->actingAs($superAdmin)
        ->get('/account/admin/donation-monitoring')
        ->assertOk();
});
