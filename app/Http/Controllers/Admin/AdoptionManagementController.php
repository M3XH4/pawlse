<?php

namespace App\Http\Controllers\Admin;

use App\Enums\AdoptionApplicationStatus;
use App\Enums\ShelterAnimalStatus;
use App\Http\Controllers\Controller;
use App\Models\AdoptionApplication;
use App\Models\AuditLog;
use App\Models\ShelterAnimal;
use App\Notifications\AdoptionApplicationStatusUpdatedNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
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
                            'priority' => $need->priority,
                            'status' => $need->status,
                        ];
                    }),
                ];
            });

        return Inertia::render('admin/adoption-management', [
            'applications' => $applications,
            'pets' => $pets,
        ]);
    }

    public function updateStatus(Request $request, AdoptionApplication $application): RedirectResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'string', 'in:approved,rejected,scheduled'],
            'rejection_reason' => ['required_if:status,rejected', 'nullable', 'string', 'max:1000'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $application->update([
            'status' => AdoptionApplicationStatus::from($validated['status']),
            'rejection_reason' => $validated['rejection_reason'] ?? null,
            'notes' => $validated['notes'] ?? $application->notes,
        ]);

        if ($validated['status'] === 'approved') {
            $application->shelterAnimal->update([
                'status' => ShelterAnimalStatus::Adopted,
            ]);
        } elseif ($validated['status'] === 'scheduled') {
            $application->shelterAnimal->update([
                'status' => ShelterAnimalStatus::Pending,
            ]);
        }

        $application->user?->notify(new AdoptionApplicationStatusUpdatedNotification($application));

        AuditLog::log('adoption_application_update', "Updated status of adoption application ID {$application->id} to {$validated['status']}");

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Application status updated successfully.',
        ]);

        return redirect()->route('account.admin.adoption-management');
    }
}
