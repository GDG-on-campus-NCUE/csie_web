<?php

namespace App\Providers;

use App\Models\Classroom;
use App\Models\Lab;
use App\Models\Post;
use App\Models\PostCategory;
use App\Models\Program;
use App\Models\Project;
use App\Models\Publication;
use Illuminate\Database\Eloquent\Relations\Relation;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\ServiceProvider;
use Database\Seeders\PostCategorySeeder;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        Relation::enforceMorphMap([
            'Post' => Post::class,
            'Lab' => Lab::class,
            'Project' => Project::class,
            'Publication' => Publication::class,
            'Program' => Program::class,
            'Classroom' => Classroom::class,
        ]);

        $this->ensureDefaultPostCategories();
    }

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
