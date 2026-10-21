<?php

namespace App\Http\Controllers\Admin;

use App\Enums\Role;
use App\Enums\ShelterAnimalStatus;
use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\FosterCareUpdate;
use App\Models\FosterParent;
use App\Models\FosterPlacement;
use App\Models\ShelterAnimal;
use App\Models\User;
use App\Notifications\FosterCareUpdateAcknowledgedNotification;
use App\Notifications\FosterPlacementAssignedNotification;
use App\Notifications\FosterPlacementEndedNotification;
use App\Notifications\FosterPlacementTransferredNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class FosterManagementController extends Controller
{
    /**
     * Display the Foster Home Management dashboard.
     */
    public function index(Request $request): Response
    {
        $search = $request->input('search', '');
        $statusFilter = $request->input('status', 'all');

        // 1. Placements Query
        $placementsQuery = FosterPlacement::with([
            'shelterAnimal',
            'fosterParent.user',
            'fosterParentUser',
            'assignedBy',
            'transferredBy',
            'careUpdates',
        ])
            ->when($statusFilter !== 'all', function ($query) use ($statusFilter) {
                $query->where('status', $statusFilter);
            })
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($q) use ($search) {
                    $q->whereHas('shelterAnimal', function ($sq) use ($search) {
                        $sq->where('name', 'like', "%{$search}%")
                            ->orWhere('breed', 'like', "%{$search}%");
                    })->orWhereHas('fosterParentUser', function ($uq) use ($search) {
                        $uq->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    });
                });
            });

        $transformPlacement = function (FosterPlacement $p): array {
            return [
                'id' => $p->id,
                'shelter_animal_id' => $p->shelter_animal_id,
                'status' => $p->status,
                'start_date' => $p->start_date ? $p->start_date->toDateString() : null,
                'expected_review_date' => $p->expected_review_date ? $p->expected_review_date->toDateString() : null,
                'end_date' => $p->end_date ? $p->end_date->toDateString() : null,
                'care_instructions' => $p->care_instructions,
                'medical_notes' => $p->medical_notes,
                'dietary_requirements' => $p->dietary_requirements,
                'special_needs' => $p->special_needs,
                'placement_notes' => $p->placement_notes,
                'transfer_reason' => $p->transfer_reason,
                'end_reason' => $p->end_reason,
                'days_in_care' => $p->start_date ? max(0, (int) abs($p->start_date->diffInDays(now()))) : 0,
                'is_review_overdue' => $p->status === 'active' && $p->expected_review_date && $p->expected_review_date->isPast(),
                'updates_count' => $p->careUpdates->count(),
                'unacknowledged_updates_count' => $p->careUpdates->whereNull('acknowledged_at')->count(),
                'pet' => $p->shelterAnimal ? [
                    'id' => $p->shelterAnimal->id,
                    'name' => $p->shelterAnimal->name,
                    'type' => $p->shelterAnimal->type ? $p->shelterAnimal->type->value : null,
                    'breed' => $p->shelterAnimal->breed,
                    'age' => $p->shelterAnimal->age,
                    'photo_url' => $p->shelterAnimal->photo_url,
                    'status' => $p->shelterAnimal->status->value,
                ] : null,
                'foster_parent' => $p->fosterParentUser ? [
                    'id' => $p->fosterParentUser->id,
                    'name' => $p->fosterParentUser->name,
                    'email' => $p->fosterParentUser->email,
                    'phone' => $p->fosterParentUser->phone,
                    'avatar' => $p->fosterParentUser->avatar,
                    'role' => $p->fosterParentUser->role,
                ] : null,
                'assigned_by' => $p->assignedBy ? [
                    'id' => $p->assignedBy->id,
                    'name' => $p->assignedBy->name,
                ] : null,
                'transferred_by' => $p->transferredBy ? [
                    'id' => $p->transferredBy->id,
                    'name' => $p->transferredBy->name,
                ] : null,
            ];
        };

        $placements = $placementsQuery->latest()->paginate(10, ['*'], 'placements_page')->withQueryString()
            ->through($transformPlacement);

        $historyPlacements = FosterPlacement::with([
            'shelterAnimal',
            'fosterParent.user',
            'fosterParentUser',
            'assignedBy',
            'transferredBy',
            'careUpdates',
        ])
            ->where('status', '!=', 'active')
            ->latest()
            ->limit(50)
            ->get()
            ->map($transformPlacement)
            ->values();

        // 2. Foster Parents List (all registered foster homes with capacity statistics)
        $fosterParents = FosterParent::with(['user', 'approver', 'activePlacements.shelterAnimal'])
            ->latest()
            ->get()
            ->map(function (FosterParent $fp) {
                $activeCount = $fp->activePlacements->count();

                return [
                    'id' => $fp->id,
                    'user_id' => $fp->user_id,
                    'name' => $fp->user?->name ?? 'Unknown',
                    'email' => $fp->user?->email ?? '',
                    'phone' => $fp->user?->phone ?? '',
                    'avatar' => $fp->user?->avatar,
                    'user_role' => $fp->user?->role ?? 'user',
                    'status' => $fp->status,
                    'capacity' => $fp->capacity,
                    'location' => $fp->location,
                    'pet_preference' => $fp->pet_preference,
                    'housing_type' => $fp->housing_type,
                    'active_count' => $activeCount,
                    'remaining_capacity' => max(0, $fp->capacity - $activeCount),
                    'is_at_capacity' => $activeCount >= $fp->capacity,
                    'notes' => $fp->notes,
                    'approved_at' => $fp->approved_at ? $fp->approved_at->toDateString() : null,
                    'approver_name' => $fp->approver?->name,
                    'active_pets' => $fp->activePlacements->map(function ($placement) {
                        return [
                            'id' => $placement->shelterAnimal?->id,
                            'name' => $placement->shelterAnimal?->name,
                            'type' => $placement->shelterAnimal?->type?->value,
                            'placement_id' => $placement->id,
                        ];
                    }),
                ];
            });

        // 3. Available Shelter Pets (eligible for foster placement)
        $availablePets = ShelterAnimal::query()
            ->where('status', ShelterAnimalStatus::Available)
            ->latest()
            ->get()
            ->map(function (ShelterAnimal $pet) {
                return [
                    'id' => $pet->id,
                    'name' => $pet->name,
                    'type' => $pet->type ? $pet->type->value : null,
                    'breed' => $pet->breed,
                    'age' => $pet->age,
                    'photo_url' => $pet->photo_url,
                    'status' => $pet->status->value,
                    'behavior' => $pet->behavior,
                    'vaccinated' => $pet->vaccinated,
                ];
            });

        // 4. Eligible Users who can be registered/authorized as Foster Parents (Volunteers and Admins not yet registered)
        $existingFosterUserIds = FosterParent::pluck('user_id')->toArray();
        $eligibleUsers = User::query()
            ->whereIn('role', [Role::Volunteer->value, Role::Admin->value, Role::SuperAdmin->value])
            ->whereNotIn('id', $existingFosterUserIds)
            ->select(['id', 'name', 'email', 'role'])
            ->orderBy('name')
            ->get();

        // 5. Recent Care Reports & Concerns
        $careUpdates = FosterCareUpdate::with(['shelterAnimal', 'user', 'acknowledgedBy'])
            ->latest()
            ->limit(20)
            ->get()
            ->map(function (FosterCareUpdate $update) {
                return [
                    'id' => $update->id,
                    'foster_placement_id' => $update->foster_placement_id,
                    'shelter_animal_id' => $update->shelter_animal_id,
                    'pet_name' => $update->shelterAnimal?->name ?? 'Pet',
                    'pet_photo' => $update->shelterAnimal?->photo_url,
                    'author_name' => $update->user?->name ?? 'Foster Parent',
                    'author_email' => $update->user?->email,
                    'update_type' => $update->update_type,
                    'urgency' => $update->urgency,
                    'title' => $update->title,
                    'notes' => $update->notes,
                    'weight' => $update->weight,
                    'feeding_notes' => $update->feeding_notes,
                    'medication_notes' => $update->medication_notes,
                    'next_appointment_date' => $update->next_appointment_date ? $update->next_appointment_date->toDateString() : null,
                    'admin_notes' => $update->admin_notes,
                    'is_acknowledged' => $update->acknowledged_at !== null,
                    'acknowledged_at' => $update->acknowledged_at ? $update->acknowledged_at->toDateTimeString() : null,
                    'acknowledged_by_name' => $update->acknowledgedBy?->name,
                    'created_at' => $update->created_at->diffForHumans(),
                ];
            });

        // 6. Audit Trail for Foster Operations
        $auditLogs = AuditLog::with('user')
            ->where('action', 'like', 'foster_%')
            ->latest()
            ->limit(30)
            ->get()
            ->map(function (AuditLog $log) {
                return [
                    'id' => $log->id,
                    'action' => $log->action,
                    'description' => $log->description,
                    'user_name' => $log->user?->name ?? 'System',
                    'created_at' => $log->created_at->toDateTimeString(),
                    'metadata' => $log->metadata,
                ];
            });

        // 7. Metrics
        $activePlacementsCount = FosterPlacement::where('status', 'active')->count();
        $availablePetsCount = ShelterAnimal::where('status', ShelterAnimalStatus::Available)->count();
        $approvedFosterParentsCount = FosterParent::where('status', 'approved')->count();
        $parentsAtCapacityCount = $fosterParents->filter(fn ($p) => $p['status'] === 'approved' && $p['is_at_capacity'])->count();
        $overdueOrUrgentCount = FosterPlacement::where('status', 'active')
            ->whereNotNull('expected_review_date')
            ->where('expected_review_date', '<=', now()->toDateString())
            ->count() + FosterCareUpdate::whereNull('acknowledged_at')->whereIn('urgency', ['high', 'critical'])->count();

        return Inertia::render('admin/foster-management', [
            'metrics' => [
                'active_placements_count' => $activePlacementsCount,
                'available_pets_count' => $availablePetsCount,
                'approved_foster_parents_count' => $approvedFosterParentsCount,
                'parents_at_capacity_count' => $parentsAtCapacityCount,
                'needs_attention_count' => $overdueOrUrgentCount,
            ],
            'placements' => $placements,
            'historyPlacements' => $historyPlacements,
            'fosterParents' => $fosterParents,
            'availablePets' => $availablePets,
            'eligibleUsers' => $eligibleUsers,
            'careUpdates' => $careUpdates,
            'auditLogs' => $auditLogs,
            'filters' => [
                'search' => $search,
                'status' => $statusFilter,
            ],
        ]);
    }

    /**
     * Authorize or register a user as a Foster Parent.
     */
    public function storeFosterParent(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'user_id' => ['required', 'exists:users,id', 'unique:foster_parents,user_id'],
            'capacity' => ['required', 'integer', 'min:1', 'max:20'],
            'location' => ['nullable', 'string', 'max:255'],
            'pet_preference' => ['nullable', 'string', 'in:dogs,cats,both'],
            'housing_type' => ['nullable', 'string', 'max:255'],
            'notes' => ['nullable', 'string', 'max:2000'],
            'status' => ['required', 'in:approved,pending'],
        ]);

        $user = User::findOrFail($validated['user_id']);

        $fosterParent = FosterParent::create([
            'user_id' => $user->id,
            'status' => $validated['status'],
            'capacity' => $validated['capacity'],
            'location' => $validated['location'] ?? null,
            'pet_preference' => $validated['pet_preference'] ?? null,
            'housing_type' => $validated['housing_type'] ?? null,
            'notes' => $validated['notes'] ?? null,
            'approved_by' => $validated['status'] === 'approved' ? $request->user()->id : null,
            'approved_at' => $validated['status'] === 'approved' ? now() : null,
        ]);

        AuditLog::log(
            'foster_parent_authorize',
            "Authorized {$user->name} as a foster parent at ".($validated['location'] ?? 'unspecified location')." with capacity of {$validated['capacity']}",
            ['foster_parent_id' => $fosterParent->id, 'user_id' => $user->id, 'capacity' => $validated['capacity'], 'location' => $validated['location'] ?? null]
        );

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => "{$user->name} has been approved as an authorized foster parent.",
        ]);

        return redirect()->back();
    }

    /**
     * Update foster parent profile (capacity, status, location, notes).
     */
    public function updateFosterParent(Request $request, FosterParent $fosterParent): RedirectResponse
    {
        $validated = $request->validate([
            'capacity' => ['required', 'integer', 'min:1', 'max:20'],
            'location' => ['nullable', 'string', 'max:255'],
            'pet_preference' => ['nullable', 'string', 'in:dogs,cats,both'],
            'housing_type' => ['nullable', 'string', 'max:255'],
            'status' => ['required', 'in:approved,pending,suspended,inactive'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ]);

        $activePlacementsCount = $fosterParent->activePlacementsCount();
        if ($validated['capacity'] < $activePlacementsCount) {
            return redirect()->back()->withErrors([
                'capacity' => "Cannot set capacity below currently active placements ({$activePlacementsCount}).",
            ]);
        }

        $oldStatus = $fosterParent->status;
        $fosterParent->update([
            'capacity' => $validated['capacity'],
            'location' => array_key_exists('location', $validated) ? $validated['location'] : $fosterParent->location,
            'pet_preference' => array_key_exists('pet_preference', $validated) ? $validated['pet_preference'] : $fosterParent->pet_preference,
            'housing_type' => array_key_exists('housing_type', $validated) ? $validated['housing_type'] : $fosterParent->housing_type,
            'status' => $validated['status'],
            'notes' => $validated['notes'] ?? null,
            'approved_by' => ($oldStatus !== 'approved' && $validated['status'] === 'approved') ? $request->user()->id : $fosterParent->approved_by,
            'approved_at' => ($oldStatus !== 'approved' && $validated['status'] === 'approved') ? now() : $fosterParent->approved_at,
        ]);

        AuditLog::log(
            'foster_parent_update',
            "Updated foster parent profile for {$fosterParent->user?->name}",
            ['foster_parent_id' => $fosterParent->id, 'status' => $validated['status'], 'capacity' => $validated['capacity']]
        );

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Foster parent profile updated successfully.',
        ]);

        return redirect()->back();
    }

    /**
     * Assign an available pet to an eligible foster parent.
     */
    public function assign(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'shelter_animal_id' => ['required', 'exists:shelter_animals,id'],
            'foster_parent_id' => ['required', 'exists:foster_parents,id'],
            'start_date' => ['required', 'date'],
            'expected_review_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'care_instructions' => ['nullable', 'string', 'max:3000'],
            'medical_notes' => ['nullable', 'string', 'max:3000'],
            'dietary_requirements' => ['nullable', 'string', 'max:3000'],
            'special_needs' => ['nullable', 'string', 'max:3000'],
            'placement_notes' => ['nullable', 'string', 'max:3000'],
        ]);

        return DB::transaction(function () use ($validated, $request) {
            // Lock animal for update to prevent concurrent duplicate assignment
            $animal = ShelterAnimal::where('id', $validated['shelter_animal_id'])
                ->lockForUpdate()
                ->firstOrFail();

            if ($animal->status !== ShelterAnimalStatus::Available) {
                return redirect()->back()->withErrors([
                    'shelter_animal_id' => "Pet '{$animal->name}' is not currently available for foster placement (Current status: {$animal->status->value}).",
                ]);
            }

            // Lock foster parent
            $fosterParent = FosterParent::with('user')
                ->where('id', $validated['foster_parent_id'])
                ->lockForUpdate()
                ->firstOrFail();

            if (! $fosterParent->isApproved()) {
                return redirect()->back()->withErrors([
                    'foster_parent_id' => "Selected foster parent is not currently in approved status ({$fosterParent->status}).",
                ]);
            }

            $currentActiveCount = FosterPlacement::where('foster_parent_id', $fosterParent->id)
                ->where('status', 'active')
                ->count();

            if ($currentActiveCount >= $fosterParent->capacity) {
                return redirect()->back()->withErrors([
                    'foster_parent_id' => "Foster parent {$fosterParent->user?->name} is at maximum capacity ({$currentActiveCount}/{$fosterParent->capacity} pets).",
                ]);
            }

            // Create placement
            $placement = FosterPlacement::create([
                'shelter_animal_id' => $animal->id,
                'foster_parent_id' => $fosterParent->id,
                'foster_parent_user_id' => $fosterParent->user_id,
                'status' => 'active',
                'start_date' => $validated['start_date'],
                'expected_review_date' => $validated['expected_review_date'] ?? null,
                'care_instructions' => $validated['care_instructions'] ?? null,
                'medical_notes' => $validated['medical_notes'] ?? null,
                'dietary_requirements' => $validated['dietary_requirements'] ?? null,
                'special_needs' => $validated['special_needs'] ?? null,
                'placement_notes' => $validated['placement_notes'] ?? null,
                'assigned_by' => $request->user()->id,
            ]);

            // Update animal status to Foster
            $animal->update([
                'status' => ShelterAnimalStatus::Foster,
            ]);

            // Notify foster parent
            $fosterParent->user?->notify(new FosterPlacementAssignedNotification($placement));

            AuditLog::log(
                'foster_assign',
                "Assigned pet '{$animal->name}' to foster parent {$fosterParent->user?->name}",
                ['placement_id' => $placement->id, 'animal_id' => $animal->id, 'foster_parent_id' => $fosterParent->id]
            );

            Inertia::flash('toast', [
                'type' => 'success',
                'message' => "Pet '{$animal->name}' successfully assigned to {$fosterParent->user?->name}.",
            ]);

            return redirect()->back();
        });
    }

    /**
     * Transfer an active placement to another approved foster parent.
     */
    public function transfer(Request $request, FosterPlacement $placement): RedirectResponse
    {
        $validated = $request->validate([
            'destination_foster_parent_id' => ['required', 'exists:foster_parents,id'],
            'transfer_reason' => ['required', 'string', 'min:5', 'max:2000'],
            'expected_review_date' => ['nullable', 'date'],
            'updated_care_instructions' => ['nullable', 'string', 'max:3000'],
        ]);

        return DB::transaction(function () use ($validated, $request, $placement) {
            // Lock placement and pet
            $activePlacement = FosterPlacement::where('id', $placement->id)
                ->lockForUpdate()
                ->firstOrFail();

            if ($activePlacement->status !== 'active') {
                return redirect()->back()->withErrors([
                    'transfer_reason' => 'Only active placements can be transferred.',
                ]);
            }

            if ($activePlacement->foster_parent_id === (int) $validated['destination_foster_parent_id']) {
                return redirect()->back()->withErrors([
                    'destination_foster_parent_id' => 'Destination foster parent must be different from current caretaker.',
                ]);
            }

            $destinationParent = FosterParent::with('user')
                ->where('id', $validated['destination_foster_parent_id'])
                ->lockForUpdate()
                ->firstOrFail();

            if (! $destinationParent->isApproved()) {
                return redirect()->back()->withErrors([
                    'destination_foster_parent_id' => 'Destination foster parent is not in approved status.',
                ]);
            }

            $destActiveCount = FosterPlacement::where('foster_parent_id', $destinationParent->id)
                ->where('status', 'active')
                ->count();

            if ($destActiveCount >= $destinationParent->capacity) {
                return redirect()->back()->withErrors([
                    'destination_foster_parent_id' => "Destination foster parent {$destinationParent->user?->name} is at maximum capacity ({$destActiveCount}/{$destinationParent->capacity} pets).",
                ]);
            }

            $animal = ShelterAnimal::where('id', $activePlacement->shelter_animal_id)
                ->lockForUpdate()
                ->firstOrFail();

            $oldParentUser = $activePlacement->fosterParentUser;

            // Mark old placement as transferred
            $activePlacement->update([
                'status' => 'transferred',
                'end_date' => now()->toDateString(),
                'transfer_reason' => $validated['transfer_reason'],
                'transferred_by' => $request->user()->id,
            ]);

            // Create new placement linking to previous
            $newPlacement = FosterPlacement::create([
                'shelter_animal_id' => $animal->id,
                'foster_parent_id' => $destinationParent->id,
                'foster_parent_user_id' => $destinationParent->user_id,
                'status' => 'active',
                'start_date' => now()->toDateString(),
                'expected_review_date' => $validated['expected_review_date'] ?? $activePlacement->expected_review_date,
                'care_instructions' => $validated['updated_care_instructions'] ?? $activePlacement->care_instructions,
                'medical_notes' => $activePlacement->medical_notes,
                'dietary_requirements' => $activePlacement->dietary_requirements,
                'special_needs' => $activePlacement->special_needs,
                'placement_notes' => "Transferred from {$oldParentUser?->name}. Reason: {$validated['transfer_reason']}",
                'transfer_reason' => $validated['transfer_reason'],
                'assigned_by' => $request->user()->id,
                'transferred_by' => $request->user()->id,
                'previous_placement_id' => $activePlacement->id,
            ]);

            // Notify both foster parents
            $oldParentUser?->notify(new FosterPlacementTransferredNotification($activePlacement, 'outgoing'));
            $destinationParent->user?->notify(new FosterPlacementTransferredNotification($newPlacement, 'incoming'));

            AuditLog::log(
                'foster_transfer',
                "Transferred pet '{$animal->name}' from {$oldParentUser?->name} to {$destinationParent->user?->name}. Reason: {$validated['transfer_reason']}",
                [
                    'previous_placement_id' => $activePlacement->id,
                    'new_placement_id' => $newPlacement->id,
                    'animal_id' => $animal->id,
                    'from_user_id' => $oldParentUser?->id,
                    'to_user_id' => $destinationParent->user_id,
                ]
            );

            Inertia::flash('toast', [
                'type' => 'success',
                'message' => "Pet '{$animal->name}' successfully transferred to {$destinationParent->user?->name}.",
            ]);

            return redirect()->back();
        });
    }

    /**
     * Conclude a foster placement and return pet to shelter / designate new state.
     */
    public function endPlacement(Request $request, FosterPlacement $placement): RedirectResponse
    {
        $validated = $request->validate([
            'end_reason' => ['required', 'string', 'min:5', 'max:2000'],
            'target_status' => ['required', 'in:available,adopted,pending'],
        ]);

        return DB::transaction(function () use ($validated, $placement) {
            $activePlacement = FosterPlacement::where('id', $placement->id)
                ->lockForUpdate()
                ->firstOrFail();

            if ($activePlacement->status !== 'active') {
                return redirect()->back()->withErrors([
                    'end_reason' => 'This placement is not active.',
                ]);
            }

            $animal = ShelterAnimal::where('id', $activePlacement->shelter_animal_id)
                ->lockForUpdate()
                ->firstOrFail();

            $activePlacement->update([
                'status' => 'ended',
                'end_date' => now()->toDateString(),
                'end_reason' => $validated['end_reason'],
            ]);

            if ($validated['target_status'] === 'adopted') {
                $fosterUser = $activePlacement->fosterParentUser ?? $activePlacement->fosterParent?->user;
                $animal->update([
                    'status' => ShelterAnimalStatus::Adopted,
                    'adoption_date' => now(),
                    'adopter_name' => $fosterUser?->name ?? 'Foster Parent',
                    'adopter_email' => $fosterUser?->email,
                    'adopter_phone' => $fosterUser?->phone,
                ]);
            } else {
                $animal->update([
                    'status' => ShelterAnimalStatus::from($validated['target_status']),
                    'adopter_name' => null,
                    'adopter_email' => null,
                    'adopter_phone' => null,
                    'adoption_date' => null,
                ]);
            }

            $activePlacement->fosterParentUser?->notify(new FosterPlacementEndedNotification($activePlacement));

            AuditLog::log(
                'foster_end',
                "Ended foster placement for pet '{$animal->name}' (Returned as {$validated['target_status']}). Reason: {$validated['end_reason']}",
                ['placement_id' => $activePlacement->id, 'animal_id' => $animal->id, 'target_status' => $validated['target_status']]
            );

            Inertia::flash('toast', [
                'type' => 'success',
                'message' => "Foster placement for {$animal->name} has concluded. Pet status set to {$validated['target_status']}.",
            ]);

            return redirect()->back();
        });
    }

    /**
     * Update instructions and medical notes for an active placement.
     */
    public function updateInstructions(Request $request, FosterPlacement $placement): RedirectResponse
    {
        $validated = $request->validate([
            'care_instructions' => ['nullable', 'string', 'max:3000'],
            'medical_notes' => ['nullable', 'string', 'max:3000'],
            'dietary_requirements' => ['nullable', 'string', 'max:3000'],
            'special_needs' => ['nullable', 'string', 'max:3000'],
            'expected_review_date' => ['nullable', 'date'],
        ]);

        $placement->update($validated);

        AuditLog::log(
            'foster_instructions_update',
            "Updated foster care instructions for placement ID {$placement->id} ({$placement->shelterAnimal?->name})",
            ['placement_id' => $placement->id]
        );

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Care instructions updated successfully.',
        ]);

        return redirect()->back();
    }

    /**
     * Admin review / response to a foster care update or emergency concern.
     */
    public function acknowledgeUpdate(Request $request, FosterCareUpdate $update): RedirectResponse
    {
        $validated = $request->validate([
            'admin_notes' => ['required', 'string', 'max:2000'],
        ]);

        $update->update([
            'admin_notes' => $validated['admin_notes'],
            'acknowledged_by' => $request->user()->id,
            'acknowledged_at' => now(),
        ]);

        $update->user?->notify(new FosterCareUpdateAcknowledgedNotification($update));

        AuditLog::log(
            'foster_update_acknowledge',
            "Acknowledged care update #{$update->id} for pet '{$update->shelterAnimal?->name}'",
            ['update_id' => $update->id, 'animal_id' => $update->shelter_animal_id]
        );

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Care report response saved and sent to foster parent.',
        ]);

        return redirect()->back();
    }
}
