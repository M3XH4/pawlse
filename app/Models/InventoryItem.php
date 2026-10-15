<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class InventoryItem extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected $casts = [
        'quantity' => 'integer',
        'min_threshold' => 'integer',
        'has_expiry' => 'boolean',
        'daily_usage_rate' => 'float',
    ];

    /**
     * Estimated days of supply based on daily consumption rate.
     */
    public function getEstimatedDaysOfSupplyAttribute(): ?float
    {
        if ($this->daily_usage_rate && $this->daily_usage_rate > 0) {
            return round($this->quantity / $this->daily_usage_rate, 1);
        }

        return null;
    }

    /**
     * @return HasMany<InventoryBatch, $this>
     */
    public function batches(): HasMany
    {
        return $this->hasMany(InventoryBatch::class);
    }

    /**
     * @return HasMany<InventoryLog, $this>
     */
    public function logs(): HasMany
    {
        return $this->hasMany(InventoryLog::class);
    }
}
