<?php

use App\Models\AuditLog;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(RoleSeeder::class);
    $this->superAdmin = User::factory()->superAdmin()->create();
});

test('audit logs page calculates correct stats', function () {
    $admin = User::factory()->admin()->create();
    $volunteer = User::factory()->volunteer()->create();

    // Create logs
    AuditLog::create([
        'user_id' => $admin->id,
        'action' => 'test_action_1',
        'description' => 'Admin test description',
        'ip_address' => '192.168.1.1',
    ]);

    AuditLog::create([
        'user_id' => $volunteer->id,
        'action' => 'test_action_2',
        'description' => 'Volunteer test description',
        'ip_address' => '192.168.1.2',
    ]);

    // System log (null user_id)
    AuditLog::create([
        'user_id' => null,
        'action' => 'system_action',
        'description' => 'System test description',
        'ip_address' => '127.0.0.1',
    ]);

    $this->actingAs($this->superAdmin)
        ->get(route('account.super-admin.audit-logs'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('super-admin/audit-logs')
            ->where('stats.total_logs', 3)
            ->where('stats.unique_users', 2) // $admin and $volunteer
            ->where('stats.system_logs', 1)
        );
});

test('audit logs page filters by search term', function () {
    $admin = User::factory()->admin()->create(['name' => 'Charlie Brown', 'email' => 'charlie@peanuts.com']);
    $volunteer = User::factory()->volunteer()->create(['name' => 'Snoopy Dog', 'email' => 'snoopy@peanuts.com']);

    AuditLog::create([
        'user_id' => $admin->id,
        'action' => 'user_create',
        'description' => 'Created Charlie Brown',
        'ip_address' => '192.168.1.1',
    ]);

    AuditLog::create([
        'user_id' => $volunteer->id,
        'action' => 'feeding_route_create',
        'description' => 'Snoopy feeding route',
        'ip_address' => '10.0.0.5',
    ]);

    // 1. Search action
    $this->actingAs($this->superAdmin)
        ->get(route('account.super-admin.audit-logs', ['search' => 'user_create']))
        ->assertInertia(fn (Assert $page) => $page
            ->has('logs.data', 1)
            ->where('logs.data.0.action', 'user_create')
        );

    // 2. Search description
    $this->actingAs($this->superAdmin)
        ->get(route('account.super-admin.audit-logs', ['search' => 'Snoopy']))
        ->assertInertia(fn (Assert $page) => $page
            ->has('logs.data', 1)
            ->where('logs.data.0.description', 'Snoopy feeding route')
        );

    // 3. Search IP address
    $this->actingAs($this->superAdmin)
        ->get(route('account.super-admin.audit-logs', ['search' => '10.0.0.5']))
        ->assertInertia(fn (Assert $page) => $page
            ->has('logs.data', 1)
            ->where('logs.data.0.ip_address', '10.0.0.5')
        );

    // 4. Search user name
    $this->actingAs($this->superAdmin)
        ->get(route('account.super-admin.audit-logs', ['search' => 'Charlie Brown']))
        ->assertInertia(fn (Assert $page) => $page
            ->has('logs.data', 1)
            ->where('logs.data.0.user_name', 'Charlie Brown')
        );

    // 5. Search user email
    $this->actingAs($this->superAdmin)
        ->get(route('account.super-admin.audit-logs', ['search' => 'snoopy@peanuts.com']))
        ->assertInertia(fn (Assert $page) => $page
            ->has('logs.data', 1)
            ->where('logs.data.0.user_name', 'Snoopy Dog')
        );
});

test('audit logs page filters by role', function () {
    $admin = User::factory()->admin()->create();
    $volunteer = User::factory()->volunteer()->create();

    AuditLog::create([
        'user_id' => $admin->id,
        'action' => 'admin_action',
        'description' => 'Admin description',
    ]);

    AuditLog::create([
        'user_id' => $volunteer->id,
        'action' => 'volunteer_action',
        'description' => 'Volunteer description',
    ]);

    AuditLog::create([
        'user_id' => null,
        'action' => 'system_action',
        'description' => 'System description',
    ]);

    // Filter by admin
    $this->actingAs($this->superAdmin)
        ->get(route('account.super-admin.audit-logs', ['role' => 'admin']))
        ->assertInertia(fn (Assert $page) => $page
            ->has('logs.data', 1)
            ->where('logs.data.0.action', 'admin_action')
        );

    // Filter by volunteer
    $this->actingAs($this->superAdmin)
        ->get(route('account.super-admin.audit-logs', ['role' => 'volunteer']))
        ->assertInertia(fn (Assert $page) => $page
            ->has('logs.data', 1)
            ->where('logs.data.0.action', 'volunteer_action')
        );

    // Filter by system
    $this->actingAs($this->superAdmin)
        ->get(route('account.super-admin.audit-logs', ['role' => 'system']))
        ->assertInertia(fn (Assert $page) => $page
            ->has('logs.data', 1)
            ->where('logs.data.0.action', 'system_action')
        );
});

test('audit logs page filters by specific user', function () {
    $admin = User::factory()->admin()->create();
    $volunteer = User::factory()->volunteer()->create();

    AuditLog::create([
        'user_id' => $admin->id,
        'action' => 'action1',
        'description' => 'Desc 1',
    ]);

    AuditLog::create([
        'user_id' => $volunteer->id,
        'action' => 'action2',
        'description' => 'Desc 2',
    ]);

    $this->actingAs($this->superAdmin)
        ->get(route('account.super-admin.audit-logs', ['user_id' => $volunteer->id]))
        ->assertInertia(fn (Assert $page) => $page
            ->has('logs.data', 1)
            ->where('logs.data.0.action', 'action2')
        );
});

test('audit logs page filters by specific action', function () {
    $admin = User::factory()->admin()->create();

    AuditLog::create([
        'user_id' => $admin->id,
        'action' => 'pet_create',
        'description' => 'Desc 1',
    ]);

    AuditLog::create([
        'user_id' => $admin->id,
        'action' => 'event_create',
        'description' => 'Desc 2',
    ]);

    $this->actingAs($this->superAdmin)
        ->get(route('account.super-admin.audit-logs', ['action' => 'pet_create']))
        ->assertInertia(fn (Assert $page) => $page
            ->has('logs.data', 1)
            ->where('logs.data.0.action', 'pet_create')
        );
});

test('audit logs page filters by date range', function () {
    $admin = User::factory()->admin()->create();

    $log1 = AuditLog::create([
        'user_id' => $admin->id,
        'action' => 'action1',
        'description' => 'Desc 1',
    ]);
    $log1->created_at = now()->subDays(5);
    $log1->save();

    $log2 = AuditLog::create([
        'user_id' => $admin->id,
        'action' => 'action2',
        'description' => 'Desc 2',
    ]);
    $log2->created_at = now()->subDays(1);
    $log2->save();

    $this->actingAs($this->superAdmin)
        ->get(route('account.super-admin.audit-logs', [
            'date_from' => now()->subDays(2)->toDateString(),
            'date_to' => now()->toDateString(),
        ]))
        ->assertInertia(fn (Assert $page) => $page
            ->has('logs.data', 1)
            ->where('logs.data.0.action', 'action2')
        );
});
