<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Partner extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'slug',
        'category',
        'badge_title',
        'badges',
        'short_description',
        'description',
        'address',
        'city',
        'phone',
        'email',
        'website_url',
        'social_url',
        'operating_hours',
        'services',
        'image_url',
        'logo_url',
        'is_emergency',
        'is_featured',
        'is_active',
        'display_order',
    ];

    protected $casts = [
        'badges' => 'array',
        'services' => 'array',
        'is_emergency' => 'boolean',
        'is_featured' => 'boolean',
        'is_active' => 'boolean',
        'display_order' => 'integer',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function (Partner $partner) {
            if (empty($partner->slug)) {
                $partner->slug = Str::slug($partner->name).'-'.Str::random(5);
            }
        });
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    public function scopeVeterinary(Builder $query): Builder
    {
        return $query->where('category', 'veterinary');
    }

    public function scopeFoodSupply(Builder $query): Builder
    {
        return $query->where('category', 'food_supply');
    }

    public function scopeEmergency(Builder $query): Builder
    {
        return $query->where('is_emergency', true);
    }

    public function scopeFeatured(Builder $query): Builder
    {
        return $query->where('is_featured', true);
    }
}
