<?php

namespace App\Notifications;

use App\Models\BlogPost;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class UserStoryRejectedNotification extends Notification
{
    use Queueable;

    public function __construct(public BlogPost $post) {}

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
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
