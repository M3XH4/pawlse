<?php

use App\Models\SystemSetting;
use App\Models\User;
use App\Support\SandboxMode;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

test('super admin can enable and disable sandbox mode in system settings', function () {
    $superAdmin = User::factory()->superAdmin()->create();

    $this->actingAs($superAdmin)
        ->post('/account/super-admin/system-settings', [
            'app_name' => 'PAWLSE',
            'contact_email' => 'support@pawlse.test',
            'contact_phone' => '09123456789',
            'registration_enabled' => true,
            'maintenance_mode' => false,
            'sandbox_mode' => true,
        ])
        ->assertRedirect();

    expect(SystemSetting::getValue('system_settings')['sandbox_mode'])->toBeTrue();
    expect(SandboxMode::isEnabled())->toBeTrue();
});

test('sandbox mode prop is shared on user and volunteer achievements pages only when enabled', function () {
    $user = User::factory()->create();
    $volunteer = User::factory()->volunteer()->create();

    SystemSetting::setValue('system_settings', ['sandbox_mode' => false]);

    $this->actingAs($user)
        ->get(route('account.user.achievements'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->where('isSandboxMode', false));

    SystemSetting::setValue('system_settings', ['sandbox_mode' => true]);

    $this->actingAs($user)
        ->get(route('account.user.achievements'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->where('isSandboxMode', true));

    $this->actingAs($volunteer)
        ->get(route('account.volunteer.achievements'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->where('isSandboxMode', true));
});

test('sandbox mode is always disabled in production environment', function () {
    SystemSetting::setValue('system_settings', ['sandbox_mode' => true]);

    app()->detectEnvironment(fn () => 'production');

    expect(SandboxMode::isAllowedInEnvironment())->toBeFalse();
    expect(SandboxMode::isEnabled())->toBeFalse();
});
