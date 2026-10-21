<?php

namespace App\Models;

use Database\Factories\FeedingSponsorshipFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class FeedingSponsorship extends Model
{
    /** @use HasFactory<FeedingSponsorshipFactory> */
    use HasFactory;

    protected $guarded = [];

    /**
     * @var array<int, string>
     */
    protected $appends = ['poster_url'];

    /**
     * @return BelongsTo<Donation, $this>
     */
    public function donation(): BelongsTo
    {
        return $this->belongsTo(Donation::class);
    }

    public function getPosterUrlAttribute(): ?string
    {
        if (! $this->poster_image) {
            return null;
        }

        if (str_starts_with($this->poster_image, 'http://') || str_starts_with($this->poster_image, 'https://')) {
            return $this->poster_image;
        }

        return Storage::url($this->poster_image);
    }
}
