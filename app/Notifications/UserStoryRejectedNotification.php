<?php

namespace App\Notifications;

use App\Models\BlogPost;
use App\Notifications\Concerns\RendersBrandedMail;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class UserStoryRejectedNotification extends Notification implements ShouldQueue
{
    use Queueable;
    use RendersBrandedMail;

    public function __construct(public BlogPost $post) {}

    public function toMail(object $notifiable): MailMessage
    {
        $summary = [
            ['label' => 'Story Title', 'value' => (string) $this->post->title],
            ['label' => 'Status', 'value' => 'REVISION REQUESTED'],
        ];

        if ($this->post->rejection_reason) {
            $summary[] = ['label' => 'Editor Feedback', 'value' => $this->post->rejection_reason];
        }

        return $this->buildBrandedMail(
            notifiable: $notifiable,
            summaryItems: $summary,
            actionText: 'Edit & Resubmit Story',
            level: 'primary',
            categoryBadge: 'STORY REVIEW UPDATE',
        );
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $typeLabel = $this->post->category === 'testimonial' ? 'testimonial' : 'adoption story';
        $title = $this->post->category === 'testimonial' ? 'Testimonial Needs Revision' : 'Adoption Story Needs Revision';
        $reason = $this->post->rejection_reason ? " Reason: {$this->post->rejection_reason}" : '';
        $message = "Your {$typeLabel} \"{$this->post->title}\" was not approved.{$reason} You can edit and resubmit your story.";

        return [
            'title' => $title,
            'message' => $message,
            'description' => $message,
            'url' => route('account.user.stories.index'),
            'icon' => 'blog',
            'category' => 'blog',
            'post_id' => $this->post->id,
            'reason' => $this->post->rejection_reason,
        ];
    }
}
