<?php

namespace App\Http\Controllers\Manage\Admin;

use App\Http\Controllers\Controller;
use App\Models\Classroom;
use App\Models\Tag;
use App\Models\User;
use App\Support\TagRegistrar;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ClassroomController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(Classroom::class, 'classroom');
    }

    public function index(Request $request)
    {
        $query = Classroom::query()->with(['users:id,name,email']);

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
            $userId = (int) $request->input('staff');
            $query->whereHas('users', fn ($inner) => $inner->where('users.id', $userId));
        }

        $visible = $request->input('visible');
        if (in_array($visible, ['1', '0'], true)) {
            $query->where('visible', $visible === '1');
        }

        $perPage = (int) $request->input('per_page', 15);
        $perPage = max(1, min($perPage, 200));

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
                'staff' => $classroom->users->map(fn (User $member) => [
                    'id' => $member->id,
                    'name' => $member->name,
                    'name_en' => $member->name,
                    'position' => null,
                    'position_en' => null,
                ])->all(),
            ];
        });

        $staff = $this->userOptions();

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

    public function create()
    {
        return Inertia::render('manage/classrooms/create', [
            'staff' => $this->userOptions(),
            'tagSuggestions' => $this->buildTagSuggestions('classrooms'),
        ]);
    }

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
            'staff_ids.*' => ['integer', 'exists:users,id'],
        ]);

        $userIds = collect($validated['staff_ids'] ?? [])
            ->map(fn ($id) => (int) $id)
            ->unique()
            ->values();
        unset($validated['staff_ids']);

        $tags = $this->normalizeTags($validated['tags'] ?? []);
        $validated['tags'] = $tags;
        $validated['sort_order'] = $validated['sort_order'] ?? 0;
        $validated['visible'] = $validated['visible'] ?? true;

        DB::transaction(function () use (&$classroom, $validated, $userIds) {
            $classroom = Classroom::create($validated);
            $classroom->users()->sync($userIds);
        });

        TagRegistrar::register($tags, ['classrooms']);

        return redirect()->route('manage.classrooms.index')
            ->with('success', __('manage.success.created', ['item' => __('manage.classroom.title', [], 'zh-TW')]));
    }

    public function edit(Classroom $classroom)
    {
        $classroom->load(['users:id,name,email']);

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
                'staff_ids' => $classroom->users->pluck('id')->values()->all(),
            ],
            'staff' => $this->userOptions(),
            'tagSuggestions' => $this->buildTagSuggestions('classrooms'),
        ]);
    }

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
            'staff_ids.*' => ['integer', 'exists:users,id'],
        ]);

        $userIds = collect($validated['staff_ids'] ?? [])
            ->map(fn ($id) => (int) $id)
            ->unique()
            ->values();
        unset($validated['staff_ids']);

        $tags = $this->normalizeTags($validated['tags'] ?? []);
        $validated['tags'] = $tags;
        $validated['sort_order'] = $validated['sort_order'] ?? 0;
        $validated['visible'] = $validated['visible'] ?? true;

        DB::transaction(function () use ($classroom, $validated, $userIds) {
            $classroom->update($validated);
            $classroom->users()->sync($userIds);
        });

        TagRegistrar::register($tags, ['classrooms']);

        return redirect()->route('manage.classrooms.index')
            ->with('success', __('manage.success.updated', ['item' => __('manage.classroom.title', [], 'zh-TW')]));
    }

    public function destroy(Classroom $classroom)
    {
        $classroom->delete();

        return redirect()->route('manage.classrooms.index')
            ->with('success', __('manage.success.deleted', ['item' => __('manage.classroom.title', [], 'zh-TW')]));
    }

    private function normalizeTags(array $tags): array
    {
        return collect($tags)
            ->filter(fn ($tag) => is_string($tag) && $tag !== '')
            ->map(fn ($tag) => trim($tag))
            ->unique()
            ->values()
            ->all();
    }

    private function buildTagSuggestions(string $context): array
    {
        return Tag::query()
            ->forContext($context)
            ->orderBy('sort_order')
            ->pluck('name')
            ->values()
            ->all();
    }

    private function userOptions()
    {
        return User::query()
            ->where('status', 'active')
            ->orderBy('name')
            ->get(['id', 'name', 'email'])
            ->map(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'name_en' => $user->name,
                'position' => null,
                'position_en' => null,
            ]);
    }
}
