<?php

namespace App\Models;

use Database\Factories\FrequentProblemFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FrequentProblem extends Model
{
    /** @use HasFactory<FrequentProblemFactory> */
    use HasFactory;

    protected $fillable = [
        'title',
        'category',
        'problem_description',
        'solution',
        'target_audience',
        'is_published',
        'display_order',
        'helpful_count',
        'created_by_user_id',
    ];

    protected function casts(): array
    {
        return [
            'is_published' => 'boolean',
            'display_order' => 'integer',
            'helpful_count' => 'integer',
        ];
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_user_id');
    }

    public function scopePublished(Builder $query): Builder
    {
        return $query->where('is_published', true);
    }

    public function scopeForAudience(Builder $query, string $role): Builder
    {
        return $query->whereIn('target_audience', ['all', $role]);
    }
}
