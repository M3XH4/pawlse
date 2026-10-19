<?php

use App\Models\AiPredictionLog;
use App\Models\AuditLog;
use App\Models\Backup;
use App\Models\Donation;
use App\Models\LoginAttempt;
use App\Models\Payment;
use App\Models\PetReport;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('super admin can fetch advanced analytics json for various periods', function (string $period) {
    $superAdmin = User::factory()->superAdmin()->create();

    // Create dummy users
    User::factory()->count(3)->create();

    // Create pet reports
    PetReport::factory()->create(['type' => 'rescue', 'status' => 'resolved', 'animal_type' => 'dog']);
    PetReport::factory()->create(['type' => 'sos', 'status' => 'pending', 'urgency' => 'high', 'animal_type' => 'cat']);

    // Create donation and payment
    $donation = Donation::factory()->create(['status' => 'verified', 'amount' => 1500, 'type' => 'cash']);
    Payment::factory()->create(['donation_id' => $donation->id, 'amount' => 1500, 'method' => 'gcash']);

    // Create login attempt
    LoginAttempt::create(['status' => 'success', 'is_suspicious' => false, 'email' => 'user@example.com']);
    LoginAttempt::create(['status' => 'failed', 'is_suspicious' => true, 'email' => 'threat@example.com', 'ip_address' => '1.2.3.4']);

    // Create AI prediction log
    AiPredictionLog::create(['feature' => 'breed_detection', 'confidence' => 0.95, 'is_accurate' => true]);

    // Create audit log
    AuditLog::create(['user_id' => $superAdmin->id, 'action' => 'user_updated', 'description' => 'Updated user settings']);

    // Create backup
    Backup::create(['filename' => 'test-backup.sql', 'disk' => 'local', 'size' => 1024, 'status' => 'completed']);

    $response = $this->actingAs($superAdmin)
        ->getJson(route('account.super-admin.analytics', ['period' => $period]))
        ->assertOk();

    $response->assertJsonStructure([
        'period',
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
    ]);
})->with(['7d', '30d', '90d', '1y', 'all']);

test('super admin can export advanced analytics csv', function () {
    $superAdmin = User::factory()->superAdmin()->create();

    $response = $this->actingAs($superAdmin)
        ->get(route('account.super-admin.analytics.export', ['period' => '30d']))
        ->assertOk();

    $response->assertHeader('content-type', 'text/csv; charset=UTF-8');
});

test('non super admin cannot access advanced analytics endpoint', function () {
    $regularUser = User::factory()->create();

    $this->actingAs($regularUser)
        ->getJson(route('account.super-admin.analytics'))
        ->assertForbidden();
});
