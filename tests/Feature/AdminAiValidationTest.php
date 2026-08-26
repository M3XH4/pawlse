<?php

use App\Enums\Role;
use App\Models\AiPredictionLog;
use App\Models\PetReport;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(RoleSeeder::class);
    $this->admin = User::factory()->admin()->create();
    $this->user = User::factory()->create(['role' => Role::User->value]);
    $this->volunteer = User::factory()->create(['role' => Role::Volunteer->value]);
});

test('non-admin users cannot access the AI validation queue', function () {
    // 1. Regular user gets 403 Forbidden
    $this->actingAs($this->user)
        ->get('/account/admin/ai-validation')
        ->assertForbidden();

    // 2. Volunteer gets 403 Forbidden
    $this->actingAs($this->volunteer)
        ->get('/account/admin/ai-validation')
        ->assertForbidden();
});

test('admin can access the AI validation queue and see list and stats', function () {
    // Create prediction logs
    $log1 = AiPredictionLog::create([
        'feature' => 'pet_prediction',
        'input_data' => ['image_name' => 'cat.jpg'],
        'output_data' => ['species' => 'cat', 'breed' => 'Siamese'],
        'confidence' => 0.85,
        'is_accurate' => null,
    ]);

    $log2 = AiPredictionLog::create([
        'feature' => 'pet_prediction',
        'input_data' => ['image_name' => 'dog.jpg'],
        'output_data' => ['species' => 'dog', 'breed' => 'Labrador'],
        'confidence' => 0.45,
        'is_accurate' => null,
    ]);

    // Create pet reports (one with AI, one without)
    $aiReport1 = PetReport::create([
        'type' => 'rescue',
        'animal_type' => 'Cat',
        'breed' => 'Siamese',
        'location' => 'Zone 4 Tibanga',
        'status' => 'pending',
        'ai_prediction_log_id' => $log1->id,
        'ai_validation_status' => 'pending',
        'contact_name' => 'John Reporter',
    ]);

    $aiReport2 = PetReport::create([
        'type' => 'missing',
        'animal_type' => 'Dog',
        'breed' => 'Labrador',
        'location' => 'Pala-o Gym',
        'status' => 'pending',
        'ai_prediction_log_id' => $log2->id,
        'ai_validation_status' => 'pending',
        'contact_name' => 'Alice Missing',
    ]);

    $manualReport = PetReport::create([
        'type' => 'rescue',
        'animal_type' => 'Dog',
        'breed' => 'German Shepherd',
        'location' => 'Orchard St',
        'status' => 'pending',
        'ai_prediction_log_id' => null,
        'ai_validation_status' => null,
        'contact_name' => 'Bob Manual',
    ]);

    $this->actingAs($this->admin)
        ->get('/account/admin/ai-validation')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/ai-validation')
            ->has('reports.data', 2) // only the 2 AI reports, manual report is omitted
            ->has('stats')
            ->where('stats.total_ai_reports', 2)
            ->where('stats.pending_validation', 2)
            ->where('stats.accuracy_rate', 100) // default when none validated is 100
            ->where('stats.average_confidence', 65) // average of 0.85 and 0.45 = 0.65 => 65%
        );
});

