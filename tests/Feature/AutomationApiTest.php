<?php

use App\Models\Backup;
use App\Models\FeedingSchedule;
use App\Models\InventoryItem;
use App\Models\PetReport;
use App\Models\SystemSetting;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    config(['n8n.api_key' => 'secret-automation-key-999']);
});

test('automation endpoints reject unauthenticated requests', function () {
    $this->getJson(route('api.automation.statistics'))
        ->assertStatus(401)
        ->assertJson([
            'error' => 'Unauthorized: Invalid or missing automation API key.',
        ]);

    $this->getJson(route('api.automation.backup-status'))
        ->assertStatus(401);
});

test('automation endpoints reject invalid api key', function () {
    $this->withHeaders(['X-Automation-Key' => 'wrong-key'])
        ->getJson(route('api.automation.statistics'))
        ->assertStatus(401);
});

test('automation endpoints return 503 when api key is not configured', function () {
    config(['n8n.api_key' => '']);

    $this->withHeaders(['X-Automation-Key' => 'some-key'])
        ->getJson(route('api.automation.statistics'))
        ->assertStatus(503)
        ->assertJson([
            'error' => 'Automation API is not configured or disabled.',
        ]);
});

test('automation statistics endpoint returns valid metrics', function () {
    PetReport::create([
        'type' => 'rescue',
        'animal_type' => 'dog',
        'location' => 'Iligan City Hall',
        'status' => 'pending',
    ]);

    $response = $this->withHeaders(['X-Automation-Key' => 'secret-automation-key-999'])
        ->getJson(route('api.automation.statistics'))
        ->assertStatus(200);

    $response->assertJsonStructure([
        'status',
        'timestamp',
        'environment',
        'summary' => [
            'rescues' => ['total', 'pending', 'in_progress', 'resolved', 'last_7_days', 'last_30_days'],
            'adoptions' => ['total_applications', 'pending', 'approved', 'rejected', 'last_7_days'],
            'donations' => ['total_cash_amount', 'verified_cash_count', 'verified_inkind_count', 'last_7_days_cash_amount'],
            'volunteers' => ['active_count', 'pending_applications', 'approved_total'],
            'shelter_animals' => ['total', 'available', 'adopted'],
        ],
    ]);

    expect($response->json('summary.rescues.total'))->toBeGreaterThanOrEqual(1);
});

test('automation backup status endpoint returns accurate health information', function () {
    SystemSetting::setValue('backup_settings', [
        'auto_enabled' => true,
        'interval' => 'daily',
        'retention_days' => 30,
    ]);

    Backup::create([
        'filename' => 'backup-mysql-2026-09-03.sql',
        'disk' => 'local',
        'size' => 1048576,
        'status' => 'completed',
    ]);

    $response = $this->withHeaders(['X-Automation-Key' => 'secret-automation-key-999'])
        ->getJson(route('api.automation.backup-status'))
        ->assertStatus(200);

    $response->assertJsonStructure([
        'status',
        'timestamp',
        'is_healthy',
        'message',
        'settings' => ['auto_enabled', 'interval', 'retention_days'],
        'backups_summary' => [
            'total_count',
            'latest_backup' => ['id', 'filename', 'disk', 'size_bytes', 'size_formatted', 'status', 'created_at', 'age_hours'],
        ],
    ]);

    expect($response->json('is_healthy'))->toBeTrue();
    expect($response->json('status'))->toBe('healthy');
});

test('automation inventory alerts endpoint returns low stock and expiring items', function () {
    InventoryItem::create([
        'name' => 'Dog Kibble Adult',
        'category' => 'Food',
        'quantity' => 2,
        'min_threshold' => 5,
        'unit' => 'bags',
    ]);

    $response = $this->withHeaders(['X-Automation-Key' => 'secret-automation-key-999'])
        ->getJson(route('api.automation.inventory-alerts'))
        ->assertStatus(200);

    $response->assertJsonStructure([
        'status',
        'timestamp',
        'has_alerts',
        'low_stock_count',
        'expiring_batches_count',
        'low_stock_items',
        'expiring_batches',
    ]);

    expect($response->json('has_alerts'))->toBeTrue();
    expect($response->json('low_stock_count'))->toBe(1);
});

test('automation upcoming feeding endpoint returns scheduled routes', function () {
    FeedingSchedule::create([
        'zone' => 'Zone 1 - Port Area',
        'day' => 'Daily',
        'time' => '07:00 AM',
        'strays' => 25,
        'volunteers' => 2,
        'status' => 'active',
    ]);

    $response = $this->withHeaders(['X-Automation-Key' => 'secret-automation-key-999'])
        ->getJson(route('api.automation.feeding.upcoming'))
        ->assertStatus(200);

    $response->assertJsonStructure([
        'status',
        'timestamp',
        'day',
        'total_routes',
        'routes',
    ]);

    expect($response->json('total_routes'))->toBeGreaterThanOrEqual(1);
});

test('automation external intake endpoint validates and accepts form submissions', function () {
    $response = $this->withHeaders(['X-Automation-Key' => 'secret-automation-key-999'])
        ->postJson(route('api.automation.external-intake'), [
            'type' => 'volunteer_inquiry',
            'name' => 'Maria Santos',
            'email' => 'maria@example.com',
            'phone' => '09123456789',
            'message' => 'Interested in weekend feeding routes.',
        ])
        ->assertStatus(201);

    $response->assertJsonStructure([
        'status',
        'message',
        'intake_id',
        'recorded_at',
    ]);

    expect($response->json('status'))->toBe('success');
});
