<?php

use App\Models\AiPredictionLog;
use App\Models\PetReport;
use App\Models\SystemSetting;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(RoleSeeder::class);
    Cache::flush();

    $this->superAdmin = User::factory()->superAdmin()->create();
});

test('super admin can view ai configuration with service health and settings', function () {
    Http::fake([
        '*/health' => Http::response([
            'status' => 'healthy',
            'device' => 'cuda',
            'classes_loaded' => 39,
        ], 200),
    ]);

    $response = $this->actingAs($this->superAdmin)
        ->get(route('account.super-admin.ai-configuration'));

    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('super-admin/ai-configuration')
            ->has('settings')
            ->has('service_health', fn (Assert $health) => $health
                ->where('is_healthy', true)
                ->where('status', 'healthy')
                ->where('device', 'cuda')
                ->where('classes_loaded', 39)
                ->etc()
            )
            ->has('logs')
            ->has('stats')
        );
});

test('super admin can toggle ai features globally', function () {
    SystemSetting::setValue('ai_settings', [
        'ai_enabled' => true,
        'ai_reporting_enabled' => true,
        'ai_identifying_enabled' => true,
        'ai_confidence_threshold' => 0.70,
        'ai_auto_validation' => false,
    ]);

    // Toggle to false (without payload, auto flips)
    $response = $this->actingAs($this->superAdmin)
        ->post(route('account.super-admin.ai-configuration.toggle'));

    $response->assertRedirect();
    $settings = SystemSetting::getValue('ai_settings');
    expect($settings['ai_enabled'])->toBeFalse();

    // Toggle back to true
    $response = $this->actingAs($this->superAdmin)
        ->post(route('account.super-admin.ai-configuration.toggle'), ['enabled' => true]);

    $response->assertRedirect();
    $settings = SystemSetting::getValue('ai_settings');
    expect($settings['ai_enabled'])->toBeTrue();
});

test('super admin can check ai health status via endpoint', function () {
    Http::fake([
        '*/health' => Http::response([
            'status' => 'healthy',
            'device' => 'cpu',
            'classes_loaded' => 39,
        ], 200),
    ]);

    $response = $this->actingAs($this->superAdmin)
        ->getJson(route('account.super-admin.ai-configuration.health'));

    $response->assertOk()
        ->assertJson([
            'is_healthy' => true,
            'status' => 'healthy',
            'device' => 'cpu',
        ]);
});

test('super admin health check correctly detects when ai service is offline', function () {
    Http::fake([
        '*/health' => function () {
            throw new ConnectionException('Connection refused');
        },
    ]);

    $response = $this->actingAs($this->superAdmin)
        ->getJson(route('account.super-admin.ai-configuration.health'));

    $response->assertOk()
        ->assertJson([
            'is_healthy' => false,
            'status' => 'unreachable',
        ]);
});

test('rescue page receives aiStatus prop indicating enabled state when service is healthy', function () {
    Http::fake([
        '*/health' => Http::response([
            'status' => 'healthy',
        ], 200),
    ]);

    SystemSetting::setValue('ai_settings', [
        'ai_enabled' => true,
        'ai_reporting_enabled' => true,
        'ai_identifying_enabled' => true,
        'ai_confidence_threshold' => 0.70,
        'ai_auto_validation' => false,
    ]);

    $response = $this->get(route('rescue'));

    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('rescue')
            ->has('aiStatus', fn (Assert $status) => $status
                ->where('enabled', true)
                ->where('available', true)
                ->where('reporting_active', true)
                ->where('identifying_active', true)
                ->where('reporting_disabled_reason', null)
                ->where('identifying_disabled_reason', null)
                ->etc()
            )
        );
});

test('rescue page aiStatus indicates admin_disabled when ai is disabled by super admin', function () {
    Http::fake([
        '*/health' => Http::response([
            'status' => 'healthy',
        ], 200),
    ]);

    SystemSetting::setValue('ai_settings', [
        'ai_enabled' => false,
        'ai_reporting_enabled' => true,
        'ai_identifying_enabled' => true,
        'ai_confidence_threshold' => 0.70,
        'ai_auto_validation' => false,
    ]);

    $response = $this->get(route('rescue'));

    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('rescue')
            ->has('aiStatus', fn (Assert $status) => $status
                ->where('enabled', false)
                ->where('reporting_active', false)
                ->where('identifying_active', false)
                ->where('reporting_disabled_reason', 'admin_disabled')
                ->where('identifying_disabled_reason', 'admin_disabled')
                ->where('reporting_message', 'AI reporting is currently disabled by the administrator. Please use Manual Entry to submit a rescue report.')
                ->where('identifying_message', 'AI identification is currently disabled by the administrator.')
                ->etc()
            )
        );
});

test('rescue page aiStatus indicates service_unavailable when ai service is offline', function () {
    Http::fake([
        '*/health' => function () {
            throw new ConnectionException('Connection refused');
        },
    ]);

    SystemSetting::setValue('ai_settings', [
        'ai_enabled' => true,
        'ai_reporting_enabled' => true,
        'ai_identifying_enabled' => true,
        'ai_confidence_threshold' => 0.70,
        'ai_auto_validation' => false,
    ]);

    $response = $this->get(route('rescue'));

    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('rescue')
            ->has('aiStatus', fn (Assert $status) => $status
                ->where('enabled', true)
                ->where('available', false)
                ->where('reporting_active', false)
                ->where('identifying_active', false)
                ->where('reporting_disabled_reason', 'service_unavailable')
                ->where('identifying_disabled_reason', 'service_unavailable')
                ->where('reporting_message', 'AI service is currently unavailable or unreachable. Please use Manual Entry to submit a rescue report.')
                ->where('identifying_message', 'AI service is currently unavailable or unreachable. AI animal identification is temporarily disabled.')
                ->etc()
            )
        );
});

test('super admin can calibrate prediction accuracy and sync linked report status', function () {
    $log = AiPredictionLog::create([
        'feature' => 'pet_prediction',
        'confidence' => 0.88,
        'input_data' => ['image' => 'dog.jpg'],
        'output_data' => ['species' => 'dog', 'breed' => 'Golden Retriever'],
        'is_accurate' => null,
    ]);

    $report = PetReport::create([
        'type' => 'rescue',
        'animal_type' => 'Dog',
        'breed' => 'Golden Retriever',
        'location' => 'Central Plaza',
        'status' => 'pending',
        'ai_prediction_log_id' => $log->id,
        'ai_validation_status' => 'pending',
        'contact_name' => 'John',
    ]);

    $response = $this->actingAs($this->superAdmin)
        ->post(route('account.super-admin.ai-configuration.logs.accuracy', $log), [
            'is_accurate' => true,
        ]);

    $response->assertRedirect();
    expect($log->fresh()->is_accurate)->toBeTrue()
        ->and($report->fresh()->ai_validation_status)->toBe('approved');
});

test('super admin can update ai configuration settings', function () {
    $response = $this->actingAs($this->superAdmin)
        ->post(route('account.super-admin.ai-configuration.settings'), [
            'ai_enabled' => true,
            'ai_reporting_enabled' => true,
            'ai_identifying_enabled' => false,
            'ai_confidence_threshold' => 0.85,
            'ai_auto_validation' => true,
        ]);

    $response->assertRedirect();
    $settings = SystemSetting::getValue('ai_settings');
    expect($settings['ai_identifying_enabled'])->toBeFalse()
        ->and($settings['ai_confidence_threshold'])->toBe(0.85)
        ->and($settings['ai_auto_validation'])->toBeTrue();
});
