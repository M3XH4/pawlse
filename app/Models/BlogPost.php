<?php

namespace App\Models;

use Database\Factories\BlogPostFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class BlogPost extends Model
{
    /** @use HasFactory<BlogPostFactory> */
    use HasFactory, SoftDeletes;

    public const CATEGORIES = [
        'testimonial' => 'Testimonials',
        'adoption_success' => 'Adoption Success',
        'rescue_story' => 'Rescue Story',
        'announcement' => 'Announcement',
        'community_awareness' => 'Community Awareness',
        'advocacy_campaign' => 'Advocacy Campaign',
        'news_update' => 'News & Updates',
    ];

    public const STATUS_DRAFT = 'draft';

    public const STATUS_PENDING = 'pending';

    public const STATUS_PUBLISHED = 'published';

    public const STATUS_REJECTED = 'rejected';

    public const STATUS_ARCHIVED = 'archived';

    public const STATUSES = [
        self::STATUS_DRAFT => 'Draft',
        self::STATUS_PENDING => 'Pending Review',
        self::STATUS_PUBLISHED => 'Published',
        self::STATUS_REJECTED => 'Rejected',
        self::STATUS_ARCHIVED => 'Archived',
    ];

    protected $guarded = ['id'];

    protected $casts = [
        'tags' => 'array',
        'is_featured' => 'boolean',
        'published_at' => 'datetime',
        'reading_time_minutes' => 'integer',
        'rating' => 'integer',
        'reviewed_at' => 'datetime',
        'views_count' => 'integer',
        'shares_count' => 'integer',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function (BlogPost $post) {
            if (empty($post->slug)) {
                $baseSlug = Str::slug($post->title);
                $slug = $baseSlug;
                $counter = 1;
                while (static::where('slug', $slug)->exists()) {
                    $slug = $baseSlug.'-'.$counter;
                    $counter++;
                }
                $post->slug = $slug;
            }

            if (empty($post->reading_time_minutes) && ! empty($post->content)) {
                $wordCount = str_word_count(strip_tags($post->content));
                $post->reading_time_minutes = (int) max(1, ceil($wordCount / 200));
            }

            if ($post->status === 'published' && empty($post->published_at)) {
                $post->published_at = now();
            }
        });
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    /**
     * @return BelongsTo<ShelterAnimal, $this>
     */
    public function shelterAnimal(): BelongsTo
    {
        return $this->belongsTo(ShelterAnimal::class, 'shelter_animal_id');
    }

    /**
     * @return BelongsTo<AdoptionApplication, $this>
     */
    public function adoptionApplication(): BelongsTo
    {
        return $this->belongsTo(AdoptionApplication::class, 'adoption_application_id');
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    /**
     * @return HasMany<BlogPostReaction, $this>
     */
    public function reactions(): HasMany
    {
        return $this->hasMany(BlogPostReaction::class);
    }

    public function scopePublished(Builder $query): Builder
    {
        return $query->where('status', 'published')
            ->whereNotNull('published_at')
            ->where('published_at', '<=', now());
    }

    public function scopePending(Builder $query): Builder
    {
        return $query->where('status', self::STATUS_PENDING);
    }

    public function scopeRejected(Builder $query): Builder
    {
        return $query->where('status', self::STATUS_REJECTED);
    }

    public function scopeFeatured(Builder $query): Builder
    {
        return $query->where('is_featured', true);
    }

    public function scopeCategory(Builder $query, ?string $category): Builder
    {
        if (empty($category) || $category === 'all') {
            return $query;
        }

        return $query->where('category', $category);
    }

    /**
     * Get reaction counts aggregated by reaction type.
     *
     * @return array<string, int>
     */
    public function getReactionCountsAttribute(): array
    {
        $counts = $this->reactions()
            ->selectRaw('reaction_type, count(*) as count')
            ->groupBy('reaction_type')
            ->pluck('count', 'reaction_type')
            ->toArray();

        return [
            'heart' => (int) ($counts['heart'] ?? 0),
            'paws' => (int) ($counts['paws'] ?? 0),
            'celebrate' => (int) ($counts['celebrate'] ?? 0),
            'care' => (int) ($counts['care'] ?? 0),
            'total' => array_sum($counts),
        ];
    }
}
