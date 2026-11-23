<?php

namespace App\Models;

use Database\Factories\VolunteerInjuryReportFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class VolunteerInjuryReport extends Model
{
    /** @use HasFactory<VolunteerInjuryReportFactory> */
    use HasFactory;

    public const string StatusReported = 'reported';

    public const string StatusMedicalAidInitiated = 'medical_aid_initiated';

    public const string StatusConfirmed = 'confirmed';

    public const array INCIDENT_TYPES = [
        'animal_bite' => 'Animal Bite',
        'scratch' => 'Scratch / Claw Wound',
        'fall_or_sprain' => 'Fall / Sprain',
        'heat_exhaustion' => 'Heat Exhaustion / Dehydration',
        'vehicle_or_traffic' => 'Road / Traffic Incident',
        'other' => 'Other Field Injury',
    ];

    public const array SEVERITIES = [
        'minor' => 'Minor',
        'moderate' => 'Moderate',
        'severe' => 'Severe',
        'critical' => 'Critical',
    ];

    public const array MEDICAL_AID_TYPES = [
        'anti_rabies_tetanus' => 'Anti-Rabies / Tetanus Shot',
        'clinic_referral' => 'Clinic / Hospital Referral',
        'onsite_first_aid' => 'On-Site First Aid Dispatch',
        'medical_reimbursement' => 'Medical Expense Reimbursement',
        'other' => 'Other Medical Aid',
    ];

    protected $guarded = [];

    protected $appends = ['photo_url'];

    protected function casts(): array
    {
        return [
            'first_aid_applied' => 'boolean',
            'incident_occurred_at' => 'datetime',
            'medical_aid_initiated_at' => 'datetime',
            'confirmed_at' => 'datetime',
        ];
    }

    public function getPhotoUrlAttribute(): ?string
    {
        if (! $this->photo_path) {
            return null;
        }

        if (str_starts_with($this->photo_path, 'http://') || str_starts_with($this->photo_path, 'https://')) {
            return $this->photo_path;
        }

        return Storage::disk('public')->url($this->photo_path);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return BelongsTo<AssignedTask, $this>
     */
    public function assignedTask(): BelongsTo
    {
        return $this->belongsTo(AssignedTask::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function initiatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'initiated_by_user_id');
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function confirmedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'confirmed_by_user_id');
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function assignedMedic(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_medic_user_id');
    }
}
