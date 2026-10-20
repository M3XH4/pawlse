<?php

namespace App\Models;

use App\Enums\AnimalAgeCategory;
use App\Enums\AnimalGender;
use App\Enums\AnimalType;
use App\Enums\ShelterAnimalStatus;
use Database\Factories\ShelterAnimalFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
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
        'gallery_photos' => 'array',
        'admitted_at' => 'date',
        'rescue_date' => 'date',
        'adoption_date' => 'date',
        'deceased_at' => 'date',
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

    /**
     * @return BelongsTo<PetReport, $this>
     */
    public function petReport(): BelongsTo
    {
        return $this->belongsTo(PetReport::class);
    }

    /**
     * @return HasMany<AnimalMedicalRecord, $this>
     */
    public function medicalRecords(): HasMany
    {
        return $this->hasMany(AnimalMedicalRecord::class)->latest('performed_date');
    }

    /**
     * @return HasMany<AnimalMedicalRecord, $this>
     */
    public function vaccinationRecords(): HasMany
    {
        return $this->hasMany(AnimalMedicalRecord::class)
            ->where('record_type', 'vaccination')
            ->latest('performed_date');
    }

    /**
     * @return HasMany<ShelterVisit, $this>
     */
    public function shelterVisits(): HasMany
    {
        return $this->hasMany(ShelterVisit::class);
    }

    /**
     * @return HasMany<PostAdoptionFollowUp, $this>
     */
    public function postAdoptionFollowUps(): HasMany
    {
        return $this->hasMany(PostAdoptionFollowUp::class)->latest('follow_up_date');
    }

    /**
     * Get computed current location for display.
     */
    public function getComputedLocationAttribute(): string
    {
        if ($this->status === ShelterAnimalStatus::Foster && $this->relationLoaded('activeFosterPlacement') && $this->activeFosterPlacement) {
            $parent = $this->activeFosterPlacement->fosterParent;
            if ($parent && ! empty($parent->location)) {
                return 'Foster Home ('.$parent->location.')';
            }
            if ($parent && $parent->relationLoaded('user') && $parent->user) {
                return 'Foster: '.$parent->user->name;
            }

            return 'Foster Care';
        }

        if (! empty($this->current_location)) {
            return $this->current_location;
        }

        if ($this->status === ShelterAnimalStatus::Adopted) {
            return ! empty($this->adopter_name) ? 'Adopted ('.$this->adopter_name.')' : 'Adopted Home';
        }

        if ($this->status === ShelterAnimalStatus::Deceased) {
            return 'Deceased (Shelter Memorial)';
        }

        return 'Main Shelter - Kennel Area';
    }

    /**
     * Get deduplicated array of all photos (primary photo_url + gallery_photos).
     *
     * @return array<int, string>
     */
    public function getAllPhotosAttribute(): array
    {
        $photos = [];

        if (! empty($this->photo_url)) {
            $photos[] = $this->photo_url;
        }

        if (is_array($this->gallery_photos)) {
            foreach ($this->gallery_photos as $photo) {
                if (is_string($photo) && trim($photo) !== '' && ! in_array($photo, $photos, true)) {
                    $photos[] = $photo;
                }
            }
        }

        return array_values($photos);
    }

    /**
     * Determine whether this animal was rescued and brought into shelter care.
     */
    public function getIsRescuedAttribute(): bool
    {
        $intake = strtolower((string) ($this->intake_type ?? 'rescue'));

        return in_array($intake, ['rescue', 'stray', 'street rescue', 'shelter intake'], true)
            || ! empty($this->rescue_date)
            || ! empty($this->rescue_location)
            || ! empty($this->rescue_story)
            || ! empty($this->pet_report_id);
    }

    /**
     * Human-readable rescue & shelter tag label.
     */
    public function getRescuedTagAttribute(): string
    {
        $statusVal = $this->status instanceof ShelterAnimalStatus
            ? $this->status->value
            : (string) $this->status;

        if ($statusVal === ShelterAnimalStatus::Adopted->value) {
            return 'Rescued • Adopted from Shelter';
        }

        if ($statusVal === ShelterAnimalStatus::Foster->value) {
            return 'Rescued • In Foster Care';
        }

        return 'Rescued • In Shelter Care';
    }
}
