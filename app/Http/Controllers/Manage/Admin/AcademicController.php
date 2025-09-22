<?php

namespace App\Http\Controllers\Manage\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Program;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AcademicController extends Controller
{
    /**
     * 顯示課程與學程整合列表頁。
     */
    public function index(Request $request): Response
    {
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

        $courseQuery = Course::with(['program']);

        if ($courseFilters['search']) {
            $search = $courseFilters['search'];
            $courseQuery->where(function ($query) use ($search) {
                $query->where('code', 'like', "%{$search}%")
                    ->orWhere('name->zh-TW', 'like', "%{$search}%")
                    ->orWhere('name->en', 'like', "%{$search}%");
            });
        }

        if ($courseFilters['program']) {
            $courseQuery->where('program_id', $courseFilters['program']);
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

        $programQuery = Program::withCount('courses');

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
            ->withQueryString();

        $programOptions = Program::orderBy('name->zh-TW')->get(['id', 'name', 'name_en']);

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
        ]);
    }
}
