<?php

namespace App\Models;

use App\Enums\AdoptionApplicationStatus;
use Database\Factories\AdoptionApplicationFactory;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;

class AdoptionApplication extends Model
{
    /** @use HasFactory<AdoptionApplicationFactory> */
    use HasFactory, SoftDeletes;

    protected $guarded = [];

    protected $casts = [
        'status' => AdoptionApplicationStatus::class,
        'birth_date' => 'date',
        'adoption_source' => 'array',
        'adopted_before' => 'boolean',
        'is_renting' => 'boolean',
        'lives_with' => 'array',
        'has_allergies' => 'boolean',
        'family_support' => 'boolean',
        'current_pets' => 'boolean',
        'past_pets' => 'boolean',
        'preferred_date' => 'date',
        'can_visit_shelter' => 'boolean',
    ];

    /**
     * Normalize preferred_time attribute before persisting to database.
     *
     * @return Attribute<string|null, string|null>
     */
    protected function preferredTime(): Attribute
    {
        return Attribute::make(
            set: function ($value) {
                if (blank($value)) {
                    return null;
                }

                try {
                    return Carbon::parse($value)->format('H:i:s');
                } catch (\Throwable) {
                    return $value;
                }
            },
        );
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return BelongsTo<ShelterAnimal, $this>
     */
    public function shelterAnimal(): BelongsTo
    {
        return $this->belongsTo(ShelterAnimal::class);
    }

    /**
     * @return HasMany<AdoptionApplicationFile, $this>
     */
    public function files(): HasMany
    {
        return $this->hasMany(AdoptionApplicationFile::class);
    }

    /**
     * @return HasMany<PostAdoptionFollowUp, $this>
     */
    public function followUps(): HasMany
    {
        return $this->hasMany(PostAdoptionFollowUp::class)->orderByDesc('follow_up_date');
    }
}
