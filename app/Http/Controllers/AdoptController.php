<?php

namespace App\Http\Controllers;

use App\Enums\ShelterAnimalStatus;
use App\Models\ShelterAnimal;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdoptController extends Controller
{
    public function index(Request $request): Response
    {
        $pets = ShelterAnimal::query()
            ->with(['medicalRecords'])
            ->where('status', ShelterAnimalStatus::Available)
            ->latest('id')
            ->get()
            ->map(fn (ShelterAnimal $pet) => $this->transformPet($pet));

        return Inertia::render('adopt', [
            'pets' => $pets,
        ]);
    }

    public function show(ShelterAnimal $pet): Response
    {
        $pet->loadMissing(['medicalRecords']);

        return Inertia::render('adopt/show', [
            'pet' => $this->transformPet($pet),
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    protected function transformPet(ShelterAnimal $pet): array
    {
        return [
            'id' => $pet->id,
            'name' => $pet->name,
            'type' => $pet->type ? $pet->type->value : null,
            'breed' => $pet->breed,
            'age' => $pet->age,
            'ageCategory' => $pet->age_category ? ucfirst($pet->age_category->value) : null,
            'gender' => $pet->gender ? ucfirst($pet->gender->value) : null,
            'color' => $pet->color,
            'weight' => $pet->weight,
            'microchip_id' => $pet->microchip_id,
            'intake_type' => $pet->intake_type,
            'current_location' => $pet->computed_location,
            'rescue_date' => $pet->rescue_date?->format('Y-m-d'),
            'rescue_location' => $pet->rescue_location,
            'rescue_story' => $pet->rescue_story,
            'special_needs' => $pet->special_needs,
            'behavior' => $pet->behavior,
            'story' => $pet->story,
            'img' => $pet->photo_url,
            'mainImg' => $pet->photo_url,
            'vaccinated' => (bool) $pet->vaccinated,
            'shelterDays' => $pet->admitted_at ? (int) abs($pet->admitted_at->diffInDays(now())) : 0,
            'medical_records' => $pet->medicalRecords->map(fn ($rec) => [
                'id' => $rec->id,
                'record_type' => $rec->record_type,
                'title' => $rec->title,
                'performed_date' => $rec->performed_date?->format('Y-m-d'),
                'next_due_date' => $rec->next_due_date?->format('Y-m-d'),
                'veterinarian' => $rec->veterinarian,
                'batch_number' => $rec->batch_number,
                'status' => $rec->status,
                'notes' => $rec->notes,
            ]),
        ];
    }
}
