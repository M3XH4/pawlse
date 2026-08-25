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
}
