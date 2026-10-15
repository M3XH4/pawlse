<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class CommunityHonor extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'category',
        'tier',
        'role_title',
        'description',
        'badges',
        'initials',
        'avatar_url',
        'is_featured',
        'is_public',
        'display_order',
    ];

    protected $casts = [
        'badges' => 'array',
        'is_featured' => 'boolean',
        'is_public' => 'boolean',
        'display_order' => 'integer',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function (CommunityHonor $honor) {
            if (empty($honor->initials) && ! empty($honor->name)) {
                $words = explode(' ', trim($honor->name));
                $initials = '';
                foreach ($words as $w) {
                    $initials .= mb_substr($w, 0, 1);
                    if (strlen($initials) >= 2) {
                        break;
                    }
                }
                $honor->initials = strtoupper($initials);
            }
        });
    }

    public function scopePublic(Builder $query): Builder
    {
        return $query->where('is_public', true);
    }

    public function scopeFeatured(Builder $query): Builder
    {
        return $query->where('is_featured', true);
    }
}
