<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Database\Eloquent\Relations\Relation;
use Illuminate\Support\Facades\Schema;
use App\Models\Post;
use App\Models\Teacher;
use App\Models\Classroom;
use App\Models\Lab;
use App\Models\Project;
use App\Models\Publication;
use App\Models\Program;
use App\Models\Course;
use App\Models\Staff;
use App\Models\PostCategory;
use Database\Seeders\PostCategorySeeder;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Relation::enforceMorphMap([
            'Post' => Post::class,
            'Teacher' => Teacher::class,
            'Lab' => Lab::class,
            'Project' => Project::class,
            'Publication' => Publication::class,
            'Program' => Program::class,
            'Course' => Course::class,
            'Staff' => Staff::class,
            'Classroom' => Classroom::class,
        ]);

        $this->ensureDefaultPostCategories();
    }

    /**
     * 確保預設公告分類存在，以免後台分類下拉選單為空。
     */
    protected function ensureDefaultPostCategories(): void
    {
        if (! Schema::hasTable('post_categories')) {
            return;
        }

        if (PostCategory::withTrashed()->count() > 0) {
            return;
        }

        app(PostCategorySeeder::class)->run();
    }
}
