<?php

namespace App\Notifications;

use App\Models\Post;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PostPublishedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public Post $post
    ) {}

    /**
     * Get the notification's delivery channels.
     */
    public function via(object $notifiable): array
    {
        $channels = ['database'];

        // 檢查使用者偏好
        if (\App\Models\NotificationPreference::isEnabled(
            $notifiable->id,
            \App\Models\NotificationPreference::TYPE_POST_PUBLISHED,
            \App\Models\NotificationPreference::CHANNEL_EMAIL
        )) {
            $channels[] = 'mail';
        }

        return $channels;
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject("新公告：{$this->post->title}")
            ->greeting("您好，{$notifiable->name}")
            ->line("有一則新的公告已發布：")
            ->line($this->post->title)
            ->line($this->post->summary ?? '')
            ->action('查看公告', url("/posts/{$this->post->id}"))
            ->line('感謝您使用我們的系統！');
    }

    /**
     * Get the array representation of the notification.
     */
    public function toArray(object $notifiable): array
    {
        return [
            'post_id' => $this->post->id,
            'title' => $this->post->title,
            'summary' => $this->post->summary,
            'action_url' => url("/posts/{$this->post->id}"),
            'priority' => 'normal',
        ];
    }
}
