<?php

namespace App\Http\Controllers;

use App\Enums\AdoptionApplicationStatus;
use App\Enums\ShelterAnimalStatus;
use App\Models\AdoptionApplication;
use App\Models\ShelterAnimal;
use App\Models\SystemSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdoptController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $appliedPetIds = $user
            ? AdoptionApplication::where(function ($q) use ($user) {
                $q->where('user_id', $user->id)
                    ->orWhereRaw('LOWER(email) = ?', [strtolower((string) $user->email)]);
            })
                ->whereIn('status', [
                    AdoptionApplicationStatus::Pending,
                    AdoptionApplicationStatus::Scheduled,
                    AdoptionApplicationStatus::Approved,
                ])
                ->pluck('shelter_animal_id')
                ->flip()
                ->all()
            : [];

        $pets = ShelterAnimal::query()
            ->with(['medicalRecords'])
            ->where('status', ShelterAnimalStatus::Available)
            ->latest('id')
            ->get()
            ->map(fn (ShelterAnimal $pet) => static::transformPet($pet, isset($appliedPetIds[$pet->id])));

        $shelterVisitSettings = SystemSetting::getValue('shelter_visit_settings', [
            'max_visitors_per_slot' => 10,
            'max_visitors_per_booking' => 10,
            'closed_days' => ['Sunday'],
            'blackout_dates' => [],
            'is_accepting_visits' => true,
        ]);

        return Inertia::render('adopt', [
            'pets' => $pets,
            'shelterVisitSettings' => $shelterVisitSettings,
        ]);
    }

    public function show(Request $request, ShelterAnimal $pet): Response
    {
        $user = $request->user();
        $hasApplied = $user ? AdoptionApplication::where('shelter_animal_id', $pet->id)
            ->where(function ($q) use ($user) {
                $q->where('user_id', $user->id)
                    ->orWhereRaw('LOWER(email) = ?', [strtolower((string) $user->email)]);
            })
            ->whereIn('status', [
                AdoptionApplicationStatus::Pending,
                AdoptionApplicationStatus::Scheduled,
                AdoptionApplicationStatus::Approved,
            ])
            ->exists() : false;

        $pet->loadMissing(['medicalRecords', 'fosterPlacements.fosterParent.user', 'postAdoptionFollowUps']);

        $shelterVisitSettings = SystemSetting::getValue('shelter_visit_settings', [
            'max_visitors_per_slot' => 10,
            'max_visitors_per_booking' => 10,
            'closed_days' => ['Sunday'],
            'blackout_dates' => [],
            'is_accepting_visits' => true,
        ]);

        return Inertia::render('adopt/show', [
            'pet' => static::transformPet($pet, $hasApplied),
            'shelterVisitSettings' => $shelterVisitSettings,
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    public static function transformPet(ShelterAnimal $pet, bool $hasApplied = false): array
    {
        $typeVal = strtolower($pet->type ? $pet->type->value : '');
        $codePrefix = match ($typeVal) {
            'dog' => 'PAW-D-',
            'cat' => 'PAW-C-',
            default => 'PAW-A-',
        };
        $code = $codePrefix.str_pad((string) $pet->id, 4, '0', STR_PAD_LEFT);

        $allPhotos = $pet->all_photos;
        $primaryImg = $pet->photo_url ?: ($allPhotos[0] ?? null);

        return [
            'id' => $pet->id,
            'has_applied' => $hasApplied,
            'code' => $code,
            'status' => $pet->status?->value ?? 'available',
            'status_label' => match ($pet->status) {
                ShelterAnimalStatus::Available => 'Available for Adoption',
                ShelterAnimalStatus::Pending => 'Adoption Pending',
                ShelterAnimalStatus::Adopted => 'Adopted',
                ShelterAnimalStatus::Foster => 'In Foster Care',
                ShelterAnimalStatus::Treatment => 'Under Treatment',
                ShelterAnimalStatus::Quarantine => 'In Quarantine',
                ShelterAnimalStatus::Deceased => 'Deceased',
                default => 'Available for Adoption',
            },
            'name' => $pet->name,
            'type' => $pet->type ? $pet->type->value : null,
            'breed' => $pet->breed,
            'age' => $pet->age,
            'ageCategory' => $pet->age_category ? ucfirst($pet->age_category->value) : null,
            'gender' => $pet->gender ? ucfirst($pet->gender->value) : null,
            'color' => $pet->color,
            'weight' => $pet->weight,
            'intake_type' => $pet->intake_type ?? 'rescue',
            'is_rescued' => $pet->is_rescued,
            'rescued_tag' => $pet->rescued_tag,
            'current_location' => $pet->computed_location,
            'admitted_at' => $pet->admitted_at?->format('Y-m-d'),
            'rescue_date' => $pet->rescue_date?->format('Y-m-d'),
            'rescue_location' => $pet->rescue_location,
            'rescue_story' => $pet->rescue_story,
            'adoption_date' => $pet->adoption_date?->format('Y-m-d'),
            'adopter_name' => $pet->adopter_name,
            'special_needs' => $pet->special_needs,
            'behavior' => $pet->behavior,
            'story' => $pet->story,
            'img' => $primaryImg,
            'mainImg' => $primaryImg,
            'photo_url' => $primaryImg,
            'photos' => $allPhotos,
            'gallery_photos' => $pet->gallery_photos ?? [],
            'before_photo_url' => $pet->before_photo_url,
            'after_photo_url' => $pet->after_photo_url,
            'beforeImg' => $pet->before_photo_url,
            'afterImg' => $pet->after_photo_url,
            'vaccinated' => (bool) $pet->vaccinated,
            'shelterDays' => $pet->admitted_at ? (int) abs($pet->admitted_at->diffInDays(now())) : 0,
            'medical_records' => $pet->relationLoaded('medicalRecords')
                ? $pet->medicalRecords->map(fn ($rec) => [
                    'id' => $rec->id,
                    'record_type' => $rec->record_type,
                    'title' => $rec->title,
                    'performed_date' => $rec->performed_date?->format('Y-m-d'),
                    'next_due_date' => $rec->next_due_date?->format('Y-m-d'),
                    'veterinarian' => $rec->veterinarian,
                    'batch_number' => $rec->batch_number,
                    'status' => $rec->status,
                    'notes' => $rec->notes,
                ])
                : [],
            'foster_placements' => $pet->relationLoaded('fosterPlacements')
                ? $pet->fosterPlacements->map(fn ($p) => [
                    'id' => $p->id,
                    'status' => $p->status,
                    'start_date' => $p->start_date?->format('Y-m-d'),
                    'end_date' => $p->end_date?->format('Y-m-d'),
                    'foster_parent_name' => $p->fosterParent?->user?->name ?? 'Foster Caretaker',
                    'placement_notes' => $p->placement_notes,
                ])
                : [],
            'follow_ups' => $pet->relationLoaded('postAdoptionFollowUps')
                ? $pet->postAdoptionFollowUps->map(fn ($f) => [
                    'id' => $f->id,
                    'follow_up_date' => $f->follow_up_date?->format('Y-m-d'),
                    'method' => $f->method,
                    'status' => $f->status,
                    'pet_condition' => $f->pet_condition,
                    'notes' => $f->notes,
                ])
                : [],
        ];
    }
}
