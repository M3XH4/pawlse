<?php

namespace App\Models;

use Database\Factories\AssignedTaskFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AssignedTask extends Model
{
    /** @use HasFactory<AssignedTaskFactory> */
    use HasFactory;

    protected $guarded = [];

    protected $casts = [
        'hours_logged' => 'decimal:2',
    ];

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return BelongsTo<Event, $this>
     */
    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    /**
     * @return BelongsTo<FeedingSchedule, $this>
     */
    public function feedingSchedule(): BelongsTo
    {
        return $this->belongsTo(FeedingSchedule::class);
    }

    /**
     * @return BelongsTo<PetReport, $this>
     */
    public function petReport(): BelongsTo
    {
        return $this->belongsTo(PetReport::class);
    }

    /**
     * @return BelongsTo<PartnerFoodPickup, $this>
     */
    public function partnerFoodPickup(): BelongsTo
    {
        return $this->belongsTo(PartnerFoodPickup::class);
    }

    /**
     * Resolve automatic volunteer hours based on task type, role, or elapsed time.
     */
    public function resolveAutomaticHours(): float
    {
        if ((float) $this->hours_logged > 0) {
            return (float) $this->hours_logged;
        }

        if ($this->event_id !== null) {
            return strtolower((string) $this->role) === 'participant' ? 2.0 : 4.0;
        }

        if ($this->partner_food_pickup_id !== null) {
            return 1.0;
        }

        if ($this->feeding_schedule_id !== null) {
            return 1.5;
        }

        $minutes = $this->created_at ? $this->created_at->diffInMinutes(now()) : 60;

        return (float) max(0.5, min(8.0, round($minutes / 30) * 0.5));
    }
}
