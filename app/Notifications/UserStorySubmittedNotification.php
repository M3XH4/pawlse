<?php

namespace App\Notifications;

use App\Models\BlogPost;
use App\Notifications\Concerns\RendersBrandedMail;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class UserStorySubmittedNotification extends Notification implements ShouldQueue
{
    use Queueable;
    use RendersBrandedMail;

    public function __construct(public BlogPost $post) {}

    public function toMail(object $notifiable): MailMessage
    {
        return $this->buildBrandedMail(
            notifiable: $notifiable,
            summaryItems: [
                ['label' => 'Story Title', 'value' => (string) $this->post->title],
                ['label' => 'Author', 'value' => (string) ($this->post->author?->name ?? 'Community Member')],
            ],
            actionText: 'Review Story Submission',
            level: 'primary',
            categoryBadge: 'NEW COMMUNITY STORY',
        );
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
