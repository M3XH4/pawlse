<?php

namespace App\Notifications;

use App\Models\VolunteerInjuryReport;
use App\Notifications\Concerns\RendersBrandedMail;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class VolunteerMedicalAidUpdatedNotification extends Notification implements ShouldQueue
{
    use Queueable;
    use RendersBrandedMail;

    public function __construct(public VolunteerInjuryReport $injuryReport) {}

    public function toMail(object $notifiable): MailMessage
    {
        $isConfirmed = $this->injuryReport->status === VolunteerInjuryReport::StatusConfirmed;
        $aidLabel = VolunteerInjuryReport::MEDICAL_AID_TYPES[$this->injuryReport->medical_aid_type] ?? ($this->injuryReport->medical_aid_type ?: 'Medical Aid');

        return $this->buildBrandedMail(
            notifiable: $notifiable,
            summaryItems: [
                ['label' => 'Status', 'value' => $isConfirmed ? 'Medical Aid Confirmed' : 'Medical Aid Initiated'],
                ['label' => 'Aid Type', 'value' => $aidLabel],
                ['label' => 'Facility / Provider', 'value' => $this->injuryReport->medical_facility ?: 'Shelter Medical Team'],
            ],
            actionText: 'View Injury Report',
            level: $isConfirmed ? 'success' : 'primary',
            categoryBadge: 'MEDICAL AID UPDATE',
        );
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $isConfirmed = $this->injuryReport->status === VolunteerInjuryReport::StatusConfirmed;
        $aidLabel = VolunteerInjuryReport::MEDICAL_AID_TYPES[$this->injuryReport->medical_aid_type] ?? ($this->injuryReport->medical_aid_type ?: 'Medical Aid');

        return [
            'title' => $isConfirmed ? 'Medical Aid Confirmed' : 'Medical Aid Initiated',
            'message' => $isConfirmed
                ? "Your field injury report (#{$this->injuryReport->id}) medical aid has been confirmed."
                : "Medical aid ({$aidLabel}) has been initiated for your field injury report (#{$this->injuryReport->id}).",
            'description' => $this->injuryReport->medical_aid_notes ?: 'Check your Field Injury Reports page for details.',
            'url' => route('account.volunteer.injury-reports'),
            'icon' => 'medical',
            'category' => 'volunteer_injury',
            'injury_report_id' => $this->injuryReport->id,
        ];
    }
}
