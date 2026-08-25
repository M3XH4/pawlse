<?php

use App\Models\User;
use App\Notifications\VerifyEmailOtpNotification;
use Illuminate\Auth\Events\Verified;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Notification;

test('email verification screen can be rendered', function () {
    $user = User::factory()->unverified()->create();
    $user->sendEmailVerificationNotification();

    $response = $this->actingAs($user)->get(route('verification.notice'));

    $response->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('auth/verify-email')
            ->where('email', $user->email)
            ->where('attempts', 0)
            ->where('maxAttempts', 5)
            ->has('cooldownSeconds')
            ->has('expiresAt'),
        );
});

test('email can be verified with a valid otp', function () {
    Notification::fake();

    $user = User::factory()->unverified()->create();
    $user->sendEmailVerificationNotification();
    $otp = null;

    Notification::assertSentTo($user, VerifyEmailOtpNotification::class, function (VerifyEmailOtpNotification $notification) use (&$otp): bool {
        $otp = $notification->otp;

        return true;
    });

    expect($otp)->toBeString()->toHaveLength(6);
    Event::fake();

    $response = $this->actingAs($user)->post(route('verification.verify'), [
        'otp' => $otp,
    ]);

    Event::assertDispatched(Verified::class);
    expect($user->fresh()->hasVerifiedEmail())->toBeTrue();
    expect($user->fresh()->email_verification_otp_hash)->toBeNull();
    $response->assertRedirect(route('dashboard', ['verified' => 1], false));
});

test('email is not verified with an incorrect otp', function () {
    Notification::fake();

    $user = User::factory()->unverified()->create();
    $user->sendEmailVerificationNotification();
    $otp = null;

    Notification::assertSentTo($user, VerifyEmailOtpNotification::class, function (VerifyEmailOtpNotification $notification) use (&$otp): bool {
        $otp = $notification->otp;

        return true;
    });

    $wrongOtp = $otp === '000000' ? '111111' : '000000';

    Event::fake();

    $this->actingAs($user)->post(route('verification.verify'), [
        'otp' => $wrongOtp,
    ])->assertSessionHasErrors('otp');

    Event::assertNotDispatched(Verified::class);
    expect($user->fresh()->hasVerifiedEmail())->toBeFalse()
        ->and($user->fresh()->email_verification_otp_attempts)->toBe(1);
});

test('email is not verified with an expired otp', function () {
    $user = User::factory()->unverified()->create();
    $otp = $user->refreshEmailVerificationOtp();
    $user->forceFill([
        'email_verification_otp_expires_at' => now()->subMinute(),
    ])->save();

    Event::fake();

    $this->actingAs($user)->post(route('verification.verify'), [
        'otp' => $otp,
    ])->assertSessionHasErrors('otp');

    Event::assertNotDispatched(Verified::class);
    expect($user->fresh()->hasVerifiedEmail())->toBeFalse();
});

test('email verification is protected after too many attempts', function () {
    $user = User::factory()->unverified()->create();
    $otp = $user->refreshEmailVerificationOtp();
    $user->forceFill([
        'email_verification_otp_attempts' => config('auth.email_otp.max_attempts'),
    ])->save();

    $this->actingAs($user)->post(route('verification.verify'), [
        'otp' => $otp,
    ])->assertSessionHasErrors('otp');

    expect($user->fresh()->hasVerifiedEmail())->toBeFalse();
});

test('verified user is redirected to dashboard from verification prompt', function () {
    $user = User::factory()->create();

    Event::fake();

    $response = $this->actingAs($user)->get(route('verification.notice'));

    Event::assertNotDispatched(Verified::class);
    $response->assertRedirect(route('dashboard', absolute: false));
});
