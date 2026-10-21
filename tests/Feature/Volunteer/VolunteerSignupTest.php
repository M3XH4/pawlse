<?php

use App\Models\User;
use App\Models\VolunteerApplication;

test('guest users cannot submit a volunteer application and are redirected to login', function () {
    $response = $this->post('/volunteer/apply', [
        'fullName' => 'Guest Person',
        'mobile' => '+63 912 345 6789',
        'email' => 'guest@example.com',
        'address' => 'Iligan City',
        'role' => 'Feeding',
        'why' => 'I want to help feed stray animals.',
    ]);

    $response->assertRedirect('/login');
    expect(VolunteerApplication::count())->toBe(0);
});

test('authenticated actual users can submit volunteer application and it is linked to their account', function () {
    $user = User::factory()->create([
        'name' => 'John Doe',
        'email' => 'john@example.com',
    ]);

    $response = $this->actingAs($user)->post('/volunteer/apply', [
        'fullName' => 'John Doe',
        'mobile' => '+63 241 421 8124',
        'email' => 'john@example.com',
        'address' => 'Pala-o, Iligan City',
        'role' => 'Rescue',
        'why' => 'I have a passion for saving injured stray animals.',
    ]);

    $response->assertSessionHasNoErrors();
    $response->assertRedirect();

    $application = VolunteerApplication::where('user_id', $user->id)->first();
    expect($application)->not->toBeNull();
    expect($application->full_name)->toBe('John Doe');
    expect($application->mobile)->toBe('+63 241 421 8124');
    expect($application->status)->toBe('pending');
    expect($application->reference_number)->toStartWith('VOL-');
});

test('authenticated user can track their volunteer status in user dashboard', function () {
    $user = User::factory()->create();

    $application = VolunteerApplication::factory()->create([
        'user_id' => $user->id,
        'status' => 'pending',
        'role' => 'Rescue',
    ]);

    $response = $this->actingAs($user)->get(route('account.user.volunteer-status'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('user/volunteer-status')
        ->where('application.status', 'pending')
        ->where('application.reference_number', $application->reference_number)
    );
});
