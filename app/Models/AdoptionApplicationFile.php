<?php

namespace App\Models;

use App\Enums\AdoptionDocumentKind;
use Database\Factories\AdoptionApplicationFileFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AdoptionApplicationFile extends Model
{
    /** @use HasFactory<AdoptionApplicationFileFactory> */
    use HasFactory;

    protected $guarded = [];

    protected $casts = [
        'kind' => AdoptionDocumentKind::class,
    ];

    /**
     * @return BelongsTo<AdoptionApplication, $this>
     */
    public function adoptionApplication(): BelongsTo
    {
        return $this->belongsTo(AdoptionApplication::class);
    }
}
