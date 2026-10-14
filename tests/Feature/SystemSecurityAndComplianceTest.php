<?php

use App\Models\PetReport;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(RoleSeeder::class);
    Storage::fake('public');

    $this->admin = User::factory()->admin()->create([
        'email' => 'admin_test@pawlse.test',
        'password' => Hash::make('password123'),
    ]);

    $this->superAdmin = User::factory()->superAdmin()->create([
        'email' => 'superadmin_test@pawlse.test',
        'password' => Hash::make('password123'),
    ]);

    $this->volunteer = User::factory()->volunteer()->create([
        'email' => 'volunteer_test@pawlse.test',
        'password' => Hash::make('password123'),
    ]);

    $this->user = User::factory()->create([
        'email' => 'user_test@pawlse.test',
        'password' => Hash::make('password123'),
    ]);
});

/*
|--------------------------------------------------------------------------
| SECTION G: SECURITY AND ACCESS-CONTROL TESTING
|--------------------------------------------------------------------------
*/

test('SEC-01: valid login authenticates correct account', function () {
    $response = $this->post('/login', [
        'email' => 'user_test@pawlse.test',
        'password' => 'password123',
    ]);

    $this->assertAuthenticatedAs($this->user);
});

test('SEC-02: invalid username / email is rejected', function () {
    $response = $this->from('/login')->post('/login', [
        'email' => 'nonexistent_account@pawlse.test',
        'password' => 'password123',
    ]);

    $response->assertSessionHasErrors('email');
    $this->assertGuest();
});

test('SEC-03: invalid password is rejected', function () {
    $response = $this->from('/login')->post('/login', [
        'email' => 'user_test@pawlse.test',
        'password' => 'wrong_password_999',
    ]);

    $response->assertSessionHasErrors('email');
    $this->assertGuest();
});

test('SEC-04: empty credentials are validated and rejected', function () {
    $response = $this->from('/login')->post('/login', [
        'email' => '',
        'password' => '',
    ]);

    $response->assertSessionHasErrors(['email', 'password']);
    $this->assertGuest();
});

test('SEC-05: public user cannot access admin-only functions', function () {
    $response = $this->get('/account/admin/dashboard');
    $response->assertRedirect('/login');
});

test('SEC-06: volunteer cannot access admin-only functions', function () {
    $response = $this->actingAs($this->volunteer)->get('/account/admin/dashboard');
    $response->assertForbidden();
});

test('SEC-07: admin cannot access super-admin-only functions', function () {
    $response = $this->actingAs($this->admin)->get('/account/super-admin/dashboard');
    $response->assertForbidden();
});

test('SEC-08: direct unauthorized request to restricted action is rejected', function () {
    $report = PetReport::factory()->create();
    $response = $this->actingAs($this->user)->post("/account/admin/rescue-management/{$report->id}/assign", [
        'volunteer_id' => $this->volunteer->id,
    ]);
    $response->assertForbidden();
});

test('SEC-09: invalid or unexpected input is validated and rejected', function () {
    $response = $this->actingAs($this->user)->post('/pet-reports/rescue', [
        'location' => '',
        'animal_type' => '',
    ]);
    $response->assertSessionHasErrors(['location']);
});

test('SEC-10: invalid file format is rejected where restricted', function () {
    $badFile = UploadedFile::fake()->create('malicious.php', 50, 'application/x-php');
    $response = $this->actingAs($this->user)->post('/pet-reports/rescue', [
        'type' => 'rescue',
        'location' => 'Main St',
        'contact_name' => 'John',
        'contact_phone' => '09123456789',
        'images' => [$badFile],
    ]);
    $response->assertSessionHasErrors('images.0');
});

test('SEC-11: oversized files beyond allowed size are rejected', function () {
    $oversizedFile = UploadedFile::fake()->create('huge_photo.jpg', 15000, 'image/jpeg'); // 15MB
    $response = $this->actingAs($this->user)->post('/pet-reports/rescue', [
        'type' => 'rescue',
        'location' => 'Main St',
        'contact_name' => 'John',
        'contact_phone' => '09123456789',
        'images' => [$oversizedFile],
    ]);
    $response->assertSessionHasErrors('images.0');
});

test('SEC-12: logout ends session appropriately', function () {
    $this->actingAs($this->user);
    $response = $this->post('/logout');
    $this->assertGuest();
});

test('SEC-13: protected page cannot be accessed after logout', function () {
    $this->actingAs($this->user);
    $this->post('/logout');

    $response = $this->get('/account/user/rescue-reports');
    $response->assertRedirect('/login');
});

test('SEC-14: session expiration prevents continued unauthorized access', function () {
    $this->actingAs($this->user);
    auth()->logout();
    Session::flush();

    $response = $this->get('/account/user/rescue-reports');
    $response->assertRedirect('/login');
});

test('SEC-15: role manipulation via registration payload does not grant elevated privileges', function () {
    $response = $this->post('/register', [
        'name' => 'Privilege Attacker',
        'email' => 'attacker@pawlse.test',
        'password' => 'Password123!',
        'password_confirmation' => 'Password123!',
        'role' => 'super-admin',
    ]);

    $attacker = User::where('email', 'attacker@pawlse.test')->first();
    expect($attacker)->not->toBeNull();
    expect($attacker->hasRole('super-admin'))->toBeFalse();
    expect($attacker->hasRole('user'))->toBeTrue();
});

test('SEC-16: record access isolation prevents IDOR unauthorized modification', function () {
    $otherUser = User::factory()->create();
    $report = PetReport::factory()->create([
        'user_id' => $otherUser->id,
        'type' => 'rescue',
        'status' => 'pending',
    ]);

    // Regular user attempting admin or unauthorized status update
    $response = $this->actingAs($this->user)->post("/account/admin/rescue-management/{$report->id}/status", [
        'status' => 'completed',
    ]);
    $response->assertForbidden();
});

test('SEC-17: sensitive administrative operations require appropriate high-level authorization', function () {
    // Admin attempting Super Admin backup run
    $response = $this->actingAs($this->admin)->post('/account/super-admin/backup-restore/run');
    $response->assertForbidden();

    // Super Admin authorized
    $responseSuper = $this->actingAs($this->superAdmin)->post('/account/super-admin/backup-restore/run');
    expect($responseSuper->status())->not->toBe(403);
});
