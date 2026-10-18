<?php

use App\Models\AiPredictionLog;
use App\Models\PetReport;
use App\Models\SystemSetting;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(RoleSeeder::class);
    Storage::fake('public');
});

test('predict endpoint successfully forwards image to AI service and records log', function () {
    Http::fake([
        '*/predict' => Http::response([
            'accepted' => true,
            'species' => 'cat',
            'species_confidence' => 0.99,
            'breed' => 'Abyssinian',
            'raw_breed' => 'cat_abyssinian',
            'confidence' => 0.92,
            'confidence_level' => 'High',
            'is_confident' => true,
            'confidence_message' => 'The AI is confident in this result.',
            'is_mixed_breed' => false,
            'mixed_confidence' => 0.1,
            'breeds' => [
                ['name' => 'Abyssinian', 'confidence' => 0.92],
            ],
            'age_group' => 'Adult',
            'neutral_names' => ['Mochi', 'Luna', 'Oliver'],
        ], 200),
    ]);

    $file = UploadedFile::fake()->image('cat.jpg', 300, 300);

    $response = $this->postJson('/ai/predict', [
        'image' => $file,
    ]);

    $response->assertOk()
        ->assertJson([
            'accepted' => true,
            'species' => 'cat',
            'breed' => 'Abyssinian',
            'confidence' => 0.92,
            'is_confident' => true,
        ])
        ->assertJsonStructure([
            'prediction_log_id',
        ]);

    $this->assertDatabaseHas('ai_prediction_logs', [
        'feature' => 'pet_prediction',
        'confidence' => 0.92,
    ]);
});

test('predict endpoint returns 403 when AI services are globally disabled', function () {
    SystemSetting::setValue('ai_settings', [
        'ai_enabled' => false,
        'ai_reporting_enabled' => true,
        'ai_identifying_enabled' => true,
        'ai_confidence_threshold' => 0.70,
        'ai_auto_validation' => false,
    ]);

    $file = UploadedFile::fake()->image('cat.jpg');

    $response = $this->postJson('/ai/predict', [
        'image' => $file,
    ]);

    $response->assertStatus(403)
        ->assertJson([
            'message' => 'AI services are currently disabled by the system administrator.',
        ]);
});

test('predict endpoint returns 403 when AI identification is disabled', function () {
    SystemSetting::setValue('ai_settings', [
        'ai_enabled' => true,
        'ai_reporting_enabled' => true,
        'ai_identifying_enabled' => false,
        'ai_confidence_threshold' => 0.70,
        'ai_auto_validation' => false,
    ]);

    $file = UploadedFile::fake()->image('dog.jpg');

    $response = $this->postJson('/ai/predict', [
        'image' => $file,
    ]);

    $response->assertStatus(403)
        ->assertJson([
            'message' => 'AI pet identification is currently disabled.',
        ]);
});

test('predict endpoint gracefully handles AI service offline or unreachable', function () {
    Http::fake([
        '*/predict' => function () {
            throw new ConnectionException('Connection refused');
        },
    ]);

    $file = UploadedFile::fake()->image('dog.jpg');

    $response = $this->postJson('/ai/predict', [
        'image' => $file,
    ]);

    $response->assertStatus(503)
        ->assertJson([
            'accepted' => false,
            'message' => 'AI service is currently unavailable or unreachable.',
        ]);
});

test('generate names endpoint forwards request and logs output', function () {
    Http::fake([
        '*/generate-names' => Http::response([
            'species' => 'dog',
            'gender' => 'male',
            'names' => ['Max', 'Charlie', 'Milo', 'Rocky', 'Buddy'],
        ], 200),
    ]);

    $response = $this->postJson('/ai/generate-names', [
        'species' => 'dog',
        'gender' => 'male',
    ]);

    $response->assertOk()
        ->assertJson([
            'species' => 'dog',
            'gender' => 'male',
            'names' => ['Max', 'Charlie', 'Milo', 'Rocky', 'Buddy'],
        ]);

    $this->assertDatabaseHas('ai_prediction_logs', [
        'feature' => 'name_generation',
    ]);
});

test('generate names endpoint returns fallback names when AI service is unreachable', function () {
    Http::fake([
        '*/generate-names' => function () {
            throw new ConnectionException('Connection refused');
        },
    ]);

    $response = $this->postJson('/ai/generate-names', [
        'species' => 'cat',
        'gender' => 'female',
    ]);

    $response->assertOk()
        ->assertJson([
            'species' => 'cat',
            'gender' => 'female',
        ])
        ->assertJsonStructure([
            'names',
        ]);
});

