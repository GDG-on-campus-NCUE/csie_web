<?php

namespace App\Providers;

use App\Models\Attachment;
use App\Models\Classroom;
use App\Models\Lab;
use App\Models\Post;
use App\Models\Project;
use App\Models\Publication;
use App\Models\Tag;
use App\Models\User;
use App\Policies\AttachmentPolicy;
use App\Policies\ClassroomPolicy;
use App\Policies\LabPolicy;
use App\Policies\PostPolicy;
use App\Policies\ProjectPolicy;
use App\Policies\PublicationPolicy;
use App\Policies\TagPolicy;
use App\Policies\UserPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    /** @var array<class-string, class-string> */
    protected $policies = [
        Attachment::class => AttachmentPolicy::class,
        Lab::class => LabPolicy::class,
        Classroom::class => ClassroomPolicy::class,
        User::class => UserPolicy::class,
        Post::class => PostPolicy::class,
        Project::class => ProjectPolicy::class,
        Publication::class => PublicationPolicy::class,
        Tag::class => TagPolicy::class,
    ];

    public function boot(): void
    {
        // 保留擴充點
    }
}