test('admin can search and filter the validation queue', function () {
    $log1 = AiPredictionLog::create([
        'feature' => 'pet_prediction',
        'confidence' => 0.90,
    ]);

    $log2 = AiPredictionLog::create([
        'feature' => 'pet_prediction',
        'confidence' => 0.35,
    ]);

    // Create reports
    PetReport::create([
        'type' => 'rescue',
        'animal_type' => 'Cat',
        'breed' => 'Puspin',
        'location' => 'Tibanga Highway',
        'ai_prediction_log_id' => $log1->id,
        'ai_validation_status' => 'pending',
    ]);

    PetReport::create([
        'type' => 'missing',
        'animal_type' => 'Dog',
        'breed' => 'Poodle',
        'location' => 'Pala-o',
        'ai_prediction_log_id' => $log2->id,
        'ai_validation_status' => 'rejected',
    ]);

    // 1. Search by breed
    $this->actingAs($this->admin)
        ->get('/account/admin/ai-validation?search=Poodle&status=All')
        ->assertInertia(fn (Assert $page) => $page
            ->has('reports.data', 1)
            ->where('reports.data.0.breed', 'Poodle')
        );

    // 2. Filter by status approved (should be 0)
    $this->actingAs($this->admin)
        ->get('/account/admin/ai-validation?status=approved')
        ->assertInertia(fn (Assert $page) => $page
            ->has('reports.data', 0)
        );

    // 3. Filter by high confidence (should find Siamese/Puspin with 90%)
    $this->actingAs($this->admin)
        ->get('/account/admin/ai-validation?confidence_level=High&status=All')
        ->assertInertia(fn (Assert $page) => $page
            ->has('reports.data', 1)
            ->where('reports.data.0.breed', 'Puspin')
        );
});

test('admin can approve AI details on a report', function () {
    $log = AiPredictionLog::create([
        'feature' => 'pet_prediction',
        'confidence' => 0.88,
        'is_accurate' => null,
    ]);

    $report = PetReport::create([
        'type' => 'rescue',
        'animal_type' => 'Dog',
        'location' => 'Tibanga',
        'ai_prediction_log_id' => $log->id,
        'ai_validation_status' => 'pending',
    ]);

    $response = $this->actingAs($this->admin)
        ->post("/account/admin/ai-validation/{$report->id}/approve");

    $response->assertRedirect();

    // Check report status was updated to approved
    $report->refresh();
    expect($report->ai_validation_status)->toBe('approved');

    // Check log status was updated to true
    $log->refresh();
    expect($log->is_accurate)->toBeTrue();

    // Verify audit log created
    $this->assertDatabaseHas('audit_logs', [
        'action' => 'ai_validation_approve',
        'user_id' => $this->admin->id,
    ]);
});

test('admin can reject AI details on a report without corrections', function () {
    $log = AiPredictionLog::create([
        'feature' => 'pet_prediction',
        'confidence' => 0.88,
        'is_accurate' => null,
    ]);

    $report = PetReport::create([
        'type' => 'rescue',
        'animal_type' => 'Dog',
        'location' => 'Tibanga',
        'ai_prediction_log_id' => $log->id,
        'ai_validation_status' => 'pending',
    ]);

    $response = $this->actingAs($this->admin)
        ->post("/account/admin/ai-validation/{$report->id}/reject");

    $response->assertRedirect();

    $report->refresh();
    expect($report->ai_validation_status)->toBe('rejected');

    $log->refresh();
    expect($log->is_accurate)->toBeFalse();

    $this->assertDatabaseHas('audit_logs', [
        'action' => 'ai_validation_reject',
    ]);
});

test('admin can reject AI details and correct the report details', function () {
    $log = AiPredictionLog::create([
        'feature' => 'pet_prediction',
        'confidence' => 0.88,
        'is_accurate' => null,
    ]);

    $report = PetReport::create([
        'type' => 'rescue',
        'animal_type' => 'Dog',
        'breed' => 'Unknown',
        'location' => 'Tibanga',
        'ai_prediction_log_id' => $log->id,
        'ai_validation_status' => 'pending',
    ]);

    $response = $this->actingAs($this->admin)
        ->post("/account/admin/ai-validation/{$report->id}/reject", [
            'animal_type' => 'Cat',
            'breed' => 'Puspin',
            'name' => 'Whiskers',
            'age_category' => 'Kitten',
            'gender' => 'Female',
        ]);

    $response->assertRedirect();

    $report->refresh();
    expect($report->ai_validation_status)->toBe('rejected');
    expect($report->animal_type)->toBe('Cat');
    expect($report->breed)->toBe('Puspin');
    expect($report->name)->toBe('Whiskers');
    expect($report->age_category)->toBe('Kitten');
    expect($report->gender)->toBe('Female');

    $log->refresh();
    expect($log->is_accurate)->toBeFalse();
});
