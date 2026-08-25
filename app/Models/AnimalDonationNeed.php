<?php

namespace App\Models;

use Database\Factories\AnimalDonationNeedFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AnimalDonationNeed extends Model
{
    /** @use HasFactory<AnimalDonationNeedFactory> */
    use HasFactory;

    protected $guarded = [];

    /**
     * @return BelongsTo<ShelterAnimal, $this>
     */
    public function animal(): BelongsTo
    {
        return $this->belongsTo(ShelterAnimal::class, 'shelter_animal_id');
    }
}
