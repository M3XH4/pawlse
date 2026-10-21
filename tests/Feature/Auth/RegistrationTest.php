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
        'terms' => true,
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

test('new users can register with separated name fields', function () {
    Notification::fake();

    $response = $this->post(route('register.store'), [
        'first_name' => 'Juan',
        'middle_initial' => 'D',
        'last_name' => 'Dela Cruz',
        'email' => 'juan@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
        'terms' => true,
    ]);

    $user = User::where('email', 'juan@example.com')->firstOrFail();

    $this->assertAuthenticated();
    $response->assertRedirect(route('dashboard', absolute: false));

    expect($user->first_name)->toBe('Juan')
        ->and($user->middle_initial)->toBe('D')
        ->and($user->last_name)->toBe('Dela Cruz')
        ->and($user->name)->toBe('Juan D. Dela Cruz');
});

test('new users can register without middle initial', function () {
    Notification::fake();

    $response = $this->post(route('register.store'), [
        'first_name' => 'Maria',
        'middle_initial' => '',
        'last_name' => 'Santos',
        'email' => 'maria@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
        'terms' => '1',
    ]);

    $user = User::where('email', 'maria@example.com')->firstOrFail();

    $this->assertAuthenticated();
    $response->assertRedirect(route('dashboard', absolute: false));

    expect($user->first_name)->toBe('Maria')
        ->and($user->middle_initial)->toBeNull()
        ->and($user->last_name)->toBe('Santos')
        ->and($user->name)->toBe('Maria Santos');
});

test('registration requires terms to be accepted', function () {
    $response = $this->post(route('register.store'), [
        'first_name' => 'Pedro',
        'last_name' => 'Penduko',
        'email' => 'pedro@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
        'terms' => false,
    ]);

    $response->assertSessionHasErrors(['terms']);
    $this->assertGuest();
});

test('registration requires first name and last name', function () {
    $response = $this->post(route('register.store'), [
        'first_name' => '',
        'middle_initial' => 'X',
        'last_name' => '',
        'email' => 'noname@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
        'terms' => true,
    ]);

    $response->assertSessionHasErrors(['first_name', 'last_name']);
    $this->assertGuest();
});

test('registration succeeds when middle initial is completely omitted', function () {
    Notification::fake();

    $response = $this->post(route('register.store'), [
        'first_name' => 'Ana',
        'last_name' => 'Reyes',
        'email' => 'ana@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
        'terms' => true,
    ]);

    $user = User::where('email', 'ana@example.com')->firstOrFail();

    $this->assertAuthenticated();
    $response->assertRedirect(route('dashboard', absolute: false));

    expect($user->first_name)->toBe('Ana')
        ->and($user->middle_initial)->toBeNull()
        ->and($user->last_name)->toBe('Reyes')
        ->and($user->name)->toBe('Ana Reyes');
});

test('registration requires email address', function () {
    $response = $this->post(route('register.store'), [
        'first_name' => 'Carlos',
        'last_name' => 'Tan',
        'email' => '',
        'password' => 'password',
        'password_confirmation' => 'password',
        'terms' => true,
    ]);

    $response->assertSessionHasErrors(['email']);
    $this->assertGuest();
});

test('registration requires password and confirmation', function () {
    $response = $this->post(route('register.store'), [
        'first_name' => 'Carlos',
        'last_name' => 'Tan',
        'email' => 'carlos@example.com',
        'password' => '',
        'password_confirmation' => '',
        'terms' => true,
    ]);

    $response->assertSessionHasErrors(['password']);
    $this->assertGuest();
});
