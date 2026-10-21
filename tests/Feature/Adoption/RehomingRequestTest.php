<?php

use App\Models\AdoptionApplication;
use App\Models\RehomingRequest;
use App\Models\ShelterAnimal;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

test('public user can submit a rehoming assistance request with image', function () {
    Storage::fake('public');

    $file = UploadedFile::fake()->image('rescue_pup.jpg', 600, 600);

    $response = $this->post(route('rehoming-requests.store'), [
        'full_name' => 'Ana Reyes',
        'contact_number' => '09171234567',
        'email' => 'ana@example.com',
        'animal_name' => 'Charlie',
        'species' => 'Dog',
        'breed' => 'Aspin',
        'gender' => 'Male',
        'age' => '1 year',
        'current_location' => 'Iligan City',
        'reason' => 'Relocating / Moving',
        'health_notes' => 'Complete 5-in-1 vaccines',
        'description' => 'Gentle and friendly with other dogs',
        'photo' => $file,
    ]);

    $response->assertSessionHasNoErrors();
    $response->assertRedirect();

    $this->assertDatabaseHas('rehoming_requests', [
        'full_name' => 'Ana Reyes',
        'animal_name' => 'Charlie',
        'species' => 'Dog',
        'gender' => 'Male',
        'current_location' => 'Iligan City',
        'status' => 'pending',
    ]);

    $rehoming = RehomingRequest::where('animal_name', 'Charlie')->first();
    expect($rehoming)->not->toBeNull();
    expect($rehoming->photo_path)->not->toBeNull();
    Storage::disk('public')->assertExists($rehoming->photo_path);
});

test('rehoming request validates required fields', function () {
    $response = $this->post(route('rehoming-requests.store'), [
        'full_name' => '',
        'contact_number' => '',
        'email' => 'invalid-email',
        'animal_name' => '',
        'species' => '',
        'current_location' => '',
        'reason' => '',
    ]);

    $response->assertSessionHasErrors(['full_name', 'contact_number', 'email', 'animal_name', 'species', 'current_location', 'reason', 'photo']);
});

test('admin can update rehoming assistance status and notes', function () {
    $admin = User::factory()->admin()->create();
    $rehoming = RehomingRequest::factory()->create([
        'status' => 'pending',
    ]);

    $response = $this->actingAs($admin)->post(route('account.admin.adoption-management.rehoming-requests.update-status', $rehoming), [
        'status' => 'posted',
        'admin_notes' => 'Cross-posted to ISF official Facebook page.',
    ]);

    $response->assertSessionHasNoErrors();
    $response->assertRedirect(route('account.admin.adoption-management'));

    $rehoming->refresh();
    expect($rehoming->status)->toBe('posted');
    expect($rehoming->admin_notes)->toBe('Cross-posted to ISF official Facebook page.');
    expect($rehoming->reviewed_by)->toBe($admin->id);
});

test('admin can mark rehoming request as home found', function () {
    $admin = User::factory()->admin()->create();
    $rehoming = RehomingRequest::factory()->create([
        'status' => 'posted',
    ]);

    $response = $this->actingAs($admin)->post(route('account.admin.adoption-management.rehoming-requests.update-status', $rehoming), [
        'status' => 'home_found',
        'admin_notes' => 'Adopter finalized via community lead.',
    ]);

    $response->assertSessionHasNoErrors();
    $rehoming->refresh();
    expect($rehoming->status)->toBe('home_found');
});

test('admin intake of rehoming request updates status to shelter_intake and creates shelter animal', function () {
    $admin = User::factory()->admin()->create();
    $rehoming = RehomingRequest::factory()->create([
        'animal_name' => 'Barnaby',
        'species' => 'Dog',
        'status' => 'pending',
    ]);

    $response = $this->actingAs($admin)->post(route('account.admin.adoption-management.rehoming-requests.intake', $rehoming), [
        'intake_notes' => 'Medical assessment completed on intake.',
    ]);

    $response->assertSessionHasNoErrors();
    $rehoming->refresh();
    expect($rehoming->status)->toBe('shelter_intake');
    expect($rehoming->admin_notes)->toContain('Pet successfully admitted to shelter sanctuary');

    $this->assertDatabaseHas('shelter_animals', [
        'name' => 'Barnaby',
        'status' => 'available',
    ]);
});

test('authenticated user can view and withdraw their rehoming requests in user dashboard', function () {
    $user = User::factory()->create(['email' => 'guardian@example.com']);
    $rehoming = RehomingRequest::factory()->create([
        'user_id' => null,
        'email' => 'guardian@example.com',
        'animal_name' => 'Milo',
        'status' => 'pending',
    ]);

    $this->actingAs($user)
        ->get(route('account.user.rehoming-requests'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('user/rehoming-requests')
            ->has('rehomingRequests', 1)
            ->where('rehomingRequests.0.id', $rehoming->id)
        );

    $this->actingAs($user)
        ->post(route('account.user.rehoming-requests.cancel', $rehoming))
        ->assertRedirect();

    $this->assertSoftDeleted('rehoming_requests', ['id' => $rehoming->id]);
});

test('updating rehoming status to shelter_intake via status endpoint also creates shelter animal and prevents duplicates', function () {
    $admin = User::factory()->admin()->create();
    $rehoming = RehomingRequest::factory()->create([
        'animal_name' => 'Mochi',
        'species' => 'Cat',
        'health_notes' => 'Not vaccinated yet',
        'status' => 'reviewed',
    ]);

    $response = $this->actingAs($admin)->post(route('account.admin.adoption-management.rehoming-requests.update-status', $rehoming), [
        'status' => 'shelter_intake',
        'admin_notes' => 'Admitted via status dropdown.',
    ]);

    $response->assertSessionHasNoErrors();
    $rehoming->refresh();
    expect($rehoming->status)->toBe('shelter_intake');

    $animals = ShelterAnimal::where('name', 'Mochi')->get();
    expect($animals)->toHaveCount(1);
    expect((bool) $animals->first()->vaccinated)->toBeFalse();

    // Calling intake again should not create a duplicate animal record
    $this->actingAs($admin)->post(route('account.admin.adoption-management.rehoming-requests.intake', $rehoming), [
        'intake_notes' => 'Second call test',
    ]);

    expect(ShelterAnimal::where('name', 'Mochi')->count())->toBe(1);
});

test('public tracking resolves REH- reference without colliding with adoption application and formats status label', function () {
    $email = 'rehome-tracker@example.com';

    AdoptionApplication::factory()->create([
        'email' => $email,
    ]);

    $rehoming = RehomingRequest::factory()->create([
        'email' => $email,
        'animal_name' => 'Biscuit',
        'status' => 'shelter_intake',
    ]);

    $rehRef = 'REH-'.str_pad((string) $rehoming->id, 5, '0', STR_PAD_LEFT);

    $response = $this->get(route('track', [
        'reference' => $rehRef,
        'email' => $email,
    ]));

    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('track')
            ->where('item.category', 'rehoming')
            ->where('item.reference', $rehRef)
            ->where('item.status_label', 'Admitted to Shelter Sanctuary')
            ->where('item.status_theme', 'green')
        );
});
