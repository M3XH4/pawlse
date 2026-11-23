<?php

namespace App\Models;

use Database\Factories\FeedingDistributionLogFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FeedingDistributionLog extends Model
{
    /** @use HasFactory<FeedingDistributionLogFactory> */
    use HasFactory;

    public const array FOOD_TYPES = [
        'Dry Kibble',
        'Wet Food',
        'Cooked Meal',
        'Water & Treats',
        'Mixed Packs',
    ];

    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'food_packs_distributed' => 'integer',
            'strays_fed' => 'integer',
            'recorded_at' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<FeedingSchedule, $this>
     */
    public function feedingSchedule(): BelongsTo
    {
        return $this->belongsTo(FeedingSchedule::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function recordedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recorded_by_user_id');
    }

    /**
     * @return BelongsTo<AssignedTask, $this>
     */
    public function assignedTask(): BelongsTo
    {
        return $this->belongsTo(AssignedTask::class);
    }
}
