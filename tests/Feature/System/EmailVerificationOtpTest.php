<?php

use App\Models\User;
use App\Notifications\VerifyEmailOtpNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;

uses(RefreshDatabase::class);

test('guests cannot view the otp verification screen', function () {
    $this->get(route('verification.notice'))
        ->assertRedirect(route('login'));
});

test('otp validation requires a six digit code', function (?string $otp) {
    $user = User::factory()->unverified()->create();

    $this->actingAs($user)
        ->post(route('verification.verify'), ['otp' => $otp])
        ->assertSessionHasErrors('otp');
})->with([
    'missing' => null,
    'short' => '12345',
    'letters' => 'ABC123',
]);

test('unverified users are redirected away from protected dashboards', function () {
    $user = User::factory()->unverified()->create();

    $this->actingAs($user)
        ->get(route('account.user.index'))
        ->assertRedirect(route('verification.notice'));
});

test('unverified user viewing verification prompt without active otp triggers notification', function () {
    Notification::fake();

    $user = User::factory()->unverified()->create([
        'email_verification_otp_hash' => null,
        'email_verification_otp_expires_at' => null,
    ]);

    $this->actingAs($user)->get(route('verification.notice'))->assertOk();

    Notification::assertSentTo($user, VerifyEmailOtpNotification::class);
    expect($user->fresh()->email_verification_otp_hash)->not->toBeNull();
});

test('otp notification mail contains professional messaging and security details', function () {
    $user = User::factory()->unverified()->create(['name' => 'Alex Morgan']);
    $notification = new VerifyEmailOtpNotification(
        otp: '654321',
        expiresAt: now()->addMinutes(10),
    );

    $mail = $notification->toMail($user);

    expect($mail->subject)->toBe('Your Pawlse Verification Code: 654321')
        ->and($mail->greeting)->toBe('Hello Alex Morgan,')
        ->and($mail->introLines)->toContain('## **654321**')
        ->and($mail->salutation)->toContain('Pawlse Community & Security Team');
});
