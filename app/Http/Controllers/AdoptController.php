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
            ->where('status', ShelterAnimalStatus::Available)
            ->get()
            ->map(function (ShelterAnimal $pet) {
                return [
                    'id' => $pet->id,
                    'name' => $pet->name,
                    'type' => $pet->type ? $pet->type->value : null,
                    'breed' => $pet->breed,
                    'age' => $pet->age,
                    'ageCategory' => $pet->age_category ? ucfirst($pet->age_category->value) : null,
                    'gender' => $pet->gender ? ucfirst($pet->gender->value) : null,
                    'color' => $pet->color,
                    'behavior' => $pet->behavior,
                    'story' => $pet->story,
                    'img' => $pet->photo_url,
                    'mainImg' => $pet->photo_url,
                    'vaccinated' => (bool) $pet->vaccinated,
                    'shelterDays' => $pet->admitted_at ? (int) abs($pet->admitted_at->diffInDays(now())) : 0,
                ];
            });

        return Inertia::render('adopt', [
            'pets' => $pets,
        ]);
    }
}
