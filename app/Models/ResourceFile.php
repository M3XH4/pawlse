<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class ResourceFile extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'title',
        'slug',
        'category',
        'badge',
        'description',
        'content',
        'file_path',
        'file_name',
        'file_size',
        'file_type',
        'external_url',
        'image_url',
        'download_count',
        'is_featured',
        'is_active',
        'display_order',
    ];

    protected $casts = [
        'download_count' => 'integer',
        'is_featured' => 'boolean',
        'is_active' => 'boolean',
        'display_order' => 'integer',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function (ResourceFile $file) {
            if (empty($file->slug)) {
                $file->slug = Str::slug($file->title).'-'.Str::random(5);
            }
        });
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    public function scopeFeatured(Builder $query): Builder
    {
        return $query->where('is_featured', true);
    }

    public function incrementDownloads(): void
    {
        $this->increment('download_count');
    }
}
