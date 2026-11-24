<?php

use App\Models\AiPredictionLog;
use App\Models\AssignedTask;
use App\Models\AuditLog;
use App\Models\Backup;
use App\Models\Donation;
use App\Models\Event;
use App\Models\FosterParent;
use App\Models\FosterPlacement;
use App\Models\HelpDeskTicket;
use App\Models\InventoryItem;
use App\Models\LoginAttempt;
use App\Models\Partner;
use App\Models\Payment;
use App\Models\PaymentWebhookEvent;
use App\Models\PetReport;
use App\Models\ResourceFile;
use App\Models\ShelterAnimal;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(RoleSeeder::class);
});

test('super admin can fetch advanced analytics json for various periods', function (string $period) {
    $superAdmin = User::factory()->superAdmin()->create();
    $volunteer = User::factory()->volunteer()->create();

    User::factory()->count(3)->create();

    PetReport::factory()->create(['type' => 'rescue', 'status' => 'resolved', 'animal_type' => 'dog', 'location' => 'Poblacion']);
    PetReport::factory()->create(['type' => 'sos', 'status' => 'pending', 'urgency' => 'high', 'animal_type' => 'cat', 'location' => 'Palao']);

    $donation = Donation::factory()->create(['status' => 'verified', 'amount' => 1500, 'type' => 'cash']);
    Payment::factory()->create(['donation_id' => $donation->id, 'amount' => 1500, 'method' => 'gcash']);

    LoginAttempt::create(['status' => 'success', 'is_suspicious' => false, 'email' => 'user@example.com']);
    LoginAttempt::create(['status' => 'failed', 'is_suspicious' => true, 'email' => 'threat@example.com', 'ip_address' => '1.2.3.4']);

    AiPredictionLog::create(['feature' => 'breed_detection', 'confidence' => 0.95, 'is_accurate' => true]);

    AuditLog::create(['user_id' => $superAdmin->id, 'action' => 'user_updated', 'description' => 'Updated user settings']);

    Backup::create(['filename' => 'test-backup.sql', 'disk' => 'local', 'size' => 1024, 'status' => 'completed']);

    $animal = ShelterAnimal::factory()->create(['status' => 'available', 'vaccinated' => true]);
    $fosterParent = FosterParent::factory()->create(['status' => 'approved', 'capacity' => 3]);
    FosterPlacement::factory()->create(['shelter_animal_id' => $animal->id, 'foster_parent_id' => $fosterParent->id, 'status' => 'active']);
    AssignedTask::factory()->create(['user_id' => $volunteer->id, 'status' => 'completed', 'hours_logged' => 4]);
    Event::factory()->create(['approval_status' => 'pending']);
    HelpDeskTicket::factory()->create(['status' => 'open', 'is_escalated' => true]);
    InventoryItem::create(['name' => 'Cat Litter', 'quantity' => 1, 'min_threshold' => 5, 'unit' => 'bags', 'category' => 'supplies']);

    $response = $this->actingAs($superAdmin)
        ->getJson(route('account.super-admin.analytics', ['period' => $period]))
        ->assertOk();

    $response->assertJsonStructure([
        'period',
        'date_range' => ['start', 'end', 'label'],
        'stats' => [
            'users',
            'donations_amount',
            'donations_count',
            'avg_donation_amount',
            'rescue_reports',
            'rescue_resolution_rate',
            'adoptions',
            'adoption_approval_rate',
            'volunteers',
            'active_volunteers',
            'ai_predictions',
            'ai_accuracy_rate',
            'ai_avg_confidence',
            'suspicious_logins',
            'login_success_rate',
            'audit_events',
            'backups',
            'health_score',
        ],
        'deltas' => [
            'users',
            'rescues',
            'adoptions',
            'donations_amount',
            'suspicious_logins',
            'ai_predictions',
        ],
        'timeline',
        'login_series',
        'ai_series',
        'role_breakdown',
        'report_type_breakdown',
        'animal_type_breakdown',
        'rescue_status_breakdown',
        'urgency_breakdown',
        'donation_type_breakdown',
        'donation_status_breakdown',
        'payment_methods',
        'ai_breakdown',
        'ai_feature_breakdown',
        'audit_action_breakdown',
        'top_audit_actors',
        'recent_security_events',
        'ecosystem' => [
            'shelterCensus',
            'fosterMetrics',
            'volunteerImpact',
            'communityMetrics',
            'inventorySustainability',
            'topRescueLocations',
        ],
        'governance' => [
            'pending_events',
            'pending_blogs',
            'escalated_tickets',
            'archived_records_total',
            'latest_backup_at',
        ],
        'top_rescue_locations',
        'top_volunteers',
        'security_posture' => [
            'total_users',
            'verified_users',
            'email_verification_rate',
            'staff_total',
            'staff_2fa_enabled',
            'staff_2fa_rate',
            'users_2fa_enabled',
            'top_suspicious_ips',
        ],
        'infrastructure' => [
            'backups_completed',
            'backups_failed',
            'backups_total_size_mb',
            'webhook_events_total',
            'webhook_events_processed',
            'webhook_events_pending',
        ],
        'platform_ecosystem' => [
            'partners_active',
            'partners_total',
            'partners_daily_food',
            'partners_emergency',
            'food_pickups_total',
            'food_pickups_completed',
            'resources_active',
            'resources_total_downloads',
            'top_resources',
            'community_honors',
            'contact_messages_total',
            'contact_messages_period',
            'contact_messages_unread',
            'blog_posts_published',
            'blog_reactions_period',
            'certificates_issued_period',
            'badges_awarded_period',
            'help_desk_status_breakdown',
        ],
        'ai_feature_performance',
        'pulse_insights' => [
            'peak_label',
            'peak_volume',
            'total_platform_users',
            'active_volunteer_pool',
            'health_pillars',
            'engagement' => [
                'shelter_visits',
                'rehoming_requests',
                'certificates_issued',
                'badges_awarded',
                'blog_posts_published',
                'blog_reactions',
            ],
        ],
        'operations_deep_dive' => [
            'kpis' => [
                'critical_pending_sos',
                'avg_resolution_hours',
                'medical_records_count',
                'shelter_visits_count',
                'shelter_visits_completed',
                'rehoming_requests_count',
                'follow_ups_count',
                'assigned_tasks_total',
                'assigned_tasks_completed',
                'task_completion_rate',
                'injury_reports_count',
                'strays_fed_period',
                'food_packs_distributed',
                'food_pickups_completed',
            ],
            'medical_type_breakdown',
            'task_status_breakdown',
            'visit_status_breakdown',
            'recent_urgent_rescues',
        ],
        'financial_deep_dive' => [
            'kpis' => [
                'unique_donors',
                'largest_donation',
                'pending_verification_count',
                'pending_verification_amount',
                'sponsorships_count',
                'sponsorships_amount',
                'in_kind_count',
                'in_kind_units',
                'pending_amount_edits',
                'active_animal_needs',
            ],
            'channel_performance',
            'in_kind_status_breakdown',
            'recent_donations',
        ],
        'security_extras' => [
            'audit_series',
            'recent_audit_logs',
            'backup_history',
            'idempotency_guards_count',
        ],
        'ai_telemetry_extras' => [
            'high_confidence_rate',
            'evaluated_count',
            'inaccurate_count',
            'pending_review_count',
            'confidence_buckets',
            'recent_predictions',
        ],
    ]);
})->with(['7d', '30d', '90d', '1y', 'all']);

