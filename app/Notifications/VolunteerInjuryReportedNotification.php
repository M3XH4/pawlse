<?php

namespace App\Notifications;

use App\Models\VolunteerInjuryReport;
use App\Notifications\Concerns\RendersBrandedMail;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class VolunteerInjuryReportedNotification extends Notification implements ShouldQueue
{
    use Queueable;
    use RendersBrandedMail;

    public function __construct(public VolunteerInjuryReport $injuryReport) {}

    public function toMail(object $notifiable): MailMessage
    {
        $this->injuryReport->loadMissing('user');
        $incidentLabel = VolunteerInjuryReport::INCIDENT_TYPES[$this->injuryReport->incident_type] ?? $this->injuryReport->incident_type;
        $severityLabel = VolunteerInjuryReport::SEVERITIES[$this->injuryReport->severity] ?? $this->injuryReport->severity;

        return $this->buildBrandedMail(
            notifiable: $notifiable,
            summaryItems: [
                ['label' => 'Volunteer', 'value' => $this->injuryReport->user?->name ?? 'Volunteer'],
                ['label' => 'Incident Type', 'value' => $incidentLabel],
                ['label' => 'Severity', 'value' => $severityLabel],
                ['label' => 'Location', 'value' => $this->injuryReport->location ?: 'Field Location'],
            ],
            actionText: 'Review & Initiate Medical Aid',
            level: 'warning',
            categoryBadge: 'FIELD INJURY REPORT',
        );
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $this->injuryReport->loadMissing('user');
        $incidentLabel = VolunteerInjuryReport::INCIDENT_TYPES[$this->injuryReport->incident_type] ?? $this->injuryReport->incident_type;
        $volunteerName = $this->injuryReport->user?->name ?? 'A volunteer';

        return [
            'title' => 'Field Injury Reported',
            'message' => "{$volunteerName} reported a {$this->injuryReport->severity} {$incidentLabel} while in the field.",
            'description' => "Severity: {$this->injuryReport->severity}. Please review and initiate medical aid.",
            'url' => '/account/admin/volunteer-management?tab=injuries',
            'icon' => 'alert',
            'category' => 'volunteer_injury',
            'injury_report_id' => $this->injuryReport->id,
        ];
    }
}
