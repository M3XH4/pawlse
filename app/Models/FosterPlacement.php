<?php

namespace App\Models;

use Database\Factories\FosterPlacementFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class FosterPlacement extends Model
{
    /** @use HasFactory<FosterPlacementFactory> */
    use HasFactory, SoftDeletes;

    protected $guarded = [];

    protected $casts = [
        'start_date' => 'date',
        'expected_review_date' => 'date',
        'end_date' => 'date',
    ];

    /**
     * @return BelongsTo<ShelterAnimal, $this>
     */
    public function shelterAnimal(): BelongsTo
    {
        return $this->belongsTo(ShelterAnimal::class);
    }

    /**
     * @return BelongsTo<FosterParent, $this>
     */
    public function fosterParent(): BelongsTo
    {
        return $this->belongsTo(FosterParent::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function fosterParentUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'foster_parent_user_id');
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function assignedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_by');
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function transferredBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'transferred_by');
    }

    /**
     * @return BelongsTo<FosterPlacement, $this>
     */
    public function previousPlacement(): BelongsTo
    {
        return $this->belongsTo(FosterPlacement::class, 'previous_placement_id');
    }

    /**
     * @return HasMany<FosterPlacement, $this>
     */
    public function subsequentPlacements(): HasMany
    {
        return $this->hasMany(FosterPlacement::class, 'previous_placement_id');
    }

    /**
     * @return HasMany<FosterCareUpdate, $this>
     */
    public function careUpdates(): HasMany
    {
        return $this->hasMany(FosterCareUpdate::class);
    }

    /**
     * Scope a query to only include active placements.
     *
     * @param  Builder<$this>  $query
     * @return Builder<$this>
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', 'active');
    }

    public function isActive(): bool
    {
        return $this->status === 'active';
    }
}
