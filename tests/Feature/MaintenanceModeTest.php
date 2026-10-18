<?php

use App\Models\SystemSetting;
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

test('super admin can view system settings page with maintenance configuration', function () {
    $this->actingAs($this->superAdmin)
        ->get(route('account.super-admin.system-settings'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('super-admin/system-settings')
            ->has('settings')
            ->has('settings.app_name')
            ->has('settings.maintenance_mode')
            ->has('settings.maintenance_message')
        );
});

test('super admin can quickly toggle maintenance mode on and off', function () {
    // 1. Initial state: maintenance mode is off
    $settings = SystemSetting::getValue('system_settings', [
        'maintenance_mode' => false,
    ]);
    expect($settings['maintenance_mode'] ?? false)->toBeFalse();

    // 2. Toggle ON
    $this->actingAs($this->superAdmin)
        ->from(route('account.super-admin.system-settings'))
        ->post(route('account.super-admin.system-settings.maintenance.toggle'), [
            'maintenance_message' => 'Emergency maintenance in progress.',
        ])
        ->assertRedirect(route('account.super-admin.system-settings'))
        ->assertSessionHas('success');

    $updatedSettings = SystemSetting::getValue('system_settings');
    expect($updatedSettings['maintenance_mode'])->toBeTrue();
    expect($updatedSettings['maintenance_message'])->toBe('Emergency maintenance in progress.');

    // Assert audit log was recorded
    $this->assertDatabaseHas('audit_logs', [
        'action' => 'maintenance_mode_toggle',
    ]);

    // 3. Toggle OFF
    $this->actingAs($this->superAdmin)
        ->from(route('account.super-admin.system-settings'))
        ->post(route('account.super-admin.system-settings.maintenance.toggle'))
        ->assertRedirect(route('account.super-admin.system-settings'))
        ->assertSessionHas('success');

    $deactivatedSettings = SystemSetting::getValue('system_settings');
    expect($deactivatedSettings['maintenance_mode'])->toBeFalse();
});

test('super admin can update maintenance mode and message through standard settings form', function () {
    $this->actingAs($this->superAdmin)
        ->post(route('account.super-admin.system-settings.update'), [
            'app_name' => 'PAWLSE Rescue',
            'contact_email' => 'ops@pawlse.test',
            'contact_phone' => '09129998877',
            'registration_enabled' => true,
            'maintenance_mode' => true,
            'maintenance_message' => 'Upgrading database servers.',
        ])
        ->assertRedirect();

    $settings = SystemSetting::getValue('system_settings');
    expect($settings['maintenance_mode'])->toBeTrue();
    expect($settings['maintenance_message'])->toBe('Upgrading database servers.');
});

test('when maintenance mode is active public visitors receive 503 maintenance page', function () {
    SystemSetting::setValue('system_settings', [
        'app_name' => 'PAWLSE Test',
        'contact_email' => 'help@pawlse.test',
        'contact_phone' => '09990001122',
        'registration_enabled' => false,
        'maintenance_mode' => true,
        'maintenance_message' => 'Short paws for updates.',
    ]);

    // Public homepage
    $this->get('/')
        ->assertStatus(503)
        ->assertInertia(fn (Assert $page) => $page
            ->component('maintenance')
            ->where('appName', 'PAWLSE Test')
            ->where('message', 'Short paws for updates.')
            ->where('contactEmail', 'help@pawlse.test')
            ->where('contactPhone', '09990001122')
        );

    // Public adopt page
    $this->get('/adopt')
        ->assertStatus(503)
        ->assertInertia(fn (Assert $page) => $page
            ->component('maintenance')
        );
});

test('when maintenance mode is active login and auth routes remain accessible', function () {
    SystemSetting::setValue('system_settings', [
        'maintenance_mode' => true,
    ]);

    $this->get('/login')
        ->assertOk();
});

test('when maintenance mode is active regular authenticated users receive 503 maintenance page', function () {
    SystemSetting::setValue('system_settings', [
        'maintenance_mode' => true,
        'maintenance_message' => 'Temporarily offline for maintenance.',
    ]);

    $this->actingAs($this->regularUser)
        ->get('/dashboard')
        ->assertStatus(503)
        ->assertInertia(fn (Assert $page) => $page
            ->component('maintenance')
            ->where('message', 'Temporarily offline for maintenance.')
        );
});

test('when maintenance mode is active super admin and admin bypass the restriction', function () {
    SystemSetting::setValue('system_settings', [
        'maintenance_mode' => true,
    ]);

    // Super Admin can access homepage and super admin dashboard
    $this->actingAs($this->superAdmin)
        ->get('/')
        ->assertOk();

    $this->actingAs($this->superAdmin)
        ->get(route('account.super-admin.dashboard'))
        ->assertOk();

    // Admin can access homepage and admin dashboard
    $this->actingAs($this->admin)
        ->get('/')
        ->assertOk();

    $this->actingAs($this->admin)
        ->get(route('account.admin.dashboard'))
        ->assertOk();
});

test('when maintenance mode is active api requests receive 503 json', function () {
    SystemSetting::setValue('system_settings', [
        'maintenance_mode' => true,
        'maintenance_message' => 'API maintenance active.',
    ]);

    $this->getJson('/api/automation/backup-status')
        ->assertStatus(503)
        ->assertJson([
            'message' => 'API maintenance active.',
            'maintenance_mode' => true,
        ]);
});

test('when maintenance mode is deactivated all public pages work normally', function () {
    SystemSetting::setValue('system_settings', [
        'maintenance_mode' => false,
    ]);

    $this->get('/')
        ->assertOk();

    $this->get('/adopt')
        ->assertOk();
});
