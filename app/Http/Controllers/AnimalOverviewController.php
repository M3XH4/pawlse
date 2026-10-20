<?php

namespace App\Http\Controllers;

use App\Enums\ShelterAnimalStatus;
use App\Models\ShelterAnimal;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AnimalOverviewController extends Controller
{
    /**
     * Display a public overview of all animals in the master record.
     */
    public function index(Request $request): Response
    {
        $statusFilter = (string) $request->input('status', 'all');
        $speciesFilter = (string) $request->input('species', 'all');
        $search = trim((string) $request->input('search', ''));

        $animals = ShelterAnimal::query()
            ->with(['medicalRecords', 'activeFosterPlacement.fosterParent'])
            ->latest('id')
            ->get()
            ->map(fn (ShelterAnimal $animal) => AdoptController::transformPet($animal));

        $rescuedInShelterCount = $animals->filter(function (array $pet) {
            return ($pet['is_rescued'] ?? true) === true
                && ! in_array($pet['status'] ?? 'available', ['adopted', 'deceased'], true);
        })->count();

        $counts = [
            'all' => $animals->count(),
            'rescued_shelter' => $rescuedInShelterCount,
            'available' => $animals->where('status', ShelterAnimalStatus::Available->value)->count(),
            'treatment' => $animals->where('status', ShelterAnimalStatus::Treatment->value)->count(),
            'foster' => $animals->where('status', ShelterAnimalStatus::Foster->value)->count(),
            'quarantine' => $animals->where('status', ShelterAnimalStatus::Quarantine->value)->count(),
            'adopted' => $animals->where('status', ShelterAnimalStatus::Adopted->value)->count(),
        ];

        return Inertia::render('animals/index', [
            'animals' => $animals,
            'counts' => $counts,
            'filters' => [
                'status' => $statusFilter,
                'species' => $speciesFilter,
                'search' => $search,
            ],
        ]);
    }
}
