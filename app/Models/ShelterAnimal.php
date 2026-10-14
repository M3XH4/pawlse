<?php

namespace App\Models;

use App\Enums\AnimalAgeCategory;
use App\Enums\AnimalGender;
use App\Enums\AnimalType;
use App\Enums\ShelterAnimalStatus;
use Database\Factories\ShelterAnimalFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class ShelterAnimal extends Model
{
    /** @use HasFactory<ShelterAnimalFactory> */
    use HasFactory, SoftDeletes;

    protected $guarded = [];

    protected $casts = [
        'type' => AnimalType::class,
        'age_category' => AnimalAgeCategory::class,
        'gender' => AnimalGender::class,
        'status' => ShelterAnimalStatus::class,
        'vaccinated' => 'boolean',
        'admitted_at' => 'date',
    ];

    /**
     * @return HasMany<AdoptionApplication, $this>
     */
    public function adoptionApplications(): HasMany
    {
        return $this->hasMany(AdoptionApplication::class);
    }

    /**
     * @return HasMany<AnimalDonationNeed, $this>
     */
    public function needs(): HasMany
    {
        return $this->hasMany(AnimalDonationNeed::class);
    }

    /**
     * @return HasMany<FosterPlacement, $this>
     */
    public function fosterPlacements(): HasMany
    {
        return $this->hasMany(FosterPlacement::class);
    }

    /**
     * @return HasOne<FosterPlacement, $this>
     */
    public function activeFosterPlacement(): HasOne
    {
        return $this->hasOne(FosterPlacement::class)->where('status', 'active');
    }

    /**
     * @return HasMany<FosterCareUpdate, $this>
     */
    public function fosterCareUpdates(): HasMany
    {
        return $this->hasMany(FosterCareUpdate::class);
    }
}
