<?php

namespace App\Listeners;

use App\Events\VolunteerApplicationApprovedEvent;
use App\Events\VolunteerApplicationRejectedEvent;
use App\Events\VolunteerApplicationSubmittedEvent;
use App\Jobs\SendN8nWebhookJob;
use Illuminate\Events\Dispatcher;

class DispatchN8nVolunteerWebhook
{
    /**
     * Handle volunteer application submission event.
     */
    public function handleSubmitted(VolunteerApplicationSubmittedEvent $event): void
    {
        $app = $event->application;

        SendN8nWebhookJob::dispatch('volunteer.application.submitted', [
            'application_id' => $app->id,
            'reference_number' => $app->reference_number,
            'user_id' => $app->user_id,
            'full_name' => $app->full_name,
            'email' => $app->email,
            'role' => $app->role,
            'submitted_at' => $app->created_at?->toIso8601String() ?? now()->toIso8601String(),
        ]);
    }

    /**
     * Handle volunteer application approval event.
     */
    public function handleApproved(VolunteerApplicationApprovedEvent $event): void
    {
        $app = $event->application;

        SendN8nWebhookJob::dispatch('volunteer.application.approved', [
            'application_id' => $app->id,
            'reference_number' => $app->reference_number,
            'user_id' => $app->user_id,
            'full_name' => $app->full_name,
            'email' => $app->email,
            'role' => $app->role,
            'status' => 'approved',
            'reviewed_at' => now()->toIso8601String(),
        ]);
    }

    /**
     * Handle volunteer application rejection event.
     */
    public function handleRejected(VolunteerApplicationRejectedEvent $event): void
    {
        $app = $event->application;

        SendN8nWebhookJob::dispatch('volunteer.application.rejected', [
            'application_id' => $app->id,
            'reference_number' => $app->reference_number,
            'user_id' => $app->user_id,
            'full_name' => $app->full_name,
            'email' => $app->email,
            'role' => $app->role,
            'status' => 'rejected',
            'rejection_reason' => $app->rejection_reason,
            'reviewed_at' => now()->toIso8601String(),
        ]);
    }

    /**
     * Register the listeners for the subscriber.
     */
    public function subscribe(Dispatcher $events): array
    {
        return [
            VolunteerApplicationSubmittedEvent::class => 'handleSubmitted',
            VolunteerApplicationApprovedEvent::class => 'handleApproved',
            VolunteerApplicationRejectedEvent::class => 'handleRejected',
        ];
    }
}
