<?php

namespace App\Http\Controllers\Admin;

use App\Enums\AnimalAgeCategory;
use App\Enums\AnimalGender;
use App\Enums\AnimalType;
use App\Enums\ShelterAnimalStatus;
use App\Http\Controllers\Controller;
use App\Models\ShelterAnimal;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class AdoptablePetController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'type' => ['required', 'string', 'in:cat,dog,other'],
            'breed' => ['required', 'string', 'max:255'],
            'age' => ['required', 'string', 'max:255'],
            'ageCategory' => ['required', 'string', 'in:puppy,kitten,young,adult,senior'],
            'gender' => ['required', 'string', 'in:male,female'],
            'color' => ['required', 'string', 'max:255'],
            'behavior' => ['required', 'string', 'max:255'],
            'story' => ['required', 'string', 'max:2000'],
            'vaccinated' => ['required', 'boolean'],
            'admittedAt' => ['required', 'date'],
            'photo' => ['nullable', 'file', 'image', 'max:8192'],
        ]);

        $photoUrl = null;
        if ($request->hasFile('photo')) {
            $path = $request->file('photo')->store('pet_photos', 'public');
            $photoUrl = Storage::url($path);
        }

        ShelterAnimal::create([
            'name' => $validated['name'],
            'type' => AnimalType::from($validated['type']),
            'breed' => $validated['breed'],
            'age' => $validated['age'],
            'age_category' => AnimalAgeCategory::from($validated['ageCategory']),
            'gender' => AnimalGender::from($validated['gender']),
            'color' => $validated['color'],
            'behavior' => $validated['behavior'],
            'story' => $validated['story'],
            'vaccinated' => $validated['vaccinated'],
            'admitted_at' => $validated['admittedAt'],
            'photo_url' => $photoUrl,
            'status' => ShelterAnimalStatus::Available,
        ]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'New shelter pet added successfully.',
        ]);

        return redirect()->route('account.admin.adoption-management');
    }
}
