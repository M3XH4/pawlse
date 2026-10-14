<?php

namespace App\Models;

use Database\Factories\FosterCareUpdateFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class FosterCareUpdate extends Model
{
    /** @use HasFactory<FosterCareUpdateFactory> */
    use HasFactory, SoftDeletes;

    protected $guarded = [];

    protected $casts = [
        'next_appointment_date' => 'date',
        'acknowledged_at' => 'datetime',
    ];

    /**
     * @return BelongsTo<FosterPlacement, $this>
     */
    public function placement(): BelongsTo
    {
        return $this->belongsTo(FosterPlacement::class, 'foster_placement_id');
    }

    /**
     * @return BelongsTo<ShelterAnimal, $this>
     */
    public function shelterAnimal(): BelongsTo
    {
        return $this->belongsTo(ShelterAnimal::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function acknowledgedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'acknowledged_by');
    }

    public function isEmergency(): bool
    {
        return $this->update_type === 'emergency' || in_array($this->urgency, ['high', 'critical'], true);
    }

    public function isAcknowledged(): bool
    {
        return $this->acknowledged_at !== null;
    }
}
