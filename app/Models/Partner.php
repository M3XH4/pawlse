<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
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
        'latitude',
        'longitude',
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
        'provides_daily_food',
        'daily_food_notes',
        'is_active',
        'display_order',
    ];

    protected $casts = [
        'badges' => 'array',
        'services' => 'array',
        'is_emergency' => 'boolean',
        'is_featured' => 'boolean',
        'provides_daily_food' => 'boolean',
        'is_active' => 'boolean',
        'display_order' => 'integer',
        'latitude' => 'float',
        'longitude' => 'float',
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

    public function scopeDailyFood(Builder $query): Builder
    {
        return $query->where('category', 'food_supply')
            ->where('provides_daily_food', true);
    }

    /**
     * @return HasMany<PartnerFoodPickup, $this>
     */
    public function foodPickups(): HasMany
    {
        return $this->hasMany(PartnerFoodPickup::class);
    }
}
