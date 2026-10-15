<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CareSustainability extends Model
{
    use HasFactory;

    protected $table = 'care_sustainabilities';

    protected $fillable = [
        'verified_funds',
        'daily_cost',
        'resource_category',
        'sustainability_endpoint',
        'threshold_stable_days',
        'threshold_needs_support_days',
        'threshold_urgent_days',
        'threshold_critical_days',
        'calculation_notes',
        'updated_by_name',
        'updated_by_id',
    ];

    protected $casts = [
        'verified_funds' => 'float',
        'daily_cost' => 'float',
        'threshold_stable_days' => 'float',
        'threshold_needs_support_days' => 'float',
        'threshold_urgent_days' => 'float',
        'threshold_critical_days' => 'float',
        'sustainability_endpoint' => 'datetime',
    ];

    public function histories(): HasMany
    {
        return $this->hasMany(CareSustainabilityHistory::class, 'care_sustainability_id')->latest('created_at');
    }

    public function updatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by_id');
    }

    /**
     * Get or initialize the singleton care sustainability record.
     */
    public static function current(): self
    {
        $current = self::first();

        if (! $current) {
            $now = Carbon::now();
            $initialEndpoint = $now->copy()->addDays(round(4250 / 500, 2));

            $current = self::create([
                'verified_funds' => 4250.00,
                'daily_cost' => 500.00,
                'resource_category' => 'General Animal Care',
                'sustainability_endpoint' => $initialEndpoint,
                'threshold_stable_days' => 7.00,
                'threshold_needs_support_days' => 3.00,
                'threshold_urgent_days' => 1.00,
                'threshold_critical_days' => 0.25,
                'calculation_notes' => 'Baseline care sustainability configuration.',
                'updated_by_name' => 'ISF Admin',
            ]);
        }

        return $current;
    }

    /**
     * Recalculate endpoint based on funds and daily cost from now.
     */
    public function recalculate(float $funds, float $dailyCost, ?string $category = null, ?string $notes = null, ?User $user = null): self
    {
        $dailyCost = max(0.01, $dailyCost);
        $days = max(0, $funds / $dailyCost);
        $seconds = (int) round($days * 86400);

        $now = Carbon::now();
        $previousEndpoint = $this->sustainability_endpoint;
        $newEndpoint = $now->copy()->addSeconds($seconds);

        $this->update([
            'verified_funds' => $funds,
            'daily_cost' => $dailyCost,
            'resource_category' => $category ?: $this->resource_category,
            'sustainability_endpoint' => $newEndpoint,
            'calculation_notes' => $notes !== null ? $notes : $this->calculation_notes,
            'updated_by_name' => $user ? $user->name : ($this->updated_by_name ?: 'ISF Admin'),
            'updated_by_id' => $user?->id,
        ]);

        CareSustainabilityHistory::create([
            'care_sustainability_id' => $this->id,
            'action' => 'recalculated',
            'funds_amount' => $funds,
            'daily_cost' => $dailyCost,
            'amount_added' => 0.00,
            'days_added' => round($days, 2),
            'endpoint_before' => $previousEndpoint,
            'endpoint_after' => $newEndpoint,
            'notes' => $notes ?: 'Care sustainability recalculated from current funds and daily rate.',
            'performed_by' => $user ? $user->name : $this->updated_by_name,
            'user_id' => $user?->id,
            'created_at' => $now,
        ]);

        return $this;
    }

    /**
     * Update configuration parameters without resetting current endpoint.
     */
    public function updateConfigOnly(array $data, ?User $user = null): self
    {
        $this->update([
            'daily_cost' => isset($data['daily_cost']) ? max(0.01, (float) $data['daily_cost']) : $this->daily_cost,
            'resource_category' => $data['resource_category'] ?? $this->resource_category,
            'threshold_stable_days' => isset($data['threshold_stable_days']) ? (float) $data['threshold_stable_days'] : $this->threshold_stable_days,
            'threshold_needs_support_days' => isset($data['threshold_needs_support_days']) ? (float) $data['threshold_needs_support_days'] : $this->threshold_needs_support_days,
            'threshold_urgent_days' => isset($data['threshold_urgent_days']) ? (float) $data['threshold_urgent_days'] : $this->threshold_urgent_days,
            'threshold_critical_days' => isset($data['threshold_critical_days']) ? (float) $data['threshold_critical_days'] : $this->threshold_critical_days,
            'calculation_notes' => array_key_exists('calculation_notes', $data) ? $data['calculation_notes'] : $this->calculation_notes,
            'updated_by_name' => $user ? $user->name : ($data['updated_by_name'] ?? $this->updated_by_name),
            'updated_by_id' => $user?->id,
        ]);

        CareSustainabilityHistory::create([
            'care_sustainability_id' => $this->id,
            'action' => 'config_updated',
            'funds_amount' => $this->verified_funds,
            'daily_cost' => $this->daily_cost,
            'amount_added' => 0.00,
            'days_added' => 0.00,
            'endpoint_before' => $this->sustainability_endpoint,
            'endpoint_after' => $this->sustainability_endpoint,
            'notes' => $data['calculation_notes'] ?? 'Updated care sustainability configuration thresholds and parameters.',
            'performed_by' => $user ? $user->name : $this->updated_by_name,
            'user_id' => $user?->id,
            'created_at' => Carbon::now(),
        ]);

        return $this;
    }

    /**
     * Extend timer by a verified donation amount.
     */
    public function extendByAmount(float $amount, ?string $notes = null, ?User $user = null, ?Donation $donation = null): self
    {
        if ($amount <= 0 || $this->daily_cost <= 0) {
            return $this;
        }

        $daysAdded = $amount / (float) $this->daily_cost;
        $secondsAdded = (int) round($daysAdded * 86400);

        $now = Carbon::now();
        $previousEndpoint = $this->sustainability_endpoint;

        if ($previousEndpoint === null || $previousEndpoint->isPast()) {
            $newEndpoint = $now->copy()->addSeconds($secondsAdded);
        } else {
            $newEndpoint = $previousEndpoint->copy()->addSeconds($secondsAdded);
        }

        $newFunds = (float) $this->verified_funds + $amount;

        $this->update([
            'verified_funds' => $newFunds,
            'sustainability_endpoint' => $newEndpoint,
            'updated_by_name' => $user ? $user->name : ($donation ? 'Donor '.$donation->public_reference : $this->updated_by_name),
            'updated_by_id' => $user?->id,
        ]);

        $defaultNote = $donation
            ? "Timer extended by verified donation {$donation->public_reference} (₱".number_format($amount, 2).')'
            : 'Timer manually extended by verified funds of ₱'.number_format($amount, 2);

        CareSustainabilityHistory::create([
            'care_sustainability_id' => $this->id,
            'action' => $donation ? 'donation_verified' : 'timer_extended',
            'funds_amount' => $newFunds,
            'daily_cost' => $this->daily_cost,
            'amount_added' => $amount,
            'days_added' => round($daysAdded, 2),
            'endpoint_before' => $previousEndpoint,
            'endpoint_after' => $newEndpoint,
            'notes' => $notes ?: $defaultNote,
            'performed_by' => $user ? $user->name : ($donation ? ($donation->anonymous ? 'Anonymous Donor' : $donation->donor_name) : $this->updated_by_name),
            'user_id' => $user?->id,
            'donation_id' => $donation?->id,
            'created_at' => $now,
        ]);

        return $this;
    }

    /**
     * Resolve status based on endpoint and thresholds.
     */
    public function getUrgencyStatus(?Carbon $now = null): string
    {
        $now = $now ?: Carbon::now();

        if (! $this->sustainability_endpoint || $this->sustainability_endpoint->lessThanOrEqualTo($now)) {
            return 'DEPLETED';
        }

        $secondsRemaining = $now->diffInSeconds($this->sustainability_endpoint, false);
        $daysRemaining = $secondsRemaining / 86400;

        if ($daysRemaining >= $this->threshold_stable_days) {
            return 'STABLE';
        }

        if ($daysRemaining >= $this->threshold_needs_support_days) {
            return 'NEEDS SUPPORT';
        }

        if ($daysRemaining >= $this->threshold_urgent_days) {
            return 'URGENT';
        }

        if ($daysRemaining >= $this->threshold_critical_days) {
            return 'CRITICAL';
        }

        return 'DEPLETED';
    }

    public function getUrgencyLabel(string $status): string
    {
        return match ($status) {
            'STABLE' => 'CARE SUSTAINABLE',
            'NEEDS SUPPORT' => 'CARE SUPPORT NEEDED',
            'URGENT' => 'URGENT CARE NEEDED',
            'CRITICAL' => 'CRITICAL CARE NEEDED',
            default => 'CARE SUPPORT NEEDED',
        };
    }

    /**
     * Format data for client SPA components.
     */
    public function toPublicArray(): array
    {
        $now = Carbon::now();
        $isDepleted = ! $this->sustainability_endpoint || $this->sustainability_endpoint->lessThanOrEqualTo($now);
        $secondsRemaining = $isDepleted ? 0 : (int) $now->diffInSeconds($this->sustainability_endpoint, false);
        $estDays = round($secondsRemaining / 86400, 1);
        $status = $this->getUrgencyStatus($now);

        return [
            'id' => $this->id,
            'verified_funds' => (float) $this->verified_funds,
            'daily_cost' => (float) $this->daily_cost,
            'resource_category' => $this->resource_category,
            'sustainability_endpoint' => $this->sustainability_endpoint?->toISOString(),
            'formatted_endpoint' => $this->sustainability_endpoint ? $this->sustainability_endpoint->format('M j, Y, g:i A') : 'Depleted',
            'seconds_remaining' => $secondsRemaining,
            'est_days' => $estDays,
            'urgency_status' => $status,
            'urgency_label' => $this->getUrgencyLabel($status),
            'calculation_notes' => $this->calculation_notes ?: '',
            'updated_by_name' => $this->updated_by_name ?: 'ISF Admin',
            'last_updated_at' => $this->updated_at?->diffForHumans() ?: 'Recently',
            'last_updated_formatted' => $this->updated_at ? $this->updated_at->format('M j, Y') : '',
            'thresholds' => [
                'stable' => (float) $this->threshold_stable_days,
                'needs_support' => (float) $this->threshold_needs_support_days,
                'urgent' => (float) $this->threshold_urgent_days,
                'critical' => (float) $this->threshold_critical_days,
            ],
        ];
    }
}
