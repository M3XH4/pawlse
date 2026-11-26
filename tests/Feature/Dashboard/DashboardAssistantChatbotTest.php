<?php

use App\Enums\AdoptionApplicationStatus;
use App\Enums\DonationStatus;
use App\Models\AdoptionApplication;
use App\Models\AssignedTask;
use App\Models\AuditLog;
use App\Models\Backup;
use App\Models\Donation;
use App\Models\PetReport;
use App\Models\ShelterAnimal;
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
    $this->volunteer = User::factory()->volunteer()->create();
    $this->user = User::factory()->user()->create();
});

test('super admin can toggle dashboard assistant chatbot in system settings and inertia shares the flag', function () {
    // Enabled by default
    $this->actingAs($this->user)
        ->get('/account/user')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('isAssistantChatbotEnabled', true)
        );

    // Super admin toggles it OFF via quick toggle button endpoint
    $this->actingAs($this->superAdmin)
        ->post(route('account.super-admin.system-settings.assistant-chatbot.toggle'))
        ->assertRedirect();

    expect(SystemSetting::getValue('system_settings')['assistant_chatbot_enabled'])->toBeFalse();
    expect(AuditLog::where('action', 'assistant_chatbot_toggle')->exists())->toBeTrue();

    // Shared Inertia prop reflects disabled state
    $this->actingAs($this->user)
        ->get('/account/user')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('isAssistantChatbotEnabled', false)
        );

    // Non-super-admin cannot toggle system settings
    $this->actingAs($this->admin)
        ->post(route('account.super-admin.system-settings.assistant-chatbot.toggle'))
        ->assertForbidden();

    // Super admin toggles it back ON via system-settings update form
    $this->actingAs($this->superAdmin)
        ->post(route('account.super-admin.system-settings.update'), [
            'app_name' => 'PAWLSE',
            'contact_email' => 'support@pawlse.test',
            'contact_phone' => '09123456789',
            'registration_enabled' => true,
            'maintenance_mode' => false,
            'assistant_chatbot_enabled' => true,
        ])
        ->assertRedirect();

    expect(SystemSetting::getValue('system_settings')['assistant_chatbot_enabled'])->toBeTrue();
});

test('assistant endpoints return 403 when disabled by super admin', function () {
    SystemSetting::setValue('system_settings', ['assistant_chatbot_enabled' => false]);

    $this->actingAs($this->user)
        ->getJson(route('account.assistant.summary', ['dashboard_role' => 'user']))
        ->assertForbidden();

    $this->actingAs($this->admin)
        ->postJson(route('account.assistant.chat'), [
            'message' => 'What should we do next?',
            'dashboard_role' => 'admin',
        ])
        ->assertForbidden();
});

test('user dashboard assistant only reads personal records and blocks restricted system queries', function () {
    $animal = ShelterAnimal::factory()->create();

    AdoptionApplication::factory()->create([
        'user_id' => $this->user->id,
        'shelter_animal_id' => $animal->id,
        'status' => AdoptionApplicationStatus::Pending->value,
    ]);

    // Another user's adoption application should not be counted for this user
    $otherUser = User::factory()->user()->create();
    AdoptionApplication::factory()->create([
        'user_id' => $otherUser->id,
        'shelter_animal_id' => $animal->id,
        'status' => AdoptionApplicationStatus::Pending->value,
    ]);

    $summaryResponse = $this->actingAs($this->user)
        ->getJson(route('account.assistant.summary', ['dashboard_role' => 'user']))
        ->assertOk()
        ->json();

    expect($summaryResponse['dashboardRole'])->toBe('user');
    expect($summaryResponse['reply'])->toContain('Track 1 active adoption application(s)');

    // User asking about audit logs / system backups should be denied
    $restrictedResponse = $this->actingAs($this->user)
        ->postJson(route('account.assistant.chat'), [
            'message' => 'Show me the audit logs and database backup status',
            'dashboard_role' => 'user',
        ])
        ->assertOk()
        ->json();

    expect($restrictedResponse['reply'])->toContain('does not currently have');
});

test('volunteer dashboard assistant surfaces assigned tasks and open rescue reports', function () {
    AssignedTask::factory()->create([
        'user_id' => $this->volunteer->id,
        'status' => AssignedTask::STATUS_PENDING,
    ]);

    PetReport::factory()->create([
        'status' => 'pending',
    ]);

    $response = $this->actingAs($this->volunteer)
        ->getJson(route('account.assistant.summary', ['dashboard_role' => 'volunteer']))
        ->assertOk()
        ->json();

    expect($response['dashboardRole'])->toBe('volunteer');
    expect($response['reply'])->toContain('Complete 1 pending assigned task(s)');
    expect($response['reply'])->toContain('Check 1 open rescue report(s)');
});

