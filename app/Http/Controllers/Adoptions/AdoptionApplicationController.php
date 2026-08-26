<?php

namespace App\Http\Controllers\Adoptions;

use App\Enums\AdoptionApplicationStatus;
use App\Enums\AdoptionDocumentKind;
use App\Http\Controllers\Controller;
use App\Models\AdoptionApplication;
use App\Models\AdoptionApplicationFile;
use App\Models\AuditLog;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class AdoptionApplicationController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $applications = AdoptionApplication::where('user_id', $user->id)
            ->with(['shelterAnimal'])
            ->latest()
            ->get();

        return Inertia::render('user/adoption-applications', [
            'applications' => $applications,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'pet_id' => ['required', 'exists:shelter_animals,id'],

            // Step 1: Personal Info
            'fullName' => ['required', 'string', 'max:255'],
            'address' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'birthDate' => ['required', 'date'],
            'occupation' => ['nullable', 'string', 'max:255'],
            'company' => ['required', 'string', 'max:255'],
            'socialMedia' => ['nullable', 'string', 'max:255'],
            'status' => ['required', 'string', 'max:255'],
            'pronouns' => ['required', 'string', 'max:255'],
            'adoptionSource' => ['required', 'array'],
            'adoptedBefore' => ['required', 'in:Yes,No'],
            'emergencyName' => ['required', 'string', 'max:255'],
            'emergencyRelationship' => ['required', 'string', 'max:255'],
            'emergencyPhone' => ['required', 'string', 'max:255'],
            'emergencyEmail' => ['required', 'email', 'max:255'],

            // Step 2: Questionnaire
            'adoptionPreference' => ['required', 'string', 'max:255'],
            'residenceType' => ['required', 'string', 'max:255'],
            'isRenting' => ['required', 'in:Yes,No'],
            'movingPlan' => ['required', 'string', 'max:1000'],
            'livesWith' => ['required', 'array'],
            'hasAllergies' => ['required', 'in:Yes,No'],
            'dailyCareHandler' => ['required', 'string', 'max:255'],
            'expensesHandler' => ['required', 'string', 'max:255'],
            'emergencyHandler' => ['required', 'string', 'max:255'],
            'hoursAlone' => ['required', 'string', 'max:255'],
            'introductionPlan' => ['required', 'string', 'max:2000'],
            'familySupport' => ['required', 'in:Yes,No'],
            'familySupportExplanation' => ['required_if:familySupport,No', 'nullable', 'string', 'max:1000'],
            'currentPets' => ['required', 'in:Yes,No'],
            'pastPets' => ['required', 'in:Yes,No'],

            // Step 3: Files
            'uploadedId' => ['required', 'file', 'image', 'max:8192'],
            'frontHouse' => ['nullable', 'file', 'image', 'max:8192'],
            'streetView' => ['nullable', 'file', 'image', 'max:8192'],
            'livingRoom' => ['nullable', 'file', 'image', 'max:8192'],
            'diningArea' => ['nullable', 'file', 'image', 'max:8192'],
            'kitchen' => ['nullable', 'file', 'image', 'max:8192'],
            'bedroom' => ['nullable', 'file', 'image', 'max:8192'],
            'windows' => ['nullable', 'file', 'image', 'max:8192'],
            'yard' => ['nullable', 'file', 'image', 'max:8192'],

            // Step 4: Interview
            'preferredDate' => ['required', 'date', 'after_or_equal:today'],
            'preferredTime' => ['required'],
            'canVisitShelter' => ['required', 'in:Yes,No'],
        ]);

        DB::transaction(function () use ($request, $validated) {
            $application = AdoptionApplication::create([
                'user_id' => $request->user()->id,
                'shelter_animal_id' => $validated['pet_id'],
                'status' => AdoptionApplicationStatus::Pending,

                // Personal Info
                'full_name' => $validated['fullName'],
                'address' => $validated['address'],
                'phone' => $validated['phone'],
                'email' => $validated['email'],
                'birth_date' => $validated['birthDate'],
                'occupation' => $validated['occupation'] ?? null,
                'company' => $validated['company'],
                'social_media' => $validated['socialMedia'] ?? null,
                'status_marital' => $validated['status'],
                'pronouns' => $validated['pronouns'],
                'adoption_source' => $validated['adoptionSource'],
                'adopted_before' => $validated['adoptedBefore'] === 'Yes',

                // Emergency Contact
                'emergency_name' => $validated['emergencyName'],
                'emergency_relationship' => $validated['emergencyRelationship'],
                'emergency_phone' => $validated['emergencyPhone'],
                'emergency_email' => $validated['emergencyEmail'],

                // Questionnaire
                'adoption_preference' => $validated['adoptionPreference'],
                'residence_type' => $validated['residenceType'],
                'is_renting' => $validated['isRenting'] === 'Yes',
                'moving_plan' => $validated['movingPlan'],
                'lives_with' => $validated['livesWith'],
                'has_allergies' => $validated['hasAllergies'] === 'Yes',
                'daily_care_handler' => $validated['dailyCareHandler'],
                'expenses_handler' => $validated['expensesHandler'],
                'emergency_handler' => $validated['emergencyHandler'],
                'hours_alone' => $validated['hoursAlone'],
                'introduction_plan' => $validated['introductionPlan'],
                'family_support' => $validated['familySupport'] === 'Yes',
                'family_support_explanation' => $validated['familySupportExplanation'] ?? null,
                'current_pets' => $validated['currentPets'] === 'Yes',
                'past_pets' => $validated['pastPets'] === 'Yes',

                // Schedule
                'preferred_date' => $validated['preferredDate'],
                'preferred_time' => $validated['preferredTime'],
                'can_visit_shelter' => $validated['canVisitShelter'] === 'Yes',
            ]);

            $documentTypes = [
                'uploadedId' => AdoptionDocumentKind::Id,
                'frontHouse' => AdoptionDocumentKind::FrontHouse,
                'streetView' => AdoptionDocumentKind::StreetView,
                'livingRoom' => AdoptionDocumentKind::LivingRoom,
                'diningArea' => AdoptionDocumentKind::DiningArea,
                'kitchen' => AdoptionDocumentKind::Kitchen,
                'bedroom' => AdoptionDocumentKind::Bedroom,
                'windows' => AdoptionDocumentKind::Windows,
                'yard' => AdoptionDocumentKind::Yard,
            ];

            foreach ($documentTypes as $inputKey => $kind) {
                if ($request->hasFile($inputKey)) {
                    $file = $request->file($inputKey);
                    $path = $file->store('adoption_documents', 'public');

                    AdoptionApplicationFile::create([
                        'adoption_application_id' => $application->id,
                        'kind' => $kind,
                        'path' => $path,
                        'original_filename' => $file->getClientOriginalName(),
                        'mime_type' => $file->getClientMimeType(),
                        'file_size' => $file->getSize(),
                    ]);
                }
            }
        });

        AuditLog::log('adoption_apply', "Submitted adoption application for pet ID {$validated['pet_id']}");

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Adoption application submitted successfully!',
        ]);

        return redirect()->route('adopt');
    }
}
