<?php

namespace App\Models;

use Database\Factories\PartnerFoodPickupFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PartnerFoodPickup extends Model
{
    /** @use HasFactory<PartnerFoodPickupFactory> */
    use HasFactory;

    public const string StatusPending = 'pending';

    public const string StatusAssigned = 'assigned';

    public const string StatusFetched = 'fetched';

    public const string StatusCompleted = 'completed';

    public const string StatusMissed = 'missed';

    protected $guarded = [];

    protected $casts = [
        'pickup_date' => 'date:Y-m-d',
        'fetched_at' => 'datetime',
        'completed_at' => 'datetime',
        'missed_at' => 'datetime',
    ];

    /**
     * @return BelongsTo<Partner, $this>
     */
    public function partner(): BelongsTo
    {
        return $this->belongsTo(Partner::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function assignedVolunteer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_volunteer_id');
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function assignedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_by');
    }

    /**
     * @return HasMany<AssignedTask, $this>
     */
    public function assignedTasks(): HasMany
    {
        return $this->hasMany(AssignedTask::class);
    }
}
