<?php

use App\Enums\Role;
use App\Models\User;
use Database\Seeders\AccountSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role as PermissionRole;

uses(RefreshDatabase::class);

test('role seeding creates all authentication roles', function () {
    $this->seed(RoleSeeder::class);

    foreach (Role::cases() as $role) {
        expect(PermissionRole::findByName($role->value, 'web'))->not->toBeNull();
    }
});

test('account seeding creates verified demo accounts for each role', function (string $email, Role $role) {
    $this->seed([
        RoleSeeder::class,
        AccountSeeder::class,
    ]);

    $user = User::query()->where('email', $email)->first();

    expect($user)->not->toBeNull()
        ->and($user->hasVerifiedEmail())->toBeTrue()
        ->and($user->role)->toBe($role->value)
        ->and($user->hasRole($role))->toBeTrue();
})->with([
    ['user@pawlse.test', Role::User],
    ['volunteer@pawlse.test', Role::Volunteer],
    ['admin@pawlse.test', Role::Admin],
    ['superadmin@pawlse.test', Role::SuperAdmin],
]);

test('seeded accounts can authenticate and reach their role dashboard', function (string $email, string $routeName) {
    $this->seed([
        RoleSeeder::class,
        AccountSeeder::class,
    ]);

    $this->post(route('login.store'), [
        'email' => $email,
        'password' => 'password',
    ])->assertRedirect(route('dashboard', absolute: false));

    $this->assertAuthenticated();

    $this->get(route('dashboard'))
        ->assertRedirect(route($routeName));

    $this->get(route($routeName))->assertOk();
})->with([
    ['user@pawlse.test', 'account.user.index'],
    ['volunteer@pawlse.test', 'account.volunteer.index'],
    ['admin@pawlse.test', 'account.admin.dashboard'],
    ['superadmin@pawlse.test', 'account.super-admin.dashboard'],
]);

test('user factory states assign matching spatie roles', function (string $state, Role $role) {
    $user = User::factory()->{$state}()->create();

    expect($user->role)->toBe($role->value)
        ->and($user->hasRole($role))->toBeTrue();
})->with([
    ['user', Role::User],
    ['volunteer', Role::Volunteer],
    ['admin', Role::Admin],
    ['superAdmin', Role::SuperAdmin],
]);

test('guests are redirected from role dashboards', function (string $routeName) {
    $this->get(route($routeName))
        ->assertRedirect(route('login'));
})->with([
    'user' => 'account.user.index',
    'volunteer' => 'account.volunteer.index',
    'admin' => 'account.admin.dashboard',
    'super admin' => 'account.super-admin.dashboard',
]);
