<?php

namespace App\Http\Controllers\Manage\Admin;

use App\Http\Controllers\Controller;
use App\Models\Lab;
use App\Models\Tag;
use App\Models\Teacher;
use App\Support\TagRegistrar;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class LabController extends Controller
{
    public function __construct()
    {
        // 初始化即綁定授權政策，確保所有動作皆受政策管控。
        $this->authorizeResource(Lab::class, 'lab');
    }

    /**
     * 實驗室列表：支援搜尋、教師與狀態篩選，並回傳分頁資料。
     */
    public function index(Request $request)
    {
        $query = Lab::query()->with(['teachers:id,name,name_en,title,title_en']);

        $search = trim((string) $request->input('search'));
        if ($search !== '') {
            $query->where(function ($inner) use ($search) {
                $inner->where('name', 'like', "%{$search}%")
                    ->orWhere('name_en', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%");
            });
        }

        if ($request->filled('teacher')) {
            $teacherId = (int) $request->input('teacher');
            $query->whereHas('teachers', fn ($inner) => $inner->where('teachers.id', $teacherId));
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

        $labs->getCollection()->transform(function (Lab $lab) {
            return [
                'id' => $lab->id,
                'code' => $lab->code,
                'name' => $lab->name,
                'name_en' => $lab->name_en,
                'email' => $lab->email,
                'phone' => $lab->phone,
                'website_url' => $lab->website_url,
                'description' => $lab->description,
                'description_en' => $lab->description_en,
                'tags' => $lab->tags ?? [],
                'visible' => $lab->visible,
                'sort_order' => $lab->sort_order,
                'updated_at' => $lab->updated_at,
                'cover_image_url' => $lab->cover_image_url ? Storage::disk('public')->url($lab->cover_image_url) : null,
                'teachers' => $lab->teachers->map(fn (Teacher $teacher) => [
                    'id' => $teacher->id,
                    'name' => $teacher->name,
                    'name_en' => $teacher->name_en,
                    'title' => $teacher->title,
                    'title_en' => $teacher->title_en,
                ])->all(),
            ];
        });

        $teachers = Teacher::query()
            ->select(['id', 'name', 'name_en', 'title', 'title_en'])
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get()
            ->map(fn (Teacher $teacher) => [
                'id' => $teacher->id,
                'name' => $teacher->name,
                'name_en' => $teacher->name_en,
                'title' => $teacher->title,
                'title_en' => $teacher->title_en,
            ]);

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

    /**
     * 建立實驗室：提供教師選項以便同步設定成員。
     */
    public function create()
    {
        $teachers = Teacher::query()
            ->select(['id', 'name', 'name_en', 'title', 'title_en'])
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get()
            ->map(fn (Teacher $teacher) => [
                'id' => $teacher->id,
                'name' => $teacher->name,
                'name_en' => $teacher->name_en,
                'title' => $teacher->title,
                'title_en' => $teacher->title_en,
            ]);

        return Inertia::render('manage/admin/labs/create', [
            'teachers' => $teachers,
            'tagSuggestions' => $this->buildTagSuggestions('labs'),
        ]);
    }

    /**
     * 儲存實驗室並同步教師關聯。
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => ['nullable', 'string', 'max:50', Rule::unique('labs', 'code')],
            'website_url' => ['nullable', 'url', 'max:500'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'cover_image' => ['nullable', 'image', 'max:5120'],
            'name' => ['required', 'string', 'max:255'],
            'name_en' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'description_en' => ['nullable', 'string'],
            'tags' => ['array'],
            'tags.*' => ['string', 'max:50'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'visible' => ['boolean'],
            'teacher_ids' => ['array'],
            'teacher_ids.*' => ['integer', 'exists:teachers,id'],
        ]);

        $teacherIds = collect($validated['teacher_ids'] ?? [])
            ->map(fn ($id) => (int) $id)
            ->unique()
            ->values();
        unset($validated['teacher_ids']);

        $tags = $this->normalizeTags($validated['tags'] ?? []);
        $validated['tags'] = $tags;

        if ($request->hasFile('cover_image')) {
            $validated['cover_image_url'] = $request->file('cover_image')->store('labs', 'public');
        }

        $validated['sort_order'] = $validated['sort_order'] ?? 0;
        $validated['visible'] = $validated['visible'] ?? true;

        DB::transaction(function () use (&$lab, $validated, $teacherIds) {
            $lab = Lab::create($validated);
            $lab->teachers()->sync($teacherIds);
        });

        TagRegistrar::register($tags, ['labs']);

        return redirect()->route('manage.labs.index')
            ->with('success', __('manage.success.created', ['item' => __('manage.lab.title', [], 'zh-TW')]));
    }

    /**
     * 編輯實驗室：回傳現有資料與教師選項。
     */
    public function edit(Lab $lab)
    {
        $lab->load(['teachers:id,name,name_en,title,title_en']);

        $teachers = Teacher::query()
            ->select(['id', 'name', 'name_en', 'title', 'title_en'])
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get()
            ->map(fn (Teacher $teacher) => [
                'id' => $teacher->id,
                'name' => $teacher->name,
                'name_en' => $teacher->name_en,
                'title' => $teacher->title,
                'title_en' => $teacher->title_en,
            ]);

        return Inertia::render('manage/admin/labs/edit', [
            'lab' => [
                'id' => $lab->id,
                'code' => $lab->code,
                'website_url' => $lab->website_url,
                'email' => $lab->email,
                'phone' => $lab->phone,
                'name' => $lab->name,
                'name_en' => $lab->name_en,
                'description' => $lab->description,
                'description_en' => $lab->description_en,
                'tags' => $lab->tags ?? [],
                'sort_order' => $lab->sort_order,
                'visible' => $lab->visible,
                'cover_image_url' => $lab->cover_image_url ? Storage::disk('public')->url($lab->cover_image_url) : null,
                'teacher_ids' => $lab->teachers->pluck('id')->values()->all(),
            ],
            'teachers' => $teachers,
            'tagSuggestions' => $this->buildTagSuggestions('labs'),
        ]);
    }

    /**
     * 更新實驗室並同步教師列表。
     */
    public function update(Request $request, Lab $lab)
    {
        $validated = $request->validate([
            'code' => ['nullable', 'string', 'max:50', Rule::unique('labs', 'code')->ignore($lab->id)],
            'website_url' => ['nullable', 'url', 'max:500'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'cover_image' => ['nullable', 'image', 'max:5120'],
            'name' => ['required', 'string', 'max:255'],
            'name_en' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'description_en' => ['nullable', 'string'],
            'tags' => ['array'],
            'tags.*' => ['string', 'max:50'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'visible' => ['boolean'],
            'teacher_ids' => ['array'],
            'teacher_ids.*' => ['integer', 'exists:teachers,id'],
        ]);

        $teacherIds = collect($validated['teacher_ids'] ?? [])
            ->map(fn ($id) => (int) $id)
            ->unique()
            ->values();
        unset($validated['teacher_ids']);

        $tags = $this->normalizeTags($validated['tags'] ?? []);
        $validated['tags'] = $tags;

        if ($request->hasFile('cover_image')) {
            $validated['cover_image_url'] = $request->file('cover_image')->store('labs', 'public');
        }

        $validated['sort_order'] = $validated['sort_order'] ?? 0;
        $validated['visible'] = $validated['visible'] ?? true;

        DB::transaction(function () use ($lab, $validated, $teacherIds) {
            $lab->update($validated);
            $lab->teachers()->sync($teacherIds);
        });

        TagRegistrar::register($tags, ['labs']);

        return redirect()->route('manage.labs.index')
            ->with('success', __('manage.success.updated', ['item' => __('manage.lab.title', [], 'zh-TW')]));
    }

    /**
     * 刪除實驗室，同步釋放教師關聯。
     */
    public function destroy(Lab $lab)
    {
        $lab->delete();

        return redirect()->route('manage.labs.index')
            ->with('success', __('manage.success.deleted', ['item' => __('manage.lab.title', [], 'zh-TW')]));
    }

    /**
     * 整理使用者輸入的標籤字串，避免出現空白或重複值。
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
     * 提供特定情境下的標籤建議列表，供前端選擇。
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
