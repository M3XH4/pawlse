<?php

namespace App\Models;

use App\Notifications\VerifyEmailOtpNotification;
use Carbon\CarbonInterface;
use Database\Factories\UserFactory;
use Illuminate\Auth\MustVerifyEmail;
use Illuminate\Contracts\Auth\MustVerifyEmail as MustVerifyEmailContract;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Hash;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Spatie\Permission\Traits\HasRoles;

#[Fillable(['name', 'email', 'password'])]
#[Hidden(['password', 'email_verification_otp_hash', 'two_factor_secret', 'two_factor_recovery_codes', 'remember_token'])]
class User extends Authenticatable implements MustVerifyEmailContract
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, HasRoles, MustVerifyEmail, Notifiable, TwoFactorAuthenticatable;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'email_verification_otp_expires_at' => 'datetime',
            'email_verification_otp_sent_at' => 'datetime',
            'email_verification_otp_attempts' => 'integer',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
        ];
    }

    public function sendEmailVerificationNotification(): void
    {
        if ($this->hasVerifiedEmail()) {
            return;
        }

        $otp = $this->refreshEmailVerificationOtp();

        $this->notify(new VerifyEmailOtpNotification(
            otp: $otp,
            expiresAt: $this->email_verification_otp_expires_at,
        ));
    }

    public function refreshEmailVerificationOtp(): string
    {
        $otp = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        $this->forceFill([
            'email_verification_otp_hash' => Hash::make($otp),
            'email_verification_otp_expires_at' => now()->addMinutes((int) config('auth.email_otp.expire', 10)),
            'email_verification_otp_sent_at' => now(),
            'email_verification_otp_attempts' => 0,
        ])->save();

        return $otp;
    }

    public function emailVerificationOtpExpired(): bool
    {
        return $this->email_verification_otp_hash === null
            || $this->email_verification_otp_expires_at === null
            || now()->greaterThan($this->email_verification_otp_expires_at);
    }

    public function hasReachedEmailVerificationOtpAttemptLimit(): bool
    {
        return $this->email_verification_otp_attempts >= (int) config('auth.email_otp.max_attempts', 5);
    }

    public function recordEmailVerificationOtpAttempt(): void
    {
        $this->forceFill([
            'email_verification_otp_attempts' => $this->email_verification_otp_attempts + 1,
        ])->save();
    }

    public function clearEmailVerificationOtp(): void
    {
        $this->forceFill([
            'email_verification_otp_hash' => null,
            'email_verification_otp_expires_at' => null,
            'email_verification_otp_sent_at' => null,
            'email_verification_otp_attempts' => 0,
        ])->save();
    }

    public function emailVerificationOtpResendAvailableAt(): ?CarbonInterface
    {
        if ($this->email_verification_otp_sent_at === null) {
            return null;
        }

        return $this->email_verification_otp_sent_at->addSeconds(
            (int) config('auth.email_otp.resend_cooldown', 60),
        );
    }

    /**
     * @return HasMany<VolunteerApplication, $this>
     */
    public function volunteerApplications(): HasMany
    {
        return $this->hasMany(VolunteerApplication::class);
    }

    /**
     * @return HasMany<AssignedTask, $this>
     */
    public function assignedTasks(): HasMany
    {
        return $this->hasMany(AssignedTask::class);
    }

    /**
     * @return HasMany<Certificate, $this>
     */
    public function certificates(): HasMany
    {
        return $this->hasMany(Certificate::class);
    }

    /**
     * @return HasMany<PetReport, $this>
     */
    public function petReports(): HasMany
    {
        return $this->hasMany(PetReport::class);
    }
}