test('predict endpoint correctly handles multi-animal detection payloads', function () {
    Http::fake([
        '*/predict' => Http::response([
            'accepted' => true,
            'total_animals_detected' => 2,
            'animals' => [
                [
                    'index' => 1,
                    'species' => 'dog',
                    'breed' => 'Beagle',
                    'confidence' => 0.85,
                    'age_group' => 'Senior',
                    'suggested_names' => ['Buddy', 'Max'],
                ],
                [
                    'index' => 2,
                    'species' => 'cat',
                    'breed' => 'Abyssinian',
                    'confidence' => 0.98,
                    'age_group' => 'Adult',
                    'suggested_names' => ['Luna', 'Mochi'],
                ],
            ],
            'species' => 'dog',
            'breed' => 'Beagle',
            'confidence' => 0.85,
            'age_group' => 'Senior',
            'neutral_names' => ['Buddy', 'Max'],
        ], 200),
    ]);

    $file = UploadedFile::fake()->image('multi.jpg', 600, 400);

    $response = $this->postJson('/ai/predict', [
        'image' => $file,
    ]);

    $response->assertOk()
        ->assertJson([
            'accepted' => true,
            'total_animals_detected' => 2,
            'species' => 'dog',
            'breed' => 'Beagle',
            'age_group' => 'Senior',
        ])
        ->assertJsonCount(2, 'animals');

    $this->assertDatabaseHas('ai_prediction_logs', [
        'feature' => 'pet_prediction',
        'confidence' => 0.85,
    ]);
});

test('storeRescue accepts multi-animal reviewed payload and formats incident summary in description', function () {
    $predictionLog = AiPredictionLog::create([
        'feature' => 'pet_prediction',
        'confidence' => 0.90,
        'input_data' => ['image' => 'sample.jpg'],
        'output_data' => [
            'total_animals_detected' => 2,
            'animals' => [
                ['species' => 'dog', 'breed' => 'Golden Retriever', 'age_group' => 'Puppy', 'suggested_names' => ['Buddy']],
                ['species' => 'dog', 'breed' => 'French Bulldog', 'age_group' => 'Adult', 'suggested_names' => ['Rocky']],
            ],
        ],
    ]);

    $animalsPayload = [
        [
            'species' => 'Dog',
            'breed' => 'Golden Retriever',
            'ageCategory' => 'Puppy: Birth to 6–7 months',
            'gender' => 'Male',
            'suggestedName' => 'Buddy',
            'included' => true,
        ],
        [
            'species' => 'Dog',
            'breed' => 'French Bulldog',
            'ageCategory' => 'Adult: 1 to 7 years',
            'gender' => 'Female',
            'suggestedName' => 'Bella',
            'included' => true,
        ],
    ];

    $response = $this->post('/pet-reports/rescue', [
        'animal_type' => 'Dog',
        'breed' => 'Golden Retriever',
        'age_category' => 'Puppy: Birth to 6–7 months',
        'gender' => 'Male',
        'name' => 'Buddy',
        'description' => 'Found two dogs wandering near the market plaza.',
        'location' => 'Market Plaza, Barangay Central',
        'contact_name' => 'John Volunteer',
        'contact_phone' => '+63 912 345 6789',
        'contact_email' => 'john@example.com',
        'ai_prediction_log_id' => $predictionLog->id,
        'animals' => json_encode($animalsPayload),
    ]);

    $response->assertRedirect();

    $report = PetReport::latest('id')->first();
    expect($report)->not->toBeNull()
        ->and($report->ai_prediction_log_id)->toBe($predictionLog->id)
        ->and($report->animal_type)->toBe('Dog')
        ->and($report->breed)->toBe('Golden Retriever')
        ->and($report->description)->toContain('Found two dogs wandering near the market plaza.')
        ->and($report->description)->toContain('[Multi-Animal Incident - 2 Animals Reviewed]')
        ->and($report->description)->toContain('Animal #1: Dog · Golden Retriever')
        ->and($report->description)->toContain('Animal #2: Dog · French Bulldog');
});

test('ai prediction endpoints have rate limiting middleware applied', function () {
    $predictRoute = Route::getRoutes()->match(Request::create('/ai/predict', 'POST'));
    expect($predictRoute->gatherMiddleware())->toContain('throttle:30,1');

    $generateNamesRoute = Route::getRoutes()->match(Request::create('/ai/generate-names', 'POST'));
    expect($generateNamesRoute->gatherMiddleware())->toContain('throttle:60,1');
});