test('admin dashboard assistant respects spatie permissions and revoked permissions', function () {
    $animal = ShelterAnimal::factory()->create();
    AdoptionApplication::factory()->create([
        'user_id' => $this->user->id,
        'shelter_animal_id' => $animal->id,
        'status' => AdoptionApplicationStatus::Pending->value,
    ]);

    Donation::factory()->create([
        'user_id' => $this->user->id,
        'status' => DonationStatus::PendingVerification->value,
    ]);

    // With full admin permissions, both adoptions and donations are visible
    $allowedResponse = $this->actingAs($this->admin)
        ->postJson(route('account.assistant.chat'), [
            'message' => 'Any donations to verify?',
            'dashboard_role' => 'admin',
        ])
        ->assertOk()
        ->json();

    expect($allowedResponse['reply'])->toContain('1');
    expect($allowedResponse['reply'])->toContain('donation');

    // Revoke donations.view from this admin
    $this->admin->update([
        'revoked_permissions' => ['donations.view'],
    ]);

    $revokedResponse = $this->actingAs($this->admin->fresh())
        ->postJson(route('account.assistant.chat'), [
            'message' => 'Any donations to verify?',
            'dashboard_role' => 'admin',
        ])
        ->assertOk()
        ->json();

    expect($revokedResponse['reply'])->toContain('does not currently have the `donations.view` permission');
});

test('super admin dashboard assistant can inspect system and backup status', function () {
    $response = $this->actingAs($this->superAdmin)
        ->postJson(route('account.assistant.chat'), [
            'message' => 'Check system & backup status',
            'dashboard_role' => 'super-admin',
        ])
        ->assertOk()
        ->json();

    expect($response['dashboardRole'])->toBe('super-admin');
    expect($response['reply'])->toContain('registered user(s)');
    expect($response['reply'])->toContain('audit log event(s)');
});

test('assistant returns priorityCount and contextual page guidance for page_path', function () {
    $animal = ShelterAnimal::factory()->create();
    AdoptionApplication::factory()->create([
        'user_id' => $this->user->id,
        'shelter_animal_id' => $animal->id,
        'status' => AdoptionApplicationStatus::Pending->value,
    ]);

    $summary = $this->actingAs($this->admin)
        ->getJson(route('account.assistant.summary', [
            'dashboard_role' => 'admin',
            'page_path' => '/account/admin/ai-validation',
        ]))
        ->assertOk()
        ->json();

    expect($summary['priorityCount'])->toBeGreaterThanOrEqual(1);
    expect($summary['reply'])->toContain('AI Validation Panel');

    $pageHelp = $this->actingAs($this->admin)
        ->postJson(route('account.assistant.chat'), [
            'message' => 'What should I do on this page?',
            'dashboard_role' => 'admin',
            'page_path' => '/account/admin/ai-validation',
        ])
        ->assertOk()
        ->json();

    expect($pageHelp['intent'])->toBe('page_context');
    expect($pageHelp['reply'])->toContain('Breed Reference Guide');
});

test('assistant executes permission-gated quick actions safely', function () {
    // User can create a help desk ticket via quick action
    $this->actingAs($this->user)
        ->postJson(route('account.assistant.quick-action'), [
            'action_id' => 'create_help_desk_ticket',
            'payload' => [
                'subject' => 'Need adoption status update',
                'message' => 'Checking on my application.',
            ],
        ])
        ->assertOk()
        ->assertJsonPath('ok', true);

    $this->assertDatabaseHas('help_desk_tickets', [
        'user_id' => $this->user->id,
        'subject' => 'Need adoption status update',
    ]);

    // User cannot trigger database backup
    $this->actingAs($this->user)
        ->postJson(route('account.assistant.quick-action'), [
            'action_id' => 'run_database_backup',
        ])
        ->assertForbidden();

    // Super admin with backup.manage can trigger database backup
    $this->actingAs($this->superAdmin)
        ->postJson(route('account.assistant.quick-action'), [
            'action_id' => 'run_database_backup',
        ])
        ->assertOk()
        ->assertJsonPath('ok', true);

    expect(Backup::count())->toBe(1);
});

test('assistant provides analytics comparisons for permitted staff and records feedback for super admin insights', function () {
    Donation::factory()->create([
        'user_id' => $this->user->id,
        'amount' => 1500,
        'status' => DonationStatus::Verified->value,
        'created_at' => now(),
    ]);

    // User without analytics.view is denied analytics comparisons
    $denied = $this->actingAs($this->user)
        ->postJson(route('account.assistant.chat'), [
            'message' => 'Compare donations this week vs last week',
            'dashboard_role' => 'user',
        ])
        ->assertOk()
        ->json();

    expect($denied['intent'])->toBe('permission_denied');

    // Admin with analytics.view gets structured stat cards and feedbackId
    $analytics = $this->actingAs($this->admin)
        ->postJson(route('account.assistant.chat'), [
            'message' => 'Compare donations this week vs last week',
            'dashboard_role' => 'admin',
        ])
        ->assertOk()
        ->json();

    expect($analytics['intent'])->toBe('analytics');
    expect($analytics['stats'])->toHaveCount(3);
    expect($analytics['feedbackId'])->not->toBeNull();

    // Submit helpfulness feedback
    $this->actingAs($this->admin)
        ->postJson(route('account.assistant.feedback'), [
            'feedback_id' => $analytics['feedbackId'],
            'rating' => 'up',
        ])
        ->assertOk()
        ->assertJsonPath('rating', 'up');

    // Super admin sees assistantInsights in System Settings
    $this->actingAs($this->superAdmin)
        ->get(route('account.super-admin.system-settings'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('super-admin/system-settings')
            ->where('assistantInsights.total_interactions', 2)
            ->where('assistantInsights.helpful_count', 1)
            ->where('assistantInsights.helpfulness_rate', 100)
        );
});
