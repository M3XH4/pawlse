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

        $query = ShelterAnimal::query()
            ->with(['medicalRecords', 'activeFosterPlacement.fosterParent'])
            ->latest('id');

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $rawId = preg_replace('/[^0-9]/', '', $search);
                if (! empty($rawId)) {
                    $q->orWhere('id', (int) $rawId);
                }
                $q->orWhere('name', 'like', "%{$search}%")
                    ->orWhere('breed', 'like', "%{$search}%")
                    ->orWhere('color', 'like', "%{$search}%")
                    ->orWhere('current_location', 'like', "%{$search}%");
            });
        }

        if ($speciesFilter !== 'all') {
            $query->where('type', $speciesFilter);
        }

        if ($statusFilter !== 'all') {
            $query->where('status', $statusFilter);
        }

        $animals = $query->get()->map(fn (ShelterAnimal $animal) => AdoptController::transformPet($animal));

        $counts = [
            'all' => ShelterAnimal::count(),
            'available' => ShelterAnimal::where('status', ShelterAnimalStatus::Available)->count(),
            'treatment' => ShelterAnimal::where('status', ShelterAnimalStatus::Treatment)->count(),
            'foster' => ShelterAnimal::where('status', ShelterAnimalStatus::Foster)->count(),
            'quarantine' => ShelterAnimal::where('status', ShelterAnimalStatus::Quarantine)->count(),
            'adopted' => ShelterAnimal::where('status', ShelterAnimalStatus::Adopted)->count(),
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
