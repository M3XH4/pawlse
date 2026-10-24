<?php

namespace App\Notifications;

use App\Models\HelpDeskReply;
use App\Models\HelpDeskTicket;
use App\Notifications\Concerns\RendersBrandedMail;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Str;

class HelpDeskTicketRepliedNotification extends Notification implements ShouldQueue
{
    use Queueable;
    use RendersBrandedMail;

    public function __construct(
        public HelpDeskTicket $ticket,
        public HelpDeskReply $reply
    ) {}

    public function toMail(object $notifiable): MailMessage
    {
        $author = $this->reply->user?->name ?? 'Support Staff';

        return $this->buildBrandedMail(
            notifiable: $notifiable,
            summaryItems: [
                ['label' => 'Ticket Number', 'value' => '#'.$this->ticket->ticket_number],
                ['label' => 'Subject', 'value' => (string) $this->ticket->subject],
                ['label' => 'Replied By', 'value' => $author],
            ],
            actionText: 'View Reply in Help Desk',
            level: 'primary',
            categoryBadge: 'HELP DESK REPLY',
        );
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $author = $this->reply->user?->name ?? 'Support Staff';
        $recipientRole = $notifiable->role ?? 'user';

        $url = match ($recipientRole) {
            'super-admin' => route('account.super-admin.help-desk'),
            'admin' => route('account.admin.help-desk'),
            'volunteer' => route('account.volunteer.help-desk'),
            default => route('account.user.help-desk'),
        };

        return [
            'title' => "Reply on Ticket #{$this->ticket->ticket_number}",
            'message' => "{$author} replied: \"".Str::limit($this->reply->message, 80).'"',
            'description' => "{$author} replied on ticket #{$this->ticket->ticket_number}",
            'url' => $url,
            'icon' => 'task',
            'category' => 'help_desk',
            'ticket_id' => $this->ticket->id,
            'ticket_number' => $this->ticket->ticket_number,
        ];
    }
}
