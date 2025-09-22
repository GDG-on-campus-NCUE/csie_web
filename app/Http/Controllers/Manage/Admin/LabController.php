<?php

namespace App\Http\Controllers\Manage\Admin;

use App\Http\Controllers\Controller;
use App\Models\Lab;
use App\Models\Teacher;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LabController extends Controller
{
    public function __construct()
    {
        // 使用政策進行授權
        $this->authorizeResource(Lab::class, 'lab');
    }

    // 列出所有實驗室
    public function index(Request $request)
    {
        $query = Lab::query()->with(['teachers:id,name,name_en']);

        $search = trim((string) $request->input('search'));
        if ($search !== '') {
            $query->where(function ($innerQuery) use ($search) {
                $innerQuery->where('name', 'like', "%{$search}%")
                    ->orWhere('name_en', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%");
            });
        }

        if ($request->filled('teacher')) {
            $teacherId = (int) $request->input('teacher');
            $query->whereHas('teachers', fn ($teacherQuery) => $teacherQuery->where('teachers.id', $teacherId));
        }

        $visible = $request->input('visible');
        if (in_array($visible, ['1', '0'], true)) {
            $query->where('visible', $visible === '1');
        }

        $perPage = (int) $request->input('per_page', 15);
        if ($perPage < 1) {
            $perPage = 15;
        }

        if ($perPage > 200) {
            $perPage = 200;
        }

        $labs = $query
            ->orderByDesc('updated_at')
            ->orderBy('sort_order')
            ->paginate($perPage)
            ->withQueryString();

        $teachers = Teacher::query()
            ->select(['id', 'name', 'name_en'])
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();

        return Inertia::render('manage/admin/labs/index', [
            'labs' => $labs,
            'teachers' => $teachers,
            'filters' => [
                'search' => $search,
                'teacher' => $request->input('teacher', ''),
                'visible' => $visible ?? '',
                'per_page' => (string) $perPage,
            ],
            'perPageOptions' => [15, 30, 50, 100, 200],
        ]);
    }

    // 顯示新增實驗室表單
    public function create()
    {
        return Inertia::render('manage/admin/labs/create');
    }

    // 儲存新的實驗室
    public function store(Request $request)
    {
        $data = $request->validate([
            'code' => ['nullable', 'string'],
            'website_url' => ['nullable', 'string'],
            'email' => ['nullable', 'string'],
            'phone' => ['nullable', 'string'],
            'cover_image' => ['nullable', 'file'],
            'name' => ['required', 'string'],
            'name_en' => ['nullable', 'string'],
            'description' => ['nullable', 'string'],
            'description_en' => ['nullable', 'string'],
            'sort_order' => ['nullable', 'integer'],
            'visible' => ['boolean'],
        ]);

        if ($request->hasFile('cover_image')) {
            // 儲存上傳封面圖路徑
            $data['cover_image_url'] = $request->file('cover_image')->store('labs', 'public');
        }

        Lab::create($data);

        return redirect()->route('manage.labs.index');
    }

    // 顯示編輯表單
    public function edit(Lab $lab)
    {
        return Inertia::render('manage/admin/labs/edit', [
            'lab' => $lab,
        ]);
    }

    // 更新實驗室資料
    public function update(Request $request, Lab $lab)
    {
        $data = $request->validate([
            'code' => ['nullable', 'string'],
            'website_url' => ['nullable', 'string'],
            'email' => ['nullable', 'string'],
            'phone' => ['nullable', 'string'],
            'cover_image' => ['nullable', 'file'],
            'name' => ['required', 'string'],
            'name_en' => ['nullable', 'string'],
            'description' => ['nullable', 'string'],
            'description_en' => ['nullable', 'string'],
            'sort_order' => ['nullable', 'integer'],
            'visible' => ['boolean'],
        ]);

        if ($request->hasFile('cover_image')) {
            $data['cover_image_url'] = $request->file('cover_image')->store('labs', 'public');
        }

        $lab->update($data);

        return redirect()->route('manage.labs.index');
    }

    // 刪除實驗室
    public function destroy(Lab $lab)
    {
        $lab->delete();
        return redirect()->route('manage.labs.index');
    }
}
