<?php

use App\Enums\Role;
use App\Models\User;
use App\Notifications\VerifyEmailOtpNotification;
use Illuminate\Support\Facades\Notification;
use Laravel\Fortify\Features;

beforeEach(function () {
    $this->skipUnlessFortifyHas(Features::registration());
});

test('registration screen can be rendered', function () {
    $response = $this->get(route('register'));

    $response->assertOk();
});

test('new users can register', function () {
    Notification::fake();

    $response = $this->post(route('register.store'), [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
        'role' => Role::SuperAdmin->value,
    ]);

    $user = User::where('email', 'test@example.com')->firstOrFail();

    $this->assertAuthenticated();
    $response->assertRedirect(route('dashboard', absolute: false));

    expect($user->hasVerifiedEmail())->toBeFalse()
        ->and($user->role)->toBe(Role::User->value)
        ->and($user->hasRole(Role::User->value))->toBeTrue()
        ->and($user->hasRole(Role::SuperAdmin->value))->toBeFalse();

    Notification::assertSentTo($user, VerifyEmailOtpNotification::class);
});
