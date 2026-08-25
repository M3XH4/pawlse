<?php

namespace App\Models;

use Database\Factories\FeedingScheduleFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FeedingSchedule extends Model
{
    /** @use HasFactory<FeedingScheduleFactory> */
    use HasFactory;

    protected $guarded = [];

    protected $casts = [
        'volunteers' => 'integer',
        'strays' => 'integer',
    ];

    /**
     * @return HasMany<AssignedTask, $this>
     */
    public function assignedTasks(): HasMany
    {
        return $this->hasMany(AssignedTask::class);
    }
}
