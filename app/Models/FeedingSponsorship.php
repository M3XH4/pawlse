<?php

namespace App\Models;

use Database\Factories\FeedingSponsorshipFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FeedingSponsorship extends Model
{
    /** @use HasFactory<FeedingSponsorshipFactory> */
    use HasFactory;

    protected $guarded = [];

    /**
     * @return BelongsTo<Donation, $this>
     */
    public function donation(): BelongsTo
    {
        return $this->belongsTo(Donation::class);
    }
}
