<?php

namespace App\Http\Controllers\Admin;

use App\Enums\AnimalAgeCategory;
use App\Enums\AnimalGender;
use App\Enums\AnimalType;
use App\Enums\ShelterAnimalStatus;
use App\Http\Controllers\Controller;
use App\Models\AnimalDonationNeed;
use App\Models\AuditLog;
use App\Models\ShelterAnimal;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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
            'initial_needs' => ['nullable', 'array'],
            'initial_needs.*.item' => ['required_with:initial_needs', 'string', 'max:255'],
            'initial_needs.*.quantity' => ['required_with:initial_needs', 'string', 'max:255'],
            'initial_needs.*.priority' => ['required_with:initial_needs', 'string', 'in:Urgent,High,Medium,Low'],
        ]);

        $photoUrl = null;
        if ($request->hasFile('photo')) {
            $path = $request->file('photo')->store('pet_photos', 'public');
            $photoUrl = Storage::url($path);
        }

        DB::transaction(function () use ($validated, $photoUrl) {
            $pet = ShelterAnimal::create([
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

            if (! empty($validated['initial_needs'])) {
                foreach ($validated['initial_needs'] as $needData) {
                    if (! empty(trim($needData['item'] ?? ''))) {
                        AnimalDonationNeed::create([
                            'shelter_animal_id' => $pet->id,
                            'item' => $needData['item'],
                            'quantity' => $needData['quantity'] ?? '1 unit',
                            'priority' => $needData['priority'] ?? 'Medium',
                            'status' => 'open',
                        ]);
                    }
                }
            }

            AuditLog::log('pet_create', "Created adoptable pet '{$validated['name']}'");
        });

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'New shelter pet added successfully.',
        ]);

        return redirect()->route('account.admin.adoption-management');
    }

    public function storeNeed(Request $request, ShelterAnimal $pet): RedirectResponse
    {
        $validated = $request->validate([
            'item' => ['required', 'string', 'max:255'],
            'quantity' => ['required', 'string', 'max:255'],
            'priority' => ['required', 'string', 'in:Urgent,High,Medium,Low'],
            'status' => ['required', 'string', 'in:open,fulfilled'],
        ]);

        $need = AnimalDonationNeed::create([
            'shelter_animal_id' => $pet->id,
            'item' => $validated['item'],
            'quantity' => $validated['quantity'],
            'priority' => $validated['priority'],
            'status' => $validated['status'],
        ]);

        AuditLog::log('pet_need_create', "Added wishlist need '{$need->item}' for pet '{$pet->name}'");

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => "Wishlist item '{$need->item}' added for {$pet->name}.",
        ]);

        return redirect()->back();
    }

    public function updateNeed(Request $request, AnimalDonationNeed $need): RedirectResponse
    {
        $validated = $request->validate([
            'item' => ['required', 'string', 'max:255'],
            'quantity' => ['required', 'string', 'max:255'],
            'priority' => ['required', 'string', 'in:Urgent,High,Medium,Low'],
            'status' => ['required', 'string', 'in:open,fulfilled'],
        ]);

        $need->update($validated);

        $animalName = $need->animal ? $need->animal->name : 'pet';
        AuditLog::log('pet_need_update', "Updated wishlist need '{$need->item}' for pet '{$animalName}'");

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Wishlist item updated.',
        ]);

        return redirect()->back();
    }

    public function destroyNeed(AnimalDonationNeed $need): RedirectResponse
    {
        $itemName = $need->item;
        $animalName = $need->animal ? $need->animal->name : 'pet';
        $need->delete();

        AuditLog::log('pet_need_delete', "Deleted wishlist need '{$itemName}' for pet '{$animalName}'");

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => "Wishlist item '{$itemName}' removed.",
        ]);

        return redirect()->back();
    }
}
