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

class ShelterAnimal extends Model
{
    /** @use HasFactory<ShelterAnimalFactory> */
    use HasFactory;

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
}
