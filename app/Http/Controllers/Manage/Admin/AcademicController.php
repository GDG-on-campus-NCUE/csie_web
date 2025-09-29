<?php

namespace App\Http\Controllers\Manage\Admin;

use App\Http\Controllers\Controller;
use App\Models\Post;
use App\Models\Program;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AcademicController extends Controller
{
    private const DEFAULT_PROGRAMS = [
        [
            'code' => 'bachelor',
            'level' => 'bachelor',
            'name' => '學士班',
            'name_en' => 'Undergraduate Program',
            'sort_order' => 1,
        ],
        [
            'code' => 'master',
            'level' => 'master',
            'name' => '研究所',
            'name_en' => 'Graduate Program',
            'sort_order' => 2,
        ],
        [
            'code' => 'ai_inservice',
            'level' => 'ai_inservice',
            'name' => '人工智慧專班',
            'name_en' => 'AI Program',
            'sort_order' => 3,
        ],
        [
            'code' => 'dual',
            'level' => 'dual',
            'name' => '雙聯學制',
            'name_en' => 'Dual Degree Program',
            'sort_order' => 4,
        ],
    ];

        /**
     * 顯示學程管理首頁
     */
    public function index(Request $request): Response
    {
        // 確保預設學程存在
        $this->ensureDefaultProgramsExist();

        // 處理學程篩選
        $programFilters = [
            'search' => $request->input('program_search'),
            'level' => $request->input('program_level'),
            'visible' => $request->input('program_visible'),
            'per_page' => $request->input('program_per_page'),
        ];

        $programQuery = Program::withCount('posts')
            ->with(['posts' => function ($query) {
                $query->select('posts.id', 'posts.title', 'posts.status', 'posts.publish_at')
                      ->where('posts.status', 'published')
                      ->orderBy('pivot_sort_order');
            }]);

        if ($programFilters['search']) {
            $search = $programFilters['search'];
            $programQuery->where(function ($query) use ($search) {
                $query->where('code', 'like', "%{$search}%")
                    ->orWhere('name', 'like', "%{$search}%")
                    ->orWhere('name_en', 'like', "%{$search}%");
            });
        }

        if ($programFilters['level']) {
            $programQuery->where('level', $programFilters['level']);
        }

        if ($programFilters['visible'] !== null && $programFilters['visible'] !== '') {
            $visible = filter_var($programFilters['visible'], FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
            if ($visible !== null) {
                $programQuery->where('visible', $visible);
            }
        }

        $programPerPage = (int) ($programFilters['per_page'] ?? 15);
        $programPerPage = max(1, min(200, $programPerPage));

        $programs = $programQuery
            ->orderBy('sort_order')
            ->orderBy('name')
            ->paginate($programPerPage)
            ->through(fn (Program $program) => [
                'id' => $program->id,
                'code' => $program->code,
                'name' => $program->name,
                'name_en' => $program->name_en,
                'level' => $program->level,
                'level_name' => $program->level_name,
                'description' => $program->description,
                'description_en' => $program->description_en,
                'website_url' => $program->website_url,
                'visible' => $program->visible,
                'sort_order' => $program->sort_order,
                'posts_count' => $program->posts_count,
                'updated_at' => $program->updated_at?->toISOString(),
                'posts' => $program->posts->map(fn ($post) => [
                    'id' => $post->id,
                    'title' => $post->title,
                    'status' => $post->status,
                    'publish_at' => $post->publish_at?->toISOString(),
                    'post_type' => $post->pivot->post_type,
                    'sort_order' => $post->pivot->sort_order,
                ]),
            ])
            ->withQueryString();

        // 取得可用的公告選項（已發布的公告）
        $postOptions = Post::query()
            ->select('id', 'title', 'status', 'publish_at')
            ->where('status', 'published')
            ->orderByDesc('publish_at')
            ->orderByDesc('created_at')
            ->limit(500)
            ->get()
            ->map(fn (Post $post) => [
                'id' => $post->id,
                'title' => $post->title,
                'status' => $post->status,
                'publish_at' => $post->publish_at?->toISOString(),
            ]);

        return Inertia::render('manage/academics/index', [
            'programs' => $programs,
            'programFilters' => $programFilters,
            'programPerPageOptions' => [15, 30, 50, 100, 200],
            'programLevelOptions' => Program::getLevelOptions(),
            'postTypeOptions' => Program::getPostTypeOptions(),
            'postOptions' => $postOptions,
        ]);
    }

    private function ensureDefaultProgramsExist(): void
    {
        foreach (self::DEFAULT_PROGRAMS as $program) {
            Program::firstOrCreate(
                ['code' => $program['code']],
                [
                    'level' => $program['level'],
                    'name' => $program['name'],
                    'name_en' => $program['name_en'],
                    'visible' => true,
                    'sort_order' => $program['sort_order'],
                ]
            );
        }
    }
}
