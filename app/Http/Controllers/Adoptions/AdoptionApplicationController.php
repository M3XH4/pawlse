<?php

namespace App\Http\Controllers\Adoptions;

use App\Enums\AdoptionApplicationStatus;
use App\Enums\AdoptionDocumentKind;
use App\Enums\Role;
use App\Enums\ShelterAnimalStatus;
use App\Events\AdoptionApplicationSubmittedEvent;
use App\Http\Controllers\Controller;
use App\Models\AdoptionApplication;
use App\Models\AdoptionApplicationFile;
use App\Models\AuditLog;
use App\Models\RehomingRequest;
use App\Models\ShelterVisit;
use App\Models\User;
use App\Notifications\AdoptionApplicationSubmittedNotification;
use App\Notifications\SubmissionEReceiptNotification;
use App\Support\EReceiptDispatcher;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class AdoptionApplicationController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('user/adoption-applications', [
            'applications' => fn () => AdoptionApplication::where(function ($q) use ($user) {
                $q->where('user_id', $user->id)
                    ->orWhereRaw('LOWER(email) = ?', [strtolower((string) $user->email)]);
            })
                ->with(['shelterAnimal', 'files', 'followUps'])
                ->latest()
                ->get(),

            'shelterVisits' => fn () => ShelterVisit::where(function ($q) use ($user) {
                $q->where('user_id', $user->id)
                    ->orWhereRaw('LOWER(email) = ?', [strtolower($user->email)]);
            })
                ->with('shelterAnimal')
                ->latest()
                ->get(),

            'rehomingRequests' => fn () => RehomingRequest::where(function ($q) use ($user) {
                $q->where('user_id', $user->id)
                    ->orWhereRaw('LOWER(email) = ?', [strtolower($user->email)]);
            })
                ->latest()
                ->get(),
        ]);
    }

    public function track(Request $request): Response|RedirectResponse
    {
        $referenceInput = trim((string) $request->query('reference', ''));
        $emailInput = trim((string) $request->query('email', ''));

        // If a logged in regular user visits the secret track page directly without query parameters,
        // redirect them to their own user dashboard as they track applications there.
        if ($request->user() && $referenceInput === '' && $emailInput === '') {
            if ($request->user()->isAdmin() || $request->user()->isSuperAdmin()) {
                return redirect()->route('account.admin.adoption-management');
            }

            return redirect()->route('account.user.adoption-applications');
        }

        $applications = [];
        $searched = false;

        if ($referenceInput !== '' || $emailInput !== '') {
            $searched = true;

            $refId = (int) preg_replace('/[^0-9]/', '', $referenceInput);

            if ($refId > 0 && $emailInput !== '') {
                $app = AdoptionApplication::where('id', $refId)
                    ->whereRaw('LOWER(email) = ?', [strtolower($emailInput)])
                    ->with(['shelterAnimal', 'files'])
                    ->first();

                if ($app) {
                    $applications = [$app];
                }
            }
        }

        return Inertia::render('adopt/track', [
            'searchedReference' => $referenceInput,
            'searchedEmail' => $emailInput,
            'searched' => $searched,
            'applications' => $applications,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'pet_id' => [
                'required',
                Rule::exists('shelter_animals', 'id')->whereIn('status', [
                    ShelterAnimalStatus::Available->value,
                    ShelterAnimalStatus::Pending->value,
                ]),
            ],

            // Step 1: Personal Info
            'fullName' => ['required', 'string', 'max:255'],
            'address' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'birthDate' => ['required', 'date', 'before:today'],
            'occupation' => ['nullable', 'string', 'max:255'],
            'company' => ['nullable', 'string', 'max:255'],
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
            'uploadedId' => ['required', 'file', 'mimes:jpeg,png,jpg,webp,pdf', 'max:8192'],
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

        $application = DB::transaction(function () use ($request, $validated) {
            $userId = $request->user()?->id;
            if (! $userId) {
                $existingUser = User::where('email', $validated['email'])->first();
                $userId = $existingUser?->id;
            }

            $app = AdoptionApplication::create([
                'user_id' => $userId,
                'shelter_animal_id' => $validated['pet_id'],
                'status' => AdoptionApplicationStatus::Pending,

                // Personal Info
                'full_name' => $validated['fullName'],
                'address' => $validated['address'],
                'phone' => $validated['phone'],
                'email' => $validated['email'],
                'birth_date' => $validated['birthDate'],
                'occupation' => $validated['occupation'] ?? null,
                'company' => ! empty($validated['company']) ? $validated['company'] : 'N/A',
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
                'preferred_time' => $this->normalizePreferredTime($validated['preferredTime']),
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
                        'adoption_application_id' => $app->id,
                        'kind' => $kind,
                        'path' => $path,
                        'original_filename' => $file->getClientOriginalName(),
                        'mime_type' => $file->getClientMimeType(),
                        'file_size' => $file->getSize(),
                    ]);
                }
            }

            return $app;
        });

        $application->loadMissing('shelterAnimal');

        $admins = User::whereIn('role', [Role::Admin->value, Role::SuperAdmin->value])->get();
        if ($admins->isNotEmpty()) {
            Notification::send($admins, new AdoptionApplicationSubmittedNotification($application));
        }

        EReceiptDispatcher::sendToEmail(
            $application->email,
            SubmissionEReceiptNotification::forAdoptionApplication($application)
        );

        AdoptionApplicationSubmittedEvent::dispatch($application);

        AuditLog::log('adoption_apply', "Submitted adoption application for pet ID {$validated['pet_id']}");

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Adoption application submitted successfully!',
        ]);

        if ($request->user()) {
            return redirect()->route('account.user.adoption-applications');
        }

        $ref = 'ADP-'.str_pad((string) $application->id, 5, '0', STR_PAD_LEFT);

        return redirect()->route('adopt.track', [
            'reference' => $ref,
            'email' => $validated['email'],
        ]);
    }

    public function resubmit(Request $request, AdoptionApplication $application): RedirectResponse
    {
        if ($application->status !== AdoptionApplicationStatus::Rejected) {
            return back()->withErrors(['error' => 'Only rejected applications can be updated and resubmitted.']);
        }

        if ($application->shelterAnimal && $application->shelterAnimal->status === ShelterAnimalStatus::Adopted) {
            return back()->withErrors(['error' => 'This pet has already been adopted and is no longer available for adoption.']);
        }

        if ($request->user()) {
            if (! $request->user()->isAdmin() && ! $request->user()->isSuperAdmin()) {
                if ($application->user_id !== null && $application->user_id !== $request->user()->id) {
                    abort(403);
                }
                if ($application->user_id === null && strcasecmp($application->email, $request->user()->email) !== 0) {
                    abort(403);
                }
            }
        } else {
            if (strcasecmp((string) $request->input('email'), $application->email) !== 0) {
                return back()->withErrors(['email' => 'The email address must match the original application.']);
            }
        }

        $validated = $request->validate([
            // Step 1: Personal Info
            'fullName' => ['required', 'string', 'max:255'],
            'address' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'birthDate' => ['required', 'date', 'before:today'],
            'occupation' => ['nullable', 'string', 'max:255'],
            'company' => ['nullable', 'string', 'max:255'],
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

            // Step 3: Files (optional on resubmit since ID was previously uploaded)
            'uploadedId' => ['nullable', 'file', 'mimes:jpeg,png,jpg,webp,pdf', 'max:8192'],
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

        DB::transaction(function () use ($request, $application, $validated) {
            $application->update([
                'status' => AdoptionApplicationStatus::Pending,
                'rejection_reason' => null,

                // Personal Info
                'full_name' => $validated['fullName'],
                'address' => $validated['address'],
                'phone' => $validated['phone'],
                'email' => $validated['email'],
                'birth_date' => $validated['birthDate'],
                'occupation' => $validated['occupation'] ?? null,
                'company' => ! empty($validated['company']) ? $validated['company'] : 'N/A',
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
                'preferred_time' => $this->normalizePreferredTime($validated['preferredTime']),
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

        $application->loadMissing('shelterAnimal');

        $admins = User::whereIn('role', [Role::Admin->value, Role::SuperAdmin->value])->get();
        if ($admins->isNotEmpty()) {
            Notification::send($admins, new AdoptionApplicationSubmittedNotification($application));
        }

        EReceiptDispatcher::sendToEmail(
            $application->email,
            SubmissionEReceiptNotification::forAdoptionApplication($application)
        );

        AdoptionApplicationSubmittedEvent::dispatch($application);

        AuditLog::log('adoption_resubmit', "Resubmitted adoption application #{$application->id} for pet ID {$application->shelter_animal_id}");

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Adoption application updated and resubmitted successfully!',
        ]);

        if ($request->user()) {
            return redirect()->route('account.user.adoption-applications');
        }

        $ref = 'ADP-'.str_pad((string) $application->id, 5, '0', STR_PAD_LEFT);

        return redirect()->route('adopt.track', [
            'reference' => $ref,
            'email' => $application->email,
        ]);
    }

    /**
     * Normalize preferred time string to 24-hour H:i:s format for database storage.
     */
    protected function normalizePreferredTime(?string $time): ?string
    {
        if (blank($time)) {
            return null;
        }

        try {
            return Carbon::parse($time)->format('H:i:s');
        } catch (\Throwable) {
            return $time;
        }
    }
}
