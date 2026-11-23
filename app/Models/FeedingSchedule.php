<?php

namespace App\Models;

use Database\Factories\FeedingScheduleFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FeedingSchedule extends Model
{
    /** @use HasFactory<FeedingScheduleFactory> */
    use HasFactory;

    public const string ExecutionScheduled = 'scheduled';

    public const string ExecutionInProgress = 'in_progress';

    public const string ExecutionCompleted = 'completed';

    public const array VOLUNTEER_ROLES = [
        'Recorder',
        'Food Carrier',
        'Feeder',
        'Route Lead',
    ];

    protected $guarded = [];

    protected $casts = [
        'volunteers' => 'integer',
        'strays' => 'integer',
        'total_food_distributed' => 'integer',
        'latitude' => 'float',
        'longitude' => 'float',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    /**
     * @return HasMany<AssignedTask, $this>
     */
    public function assignedTasks(): HasMany
    {
        return $this->hasMany(AssignedTask::class);
    }

    /**
     * @return HasMany<FeedingDistributionLog, $this>
     */
    public function distributionLogs(): HasMany
    {
        return $this->hasMany(FeedingDistributionLog::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function startedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'started_by_user_id');
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function completedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'completed_by_user_id');
    }
}
