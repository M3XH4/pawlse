<?php

use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

test('profile page is displayed', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->get(route('profile.edit'));

    $response->assertOk();
});

test('unverified user profile information and email can be updated', function () {
    $user = User::factory()->unverified()->create();

    $response = $this
        ->actingAs($user)
        ->from(route('profile.edit'))
        ->patch(route('profile.update'), [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'phone' => '+639123456789',
            'location' => 'Pasig City',
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('profile.edit'));

    $user->refresh();

    expect($user->name)->toBe('Test User');
    expect($user->email)->toBe('test@example.com');
    expect($user->phone)->toBe('+639123456789');
    expect($user->location)->toBe('Pasig City');
    expect($user->email_verified_at)->toBeNull();
});

test('verified user email cannot be changed and remains verified', function () {
    $user = User::factory()->create([
        'email' => 'verified@example.com',
    ]);

    $response = $this
        ->actingAs($user)
        ->from(route('profile.edit'))
        ->patch(route('profile.update'), [
            'name' => 'Updated Name',
            'email' => 'newemail@example.com',
            'phone' => '+639189999999',
            'location' => 'Quezon City',
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('profile.edit'));

    $user->refresh();

    expect($user->name)->toBe('Updated Name');
    expect($user->email)->toBe('verified@example.com');
    expect($user->phone)->toBe('+639189999999');
    expect($user->location)->toBe('Quezon City');
    expect($user->email_verified_at)->not->toBeNull();
});

test('user can upload and remove avatar', function () {
    Storage::fake('public');
    $user = User::factory()->create();

    $file = UploadedFile::fake()->image('profile.jpg', 300, 300);

    $response = $this
        ->actingAs($user)
        ->from(route('profile.edit'))
        ->patch(route('profile.update'), [
            'name' => $user->name,
            'avatar' => $file,
        ]);

    $response->assertSessionHasNoErrors();
    $user->refresh();

    expect($user->avatar_path)->not->toBeNull();
    Storage::disk('public')->assertExists($user->avatar_path);

    // Now test removing avatar
    $removeResponse = $this
        ->actingAs($user)
        ->from(route('profile.edit'))
        ->patch(route('profile.update'), [
            'name' => $user->name,
            'remove_avatar' => true,
        ]);

    $removeResponse->assertSessionHasNoErrors();
    $user->refresh();

    expect($user->avatar_path)->toBeNull();
});

test('user can delete their account', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->delete(route('profile.destroy'), [
            'password' => 'password',
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('home'));

    $this->assertGuest();
    expect(User::find($user->id))->toBeNull();
});

test('correct password must be provided to delete account', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->from(route('profile.edit'))
        ->delete(route('profile.destroy'), [
            'password' => 'wrong-password',
        ]);

    $response
        ->assertSessionHasErrors('password')
        ->assertRedirect(route('profile.edit'));

    expect($user->fresh())->not->toBeNull();
});
