<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class InventoryItem extends Model
{
    use HasFactory;

    protected $guarded = [];

    /**
     * @return HasMany<InventoryLog, $this>
     */
    public function logs(): HasMany
    {
        return $this->hasMany(InventoryLog::class);
    }
}
