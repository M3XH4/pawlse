<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\VerifyEmailOtpRequest;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class EmailVerificationOtpController extends Controller
{
    public function show(Request $request): Response|RedirectResponse
    {
        if ($request->user()->hasVerifiedEmail()) {
            return redirect()->route('dashboard');
        }

        return Inertia::render('auth/verify-email', [
            'status' => $request->session()->get('status'),
            'email' => $request->user()->email,
            'cooldownSeconds' => $this->cooldownSeconds($request),
            'expiresAt' => $request->user()->email_verification_otp_expires_at?->toISOString(),
            'attempts' => $request->user()->email_verification_otp_attempts,
            'maxAttempts' => (int) config('auth.email_otp.max_attempts', 5),
        ]);
    }

    public function store(VerifyEmailOtpRequest $request): RedirectResponse
    {
        $user = $request->user();

        if ($user->hasVerifiedEmail()) {
            return redirect()->route('dashboard');
        }

        if ($user->hasReachedEmailVerificationOtpAttemptLimit()) {
            return back()->withErrors([
                'otp' => 'Too many incorrect attempts. Request a new code to continue.',
            ])->withInput();
        }

        if ($user->emailVerificationOtpExpired()) {
            return back()->withErrors([
                'otp' => 'This verification code has expired. Request a new code to continue.',
            ])->withInput();
        }

        $user->recordEmailVerificationOtpAttempt();

        if (! Hash::check($request->validated('otp'), (string) $user->email_verification_otp_hash)) {
            return back()->withErrors([
                'otp' => 'The verification code is incorrect.',
            ])->withInput();
        }

        if ($user->markEmailAsVerified()) {
            event(new Verified($user));
        }

        $user->clearEmailVerificationOtp();

        return redirect()->route('dashboard', ['verified' => 1]);
    }

    public function resend(Request $request): RedirectResponse
    {
        $user = $request->user();

        if ($user->hasVerifiedEmail()) {
            return redirect()->route('dashboard');
        }

        $cooldownSeconds = $this->cooldownSeconds($request);

        if ($cooldownSeconds > 0) {
            return back()->withErrors([
                'otp' => "Please wait {$cooldownSeconds} seconds before requesting another code.",
            ]);
        }

        $user->sendEmailVerificationNotification();

        return back()->with('status', 'verification-code-sent');
    }

    private function cooldownSeconds(Request $request): int
    {
        $availableAt = $request->user()->emailVerificationOtpResendAvailableAt();

        if ($availableAt === null || now()->greaterThanOrEqualTo($availableAt)) {
            return 0;
        }

        return (int) ceil(now()->diffInSeconds($availableAt, false));
    }
}
