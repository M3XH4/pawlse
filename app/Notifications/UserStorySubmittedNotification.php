<?php

namespace App\Notifications;

use App\Models\BlogPost;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class UserStorySubmittedNotification extends Notification
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
        $authorName = $this->post->author?->name ?? 'A user';
        $typeLabel = $this->post->category === 'testimonial' ? 'community testimonial' : 'adoption story';
        $title = $this->post->category === 'testimonial' ? 'New Community Testimonial Submitted' : 'New Adoption Story Submitted';
        $message = "{$authorName} submitted a {$typeLabel} \"{$this->post->title}\" for admin review.";

        return [
            'title' => $title,
            'message' => $message,
            'description' => $message,
            'url' => route('account.admin.blog-management', ['status' => 'pending']),
            'icon' => 'blog',
            'category' => 'blog',
            'post_id' => $this->post->id,
            'author_id' => $this->post->author_id,
        ];
    }
}
