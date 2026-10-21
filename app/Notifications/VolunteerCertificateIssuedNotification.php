<?php

namespace App\Notifications;

use App\Enums\Role;
use App\Models\Certificate;
use App\Models\User;
use App\Notifications\Concerns\RendersBrandedMail;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\AnonymousNotifiable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\URL;

class VolunteerCertificateIssuedNotification extends Notification
{
    use Queueable;
    use RendersBrandedMail;

    public function __construct(public Certificate $certificate) {}

    protected function resolveCertificateUrl(object $notifiable): string
    {
        if ($notifiable instanceof AnonymousNotifiable || $this->certificate->user_id === null) {
            return URL::signedRoute('certificates.public.show', ['certificate' => $this->certificate->id]);
        }

        if ($notifiable instanceof User) {
            $userRole = $notifiable->role instanceof Role ? $notifiable->role->value : (string) $notifiable->role;
            if ($userRole === Role::Volunteer->value) {
                return route('account.volunteer.certificates');
            }

            return route('account.user.certificates');
        }

        return URL::signedRoute('certificates.public.show', ['certificate' => $this->certificate->id]);
    }

    public function toMail(object $notifiable): MailMessage
    {
        $this->certificate->loadMissing(['event', 'user']);

        $recipientName = $this->certificate->user?->name
            ?? $this->certificate->guest_name
            ?? ($notifiable->name ?? 'Participant');

        $roleLabel = $this->certificate->role ?: 'Participant';
        $summaryItems = [
            ['label' => 'Recipient Name', 'value' => (string) $recipientName],
            ['label' => 'Certificate Title', 'value' => (string) $this->certificate->title],
            ['label' => 'Participation Role', 'value' => (string) $roleLabel],
            ['label' => 'Certificate Number', 'value' => (string) $this->certificate->certificate_number],
        ];

        if ($this->certificate->event) {
            $summaryItems[] = ['label' => 'Event', 'value' => (string) $this->certificate->event->title];
        }

        $badge = strtolower($roleLabel) === 'participant'
            ? 'EVENT PARTICIPATION CERTIFICATE'
            : 'VOLUNTEER RECOGNITION';

        return $this->buildBrandedMail(
            notifiable: $notifiable,
            summaryItems: $summaryItems,
            actionText: 'View & Download Certificate',
            level: 'success',
            categoryBadge: $badge,
            actionUrl: $this->resolveCertificateUrl($notifiable),
            recipientNameOverride: $recipientName,
        );
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'Certificate Issued',
            'message' => "Certificate \"{$this->certificate->title}\" (Ref: {$this->certificate->certificate_number}) has been issued.",
            'description' => "Certificate issued: {$this->certificate->title}.",
            'url' => $this->resolveCertificateUrl($notifiable),
            'icon' => 'certificate',
            'category' => 'certificate',
            'certificate_id' => $this->certificate->id,
        ];
    }
}
