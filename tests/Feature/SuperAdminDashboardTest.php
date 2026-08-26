<?php

use App\Models\AiPredictionLog;
use App\Models\AuditLog;
use App\Models\Backup;
use App\Models\SystemSetting;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(RoleSeeder::class);
    $this->superAdmin = User::factory()->superAdmin()->create();
});

test('system overview dashboard is reachable and receives stats & audit feed', function () {
    AuditLog::create([
        'user_id' => $this->superAdmin->id,
        'action' => 'test_action',
        'description' => 'A test audit log description',
        'ip_address' => '127.0.0.1',
    ]);

    $this->actingAs($this->superAdmin)
        ->get(route('account.super-admin.dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('super-admin/dashboard')
            ->has('stats')
            ->has('stats.total_users')
            ->has('stats.database_size')
            ->has('recentActivities', 1)
            ->where('recentActivities.0.description', 'A test audit log description')
        );
});

test('user management can list, create, update, soft-delete and restore users', function () {
    // 1. List users
    $this->actingAs($this->superAdmin)
        ->get(route('account.super-admin.user-management'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('super-admin/user-management')
            ->has('users.data')
            ->has('stats.total')
        );

    // 2. Create user
    $this->actingAs($this->superAdmin)
        ->post(route('account.super-admin.user-management.store'), [
            'name' => 'John Doe',
            'email' => 'john@example.test',
            'password' => 'Password123!',
            'role' => 'volunteer',
            'verified' => true,
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('users', [
        'name' => 'John Doe',
        'email' => 'john@example.test',
        'role' => 'volunteer',
    ]);

    $createdUser = User::where('email', 'john@example.test')->first();
    expect($createdUser->hasRole('volunteer'))->toBeTrue();
    expect($createdUser->email_verified_at)->not->toBeNull();

    // Verify audit log created
    $this->assertDatabaseHas('audit_logs', [
        'action' => 'user_create',
    ]);

    // 3. Update user
    $this->actingAs($this->superAdmin)
        ->put(route('account.super-admin.user-management.update', $createdUser->id), [
            'name' => 'John Updated',
            'email' => 'john@example.test',
            'role' => 'admin',
            'verified' => true,
        ])
        ->assertRedirect();

    $createdUser->refresh();
    expect($createdUser->name)->toBe('John Updated');
    expect($createdUser->hasRole('admin'))->toBeTrue();

    // 4. Soft delete user
    $this->actingAs($this->superAdmin)
        ->delete(route('account.super-admin.user-management.destroy', $createdUser->id))
        ->assertRedirect();

    $this->assertSoftDeleted('users', [
        'id' => $createdUser->id,
    ]);

    // 5. Restore user
    $this->actingAs($this->superAdmin)
        ->post(route('account.super-admin.user-management.restore', $createdUser->id))
        ->assertRedirect();

    $this->assertDatabaseHas('users', [
        'id' => $createdUser->id,
        'deleted_at' => null,
    ]);
});

test('audit logs page lists, searches, and filters logs', function () {
    $otherAdmin = User::factory()->admin()->create();
    AuditLog::create([
        'user_id' => $otherAdmin->id,
        'action' => 'custom_action',
        'description' => 'Admin did a custom action',
        'ip_address' => '10.0.0.1',
    ]);

    $this->actingAs($this->superAdmin)
        ->get(route('account.super-admin.audit-logs', ['user_id' => $otherAdmin->id]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('super-admin/audit-logs')
            ->has('logs.data', 1)
            ->where('logs.data.0.description', 'Admin did a custom action')
        );
});

test('archives displays soft-deleted records and allows restoration or purging', function () {
    $user = User::factory()->create();
    $user->delete();

    // List archives
    $this->actingAs($this->superAdmin)
        ->get(route('account.super-admin.archives', ['type' => 'user']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('super-admin/archives')
            ->has('items.data', 1)
            ->where('items.data.0.title', $user->name)
        );

    // Restore archived user
    $this->actingAs($this->superAdmin)
        ->post(route('account.super-admin.archives.restore', ['type' => 'user', 'id' => $user->id]))
        ->assertRedirect();

    $this->assertDatabaseHas('users', [
        'id' => $user->id,
        'deleted_at' => null,
    ]);

    // Purge archived user (soft-delete again, then force delete)
    $user->delete();
    $this->actingAs($this->superAdmin)
        ->delete(route('account.super-admin.archives.force-delete', ['type' => 'user', 'id' => $user->id]))
        ->assertRedirect();

    $this->assertDatabaseMissing('users', [
        'id' => $user->id,
    ]);
});

test('security and logins logging and suspicious heuristics trigger correctly', function () {
    auth()->logout();

    // 1. Successful Login Logging
    $user = User::factory()->create([
        'password' => Hash::make('password'),
    ]);

    $this->post('/login', [
        'email' => $user->email,
        'password' => 'password',
    ]);

    $this->assertDatabaseHas('login_attempts', [
        'user_id' => $user->id,
        'email' => $user->email,
        'status' => 'success',
        'is_suspicious' => false,
    ]);

    auth()->logout();

    // 2. Failed Login Logging (1st attempt)
    $this->post('/login', [
        'email' => $user->email,
        'password' => 'wrongpassword',
    ]);

    $this->assertDatabaseHas('login_attempts', [
        'user_id' => $user->id,
        'email' => $user->email,
        'status' => 'failed',
        'is_suspicious' => false,
    ]);

    // 3. 2nd Failed Attempt
    $this->post('/login', [
        'email' => $user->email,
        'password' => 'wrongpassword',
    ]);

    // 4. 3rd Failed Attempt (should trigger suspicious flag for IP)
    $this->post('/login', [
        'email' => $user->email,
        'password' => 'wrongpassword',
    ]);

    $this->assertDatabaseHas('login_attempts', [
        'email' => $user->email,
        'status' => 'failed',
        'is_suspicious' => true,
    ]);
});

test('backup and restore creates database exports and restores them', function () {
    // List backups
    $this->actingAs($this->superAdmin)
        ->get(route('account.super-admin.backup-restore'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('super-admin/backup-restore')
            ->has('backups.data')
            ->has('settings')
        );

    // Run manual backup
    $this->actingAs($this->superAdmin)
        ->post(route('account.super-admin.backup-restore.run'))
        ->assertRedirect();

    $this->assertDatabaseCount('backups', 1);
    $backup = Backup::first();
    expect($backup->status)->toBe('completed');

    $filePath = storage_path("app/backups/{$backup->filename}");
    expect(file_exists($filePath))->toBeTrue();

    // Save automatic settings
    $this->actingAs($this->superAdmin)
        ->post(route('account.super-admin.backup-restore.settings'), [
            'auto_enabled' => true,
            'interval' => 'weekly',
            'retention_days' => 14,
        ])
        ->assertRedirect();

    $backupSettings = SystemSetting::getValue('backup_settings');
    expect($backupSettings['auto_enabled'])->toBe(true);
    expect($backupSettings['interval'])->toBe('weekly');
    expect($backupSettings['retention_days'])->toBe(14);

    // Clean up file
    if (file_exists($filePath)) {
        unlink($filePath);
    }
});

test('ai configurations manages settings and log accuracy rating', function () {
    $log = AiPredictionLog::create([
        'feature' => 'pet_prediction',
        'input_data' => ['image_name' => 'dog.jpg'],
        'output_data' => ['label' => 'dog', 'confidence' => 0.85],
        'confidence' => 0.85,
        'is_accurate' => null,
    ]);

    // Get config page
    $this->actingAs($this->superAdmin)
        ->get(route('account.super-admin.ai-configuration'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('super-admin/ai-configuration')
            ->has('settings')
            ->has('logs.data', 1)
        );

    // Update settings
    $this->actingAs($this->superAdmin)
        ->post(route('account.super-admin.ai-configuration.settings'), [
            'ai_enabled' => true,
            'ai_reporting_enabled' => false,
            'ai_identifying_enabled' => true,
            'ai_confidence_threshold' => 0.80,
            'ai_auto_validation' => true,
        ])
        ->assertRedirect();

    $aiSettings = SystemSetting::getValue('ai_settings');
    expect($aiSettings['ai_reporting_enabled'])->toBe(false);
    expect($aiSettings['ai_confidence_threshold'])->toBe(0.80);

    // Calibrate prediction
    $this->actingAs($this->superAdmin)
        ->post(route('account.super-admin.ai-configuration.logs.accuracy', $log->id), [
            'is_accurate' => true,
        ])
        ->assertRedirect();

    $log->refresh();
    expect($log->is_accurate)->toBeTrue();
});

test('system settings can update app settings details', function () {
    // Save system settings
    $this->actingAs($this->superAdmin)
        ->post(route('account.super-admin.system-settings.update'), [
            'app_name' => 'Pawlse Rebranded',
            'contact_email' => 'new-support@pawlse.test',
            'contact_phone' => '09998887777',
            'registration_enabled' => false,
            'maintenance_mode' => true,
        ])
        ->assertRedirect();

    $systemSettings = SystemSetting::getValue('system_settings');
    expect($systemSettings['app_name'])->toBe('Pawlse Rebranded');
    expect($systemSettings['contact_email'])->toBe('new-support@pawlse.test');
    expect($systemSettings['registration_enabled'])->toBe(false);
    expect($systemSettings['maintenance_mode'])->toBe(true);
});
