<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class PetReportPhoto extends Model
{
    protected $guarded = [];

    protected $appends = ['url'];

    /**
     * Get the publicly accessible URL for the photo.
     */
    public function getUrlAttribute(): string
    {
        if (empty($this->path)) {
            return '';
        }

        if (str_starts_with($this->path, 'http://') || str_starts_with($this->path, 'https://')) {
            return $this->path;
        }

        $cleanPath = ltrim(str_replace('/storage/', '', $this->path), '/');

        return Storage::disk('public')->url($cleanPath);
    }

    /**
     * Get the relative disk storage path without the /storage/ prefix.
     */
    public function getStoragePathAttribute(): string
    {
        return ltrim(str_replace('/storage/', '', (string) $this->path), '/');
    }

    /**
     * @return BelongsTo<PetReport, $this>
     */
    public function petReport(): BelongsTo
    {
        return $this->belongsTo(PetReport::class);
    }
}
