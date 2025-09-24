<?php

namespace App\Http\Controllers\Manage\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
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
     * 顯示課程與學程整合列表頁。
     */
    public function index(Request $request): Response
    {
        $this->ensureDefaultPrograms();

        $activeTab = $request->string('tab')->toString();
        if (! in_array($activeTab, ['courses', 'programs'], true)) {
            $activeTab = 'courses';
        }

        $courseFilters = [
            'search' => $request->input('course_search'),
            'program' => $request->input('course_program'),
            'level' => $request->input('course_level'),
            'visible' => $request->input('course_visible'),
            'per_page' => $request->input('course_per_page'),
        ];

        $programFilters = [
            'search' => $request->input('program_search'),
            'level' => $request->input('program_level'),
            'visible' => $request->input('program_visible'),
            'per_page' => $request->input('program_per_page'),
        ];

        $courseQuery = Course::with(['programs:id,name,name_en']);

        if ($courseFilters['search']) {
            $search = $courseFilters['search'];
            $courseQuery->where(function ($query) use ($search) {
                $query->where('code', 'like', "%{$search}%")
                    ->orWhere('name->zh-TW', 'like', "%{$search}%")
                    ->orWhere('name->en', 'like', "%{$search}%");
            });
        }

        if ($courseFilters['program']) {
            $courseQuery->whereHas('programs', function ($query) use ($courseFilters) {
                $query->where('programs.id', $courseFilters['program']);
            });
        }

        if ($courseFilters['level']) {
            $courseQuery->where('level', $courseFilters['level']);
        }

        if ($courseFilters['visible'] !== null && $courseFilters['visible'] !== '') {
            if ($courseFilters['visible'] === '1' || $courseFilters['visible'] === 1 || $courseFilters['visible'] === true) {
                $courseQuery->where('visible', true);
            } elseif ($courseFilters['visible'] === '0' || $courseFilters['visible'] === 0 || $courseFilters['visible'] === false) {
                $courseQuery->where('visible', false);
            }
        }

        $coursePerPage = (int) ($courseFilters['per_page'] ?? 15);
        if ($coursePerPage < 1) {
            $coursePerPage = 15;
        }

        if ($coursePerPage > 200) {
            $coursePerPage = 200;
        }

        $courses = $courseQuery
            ->orderBy('code')
            ->paginate($coursePerPage, ['*'], 'course_page')
            ->withQueryString();

        $programQuery = Program::withCount('courses')
            ->with(['posts:id,title,status,publish_at']);

        if ($programFilters['search']) {
            $search = $programFilters['search'];
            $programQuery->where(function ($query) use ($search) {
                $query->where('name->zh-TW', 'like', "%{$search}%")
                    ->orWhere('name->en', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%");
            });
        }

        if ($programFilters['level']) {
            $programQuery->where('level', $programFilters['level']);
        }

        if ($programFilters['visible'] !== null && $programFilters['visible'] !== '') {
            if ($programFilters['visible'] === '1' || $programFilters['visible'] === 1 || $programFilters['visible'] === true) {
                $programQuery->where('visible', true);
            } elseif ($programFilters['visible'] === '0' || $programFilters['visible'] === 0 || $programFilters['visible'] === false) {
                $programQuery->where('visible', false);
            }
        }

        $programPerPage = (int) ($programFilters['per_page'] ?? 15);
        if ($programPerPage < 1) {
            $programPerPage = 15;
        }

        if ($programPerPage > 200) {
            $programPerPage = 200;
        }

        $programs = $programQuery
            ->orderBy('sort_order')
            ->orderBy('name->zh-TW')
            ->paginate($programPerPage, ['*'], 'program_page')
            ->through(fn (Program $program) => [
                'id' => $program->id,
                'code' => $program->code,
                'name' => $program->name,
                'name_en' => $program->name_en,
                'level' => $program->level,
                'visible' => $program->visible,
                'sort_order' => $program->sort_order,
                'courses_count' => $program->courses_count,
                'updated_at' => optional($program->updated_at)->toIso8601String(),
                'website_url' => $program->website_url,
                'posts' => $program->posts->map(fn (Post $post) => [
                    'id' => $post->id,
                    'title' => $post->title,
                    'status' => $post->status,
                    'publish_at' => optional($post->publish_at)->toIso8601String(),
                ]),
            ])
            ->withQueryString();

        $programOptions = Program::orderBy('name->zh-TW')->get(['id', 'name', 'name_en']);

        $topPostIds = Post::query()
            ->select('id')
            ->orderByDesc('publish_at')
            ->orderByDesc('created_at')
            ->limit(300)
            ->pluck('id');

        $linkedPostIds = Program::query()
            ->with(['posts:id'])
            ->get()
            ->flatMap(fn (Program $program) => $program->posts->pluck('id'))
            ->filter()
            ->unique();

        $postOptions = Post::query()
            ->select('id', 'title', 'status', 'publish_at', 'created_at')
            ->whereIn('id', $topPostIds->merge($linkedPostIds)->unique()->values())
            ->orderByDesc('publish_at')
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (Post $post) => [
                'id' => $post->id,
                'title' => $post->title,
                'status' => $post->status,
                'publish_at' => optional($post->publish_at)->toIso8601String(),
                'created_at' => optional($post->created_at)->toIso8601String(),
            ]);

        $query = [];
        foreach ($request->query() as $key => $value) {
            if (is_scalar($value)) {
                $query[$key] = (string) $value;
            }
        }

        return Inertia::render('manage/admin/academics/index', [
            'courses' => $courses,
            'courseProgramOptions' => $programOptions,
            'courseFilters' => $courseFilters,
            'coursePerPageOptions' => [15, 30, 50, 100, 200],
            'programs' => $programs,
            'programFilters' => $programFilters,
            'programPerPageOptions' => [15, 30, 50, 100, 200],
            'activeTab' => $activeTab,
            'query' => $query,
            'postOptions' => $postOptions,
        ]);
    }

    private function ensureDefaultPrograms(): void
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
