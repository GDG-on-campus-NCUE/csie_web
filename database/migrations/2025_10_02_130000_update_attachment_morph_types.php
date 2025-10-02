<?php

use App\Models\Classroom;
use App\Models\Lab;
use App\Models\Post;
use App\Models\Program;
use App\Models\Project;
use App\Models\Publication;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        /**
         * 將既有附件的多型型別字串統一轉換為 morph 別名，避免舊資料殘留完整類別名稱。
         */
        $aliasMap = [
            Post::class => 'Post',
            Lab::class => 'Lab',
            Project::class => 'Project',
            Publication::class => 'Publication',
            Program::class => 'Program',
            Classroom::class => 'Classroom',
        ];

        foreach ($aliasMap as $class => $alias) {
            DB::table('attachments')
                ->where('attached_to_type', $class)
                ->update(['attached_to_type' => $alias]);
        }
    }

    public function down(): void
    {
        /**
         * 回復為完整類別名稱，與舊行為保持相容。
         */
        $aliasMap = [
            'Post' => Post::class,
            'Lab' => Lab::class,
            'Project' => Project::class,
            'Publication' => Publication::class,
            'Program' => Program::class,
            'Classroom' => Classroom::class,
        ];

        foreach ($aliasMap as $alias => $class) {
            DB::table('attachments')
                ->where('attached_to_type', $alias)
                ->update(['attached_to_type' => $class]);
        }
    }
};
