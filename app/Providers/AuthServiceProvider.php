<?php

namespace App\Providers;

use App\Models\Attachment;
use App\Models\Classroom;
use App\Models\Lab;
use App\Models\Post;
use App\Models\Publication;
use App\Models\Teacher;
use App\Models\Staff;
use App\Models\Tag;
use App\Models\User;
use App\Policies\AttachmentPolicy;
use App\Policies\ClassroomPolicy;
use App\Policies\LabPolicy;
use App\Policies\PostPolicy;
use App\Policies\PublicationPolicy;
use App\Policies\StaffPolicy;
use App\Policies\TagPolicy;
use App\Policies\TeacherPolicy;
use App\Policies\UserPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    /** @var array<class-string, class-string> */
    protected $policies = [
        // 附件授權政策
        Attachment::class => AttachmentPolicy::class,
        // 職員授權政策
        Staff::class => StaffPolicy::class,
        // 實驗室授權政策
        Lab::class => LabPolicy::class,
        // 教室授權政策
        Classroom::class => ClassroomPolicy::class,
        // 使用者管理授權政策
        User::class => UserPolicy::class,
        // 貼文授權政策
        Post::class => PostPolicy::class,
        // 發表論文授權政策
        Publication::class => PublicationPolicy::class,
        // 標籤授權政策
        Tag::class => TagPolicy::class,
        // 教師授權政策
        Teacher::class => TeacherPolicy::class,
    ];

    public function boot(): void
    {
        // 可在此處加入額外授權邏輯
    }
}
