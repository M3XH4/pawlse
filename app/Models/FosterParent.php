<?php

namespace App\Models;

use Database\Factories\FosterParentFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class FosterParent extends Model
{
    /** @use HasFactory<FosterParentFactory> */
    use HasFactory, SoftDeletes;

    protected $guarded = [];

    protected $casts = [
        'capacity' => 'integer',
        'approved_at' => 'datetime',
    ];

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
    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /**
     * @return HasMany<FosterPlacement, $this>
     */
    public function placements(): HasMany
    {
        return $this->hasMany(FosterPlacement::class);
    }

    /**
     * @return HasMany<FosterPlacement, $this>
     */
    public function activePlacements(): HasMany
    {
        return $this->hasMany(FosterPlacement::class)->where('status', 'active');
    }

    public function isApproved(): bool
    {
        return $this->status === 'approved';
    }

    public function activePlacementsCount(): int
    {
        return $this->activePlacements()->count();
    }

    public function remainingCapacity(): int
    {
        return max(0, $this->capacity - $this->activePlacementsCount());
    }

    public function isAtCapacity(): bool
    {
        return $this->activePlacementsCount() >= $this->capacity;
    }
}
