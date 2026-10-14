<?php

namespace App\Http\Controllers;

use App\Enums\Role;
use App\Models\AuditLog;
use App\Models\FosterCareUpdate;
use App\Models\FosterParent;
use App\Models\FosterPlacement;
use App\Models\User;
use App\Notifications\FosterCareEmergencyNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FosterCareController extends Controller
{
    /**
     * Display My Foster Pets / Foster Care dashboard for authorized foster parents.
     */
    public function index(Request $request): Response|RedirectResponse
    {
        $user = $request->user();
        $isAdmin = $user->hasRole(Role::Admin->value) || $user->hasRole(Role::SuperAdmin->value);

        if (! $user->isApprovedFosterParent()) {
            if ($isAdmin) {
                return redirect()->route('account.admin.foster-management')
                    ->with('toast', [
                        'type' => 'info',
                        'message' => 'You are not currently authorized as an active foster parent. You can authorize your account in Foster Home Management.',
                    ]);
            }

            return redirect()->route('account.volunteer.status')
                ->with('toast', [
                    'type' => 'error',
                    'message' => 'You must be an approved foster parent to access the foster care dashboard.',
                ]);
        }

        // Check foster parent profile
        $fosterParent = FosterParent::where('user_id', $user->id)->first();

        // Active placements assigned to this user
        $activePlacements = FosterPlacement::with(['shelterAnimal', 'assignedBy', 'careUpdates'])
            ->where('foster_parent_user_id', $user->id)
            ->where('status', 'active')
            ->latest('start_date')
            ->get()
            ->map(function (FosterPlacement $p) {
                return [
                    'id' => $p->id,
                    'status' => $p->status,
                    'start_date' => $p->start_date ? $p->start_date->toDateString() : null,
                    'expected_review_date' => $p->expected_review_date ? $p->expected_review_date->toDateString() : null,
                    'care_instructions' => $p->care_instructions,
                    'medical_notes' => $p->medical_notes,
                    'dietary_requirements' => $p->dietary_requirements,
                    'special_needs' => $p->special_needs,
                    'placement_notes' => $p->placement_notes,
                    'days_in_care' => $p->start_date ? max(0, (int) abs($p->start_date->diffInDays(now()))) : 0,
                    'is_review_near_or_overdue' => $p->expected_review_date ? $p->expected_review_date->diffInDays(now(), false) >= -3 : false,
                    'pet' => $p->shelterAnimal ? [
                        'id' => $p->shelterAnimal->id,
                        'name' => $p->shelterAnimal->name,
                        'type' => $p->shelterAnimal->type ? $p->shelterAnimal->type->value : null,
                        'breed' => $p->shelterAnimal->breed,
                        'age' => $p->shelterAnimal->age,
                        'gender' => $p->shelterAnimal->gender ? $p->shelterAnimal->gender->value : null,
                        'color' => $p->shelterAnimal->color,
                        'behavior' => $p->shelterAnimal->behavior,
                        'vaccinated' => $p->shelterAnimal->vaccinated,
                        'photo_url' => $p->shelterAnimal->photo_url,
                        'story' => $p->shelterAnimal->story,
                    ] : null,
                    'assigned_by' => $p->assignedBy ? [
                        'id' => $p->assignedBy->id,
                        'name' => $p->assignedBy->name,
                    ] : null,
                    'recent_updates' => $p->careUpdates->sortByDesc('created_at')->values()->take(5)->map(function ($u) {
                        return [
                            'id' => $u->id,
                            'title' => $u->title,
                            'update_type' => $u->update_type,
                            'urgency' => $u->urgency,
                            'notes' => $u->notes,
                            'weight' => $u->weight,
                            'feeding_notes' => $u->feeding_notes,
                            'medication_notes' => $u->medication_notes,
                            'next_appointment_date' => $u->next_appointment_date ? $u->next_appointment_date->toDateString() : null,
                            'admin_notes' => $u->admin_notes,
                            'is_acknowledged' => $u->acknowledged_at !== null,
                            'created_at' => $u->created_at->diffForHumans(),
                        ];
                    }),
                ];
            });

        // Past placement history for this user
        $historyPlacements = FosterPlacement::with(['shelterAnimal'])
            ->where('foster_parent_user_id', $user->id)
            ->whereIn('status', ['transferred', 'ended', 'cancelled'])
            ->latest('end_date')
            ->get()
            ->map(function (FosterPlacement $p) {
                return [
                    'id' => $p->id,
                    'status' => $p->status,
                    'start_date' => $p->start_date ? $p->start_date->toDateString() : null,
                    'end_date' => $p->end_date ? $p->end_date->toDateString() : null,
                    'transfer_reason' => $p->transfer_reason,
                    'end_reason' => $p->end_reason,
                    'pet' => $p->shelterAnimal ? [
                        'id' => $p->shelterAnimal->id,
                        'name' => $p->shelterAnimal->name,
                        'type' => $p->shelterAnimal->type ? $p->shelterAnimal->type->value : null,
                        'breed' => $p->shelterAnimal->breed,
                        'photo_url' => $p->shelterAnimal->photo_url,
                    ] : null,
                ];
            });

        // Determine context/layout theme: if user is admin viewing personal foster pets
        $isAdmin = $user->hasRole(Role::Admin->value) || $user->hasRole(Role::SuperAdmin->value);
        $theme = $isAdmin ? 'admin' : 'volunteer';
        $page = $isAdmin ? 'admin/my-foster-pets' : 'volunteer/foster-care';

        return Inertia::render($page, [
            'fosterParent' => $fosterParent ? [
                'id' => $fosterParent->id,
                'status' => $fosterParent->status,
                'capacity' => $fosterParent->capacity,
                'location' => $fosterParent->location,
                'pet_preference' => $fosterParent->pet_preference,
                'housing_type' => $fosterParent->housing_type,
                'active_count' => $activePlacements->count(),
                'remaining_capacity' => max(0, $fosterParent->capacity - $activePlacements->count()),
                'notes' => $fosterParent->notes,
                'approved_at' => $fosterParent->approved_at ? $fosterParent->approved_at->toDateString() : null,
            ] : null,
            'activePlacements' => $activePlacements,
            'historyPlacements' => $historyPlacements,
            'theme' => $theme,
            'isAdmin' => $isAdmin,
        ]);
    }

    /**
     * Submit a routine care log, medical note, behavioral update, or emergency concern.
     */
    public function storeUpdate(Request $request, FosterPlacement $placement): RedirectResponse
    {
        $user = $request->user();

        // Enforce authorization: only the caretaker assigned to this placement can post updates
        if ($placement->foster_parent_user_id !== $user->id) {
            abort(403, 'Unauthorized. You can only submit care updates for your own assigned foster pets.');
        }

        if ($placement->status !== 'active') {
            return redirect()->back()->withErrors([
                'title' => 'Cannot submit care updates for inactive placements.',
            ]);
        }

        $validated = $request->validate([
            'update_type' => ['required', 'string', 'in:routine,medical,behavioral,emergency,milestone'],
            'urgency' => ['required', 'string', 'in:low,medium,high,critical'],
            'title' => ['required', 'string', 'min:3', 'max:255'],
            'notes' => ['required', 'string', 'min:5', 'max:5000'],
            'weight' => ['nullable', 'string', 'max:50'],
            'feeding_notes' => ['nullable', 'string', 'max:1000'],
            'medication_notes' => ['nullable', 'string', 'max:1000'],
            'next_appointment_date' => ['nullable', 'date'],
        ]);

        $update = FosterCareUpdate::create([
            'foster_placement_id' => $placement->id,
            'shelter_animal_id' => $placement->shelter_animal_id,
            'user_id' => $user->id,
            'update_type' => $validated['update_type'],
            'urgency' => $validated['urgency'],
            'title' => $validated['title'],
            'notes' => $validated['notes'],
            'weight' => $validated['weight'] ?? null,
            'feeding_notes' => $validated['feeding_notes'] ?? null,
            'medication_notes' => $validated['medication_notes'] ?? null,
            'next_appointment_date' => $validated['next_appointment_date'] ?? null,
        ]);

        // If emergency or high/critical urgency, notify all shelter administrators immediately
        if ($update->isEmergency()) {
            $admins = User::whereIn('role', [Role::Admin->value, Role::SuperAdmin->value])->get();
            foreach ($admins as $admin) {
                $admin->notify(new FosterCareEmergencyNotification($update));
            }
        }

        AuditLog::log(
            'foster_care_update',
            "Foster parent {$user->name} submitted a {$validated['urgency']} priority {$validated['update_type']} update for '{$placement->shelterAnimal?->name}': '{$validated['title']}'",
            ['placement_id' => $placement->id, 'update_id' => $update->id, 'animal_id' => $placement->shelter_animal_id]
        );

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => $update->isEmergency()
                ? 'Emergency alert logged and coordinators notified immediately.'
                : 'Care report submitted successfully.',
        ]);

        return redirect()->back();
    }

    /**
     * Submit an application to become a Foster Parent from the volunteer dashboard.
     */
    public function applyFoster(Request $request): RedirectResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'capacity' => ['required', 'integer', 'min:1', 'max:10'],
            'location' => ['required', 'string', 'min:3', 'max:255'],
            'pet_preference' => ['required', 'string', 'in:dogs,cats,both'],
            'housing_type' => ['required', 'string', 'max:255'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ]);

        $fosterParent = FosterParent::updateOrCreate(
            ['user_id' => $user->id],
            [
                'status' => 'pending',
                'capacity' => $validated['capacity'],
                'location' => $validated['location'],
                'pet_preference' => $validated['pet_preference'],
                'housing_type' => $validated['housing_type'],
                'notes' => $validated['notes'] ?? null,
            ]
        );

        AuditLog::log(
            'foster_application_submit',
            "Volunteer {$user->name} submitted an application to become a foster parent (Location: {$validated['location']}, Capacity: {$validated['capacity']})",
            ['foster_parent_id' => $fosterParent->id, 'user_id' => $user->id, 'location' => $validated['location']]
        );

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Your foster parent application has been submitted! Our shelter coordinators will review your home details and reach out shortly.',
        ]);

        return redirect()->back();
    }
}
