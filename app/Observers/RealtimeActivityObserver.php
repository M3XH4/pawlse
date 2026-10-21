<?php

namespace App\Observers;

use App\Models\AdoptionApplication;
use App\Models\Donation;
use App\Models\FosterCareUpdate;
use App\Models\FosterPlacement;
use App\Models\PetReport;
use App\Models\RehomingRequest;
use App\Models\ShelterVisit;
use App\Models\VolunteerApplication;
use App\Services\RealtimeEventBroadcaster;

class RealtimeActivityObserver
{
    public static function boot(): void
    {
        // 1. Adoption Application lifecycle
        AdoptionApplication::created(function (AdoptionApplication $app): void {
            RealtimeEventBroadcaster::publish(
                domain: 'adoption',
                action: 'submitted',
                title: 'New Adoption Application',
                message: "{$app->full_name} submitted an adoption application.",
                payload: ['id' => $app->id, 'pet_id' => $app->shelter_animal_id],
                targetRoles: ['admin', 'super-admin'],
            );
        });

        AdoptionApplication::updated(function (AdoptionApplication $app): void {
            if ($app->wasChanged('status')) {
                $status = $app->status instanceof \BackedEnum ? $app->status->value : (string) $app->status;
                RealtimeEventBroadcaster::publish(
                    domain: 'adoption',
                    action: 'status_updated',
                    title: 'Adoption Application Status Updated',
                    message: "Adoption application status changed to {$status}.",
                    payload: ['id' => $app->id, 'status' => $status],
                    targetRoles: ['admin', 'super-admin', 'user'],
                    targetUserId: $app->user_id,
                );
            }
        });

        // 2. Pet / Rescue / SOS Reports lifecycle
        PetReport::created(function (PetReport $report): void {
            RealtimeEventBroadcaster::publish(
                domain: 'rescue',
                action: 'submitted',
                title: 'New Rescue / Pet Report',
                message: "New {$report->type} report submitted at {$report->location}.",
                payload: ['id' => $report->id, 'type' => $report->type],
                targetRoles: ['admin', 'super-admin', 'volunteer'],
            );
        });

        PetReport::updated(function (PetReport $report): void {
            if ($report->wasChanged('status')) {
                RealtimeEventBroadcaster::publish(
                    domain: 'rescue',
                    action: 'status_updated',
                    title: 'Rescue Status Updated',
                    message: "Rescue report #{$report->id} status updated to {$report->status}.",
                    payload: ['id' => $report->id, 'status' => $report->status],
                    targetRoles: ['admin', 'super-admin', 'user', 'volunteer'],
                    targetUserId: $report->user_id,
                );
            }

            if ($report->wasChanged('assigned_volunteer_id') && $report->assigned_volunteer_id) {
                RealtimeEventBroadcaster::publish(
                    domain: 'volunteer',
                    action: 'assigned',
                    title: 'Rescue Mission Assigned',
                    message: "You have been assigned to rescue mission #{$report->id}.",
                    payload: ['id' => $report->id],
                    targetRoles: ['volunteer'],
                    targetUserId: $report->assigned_volunteer_id,
                );
            }
        });

        // 3. Donations lifecycle
        Donation::created(function (Donation $donation): void {
            RealtimeEventBroadcaster::publish(
                domain: 'donation',
                action: 'submitted',
                title: 'New Donation Received',
                message: "New donation of ₱{$donation->amount} received from {$donation->donor_name}.",
                payload: ['id' => $donation->id, 'type' => $donation->type],
                targetRoles: ['admin', 'super-admin'],
            );
        });

        Donation::updated(function (Donation $donation): void {
            if ($donation->wasChanged('status')) {
                RealtimeEventBroadcaster::publish(
                    domain: 'donation',
                    action: 'verified',
                    title: 'Donation Status Updated',
                    message: "Donation {$donation->public_reference} status is now {$donation->status}.",
                    payload: ['id' => $donation->id, 'status' => $donation->status],
                    targetRoles: ['admin', 'super-admin', 'user'],
                    targetUserId: $donation->user_id,
                );
            }
        });

        // 4. Volunteer Applications lifecycle
        VolunteerApplication::created(function (VolunteerApplication $app): void {
            RealtimeEventBroadcaster::publish(
                domain: 'volunteer',
                action: 'submitted',
                title: 'New Volunteer Application',
                message: "{$app->full_name} submitted a volunteer application.",
                payload: ['id' => $app->id],
                targetRoles: ['admin', 'super-admin'],
            );
        });

        VolunteerApplication::updated(function (VolunteerApplication $app): void {
            if ($app->wasChanged('status')) {
                RealtimeEventBroadcaster::publish(
                    domain: 'volunteer',
                    action: 'status_updated',
                    title: 'Volunteer Application Status Updated',
                    message: "Your volunteer application is now {$app->status}.",
                    payload: ['id' => $app->id, 'status' => $app->status],
                    targetRoles: ['admin', 'super-admin', 'user'],
                    targetUserId: $app->user_id,
                );
            }
        });

        // 5. Foster Care & Placements lifecycle
        FosterPlacement::saved(function (FosterPlacement $placement): void {
            RealtimeEventBroadcaster::publish(
                domain: 'foster',
                action: 'placement_updated',
                title: 'Foster Placement Updated',
                message: 'Foster placement records have been updated.',
                payload: ['id' => $placement->id, 'status' => $placement->status],
                targetRoles: ['admin', 'super-admin', 'volunteer', 'user'],
            );
        });

        FosterCareUpdate::created(function (FosterCareUpdate $update): void {
            RealtimeEventBroadcaster::publish(
                domain: 'foster',
                action: 'care_updated',
                title: 'New Foster Care Update',
                message: $update->is_emergency ? 'URGENT: Emergency foster update filed!' : 'New foster care update received.',
                payload: ['id' => $update->id, 'emergency' => (bool) $update->is_emergency],
                targetRoles: ['admin', 'super-admin'],
            );
        });

        // 6. Shelter Visits lifecycle
        ShelterVisit::created(function (ShelterVisit $visit): void {
            RealtimeEventBroadcaster::publish(
                domain: 'adoption',
                action: 'visit_submitted',
                title: 'New Shelter Visit Request',
                message: "{$visit->full_name} requested a shelter visit.",
                payload: ['id' => $visit->id],
                targetRoles: ['admin', 'super-admin'],
            );
        });

        ShelterVisit::updated(function (ShelterVisit $visit): void {
            if ($visit->wasChanged('status')) {
                RealtimeEventBroadcaster::publish(
                    domain: 'adoption',
                    action: 'visit_status_updated',
                    title: 'Shelter Visit Status Updated',
                    message: "Shelter visit status changed to {$visit->status}.",
                    payload: ['id' => $visit->id, 'status' => $visit->status],
                    targetRoles: ['admin', 'super-admin', 'user'],
                    targetUserId: $visit->user_id,
                );
            }
        });

        // 7. Rehoming Requests lifecycle
        RehomingRequest::created(function (RehomingRequest $rehoming): void {
            RealtimeEventBroadcaster::publish(
                domain: 'adoption',
                action: 'rehoming_submitted',
                title: 'New Rehoming Assistance Request',
                message: "{$rehoming->full_name} submitted a rehoming request for {$rehoming->animal_name}.",
                payload: ['id' => $rehoming->id],
                targetRoles: ['admin', 'super-admin'],
            );
        });

        RehomingRequest::updated(function (RehomingRequest $rehoming): void {
            if ($rehoming->wasChanged('status')) {
                RealtimeEventBroadcaster::publish(
                    domain: 'adoption',
                    action: 'rehoming_status_updated',
                    title: 'Rehoming Request Status Updated',
                    message: "Rehoming request for {$rehoming->animal_name} is now {$rehoming->status}.",
                    payload: ['id' => $rehoming->id, 'status' => $rehoming->status],
                    targetRoles: ['admin', 'super-admin', 'user'],
                    targetUserId: $rehoming->user_id,
                );
            }
        });
    }
}
