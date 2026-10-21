<?php

namespace App\Http\Controllers\Admin;

use App\Enums\AdoptionApplicationStatus;
use App\Enums\AnimalAgeCategory;
use App\Enums\AnimalGender;
use App\Enums\AnimalType;
use App\Enums\ShelterAnimalStatus;
use App\Events\AdoptionApplicationStatusUpdatedEvent;
use App\Http\Controllers\Controller;
use App\Models\AdoptionApplication;
use App\Models\AuditLog;
use App\Models\PostAdoptionFollowUp;
use App\Models\RehomingRequest;
use App\Models\ShelterAnimal;
use App\Models\ShelterVisit;
use App\Models\SystemSetting;
use App\Notifications\AdoptionApplicationStatusUpdatedNotification;
use App\Notifications\RehomingRequestStatusUpdatedNotification;
use App\Notifications\ShelterVisitStatusUpdatedNotification;
use App\Support\EReceiptDispatcher;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class AdoptionManagementController extends Controller
{
    public function index(Request $request): Response
    {
        $applications = AdoptionApplication::with(['user', 'shelterAnimal', 'files'])
            ->latest()
            ->get()
            ->map(function ($app) {
                return [
                    'id' => $app->id,
                    'status' => $app->status->value,
                    'full_name' => $app->full_name,
                    'address' => $app->address,
                    'phone' => $app->phone,
                    'email' => $app->email,
                    'birth_date' => $app->birth_date ? $app->birth_date->format('Y-m-d') : null,
                    'occupation' => $app->occupation,
                    'company' => $app->company,
                    'social_media' => $app->social_media,
                    'status_marital' => $app->status_marital,
                    'pronouns' => $app->pronouns,
                    'adoption_source' => $app->adoption_source,
                    'adopted_before' => (bool) $app->adopted_before,
                    'emergency_name' => $app->emergency_name,
                    'emergency_relationship' => $app->emergency_relationship,
                    'emergency_phone' => $app->emergency_phone,
                    'emergency_email' => $app->emergency_email,
                    'adoption_preference' => $app->adoption_preference,
                    'residence_type' => $app->residence_type,
                    'is_renting' => (bool) $app->is_renting,
                    'moving_plan' => $app->moving_plan,
                    'lives_with' => $app->lives_with,
                    'has_allergies' => (bool) $app->has_allergies,
                    'daily_care_handler' => $app->daily_care_handler,
                    'expenses_handler' => $app->expenses_handler,
                    'emergency_handler' => $app->emergency_handler,
                    'hours_alone' => $app->hours_alone,
                    'introduction_plan' => $app->introduction_plan,
                    'family_support' => (bool) $app->family_support,
                    'family_support_explanation' => $app->family_support_explanation,
                    'current_pets' => (bool) $app->current_pets,
                    'past_pets' => (bool) $app->past_pets,
                    'preferred_date' => $app->preferred_date ? $app->preferred_date->format('Y-m-d') : null,
                    'preferred_time' => $app->preferred_time,
                    'can_visit_shelter' => (bool) $app->can_visit_shelter,
                    'rejection_reason' => $app->rejection_reason,
                    'notes' => $app->notes,
                    'created_at' => $app->created_at->toDateTimeString(),
                    'pet' => $app->shelterAnimal ? [
                        'id' => $app->shelterAnimal->id,
                        'name' => $app->shelterAnimal->name,
                        'type' => $app->shelterAnimal->type ? $app->shelterAnimal->type->value : null,
                        'breed' => $app->shelterAnimal->breed,
                        'age' => $app->shelterAnimal->age,
                        'photo_url' => $app->shelterAnimal->photo_url,
                        'status' => $app->shelterAnimal->status->value,
                    ] : null,
                    'user' => $app->user ? [
                        'id' => $app->user->id,
                        'name' => $app->user->name,
                        'email' => $app->user->email,
                    ] : null,
                    'files' => $app->files->map(function ($file) {
                        return [
                            'id' => $file->id,
                            'kind' => $file->kind->value,
                            'name' => $file->original_filename,
                            'url' => Storage::url($file->path),
                            'size' => $file->file_size,
                        ];
                    }),
                ];
            });

        $pets = ShelterAnimal::with('needs')
            ->latest()
            ->get()
            ->map(function ($pet) {
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
                    'status' => $pet->status->value,
                    'needs' => $pet->needs->map(function ($need) {
                        return [
                            'id' => $need->id,
                            'item' => $need->item,
                            'quantity' => $need->quantity,
                            'priority' => ucfirst(strtolower($need->priority ?? 'Medium')),
                            'status' => strtolower($need->status ?? 'open'),
                        ];
                    }),
                ];
            });

        $postAdoptionFollowUps = PostAdoptionFollowUp::with(['shelterAnimal', 'conductedBy'])
            ->latest('follow_up_date')
            ->get()
            ->map(function (PostAdoptionFollowUp $followUp) {
                return [
                    'id' => $followUp->id,
                    'shelter_animal_id' => $followUp->shelter_animal_id,
                    'follow_up_date' => $followUp->follow_up_date->format('Y-m-d'),
                    'method' => $followUp->method,
                    'status' => $followUp->status,
                    'pet_condition' => $followUp->pet_condition,
                    'notes' => $followUp->notes,
                    'photo_url' => $followUp->photo_url,
                    'next_follow_up_date' => $followUp->next_follow_up_date?->format('Y-m-d'),
                    'conducted_by_name' => $followUp->conductedBy?->name ?? 'ISF Staff',
                    'pet' => $followUp->shelterAnimal ? [
                        'id' => $followUp->shelterAnimal->id,
                        'name' => $followUp->shelterAnimal->name,
                        'type' => $followUp->shelterAnimal->type?->value,
                        'breed' => $followUp->shelterAnimal->breed,
                        'photo_url' => $followUp->shelterAnimal->photo_url,
                        'adopter_name' => $followUp->shelterAnimal->adopter_name,
                        'adopter_phone' => $followUp->shelterAnimal->adopter_phone,
                        'adoption_date' => $followUp->shelterAnimal->adoption_date?->format('Y-m-d'),
                    ] : null,
                ];
            });

        $adoptedPets = ShelterAnimal::query()
            ->where('status', ShelterAnimalStatus::Adopted)
            ->withCount('postAdoptionFollowUps')
            ->latest('adoption_date')
            ->get()
            ->map(function (ShelterAnimal $pet) {
                return [
                    'id' => $pet->id,
                    'name' => $pet->name,
                    'type' => $pet->type?->value,
                    'breed' => $pet->breed,
                    'photo_url' => $pet->photo_url,
                    'adopter_name' => $pet->adopter_name,
                    'adopter_phone' => $pet->adopter_phone,
                    'adopter_email' => $pet->adopter_email,
                    'adoption_date' => $pet->adoption_date?->format('Y-m-d'),
                    'follow_ups_count' => $pet->post_adoption_follow_ups_count,
                ];
            });

        $shelterVisits = ShelterVisit::with(['shelterAnimal', 'user', 'confirmedBy'])
            ->latest('preferred_date')
            ->get()
            ->map(function (ShelterVisit $visit) {
                return [
                    'id' => $visit->id,
                    'full_name' => $visit->full_name,
                    'contact_number' => $visit->contact_number,
                    'email' => $visit->email,
                    'preferred_date' => $visit->preferred_date->format('Y-m-d'),
                    'preferred_time_slot' => $visit->preferred_time_slot,
                    'number_of_visitors' => $visit->number_of_visitors,
                    'purpose' => $visit->purpose,
                    'status' => $visit->status,
                    'confirmed_date' => $visit->confirmed_date?->format('Y-m-d'),
                    'confirmed_time_slot' => $visit->confirmed_time_slot,
                    'additional_notes' => $visit->additional_notes,
                    'admin_notes' => $visit->admin_notes,
                    'confirmed_by_name' => $visit->confirmedBy?->name,
                    'pet' => $visit->shelterAnimal ? [
                        'id' => $visit->shelterAnimal->id,
                        'name' => $visit->shelterAnimal->name,
                        'photo_url' => $visit->shelterAnimal->photo_url,
                    ] : null,
                    'created_at' => $visit->created_at->toDateTimeString(),
                ];
            });

        $rehomingRequests = RehomingRequest::with(['user', 'reviewedBy'])
            ->latest()
            ->get()
            ->map(function (RehomingRequest $rehoming) {
                return [
                    'id' => $rehoming->id,
                    'full_name' => $rehoming->full_name,
                    'contact_number' => $rehoming->contact_number,
                    'email' => $rehoming->email,
                    'animal_name' => $rehoming->animal_name,
                    'species' => $rehoming->species,
                    'breed' => $rehoming->breed,
                    'gender' => $rehoming->gender,
                    'age' => $rehoming->age,
                    'current_location' => $rehoming->current_location,
                    'reason' => $rehoming->reason,
                    'health_notes' => $rehoming->health_notes,
                    'description' => $rehoming->description,
                    'photo_url' => $rehoming->photo_url,
                    'status' => $rehoming->status,
                    'admin_notes' => $rehoming->admin_notes,
                    'reviewed_by_name' => $rehoming->reviewedBy?->name,
                    'created_at' => $rehoming->created_at->toDateTimeString(),
                ];
            });

        $shelterVisitSettings = SystemSetting::getValue('shelter_visit_settings', [
            'max_visitors_per_slot' => 10,
            'max_visitors_per_booking' => 10,
            'closed_days' => ['Sunday'],
            'blackout_dates' => [],
            'is_accepting_visits' => true,
        ]);

        return Inertia::render('admin/adoption-management', [
            'applications' => $applications,
            'pets' => $pets,
            'postAdoptionFollowUps' => $postAdoptionFollowUps,
            'adoptedPets' => $adoptedPets,
            'shelterVisits' => $shelterVisits,
            'rehomingRequests' => $rehomingRequests,
            'shelterVisitSettings' => $shelterVisitSettings,
        ]);
    }

    public function updateStatus(Request $request, AdoptionApplication $application): RedirectResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'string', 'in:approved,rejected,scheduled'],
            'rejection_reason' => ['required_if:status,rejected', 'nullable', 'string', 'max:1000'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $newStatus = AdoptionApplicationStatus::from($validated['status']);
        $oldStatus = $application->status;

        DB::transaction(function () use ($application, $validated, $newStatus, $oldStatus) {
            $animal = ShelterAnimal::where('id', $application->shelter_animal_id)
                ->lockForUpdate()
                ->firstOrFail();

            $application->update([
                'status' => $newStatus,
                'rejection_reason' => $validated['rejection_reason'] ?? null,
                'notes' => $validated['notes'] ?? $application->notes,
            ]);

            if ($newStatus === AdoptionApplicationStatus::Approved) {
                $animal->update([
                    'status' => ShelterAnimalStatus::Adopted,
                    'adoption_date' => now(),
                    'adopter_name' => $application->full_name,
                    'adopter_phone' => $application->phone,
                    'adopter_email' => $application->email,
                ]);

                // Auto-reject competing pending/scheduled applications for this animal
                $competingApplications = AdoptionApplication::where('shelter_animal_id', $animal->id)
                    ->where('id', '!=', $application->id)
                    ->whereIn('status', [AdoptionApplicationStatus::Pending, AdoptionApplicationStatus::Scheduled])
                    ->get();

                foreach ($competingApplications as $competing) {
                    $competing->update([
                        'status' => AdoptionApplicationStatus::Rejected,
                        'rejection_reason' => 'Another applicant was approved and matched for this pet.',
                    ]);

                    EReceiptDispatcher::sendToUserAndEmail(
                        $competing->user,
                        $competing->email,
                        new AdoptionApplicationStatusUpdatedNotification($competing)
                    );
                    AdoptionApplicationStatusUpdatedEvent::dispatch($competing);
                }
            } elseif ($newStatus === AdoptionApplicationStatus::Scheduled) {
                $animal->update([
                    'status' => ShelterAnimalStatus::Pending,
                ]);
            } elseif ($newStatus === AdoptionApplicationStatus::Rejected) {
                // Rollback animal status if this application was previously approved or scheduled
                if ($oldStatus === AdoptionApplicationStatus::Approved && $animal->status === ShelterAnimalStatus::Adopted) {
                    $animal->update([
                        'status' => ShelterAnimalStatus::Available,
                        'adoption_date' => null,
                        'adopter_name' => null,
                        'adopter_phone' => null,
                        'adopter_email' => null,
                    ]);
                } elseif ($oldStatus === AdoptionApplicationStatus::Scheduled && $animal->status === ShelterAnimalStatus::Pending) {
                    $hasOtherScheduled = AdoptionApplication::where('shelter_animal_id', $animal->id)
                        ->where('id', '!=', $application->id)
                        ->where('status', AdoptionApplicationStatus::Scheduled)
                        ->exists();

                    if (! $hasOtherScheduled) {
                        $animal->update([
                            'status' => ShelterAnimalStatus::Available,
                        ]);
                    }
                }
            }

            EReceiptDispatcher::sendToUserAndEmail(
                $application->user,
                $application->email,
                new AdoptionApplicationStatusUpdatedNotification($application)
            );
            AdoptionApplicationStatusUpdatedEvent::dispatch($application);

            AuditLog::log('adoption_application_update', "Updated status of adoption application ID {$application->id} to {$validated['status']}");
        });

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Application status updated successfully.',
        ]);

        return redirect()->route('account.admin.adoption-management');
    }

    public function updateVisitStatus(Request $request, ShelterVisit $visit): RedirectResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'string', 'in:pending,confirmed,completed,cancelled'],
            'confirmed_date' => ['nullable', 'date'],
            'confirmed_time_slot' => ['nullable', 'string', 'max:100'],
            'admin_notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $oldStatus = $visit->status;
        $oldConfirmedDate = $visit->confirmed_date?->format('Y-m-d');
        $oldConfirmedSlot = $visit->confirmed_time_slot;

        $confirmedDate = $validated['confirmed_date'] ?? $visit->confirmed_date;
        $confirmedTimeSlot = $validated['confirmed_time_slot'] ?? $visit->confirmed_time_slot;

        if ($validated['status'] === 'confirmed') {
            $confirmedDate = $confirmedDate ?? $visit->preferred_date;
            $confirmedTimeSlot = $confirmedTimeSlot ?: $visit->preferred_time_slot;
        }

        $visit->update([
            'status' => $validated['status'],
            'confirmed_date' => $confirmedDate,
            'confirmed_time_slot' => $confirmedTimeSlot,
            'admin_notes' => $validated['admin_notes'] ?? $visit->admin_notes,
            'confirmed_by' => $request->user()?->id,
        ]);

        $scheduleChanged = $validated['status'] === 'confirmed' && (
            $visit->confirmed_date?->format('Y-m-d') !== $oldConfirmedDate
            || $visit->confirmed_time_slot !== $oldConfirmedSlot
        );

        if ($oldStatus !== $validated['status'] || $scheduleChanged) {
            EReceiptDispatcher::sendToUserAndEmail(
                $visit->user,
                $visit->email,
                new ShelterVisitStatusUpdatedNotification($visit)
            );
        }

        AuditLog::log('shelter_visit_update', "Updated shelter visit ID {$visit->id} status to {$validated['status']}");

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Shelter visit updated successfully.',
        ]);

        return redirect()->route('account.admin.adoption-management');
    }

    public function updateRehomingStatus(Request $request, RehomingRequest $rehomingRequest): RedirectResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'string', 'in:pending,reviewed,posted,shelter_intake,home_found,declined'],
            'admin_notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $oldStatus = $rehomingRequest->status;

        if ($validated['status'] === 'shelter_intake' && $oldStatus !== 'shelter_intake') {
            $request->merge([
                'intake_notes' => $validated['admin_notes'] ?? null,
            ]);

            return $this->intakeRehomingRequest($request, $rehomingRequest);
        }

        $rehomingRequest->update([
            'status' => $validated['status'],
            'admin_notes' => $validated['admin_notes'] ?? $rehomingRequest->admin_notes,
            'reviewed_by' => $request->user()?->id,
        ]);

        if ($oldStatus !== $validated['status']) {
            EReceiptDispatcher::sendToUserAndEmail(
                $rehomingRequest->user,
                $rehomingRequest->email,
                new RehomingRequestStatusUpdatedNotification($rehomingRequest)
            );
        }

        AuditLog::log('rehoming_request_update', "Updated rehoming request ID {$rehomingRequest->id} status to {$validated['status']}");

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Rehoming request status updated successfully.',
        ]);

        return redirect()->route('account.admin.adoption-management');
    }

    public function intakeRehomingRequest(Request $request, RehomingRequest $rehomingRequest): RedirectResponse
    {
        $validated = $request->validate([
            'intake_notes' => ['nullable', 'string', 'max:1000'],
            'admitted_at' => ['nullable', 'date'],
        ]);

        if ($rehomingRequest->status === 'shelter_intake') {
            if (! empty($validated['intake_notes'])) {
                $rehomingRequest->update([
                    'admin_notes' => $validated['intake_notes'],
                    'reviewed_by' => $request->user()?->id,
                ]);
            }

            Inertia::flash('toast', [
                'type' => 'info',
                'message' => "Pet '{$rehomingRequest->animal_name}' has already been admitted to the shelter.",
            ]);

            return redirect()->route('account.admin.adoption-management');
        }

        return DB::transaction(function () use ($request, $rehomingRequest, $validated) {
            $type = match (strtolower($rehomingRequest->species)) {
                'cat' => AnimalType::Cat,
                'dog' => AnimalType::Dog,
                default => AnimalType::Other,
            };

            $gender = match (strtolower($rehomingRequest->gender)) {
                'female' => AnimalGender::Female,
                default => AnimalGender::Male,
            };

            $ageStr = strtolower((string) $rehomingRequest->age);
            $ageCategory = match (true) {
                str_contains($ageStr, 'month') || str_contains($ageStr, 'week') || str_contains($ageStr, 'puppy') || str_contains($ageStr, 'kitten') => $type === AnimalType::Cat ? AnimalAgeCategory::Kitten : ($type === AnimalType::Dog ? AnimalAgeCategory::Puppy : AnimalAgeCategory::Young),
                str_contains($ageStr, 'senior') || str_contains($ageStr, 'old') => AnimalAgeCategory::Senior,
                default => AnimalAgeCategory::Adult,
            };

            $healthNotesLower = strtolower(trim((string) $rehomingRequest->health_notes));
            $hasNegativeVaccine = str_contains($healthNotesLower, 'not vaccin')
                || str_contains($healthNotesLower, 'unvaccin')
                || str_contains($healthNotesLower, 'no vaccin')
                || str_contains($healthNotesLower, 'never vaccin')
                || in_array($healthNotesLower, ['none', 'n/a', 'no'], true);
            $isVaccinated = ! $hasNegativeVaccine && (
                str_contains($healthNotesLower, 'vaccin')
                || str_contains($healthNotesLower, 'rabies')
                || str_contains($healthNotesLower, '5-in-1')
                || str_contains($healthNotesLower, '4-in-1')
                || str_contains($healthNotesLower, 'complete')
                || str_contains($healthNotesLower, 'immuniz')
                || str_contains($healthNotesLower, 'shot')
            );

            $photoUrl = null;
            if ($rehomingRequest->photo_path) {
                $photoUrl = str_starts_with($rehomingRequest->photo_path, 'http') || str_starts_with($rehomingRequest->photo_path, '/storage/')
                    ? $rehomingRequest->photo_path
                    : '/storage/'.ltrim($rehomingRequest->photo_path, '/');
            }

            $story = trim(($rehomingRequest->description ?? '')."\n\nSurrendered by ".$rehomingRequest->full_name.' ('.$rehomingRequest->reason.'). '.($rehomingRequest->health_notes ? 'Health: '.$rehomingRequest->health_notes : ''));

            $animal = ShelterAnimal::create([
                'name' => $rehomingRequest->animal_name,
                'type' => $type,
                'breed' => $rehomingRequest->breed ?? 'Mixed Breed',
                'age' => $rehomingRequest->age ?? 'Adult',
                'age_category' => $ageCategory,
                'gender' => $gender,
                'color' => 'Mixed',
                'behavior' => 'Intake from rehoming surrender: '.$rehomingRequest->reason,
                'story' => $story,
                'vaccinated' => $isVaccinated,
                'intake_type' => 'shelter intake',
                'rescue_location' => $rehomingRequest->current_location,
                'status' => ShelterAnimalStatus::Available,
                'photo_url' => $photoUrl,
                'admitted_at' => $validated['admitted_at'] ?? now(),
            ]);

            $existingNotes = trim((string) $rehomingRequest->admin_notes);
            $intakeNote = trim((string) ($validated['intake_notes'] ?? ''));
            $combinedNotes = $existingNotes;
            if ($intakeNote !== '' && $intakeNote !== $existingNotes) {
                $combinedNotes = $combinedNotes !== '' ? $combinedNotes."\n".$intakeNote : $intakeNote;
            }
            $combinedNotes = trim(($combinedNotes !== '' ? $combinedNotes."\n" : '')."Pet successfully admitted to shelter sanctuary as '{$animal->name}' (ID #{$animal->id}).");

            $rehomingRequest->update([
                'status' => 'shelter_intake',
                'admin_notes' => $combinedNotes,
                'reviewed_by' => $request->user()?->id,
            ]);

            EReceiptDispatcher::sendToUserAndEmail(
                $rehomingRequest->user,
                $rehomingRequest->email,
                new RehomingRequestStatusUpdatedNotification($rehomingRequest)
            );

            AuditLog::log('rehoming_intake_to_shelter', "Admitted rehoming request pet '{$rehomingRequest->animal_name}' into shelter as animal ID {$animal->id}");

            Inertia::flash('toast', [
                'type' => 'success',
                'message' => "Pet '{$animal->name}' admitted to shelter as an available adoptable pet.",
            ]);

            return redirect()->route('account.admin.adoption-management');
        });
    }

    public function updateVisitSettings(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'max_visitors_per_slot' => ['required', 'integer', 'min:1', 'max:50'],
            'max_visitors_per_booking' => ['required', 'integer', 'min:1', 'max:30'],
            'closed_days' => ['nullable', 'array'],
            'closed_days.*' => ['string', 'in:Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday'],
            'blackout_dates' => ['nullable', 'array'],
            'blackout_dates.*' => ['date'],
            'is_accepting_visits' => ['required', 'boolean'],
        ]);

        SystemSetting::setValue('shelter_visit_settings', $validated);

        AuditLog::log('shelter_visit_settings_update', 'Updated shelter visit capacity and operational schedule settings');

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Shelter visit configuration updated successfully.',
        ]);

        return redirect()->route('account.admin.adoption-management');
    }

    public function storeFollowUp(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'shelter_animal_id' => [
                'required',
                Rule::exists('shelter_animals', 'id')->where('status', ShelterAnimalStatus::Adopted->value),
            ],
            'follow_up_date' => ['required', 'date'],
            'method' => ['required', 'string', 'in:chat,call,photo_update,video,home_visit'],
            'status' => ['required', 'string', 'in:scheduled,completed,cancelled'],
            'pet_condition' => ['required', 'string', 'in:Excellent,Good,Fair,Needs Attention'],
            'notes' => ['required', 'string', 'max:2000'],
            'next_follow_up_date' => ['nullable', 'date'],
            'photo' => ['nullable', 'image', 'max:5120'],
        ]);

        $photoPath = null;
        if ($request->hasFile('photo')) {
            $photoPath = $request->file('photo')->store('follow-ups', 'public');
        }

        $nextFollowUpDate = $validated['next_follow_up_date'] ?? null;
        unset($validated['photo'], $validated['next_follow_up_date']);

        $latestApplication = AdoptionApplication::where('shelter_animal_id', $validated['shelter_animal_id'])
            ->where('status', AdoptionApplicationStatus::Approved)
            ->latest()
            ->first();

        $followUp = PostAdoptionFollowUp::create([
            ...$validated,
            'adoption_application_id' => $latestApplication?->id,
            'next_follow_up_date' => $nextFollowUpDate,
            'photo_path' => $photoPath,
            'conducted_by' => $request->user()?->id,
        ]);

        if (! empty($nextFollowUpDate)) {
            PostAdoptionFollowUp::create([
                'shelter_animal_id' => $validated['shelter_animal_id'],
                'adoption_application_id' => $latestApplication?->id,
                'follow_up_date' => $nextFollowUpDate,
                'method' => $validated['method'],
                'status' => 'scheduled',
                'pet_condition' => 'Good',
                'notes' => "Auto-scheduled check-in following up on check-in from {$validated['follow_up_date']}.",
                'conducted_by' => null,
            ]);
        }

        AuditLog::log('post_adoption_followup', "Recorded post-adoption follow-up for animal ID {$followUp->shelter_animal_id} via {$followUp->method}");

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Post-adoption follow-up recorded successfully.',
        ]);

        return redirect()->route('account.admin.adoption-management');
    }
}