test('super admin analytics supports custom date range', function () {
    $superAdmin = User::factory()->superAdmin()->create();

    $start = now()->subDays(14)->toDateString();
    $end = now()->toDateString();

    $this->actingAs($superAdmin)
        ->getJson(route('account.super-admin.analytics', [
            'period' => 'custom',
            'start_date' => $start,
            'end_date' => $end,
        ]))
        ->assertOk()
        ->assertJsonPath('period', 'custom')
        ->assertJsonPath('date_range.start', $start)
        ->assertJsonPath('date_range.end', $end);
});

test('super admin can export advanced analytics csv', function () {
    $superAdmin = User::factory()->superAdmin()->create();

    $response = $this->actingAs($superAdmin)
        ->get(route('account.super-admin.analytics.export', ['period' => '30d']))
        ->assertOk();

    $response->assertHeader('content-type', 'text/csv; charset=UTF-8');
});

test('super admin csv export supports sectioned report types', function (string $type, string $expectedHeader) {
    $superAdmin = User::factory()->superAdmin()->create();

    $response = $this->actingAs($superAdmin)
        ->get(route('account.super-admin.analytics.export', ['period' => '30d', 'type' => $type]))
        ->assertOk();

    $response->assertHeader('content-type', 'text/csv; charset=UTF-8');
    expect($response->streamedContent())->toContain($expectedHeader);
})->with([
    ['full', 'PAWLSE SUPER-ADMIN FULL EXECUTIVE ANALYTICS CSV'],
    ['operations', 'PAWLSE SUPER-ADMIN RESCUE, CLINICAL & OPERATIONS CSV'],
    ['financials', 'PAWLSE SUPER-ADMIN FINANCIALS, GATEWAYS & SPONSORSHIPS CSV'],
    ['security', 'PAWLSE SUPER-ADMIN SECURITY POSTURE & AUDIT TRAIL CSV'],
    ['ai', 'PAWLSE SUPER-ADMIN AI TELEMETRY & CALIBRATION CSV'],
    ['ecosystem', 'PAWLSE SUPER-ADMIN ECOSYSTEM, PARTNERS & GOVERNANCE CSV'],
]);

