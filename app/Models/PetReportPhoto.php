<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PetReportPhoto extends Model
{
    protected $guarded = [];

    /**
     * @return BelongsTo<PetReport, $this>
     */
    public function petReport(): BelongsTo
    {
        return $this->belongsTo(PetReport::class);
    }
}
