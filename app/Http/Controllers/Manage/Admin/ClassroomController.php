<?php

namespace App\Http\Controllers\Manage\Admin;

use App\Http\Controllers\Controller;
use App\Models\Classroom;
use App\Models\Staff;
use App\Models\Tag;
use App\Support\TagRegistrar;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class ClassroomController extends Controller
{
    public function __construct()
    {
        // 初始化即綁定授權政策，避免每支動作重複撰寫 authorize 呼叫。
        $this->authorizeResource(Classroom::class, 'classroom');
    }

    /**
     * 教室清單頁：支援搜尋、狀態與職員條件篩選。
     */
    public function index(Request $request)
    {
        $query = Classroom::query()->with(['staff:id,name,name_en,position,position_en']);

        $search = trim((string) $request->input('search'));
        if ($search !== '') {
            $query->where(function ($inner) use ($search) {
                $inner->where('name', 'like', "%{$search}%")
                    ->orWhere('name_en', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%")
                    ->orWhere('location', 'like', "%{$search}%");
            });
        }

        if ($request->filled('staff')) {
            $staffId = (int) $request->input('staff');
            $query->whereHas('staff', fn ($inner) => $inner->where('staff.id', $staffId));
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

        $classrooms = $query
            ->orderByDesc('updated_at')
            ->orderBy('sort_order')
            ->paginate($perPage)
            ->withQueryString();

        $classrooms->getCollection()->transform(function (Classroom $classroom) {
            return [
                'id' => $classroom->id,
                'code' => $classroom->code,
                'name' => $classroom->name,
                'name_en' => $classroom->name_en,
                'location' => $classroom->location,
                'capacity' => $classroom->capacity,
                'equipment_summary' => $classroom->equipment_summary,
                'description' => $classroom->description,
                'description_en' => $classroom->description_en,
                'visible' => $classroom->visible,
                'sort_order' => $classroom->sort_order,
                'updated_at' => $classroom->updated_at,
                'tags' => $classroom->tags ?? [],
                'staff' => $classroom->staff->map(fn (Staff $member) => [
                    'id' => $member->id,
                    'name' => $member->name,
                    'name_en' => $member->name_en,
                    'position' => $member->position,
                    'position_en' => $member->position_en,
                ])->all(),
            ];
        });

        $staff = Staff::query()
            ->select(['id', 'name', 'name_en', 'position', 'position_en'])
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get()
            ->map(fn (Staff $member) => [
                'id' => $member->id,
                'name' => $member->name,
                'name_en' => $member->name_en,
                'position' => $member->position,
                'position_en' => $member->position_en,
            ]);

        return Inertia::render('manage/classrooms/index', [
            'classrooms' => $classrooms,
            'staff' => $staff,
            'filters' => [
                'search' => $search,
                'staff' => $request->input('staff', ''),
                'visible' => $visible ?? '',
                'per_page' => (string) $perPage,
            ],
            'perPageOptions' => [15, 30, 50, 100, 200],
        ]);
    }

    /**
     * 建立表單：提供職員選項以便初始綁定。
     */
    public function create()
    {
        $staff = Staff::query()
            ->select(['id', 'name', 'name_en', 'position', 'position_en'])
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get()
            ->map(fn (Staff $member) => [
                'id' => $member->id,
                'name' => $member->name,
                'name_en' => $member->name_en,
                'position' => $member->position,
                'position_en' => $member->position_en,
            ]);

        return Inertia::render('manage/classrooms/create', [
            'staff' => $staff,
            'tagSuggestions' => $this->buildTagSuggestions('classrooms'),
        ]);
    }

    /**
     * 儲存教室資料並同步職員關聯。
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => ['nullable', 'string', 'max:50', Rule::unique('classrooms', 'code')],
            'name' => ['required', 'string', 'max:255'],
            'name_en' => ['nullable', 'string', 'max:255'],
            'location' => ['nullable', 'string', 'max:255'],
            'capacity' => ['nullable', 'integer', 'min:0'],
            'equipment_summary' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'description_en' => ['nullable', 'string'],
            'tags' => ['array'],
            'tags.*' => ['string', 'max:50'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'visible' => ['boolean'],
            'staff_ids' => ['array'],
            'staff_ids.*' => ['integer', 'exists:staff,id'],
        ]);

        $staffIds = collect($validated['staff_ids'] ?? [])
            ->map(fn ($id) => (int) $id)
            ->unique()
            ->values();
        unset($validated['staff_ids']);

        $tags = $this->normalizeTags($validated['tags'] ?? []);
        $validated['tags'] = $tags;

        $validated['sort_order'] = $validated['sort_order'] ?? 0;
        $validated['visible'] = $validated['visible'] ?? true;

        DB::transaction(function () use (&$classroom, $validated, $staffIds) {
            $classroom = Classroom::create($validated);
            $classroom->staff()->sync($staffIds);
        });

        TagRegistrar::register($tags, ['classrooms']);

        return redirect()->route('manage.classrooms.index')
            ->with('success', __('manage.success.created', ['item' => __('manage.classroom.title', [], 'zh-TW')]));
    }

    /**
     * 編輯畫面：回傳現有資料與職員選項。
     */
    public function edit(Classroom $classroom)
    {
        $classroom->load(['staff:id,name,name_en,position,position_en']);

        $staff = Staff::query()
            ->select(['id', 'name', 'name_en', 'position', 'position_en'])
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get()
            ->map(fn (Staff $member) => [
                'id' => $member->id,
                'name' => $member->name,
                'name_en' => $member->name_en,
                'position' => $member->position,
                'position_en' => $member->position_en,
            ]);

        return Inertia::render('manage/classrooms/edit', [
            'classroom' => [
                'id' => $classroom->id,
                'code' => $classroom->code,
                'name' => $classroom->name,
                'name_en' => $classroom->name_en,
                'location' => $classroom->location,
                'capacity' => $classroom->capacity,
                'equipment_summary' => $classroom->equipment_summary,
                'description' => $classroom->description,
                'description_en' => $classroom->description_en,
                'tags' => $classroom->tags ?? [],
                'sort_order' => $classroom->sort_order,
                'visible' => $classroom->visible,
                'staff_ids' => $classroom->staff->pluck('id')->values()->all(),
            ],
            'staff' => $staff,
            'tagSuggestions' => $this->buildTagSuggestions('classrooms'),
        ]);
    }

    /**
     * 更新教室資料，同步職員連結。
     */
    public function update(Request $request, Classroom $classroom)
    {
        $validated = $request->validate([
            'code' => ['nullable', 'string', 'max:50', Rule::unique('classrooms', 'code')->ignore($classroom->id)],
            'name' => ['required', 'string', 'max:255'],
            'name_en' => ['nullable', 'string', 'max:255'],
            'location' => ['nullable', 'string', 'max:255'],
            'capacity' => ['nullable', 'integer', 'min:0'],
            'equipment_summary' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'description_en' => ['nullable', 'string'],
            'tags' => ['array'],
            'tags.*' => ['string', 'max:50'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'visible' => ['boolean'],
            'staff_ids' => ['array'],
            'staff_ids.*' => ['integer', 'exists:staff,id'],
        ]);

        $staffIds = collect($validated['staff_ids'] ?? [])
            ->map(fn ($id) => (int) $id)
            ->unique()
            ->values();
        unset($validated['staff_ids']);

        $tags = $this->normalizeTags($validated['tags'] ?? []);
        $validated['tags'] = $tags;

        $validated['sort_order'] = $validated['sort_order'] ?? 0;
        $validated['visible'] = $validated['visible'] ?? true;

        DB::transaction(function () use ($classroom, $validated, $staffIds) {
            $classroom->update($validated);
            $classroom->staff()->sync($staffIds);
        });

        TagRegistrar::register($tags, ['classrooms']);

        return redirect()->route('manage.classrooms.index')
            ->with('success', __('manage.success.updated', ['item' => __('manage.classroom.title', [], 'zh-TW')]));
    }

    /**
     * 刪除教室，同時會透過外鍵自動清除 pivot 資料。
     */
    public function destroy(Classroom $classroom)
    {
        $classroom->delete();

        return redirect()->route('manage.classrooms.index')
            ->with('success', __('manage.success.deleted', ['item' => __('manage.classroom.title', [], 'zh-TW')]));
    }

    /**
     * 將傳入標籤整理成乾淨陣列，避免空值或重複字串。
     */
    protected function normalizeTags($value): array
    {
        return collect(is_array($value) ? $value : [])
            ->map(fn ($item) => trim((string) $item))
            ->filter(fn ($item) => $item !== '')
            ->unique()
            ->values()
            ->all();
    }

    /**
     * 產生 TagSelector 可用的建議標籤清單。
     */
    protected function buildTagSuggestions(string $context): array
    {
        if (! Tag::tableExists()) {
            return [];
        }

        return Tag::query()
            ->where('context', $context)
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get()
            ->map(fn (Tag $tag) => [
                'value' => $tag->name,
                'label' => $tag->name,
                'description' => $tag->description,
            ])
            ->all();
    }
}