test('super admin can export executive pdf report with visible logos and system telemetry', function () {
    $superAdmin = User::factory()->superAdmin()->create([
        'name' => 'Chief Architect',
        'two_factor_confirmed_at' => now(),
    ]);

    PetReport::factory()->create([
        'type' => 'sos',
        'location' => 'Hinaplanon Bridge',
        'status' => 'pending',
        'urgency' => 'critical',
    ]);

    LoginAttempt::create([
        'status' => 'failed',
        'is_suspicious' => true,
        'email' => 'intruder@example.com',
        'ip_address' => '203.0.113.42',
    ]);

    AuditLog::create([
        'user_id' => $superAdmin->id,
        'action' => 'system_config',
        'description' => 'Updated security thresholds',
    ]);

    InventoryItem::create([
        'name' => 'Rabies Vaccine Vial',
        'quantity' => 2,
        'min_threshold' => 8,
        'unit' => 'vials',
        'category' => 'medical',
    ]);

    Backup::create([
        'filename' => 'pawlse-backup-01.zip',
        'disk' => 'local',
        'size' => 5 * 1024 * 1024,
        'status' => 'completed',
    ]);

    PaymentWebhookEvent::forceCreate([
        'provider' => 'paymongo',
        'event_id' => 'evt_test_001',
        'payload' => json_encode(['type' => 'payment.paid']),
        'processed_at' => now(),
    ]);

    Partner::create([
        'name' => 'Iligan Pet Care Clinic',
        'category' => 'Veterinary Clinic',
        'is_active' => true,
        'is_emergency' => true,
    ]);

    ResourceFile::create([
        'title' => 'First Aid Handbook',
        'description' => 'Emergency care reference',
        'file_path' => 'resources/first-aid.pdf',
        'file_type' => 'pdf',
        'is_active' => true,
        'download_count' => 42,
    ]);

    AiPredictionLog::create([
        'feature' => 'rescue_triage',
        'input_data' => ['text' => 'Injured stray dog'],
        'prediction_data' => ['urgency' => 'high'],
        'confidence' => 0.94,
        'is_accurate' => true,
    ]);

    $response = $this->actingAs($superAdmin)
        ->get(route('account.super-admin.analytics.pdf', ['period' => '30d']));

    $response->assertOk()
        ->assertSee('Executive System Intelligence & Audit Report')
        ->assertSee('data:image/png;base64,', false)
        ->assertSee('<svg', false)
        ->assertSee('background: transparent;', false)
        ->assertSee('Chief Architect')
        ->assertSee('intruder@example.com')
        ->assertSee('203.0.113.42')
        ->assertSee('Hinaplanon Bridge')
        ->assertSee('Rabies Vaccine Vial')
        ->assertSee('5 MB (1 / 0)')
        ->assertSee('Payment Webhooks (Processed / Pending)')
        ->assertSee('1 / 0')
        ->assertSee('1 / 1 (100%)')
        ->assertSee('1 / 42')
        ->assertSee('Rescue triage');
});

test('super admin pdf export respects section filter', function (string $section, string $expectedTitle) {
    $superAdmin = User::factory()->superAdmin()->create();

    $response = $this->actingAs($superAdmin)
        ->get(route('account.super-admin.analytics.pdf', ['period' => '30d', 'section' => $section]));

    $response->assertOk()
        ->assertSee($expectedTitle)
        ->assertSee('data:image/png;base64,', false);
})->with([
    ['operations', 'Super-Admin Rescue & Shelter Operations Report'],
    ['financials', 'Super-Admin Donations, Revenue & Sustainability Report'],
    ['security', 'Super-Admin Security Posture & Audit Trail Report'],
    ['ai', 'Super-Admin AI Telemetry & Validation Report'],
    ['ecosystem', 'Super-Admin Ecosystem, Infrastructure & Governance Report'],
]);

test('non super admin cannot access advanced analytics endpoints or pdf export', function () {
    $regularUser = User::factory()->user()->create();
    $admin = User::factory()->admin()->create();

    $this->actingAs($regularUser)
        ->getJson(route('account.super-admin.analytics'))
        ->assertForbidden();

    $this->actingAs($regularUser)
        ->get(route('account.super-admin.analytics.pdf'))
        ->assertForbidden();

    $this->actingAs($admin)
        ->getJson(route('account.super-admin.analytics'))
        ->assertForbidden();

    $this->actingAs($admin)
        ->get(route('account.super-admin.analytics.pdf'))
        ->assertForbidden();
});
