<?php

use App\Models\User;
use App\Notifications\VerifyEmailOtpNotification;
use Illuminate\Support\Facades\Notification;

test('sends verification otp notification', function () {
    Notification::fake();

    $user = User::factory()->unverified()->create();
    $user->forceFill(['email_verification_otp_sent_at' => now()->subSeconds(61)])->save();

    $this->actingAs($user)
        ->post(route('verification.send'))
        ->assertRedirect();

    Notification::assertSentTo($user, VerifyEmailOtpNotification::class);
});

test('does not send verification notification if email is verified', function () {
    Notification::fake();

    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('verification.send'))
        ->assertRedirect(route('dashboard', absolute: false));

    Notification::assertNothingSent();
});

test('verification otp resend respects cooldown', function () {
    Notification::fake();

    $user = User::factory()->unverified()->create();
    $user->sendEmailVerificationNotification();

    $this->actingAs($user)
        ->post(route('verification.send'))
        ->assertSessionHasErrors('otp');

    Notification::assertSentToTimes($user, VerifyEmailOtpNotification::class, 1);
});

test('verification otp resend is rate limited', function () {
    Notification::fake();

    $user = User::factory()->unverified()->create();
    $user->forceFill(['email_verification_otp_sent_at' => now()->subSeconds(61)])->save();

    $this->actingAs($user)
        ->post(route('verification.send'))
        ->assertRedirect();

    $user->forceFill(['email_verification_otp_sent_at' => now()->subSeconds(61)])->save();

    $this->actingAs($user)
        ->post(route('verification.send'))
        ->assertTooManyRequests();
});
