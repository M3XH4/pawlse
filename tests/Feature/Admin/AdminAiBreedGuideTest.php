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
});

test('super admin sees ai_breed_guide_enabled in system settings default values', function () {
    $this->actingAs($this->superAdmin)
        ->get(route('account.super-admin.system-settings'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('super-admin/system-settings')
            ->has('settings')
            ->where('settings.ai_breed_guide_enabled', true)
        );
});

test('super admin can disable and enable ai_breed_guide_enabled via system settings update', function () {
    // 1. Disable the breed guide feature
    $response = $this->actingAs($this->superAdmin)
        ->post(route('account.super-admin.system-settings.update'), [
            'app_name' => 'PAWLSE Test',
            'contact_email' => 'support@pawlse.test',
            'contact_phone' => '09123456789',
            'registration_enabled' => true,
            'maintenance_mode' => false,
            'maintenance_message' => 'Maintenance underway.',
            'payment_simulation_enabled' => false,
            'ai_breed_guide_enabled' => false,
        ]);

    $response->assertRedirect()->assertSessionHas('success');

    $saved = SystemSetting::getValue('system_settings');
    expect($saved['ai_breed_guide_enabled'])->toBeFalse();

    // 2. Re-enable the breed guide feature
    $response = $this->actingAs($this->superAdmin)
        ->post(route('account.super-admin.system-settings.update'), [
            'app_name' => 'PAWLSE Test',
            'contact_email' => 'support@pawlse.test',
            'contact_phone' => '09123456789',
            'registration_enabled' => true,
            'maintenance_mode' => false,
            'maintenance_message' => 'Maintenance underway.',
            'payment_simulation_enabled' => false,
            'ai_breed_guide_enabled' => true,
        ]);

    $response->assertRedirect()->assertSessionHas('success');

    $saved = SystemSetting::getValue('system_settings');
    expect($saved['ai_breed_guide_enabled'])->toBeTrue();
});

test('admin ai-validation panel receives breed_guide_enabled prop based on system setting', function () {
    // Enabled state (default)
    $this->actingAs($this->admin)
        ->get('/account/admin/ai-validation')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/ai-validation')
            ->where('breed_guide_enabled', true)
        );

    // Disabled state
    SystemSetting::setValue('system_settings', [
        'app_name' => 'PAWLSE',
        'contact_email' => 'test@pawlse.test',
        'contact_phone' => '09123456789',
        'registration_enabled' => true,
        'maintenance_mode' => false,
        'ai_breed_guide_enabled' => false,
    ]);

    $this->actingAs($this->admin)
        ->get('/account/admin/ai-validation')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/ai-validation')
            ->where('breed_guide_enabled', false)
        );
});
