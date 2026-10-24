<?php

namespace App\Notifications;

use App\Models\HelpDeskTicket;
use App\Notifications\Concerns\RendersBrandedMail;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class HelpDeskTicketCreatedNotification extends Notification implements ShouldQueue
{
    use Queueable;
    use RendersBrandedMail;

    public function __construct(public HelpDeskTicket $ticket) {}

    public function toMail(object $notifiable): MailMessage
    {
        return $this->buildBrandedMail(
            notifiable: $notifiable,
            summaryItems: [
                ['label' => 'Ticket Number', 'value' => '#'.$this->ticket->ticket_number],
                ['label' => 'Subject', 'value' => (string) $this->ticket->subject],
                ['label' => 'Submitted By', 'value' => (string) ($this->ticket->user?->name ?? 'User')],
            ],
            actionText: 'Open Help Desk Ticket',
            level: 'primary',
            categoryBadge: 'HELP DESK SUPPORT',
        );
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $role = $this->ticket->user?->role ?? 'user';
        $targetUrl = $this->ticket->target_role === 'super-admin'
            ? route('account.super-admin.help-desk')
            : route('account.admin.help-desk');

        return [
            'title' => "New Support Ticket: #{$this->ticket->ticket_number}",
            'message' => "{$this->ticket->user?->name} ({$role}) opened a ticket: {$this->ticket->subject}",
            'description' => "{$this->ticket->user?->name} ({$role}) opened a ticket: {$this->ticket->subject}",
            'url' => $targetUrl,
            'icon' => 'system',
            'category' => 'help_desk',
            'ticket_id' => $this->ticket->id,
            'ticket_number' => $this->ticket->ticket_number,
        ];
    }
}
