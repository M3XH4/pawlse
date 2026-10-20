<?php

namespace App\Notifications;

use App\Models\HelpDeskTicket;
use App\Models\User;
use App\Notifications\Concerns\RendersBrandedMail;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class HelpDeskTicketEscalatedNotification extends Notification
{
    use Queueable;
    use RendersBrandedMail;

    public function __construct(
        public HelpDeskTicket $ticket,
        public User $adminUser,
        public ?string $escalationReason = null
    ) {}

    public function toMail(object $notifiable): MailMessage
    {
        return $this->buildBrandedMail(
            notifiable: $notifiable,
            summaryItems: [
                ['label' => 'Ticket Number', 'value' => '#'.$this->ticket->ticket_number],
                ['label' => 'Subject', 'value' => (string) $this->ticket->subject],
                ['label' => 'Escalated By', 'value' => (string) $this->adminUser->name],
            ],
            actionText: 'Review Escalated Ticket',
            level: 'error',
            categoryBadge: 'ESCALATED TICKET',
        );
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'title' => "Ticket Escalated to Super Admin: #{$this->ticket->ticket_number}",
            'message' => "Admin {$this->adminUser->name} escalated ticket '{$this->ticket->subject}': {$this->escalationReason}",
            'description' => "Admin {$this->adminUser->name} requested Super Admin intervention on ticket #{$this->ticket->ticket_number}",
            'url' => route('account.super-admin.help-desk'),
            'icon' => 'system',
            'category' => 'help_desk',
            'ticket_id' => $this->ticket->id,
            'ticket_number' => $this->ticket->ticket_number,
        ];
    }
}
