<?php

namespace App\Http\Controllers\Admin;

use App\Enums\AdoptionApplicationStatus;
use App\Enums\AnimalAgeCategory;
use App\Enums\AnimalGender;
use App\Enums\AnimalType;
use App\Enums\ShelterAnimalStatus;
use App\Http\Controllers\Controller;
use App\Models\AnimalMedicalRecord;
use App\Models\AuditLog;
use App\Models\ShelterAnimal;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class AnimalMasterRecordController extends Controller
{
    /**
     * Display a paginated master listing of all animals with stats, filters, and full detail records.
     */
    public function index(Request $request): Response
    {
        $search = trim((string) $request->input('search', ''));
        $speciesFilter = (string) $request->input('species', 'all');
        $statusFilter = (string) $request->input('status', 'all');
        $genderFilter = (string) $request->input('gender', 'all');
        $locationFilter = trim((string) $request->input('location', 'all'));
        $vaccinatedFilter = (string) $request->input('vaccinated', 'all');
        $sortBy = (string) $request->input('sort', 'latest');
        $perPage = (int) $request->input('per_page', 12);
        if ($perPage < 5 || $perPage > 100) {
            $perPage = 12;
        }

        // Query builder for filtering
        $query = ShelterAnimal::with([
            'activeFosterPlacement.fosterParent.user',
            'adoptionApplications.user',
            'medicalRecords',
            'petReport.photos',
        ]);

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $rawId = preg_replace('/[^0-9]/', '', $search);
                if (! empty($rawId)) {
                    $q->orWhere('id', (int) $rawId);
                }

                $q->orWhere('name', 'like', "%{$search}%")
                    ->orWhere('breed', 'like', "%{$search}%")
                    ->orWhere('color', 'like', "%{$search}%")
                    ->orWhere('current_location', 'like', "%{$search}%")
                    ->orWhere('adopter_name', 'like', "%{$search}%")
                    ->orWhere('rescue_location', 'like', "%{$search}%");
            });
        }

        if ($speciesFilter !== 'all' && in_array($speciesFilter, AnimalType::values(), true)) {
            $query->where('type', $speciesFilter);
        }

        if ($statusFilter !== 'all' && in_array($statusFilter, ShelterAnimalStatus::values(), true)) {
            $query->where('status', $statusFilter);
        }

        if ($genderFilter !== 'all' && in_array($genderFilter, AnimalGender::values(), true)) {
            $query->where('gender', $genderFilter);
        }

        if ($vaccinatedFilter === 'yes') {
            $query->where('vaccinated', true);
        } elseif ($vaccinatedFilter === 'no') {
            $query->where('vaccinated', false);
        }

        if ($locationFilter !== 'all' && $locationFilter !== '') {
            if ($locationFilter === 'foster') {
                $query->where('status', ShelterAnimalStatus::Foster);
            } elseif ($locationFilter === 'shelter') {
                $query->where('status', '!=', ShelterAnimalStatus::Foster)
                    ->where(function ($q) {
                        $q->whereNull('current_location')
                            ->orWhere('current_location', 'like', '%shelter%')
                            ->orWhere('current_location', 'like', '%kennel%')
                            ->orWhere('current_location', 'like', '%cattery%');
                    });
            } else {
                $query->where('current_location', 'like', "%{$locationFilter}%");
            }
        }

        // Sorting
        match ($sortBy) {
            'oldest' => $query->oldest('id'),
            'name_asc' => $query->orderBy('name', 'asc'),
            'name_desc' => $query->orderBy('name', 'desc'),
            'id_asc' => $query->orderBy('id', 'asc'),
            'id_desc' => $query->orderBy('id', 'desc'),
            default => $query->latest('id'),
        };

        $animalsPaginator = $query->paginate($perPage)->withQueryString();

        // Calculate Status Bar metrics across all records in database
        $totalCount = ShelterAnimal::count();
        $statusCounts = ShelterAnimal::select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        $speciesCounts = ShelterAnimal::select('type', DB::raw('count(*) as count'))
            ->groupBy('type')
            ->pluck('count', 'type')
            ->toArray();

        $vaccinatedCount = ShelterAnimal::where('vaccinated', true)->count();
        $vaccinationRate = $totalCount > 0 ? (int) round(($vaccinatedCount / $totalCount) * 100) : 0;

        $statusBar = [
            'total' => $totalCount,
            'available' => (int) ($statusCounts[ShelterAnimalStatus::Available->value] ?? 0),
            'foster' => (int) ($statusCounts[ShelterAnimalStatus::Foster->value] ?? 0),
            'pending' => (int) ($statusCounts[ShelterAnimalStatus::Pending->value] ?? 0),
            'adopted' => (int) ($statusCounts[ShelterAnimalStatus::Adopted->value] ?? 0),
            'treatment' => (int) ($statusCounts[ShelterAnimalStatus::Treatment->value] ?? 0),
            'quarantine' => (int) ($statusCounts[ShelterAnimalStatus::Quarantine->value] ?? 0),
            'deceased' => (int) ($statusCounts[ShelterAnimalStatus::Deceased->value] ?? 0),
            'vaccinated_count' => $vaccinatedCount,
            'vaccination_rate' => $vaccinationRate,
            'dogs' => (int) ($speciesCounts['dog'] ?? 0),
            'cats' => (int) ($speciesCounts['cat'] ?? 0),
            'others' => (int) ($speciesCounts['other'] ?? 0),
        ];

        // Format paginated animals for frontend
        $transformedAnimals = $animalsPaginator->through(function (ShelterAnimal $animal) {
            $activePlacement = $animal->activeFosterPlacement;
            $fosterParentUser = $activePlacement?->fosterParent?->user;
            $fosterParentLocation = $activePlacement?->fosterParent?->location;

            $statusValue = $animal->status instanceof ShelterAnimalStatus
                ? $animal->status->value
                : (string) $animal->status;

            $typeValue = $animal->type instanceof AnimalType
                ? $animal->type->value
                : (string) $animal->type;

            $genderValue = $animal->gender instanceof AnimalGender
                ? $animal->gender->value
                : (string) $animal->gender;

            $ageCategoryValue = $animal->age_category instanceof AnimalAgeCategory
                ? $animal->age_category->value
                : (string) $animal->age_category;

            $shelterDays = $animal->admitted_at ? (int) $animal->admitted_at->diffInDays(now()) : 0;

            // Compute human readable current location
            $computedLocation = $animal->computed_location;

            // Medical records transformed
            $medicalRecords = $animal->medicalRecords->map(function (AnimalMedicalRecord $m) {
                return [
                    'id' => $m->id,
                    'record_type' => $m->record_type,
                    'title' => $m->title,
                    'performed_date' => $m->performed_date ? $m->performed_date->format('Y-m-d') : null,
                    'next_due_date' => $m->next_due_date ? $m->next_due_date->format('Y-m-d') : null,
                    'veterinarian' => $m->veterinarian,
                    'batch_number' => $m->batch_number,
                    'dosage' => $m->dosage,
                    'severity' => $m->severity,
                    'treatment_plan' => $m->treatment_plan,
                    'status' => $m->status,
                    'notes' => $m->notes,
                    'created_at' => $m->created_at?->format('Y-m-d H:i'),
                ];
            });

            $vaccinationRecords = $medicalRecords->where('record_type', 'vaccination')->values();
            $injuryAndDiseaseRecords = $medicalRecords->whereIn('record_type', ['injury', 'disease'])->values();
            $otherMedicalRecords = $medicalRecords->whereNotIn('record_type', ['vaccination', 'injury', 'disease'])->values();
            $activeConditions = $injuryAndDiseaseRecords->filter(fn ($r) => in_array($r['status'], ['active', 'under_treatment', 'scheduled', 'overdue', 'chronic'], true))->values();

            // Adoption applications
            $adoptionApps = $animal->adoptionApplications->map(function ($app) {
                return [
                    'id' => $app->id,
                    'status' => $app->status instanceof AdoptionApplicationStatus ? $app->status->value : (string) $app->status,
                    'applicant_name' => $app->full_name ?? $app->user?->name ?? 'Applicant',
                    'applicant_email' => $app->email ?? $app->user?->email,
                    'applicant_phone' => $app->phone,
                    'created_at' => $app->created_at?->format('M d, Y'),
                ];
            });

            return [
                'id' => $animal->id,
                'code' => '#ANM-'.str_pad((string) $animal->id, 4, '0', STR_PAD_LEFT),
                'name' => $animal->name,
                'type' => $typeValue,
                'species' => ucfirst($typeValue),
                'breed' => $animal->breed ?? 'Mixed Breed',
                'age' => $animal->age ?? 'Unknown',
                'age_category' => $ageCategoryValue,
                'gender' => $genderValue,
                'color' => $animal->color,
                'weight' => $animal->weight,
                'status' => $statusValue,
                'status_label' => ucfirst(str_replace('_', ' ', $statusValue)),
                'current_location' => $computedLocation,
                'raw_location' => $animal->current_location,
                'photo_url' => $animal->photo_url,
                'before_photo_url' => $animal->before_photo_url,
                'after_photo_url' => $animal->after_photo_url,
                'vaccinated' => (bool) $animal->vaccinated,
                'has_active_condition' => $activeConditions->isNotEmpty(),
                'active_condition_title' => $activeConditions->first()['title'] ?? null,
                'active_condition_type' => $activeConditions->first()['record_type'] ?? null,
                'active_condition_severity' => $activeConditions->first()['severity'] ?? null,
                'behavior' => $animal->behavior,
                'special_needs' => $animal->special_needs,
                'story' => $animal->story,
                'intake_type' => $animal->intake_type ?? 'Shelter Intake',
                'admitted_at' => $animal->admitted_at?->format('Y-m-d'),
                'admitted_at_human' => $animal->admitted_at?->format('M d, Y'),
                'shelter_days' => $shelterDays,

                // Foster section data
                'foster' => [
                    'is_active' => $statusValue === ShelterAnimalStatus::Foster->value && $activePlacement !== null,
                    'parent_name' => $fosterParentUser?->name,
                    'parent_email' => $fosterParentUser?->email,
                    'location' => $fosterParentLocation,
                    'start_date' => $activePlacement?->start_date?->format('M d, Y'),
                    'care_instructions' => $activePlacement?->care_instructions,
                ],

                // Medical and vaccination section data
                'medical_history' => [
                    'is_vaccinated' => (bool) $animal->vaccinated,
                    'total_records_count' => $medicalRecords->count(),
                    'vaccines_count' => $vaccinationRecords->count(),
                    'conditions_count' => $injuryAndDiseaseRecords->count(),
                    'active_conditions_count' => $activeConditions->count(),
                    'other_records_count' => $otherMedicalRecords->count(),
                    'vaccinations' => $vaccinationRecords,
                    'conditions' => $injuryAndDiseaseRecords,
                    'active_conditions' => $activeConditions,
                    'treatments' => $otherMedicalRecords,
                    'all_records' => $medicalRecords,
                    'next_due' => $medicalRecords->whereNotNull('next_due_date')->sortBy('next_due_date')->first(),
                ],

                // Adoption section data
                'adoption' => [
                    'is_adopted' => $statusValue === ShelterAnimalStatus::Adopted->value,
                    'adoption_date' => $animal->adoption_date?->format('Y-m-d'),
                    'adoption_date_human' => $animal->adoption_date?->format('M d, Y'),
                    'adopter_name' => $animal->adopter_name,
                    'adopter_phone' => $animal->adopter_phone,
                    'adopter_email' => $animal->adopter_email,
                    'adoption_notes' => $animal->adoption_notes,
                    'applications' => $adoptionApps,
                    'applications_count' => $adoptionApps->count(),
                ],

                // Rescue section data
                'rescue' => [
                    'rescue_date' => $animal->rescue_date?->format('Y-m-d'),
                    'rescue_date_human' => $animal->rescue_date?->format('M d, Y'),
                    'rescue_location' => $animal->rescue_location,
                    'rescue_story' => $animal->rescue_story ?: $animal->story,
                    'before_photo_url' => $animal->before_photo_url,
                    'after_photo_url' => $animal->after_photo_url,
                    'pet_report' => $animal->petReport ? [
                        'id' => $animal->petReport->id,
                        'tracking_code' => $animal->petReport->tracking_code,
                        'incident_type' => $animal->petReport->type,
                        'status' => $animal->petReport->status,
                        'location' => $animal->petReport->address,
                        'description' => $animal->petReport->description,
                        'created_at' => $animal->petReport->created_at?->format('M d, Y'),
                    ] : null,
                ],

                // Deceased section data
                'deceased' => [
                    'is_deceased' => $statusValue === ShelterAnimalStatus::Deceased->value,
                    'deceased_at' => $animal->deceased_at?->format('Y-m-d'),
                    'deceased_at_human' => $animal->deceased_at?->format('M d, Y'),
                    'deceased_notes' => $animal->deceased_notes,
                ],
            ];
        });

        // Common locations list for filter dropdown
        $locationsList = ShelterAnimal::whereNotNull('current_location')
            ->where('current_location', '!=', '')
            ->distinct()
            ->pluck('current_location')
            ->values()
            ->all();

        return Inertia::render('admin/animal-records', [
            'animals' => $transformedAnimals,
            'statusBar' => $statusBar,
            'filters' => [
                'search' => $search,
                'species' => $speciesFilter,
                'status' => $statusFilter,
                'gender' => $genderFilter,
                'location' => $locationFilter,
                'vaccinated' => $vaccinatedFilter,
                'sort' => $sortBy,
                'per_page' => $perPage,
            ],
            'locationsList' => $locationsList,
        ]);
    }

    /**
     * Store a newly created animal record.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'type' => ['required', 'string', 'in:cat,dog,other'],
            'breed' => ['required', 'string', 'max:255'],
            'age' => ['required', 'string', 'max:255'],
            'ageCategory' => ['required', 'string', 'in:puppy,kitten,young,adult,senior'],
            'gender' => ['required', 'string', 'in:male,female'],
            'color' => ['nullable', 'string', 'max:255'],
            'weight' => ['nullable', 'string', 'max:100'],
            'current_location' => ['nullable', 'string', 'max:255'],
            'status' => ['required', 'string', 'in:available,foster,pending,adopted,treatment,quarantine,deceased'],
            'behavior' => ['nullable', 'string', 'max:1000'],
            'special_needs' => ['nullable', 'string', 'max:2000'],
            'story' => ['nullable', 'string', 'max:3000'],
            'vaccinated' => ['boolean'],
            'admittedAt' => ['required', 'date'],
            'intake_type' => ['nullable', 'string', 'max:100'],
            'rescue_date' => ['nullable', 'date'],
            'rescue_location' => ['nullable', 'string', 'max:255'],
            'rescue_story' => ['nullable', 'string', 'max:3000'],
            'adoption_date' => ['nullable', 'date'],
            'adopter_name' => ['nullable', 'string', 'max:255'],
            'adopter_phone' => ['nullable', 'string', 'max:50'],
            'adopter_email' => ['nullable', 'email', 'max:255'],
            'adoption_notes' => ['nullable', 'string', 'max:2000'],
            'deceased_at' => ['nullable', 'date'],
            'deceased_notes' => ['nullable', 'string', 'max:2000'],
            'photo' => ['nullable', 'file', 'image', 'max:8192'],
            'before_photo' => ['nullable', 'file', 'image', 'max:8192'],
            'after_photo' => ['nullable', 'file', 'image', 'max:8192'],
            'before_photo_url' => ['nullable', 'string', 'max:1000'],
            'after_photo_url' => ['nullable', 'string', 'max:1000'],
        ]);

        $photoUrl = null;
        if ($request->hasFile('photo')) {
            $path = $request->file('photo')->store('pet_photos', 'public');
            $photoUrl = Storage::url($path);
        }

        $beforePhotoUrl = $validated['before_photo_url'] ?? null;
        if ($request->hasFile('before_photo')) {
            $path = $request->file('before_photo')->store('pet_photos', 'public');
            $beforePhotoUrl = Storage::url($path);
        }

        $afterPhotoUrl = $validated['after_photo_url'] ?? null;
        if ($request->hasFile('after_photo')) {
            $path = $request->file('after_photo')->store('pet_photos', 'public');
            $afterPhotoUrl = Storage::url($path);
        }

        $animal = DB::transaction(function () use ($validated, $photoUrl, $beforePhotoUrl, $afterPhotoUrl) {
            $status = ShelterAnimalStatus::from($validated['status']);

            $animal = ShelterAnimal::create([
                'name' => $validated['name'],
                'type' => AnimalType::from($validated['type']),
                'breed' => $validated['breed'],
                'age' => $validated['age'],
                'age_category' => AnimalAgeCategory::from($validated['ageCategory']),
                'gender' => AnimalGender::from($validated['gender']),
                'color' => $validated['color'] ?? 'Unknown',
                'weight' => $validated['weight'] ?? null,
                'current_location' => $validated['current_location'] ?? 'Main Shelter - Kennel Area',
                'status' => $status,
                'behavior' => $validated['behavior'] ?? 'Friendly and playful',
                'special_needs' => $validated['special_needs'] ?? null,
                'story' => $validated['story'] ?? ($validated['rescue_story'] ?? 'Rescued and waiting for a loving forever home.'),
                'vaccinated' => $validated['vaccinated'] ?? false,
                'admitted_at' => $validated['admittedAt'],
                'intake_type' => $validated['intake_type'] ?? 'rescue',
                'rescue_date' => $validated['rescue_date'] ?? null,
                'rescue_location' => $validated['rescue_location'] ?? null,
                'rescue_story' => $validated['rescue_story'] ?? null,
                'adoption_date' => $status === ShelterAnimalStatus::Adopted ? ($validated['adoption_date'] ?? now()->toDateString()) : ($validated['adoption_date'] ?? null),
                'adopter_name' => $validated['adopter_name'] ?? null,
                'adopter_phone' => $validated['adopter_phone'] ?? null,
                'adopter_email' => $validated['adopter_email'] ?? null,
                'adoption_notes' => $validated['adoption_notes'] ?? null,
                'deceased_at' => $status === ShelterAnimalStatus::Deceased ? ($validated['deceased_at'] ?? now()->toDateString()) : ($validated['deceased_at'] ?? null),
                'deceased_notes' => $validated['deceased_notes'] ?? null,
                'photo_url' => $photoUrl,
                'before_photo_url' => $beforePhotoUrl,
                'after_photo_url' => $afterPhotoUrl,
            ]);

            AuditLog::log('animal_master_record_create', "Created animal master record for '{$animal->name}' (#ANM-{$animal->id})", [
                'animal_id' => $animal->id,
                'name' => $animal->name,
                'status' => $animal->status->value,
            ]);

            return $animal;
        });

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => "Animal record for '{$animal->name}' created successfully.",
        ]);

        return redirect()->back();
    }

    /**
     * Update an animal master record.
     */
    public function update(Request $request, ShelterAnimal $animal): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'type' => ['required', 'string', 'in:cat,dog,other'],
            'breed' => ['required', 'string', 'max:255'],
            'age' => ['required', 'string', 'max:255'],
            'ageCategory' => ['required', 'string', 'in:puppy,kitten,young,adult,senior'],
            'gender' => ['required', 'string', 'in:male,female'],
            'color' => ['nullable', 'string', 'max:255'],
            'weight' => ['nullable', 'string', 'max:100'],
            'current_location' => ['nullable', 'string', 'max:255'],
            'status' => ['required', 'string', 'in:available,foster,pending,adopted,treatment,quarantine,deceased'],
            'behavior' => ['nullable', 'string', 'max:1000'],
            'special_needs' => ['nullable', 'string', 'max:2000'],
            'story' => ['nullable', 'string', 'max:3000'],
            'vaccinated' => ['boolean'],
            'admittedAt' => ['required', 'date'],
            'intake_type' => ['nullable', 'string', 'max:100'],
            'rescue_date' => ['nullable', 'date'],
            'rescue_location' => ['nullable', 'string', 'max:255'],
            'rescue_story' => ['nullable', 'string', 'max:3000'],
            'adoption_date' => ['nullable', 'date'],
            'adopter_name' => ['nullable', 'string', 'max:255'],
            'adopter_phone' => ['nullable', 'string', 'max:50'],
            'adopter_email' => ['nullable', 'email', 'max:255'],
            'adoption_notes' => ['nullable', 'string', 'max:2000'],
            'deceased_at' => ['nullable', 'date'],
            'deceased_notes' => ['nullable', 'string', 'max:2000'],
            'photo' => ['nullable', 'file', 'image', 'max:8192'],
            'before_photo' => ['nullable', 'file', 'image', 'max:8192'],
            'after_photo' => ['nullable', 'file', 'image', 'max:8192'],
            'before_photo_url' => ['nullable', 'string', 'max:1000'],
            'after_photo_url' => ['nullable', 'string', 'max:1000'],
        ]);

        $photoUrl = $animal->photo_url;
        if ($request->hasFile('photo')) {
            $path = $request->file('photo')->store('pet_photos', 'public');
            $photoUrl = Storage::url($path);
        }

        $beforePhotoUrl = $animal->before_photo_url;
        if ($request->hasFile('before_photo')) {
            $path = $request->file('before_photo')->store('pet_photos', 'public');
            $beforePhotoUrl = Storage::url($path);
        } elseif ($request->filled('before_photo_url')) {
            $beforePhotoUrl = $request->input('before_photo_url');
        }

        $afterPhotoUrl = $animal->after_photo_url;
        if ($request->hasFile('after_photo')) {
            $path = $request->file('after_photo')->store('pet_photos', 'public');
            $afterPhotoUrl = Storage::url($path);
        } elseif ($request->filled('after_photo_url')) {
            $afterPhotoUrl = $request->input('after_photo_url');
        }

        $newStatus = ShelterAnimalStatus::from($validated['status']);

        // Handle auto-dating for adopted or deceased if not explicitly specified
        $adoptionDate = $validated['adoption_date'] ?? null;
        if ($newStatus === ShelterAnimalStatus::Adopted && empty($adoptionDate)) {
            $adoptionDate = $animal->adoption_date ?: now()->toDateString();
        }

        $deceasedDate = $validated['deceased_at'] ?? null;
        if ($newStatus === ShelterAnimalStatus::Deceased && empty($deceasedDate)) {
            $deceasedDate = $animal->deceased_at ?: now()->toDateString();
        }

        $animal->update([
            'name' => $validated['name'],
            'type' => AnimalType::from($validated['type']),
            'breed' => $validated['breed'],
            'age' => $validated['age'],
            'age_category' => AnimalAgeCategory::from($validated['ageCategory']),
            'gender' => AnimalGender::from($validated['gender']),
            'color' => $validated['color'] ?? $animal->color,
            'weight' => $validated['weight'] ?? $animal->weight,
            'current_location' => $validated['current_location'] ?? $animal->current_location,
            'status' => $newStatus,
            'behavior' => $validated['behavior'] ?? $animal->behavior,
            'special_needs' => $validated['special_needs'] ?? $animal->special_needs,
            'story' => $validated['story'] ?? $animal->story,
            'vaccinated' => $validated['vaccinated'] ?? $animal->vaccinated,
            'admitted_at' => $validated['admittedAt'],
            'intake_type' => $validated['intake_type'] ?? $animal->intake_type,
            'rescue_date' => $validated['rescue_date'] ?? $animal->rescue_date,
            'rescue_location' => $validated['rescue_location'] ?? $animal->rescue_location,
            'rescue_story' => $validated['rescue_story'] ?? $animal->rescue_story,
            'adoption_date' => $adoptionDate,
            'adopter_name' => $validated['adopter_name'] ?? $animal->adopter_name,
            'adopter_phone' => $validated['adopter_phone'] ?? $animal->adopter_phone,
            'adopter_email' => $validated['adopter_email'] ?? $animal->adopter_email,
            'adoption_notes' => $validated['adoption_notes'] ?? $animal->adoption_notes,
            'deceased_at' => $deceasedDate,
            'deceased_notes' => $validated['deceased_notes'] ?? $animal->deceased_notes,
            'photo_url' => $photoUrl,
            'before_photo_url' => $beforePhotoUrl,
            'after_photo_url' => $afterPhotoUrl,
        ]);

        AuditLog::log('animal_master_record_update', "Updated master record for '{$animal->name}' (#ANM-{$animal->id})", [
            'animal_id' => $animal->id,
            'status' => $animal->status->value,
            'current_location' => $animal->current_location,
        ]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => "Master record for '{$animal->name}' updated successfully.",
        ]);

        return redirect()->back();
    }

    /**
     * Add a vaccination, medical checkup, injury, or disease record entry for an animal.
     */
    public function storeMedicalRecord(Request $request, ShelterAnimal $animal): RedirectResponse
    {
        $validated = $request->validate([
            'record_type' => ['required', 'string', 'in:vaccination,medical_checkup,surgery,treatment,medication,dental,lab_test,injury,disease,other'],
            'title' => ['required', 'string', 'max:255'],
            'performed_date' => ['required', 'date'],
            'next_due_date' => ['nullable', 'date'],
            'veterinarian' => ['nullable', 'string', 'max:255'],
            'batch_number' => ['nullable', 'string', 'max:100'],
            'dosage' => ['nullable', 'string', 'max:100'],
            'severity' => ['nullable', 'string', 'in:mild,moderate,severe,critical'],
            'treatment_plan' => ['nullable', 'string', 'max:2000'],
            'status' => ['required', 'string', 'in:completed,scheduled,overdue,active,under_treatment,resolved,chronic'],
            'notes' => ['nullable', 'string', 'max:2000'],
            'update_animal_status' => ['nullable', 'string', 'in:treatment,quarantine,available'],
        ]);

        $record = AnimalMedicalRecord::create([
            'shelter_animal_id' => $animal->id,
            'record_type' => $validated['record_type'],
            'title' => $validated['title'],
            'performed_date' => $validated['performed_date'],
            'next_due_date' => $validated['next_due_date'] ?? null,
            'veterinarian' => $validated['veterinarian'] ?? null,
            'batch_number' => $validated['batch_number'] ?? null,
            'dosage' => $validated['dosage'] ?? null,
            'severity' => $validated['severity'] ?? null,
            'treatment_plan' => $validated['treatment_plan'] ?? null,
            'status' => $validated['status'],
            'notes' => $validated['notes'] ?? null,
            'created_by' => $request->user()?->id,
        ]);

        // If vaccination entry, ensure vaccinated flag is updated on animal
        if ($validated['record_type'] === 'vaccination' && $validated['status'] === 'completed') {
            $animal->update(['vaccinated' => true]);
        }

        // If requested, update the animal's overall status (e.g. to treatment or quarantine)
        if (! empty($validated['update_animal_status'])) {
            $newStatus = ShelterAnimalStatus::from($validated['update_animal_status']);
            $oldStatus = $animal->status instanceof ShelterAnimalStatus ? $animal->status->value : (string) $animal->status;
            $animal->update(['status' => $newStatus]);

            AuditLog::log('animal_status_change', "Status changed from '{$oldStatus}' to '{$newStatus->value}' due to {$validated['record_type']} record '{$validated['title']}' for '{$animal->name}'", [
                'animal_id' => $animal->id,
                'previous_status' => $oldStatus,
                'new_status' => $newStatus->value,
            ]);
        }

        AuditLog::log('animal_medical_record_create', "Added {$validated['record_type']} record '{$validated['title']}' for '{$animal->name}'", [
            'animal_id' => $animal->id,
            'record_id' => $record->id,
            'record_type' => $record->record_type,
            'severity' => $record->severity,
            'title' => $record->title,
        ]);

        $label = match ($validated['record_type']) {
            'injury' => 'Injury log',
            'disease' => 'Disease/Illness log',
            'vaccination' => 'Vaccination record',
            default => 'Medical record',
        };

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => "{$label} '{$record->title}' logged successfully for {$animal->name}.",
        ]);

        return redirect()->back();
    }

    /**
     * Update an existing medical record entry (e.g. mark injury/disease as resolved, update treatment plan).
     */
    public function updateMedicalRecord(Request $request, AnimalMedicalRecord $medicalRecord): RedirectResponse
    {
        $validated = $request->validate([
            'record_type' => ['sometimes', 'required', 'string', 'in:vaccination,medical_checkup,surgery,treatment,medication,dental,lab_test,injury,disease,other'],
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'performed_date' => ['sometimes', 'required', 'date'],
            'next_due_date' => ['nullable', 'date'],
            'veterinarian' => ['nullable', 'string', 'max:255'],
            'batch_number' => ['nullable', 'string', 'max:100'],
            'dosage' => ['nullable', 'string', 'max:100'],
            'severity' => ['nullable', 'string', 'in:mild,moderate,severe,critical'],
            'treatment_plan' => ['nullable', 'string', 'max:2000'],
            'status' => ['sometimes', 'required', 'string', 'in:completed,scheduled,overdue,active,under_treatment,resolved,chronic'],
            'notes' => ['nullable', 'string', 'max:2000'],
            'update_animal_status' => ['nullable', 'string', 'in:treatment,quarantine,available'],
        ]);

        $medicalRecord->update([
            'record_type' => $validated['record_type'] ?? $medicalRecord->record_type,
            'title' => $validated['title'] ?? $medicalRecord->title,
            'performed_date' => $validated['performed_date'] ?? $medicalRecord->performed_date,
            'next_due_date' => array_key_exists('next_due_date', $validated) ? $validated['next_due_date'] : $medicalRecord->next_due_date,
            'veterinarian' => array_key_exists('veterinarian', $validated) ? $validated['veterinarian'] : $medicalRecord->veterinarian,
            'batch_number' => array_key_exists('batch_number', $validated) ? $validated['batch_number'] : $medicalRecord->batch_number,
            'dosage' => array_key_exists('dosage', $validated) ? $validated['dosage'] : $medicalRecord->dosage,
            'severity' => array_key_exists('severity', $validated) ? $validated['severity'] : $medicalRecord->severity,
            'treatment_plan' => array_key_exists('treatment_plan', $validated) ? $validated['treatment_plan'] : $medicalRecord->treatment_plan,
            'status' => $validated['status'] ?? $medicalRecord->status,
            'notes' => array_key_exists('notes', $validated) ? $validated['notes'] : $medicalRecord->notes,
        ]);

        $animal = $medicalRecord->shelterAnimal()->withTrashed()->first();
        if ($animal && ! empty($validated['update_animal_status'])) {
            $newStatus = ShelterAnimalStatus::from($validated['update_animal_status']);
            $oldStatus = $animal->status instanceof ShelterAnimalStatus ? $animal->status->value : (string) $animal->status;
            $animal->update(['status' => $newStatus]);

            AuditLog::log('animal_status_change', "Status changed from '{$oldStatus}' to '{$newStatus->value}' after updating medical record '{$medicalRecord->title}' for '{$animal->name}'", [
                'animal_id' => $animal->id,
                'previous_status' => $oldStatus,
                'new_status' => $newStatus->value,
            ]);
        }

        AuditLog::log('animal_medical_record_update', "Updated {$medicalRecord->record_type} record '{$medicalRecord->title}' for animal #{$medicalRecord->shelter_animal_id}", [
            'record_id' => $medicalRecord->id,
            'status' => $medicalRecord->status,
        ]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => "Medical record '{$medicalRecord->title}' updated successfully.",
        ]);

        return redirect()->back();
    }

    /**
     * Delete a medical record entry.
     */
    public function deleteMedicalRecord(AnimalMedicalRecord $medicalRecord): RedirectResponse
    {
        $animal = $medicalRecord->shelterAnimal()->withTrashed()->first();
        $title = $medicalRecord->title;
        $medicalRecord->delete();

        // Check if animal still has any completed vaccination records
        if ($animal) {
            $hasVaccines = $animal->medicalRecords()->where('record_type', 'vaccination')->where('status', 'completed')->exists();
            if (! $hasVaccines && $animal->medicalRecords()->count() === 0) {
                // Keep existing boolean unless explicitly wanted
            }
        }

        AuditLog::log('animal_medical_record_delete', "Deleted medical record '{$title}' for animal #{$animal?->id}");

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => "Medical record '{$title}' removed.",
        ]);

        return redirect()->back();
    }

    /**
     * Soft delete an animal record.
     */
    public function destroy(ShelterAnimal $animal): RedirectResponse
    {
        $name = $animal->name;
        $id = $animal->id;
        $animal->delete();

        AuditLog::log('animal_master_record_delete', "Archived/Deleted master record for '{$name}' (#ANM-{$id})");

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => "Animal record for '{$name}' has been archived.",
        ]);

        return redirect()->back();
    }
}
