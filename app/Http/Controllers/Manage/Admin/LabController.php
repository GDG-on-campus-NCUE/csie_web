<?php

namespace App\Http\Controllers\Manage\Admin;

use App\Http\Controllers\Controller;
use App\Models\Lab;
use App\Models\Tag;
use App\Models\User;
use App\Support\TagRegistrar;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class LabController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(Lab::class, 'lab');
    }

    public function index(Request $request): Response
    {
        $query = Lab::query()->with(['members:id,name,email']);

        $search = trim((string) $request->input('search'));
        if ($search !== '') {
            $query->where(function ($inner) use ($search) {
                $inner->where('name', 'like', "%{$search}%")
                    ->orWhere('name_en', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%");
            });
        }

        if ($request->filled('teacher')) {
            $memberId = (int) $request->input('teacher');
            $query->whereHas('members', fn ($inner) => $inner->where('users.id', $memberId));
        }

        $visible = $request->input('visible');
        if (in_array($visible, ['1', '0'], true)) {
            $query->where('visible', $visible === '1');
        }

        $perPage = (int) $request->input('per_page', 15);
        $perPage = max(1, min($perPage, 200));

        $labs = $query
            ->orderByDesc('updated_at')
            ->orderBy('sort_order')
            ->paginate($perPage)
            ->withQueryString();

        $labs->getCollection()->transform(function (Lab $lab) {
            $teachers = $lab->members->map(fn (User $member) => [
                'id' => $member->id,
                'name' => $member->name,
                'name_en' => $member->name,
                'title' => null,
                'title_en' => null,
            ])->all();

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
                'teachers' => $teachers,
            ];
        });

        return Inertia::render('manage/labs/index', [
            'labs' => $labs,
            'teachers' => $this->userOptions(),
            'filters' => [
                'search' => $search,
                'teacher' => $request->input('teacher', ''),
                'visible' => $visible ?? '',
                'per_page' => (string) $perPage,
            ],
            'perPageOptions' => [15, 30, 50, 100, 200],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('manage/labs/create', [
            'teachers' => $this->userOptions(),
            'tagSuggestions' => $this->buildTagSuggestions('labs'),
        ]);
    }

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
            'teacher_ids.*' => ['integer', 'exists:users,id'],
        ]);

        $memberIds = collect($validated['teacher_ids'] ?? [])
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

        DB::transaction(function () use (&$lab, $validated, $memberIds) {
            $lab = Lab::create($validated);
            $lab->members()->sync($memberIds);
        });

        TagRegistrar::register($tags, ['labs']);

        return redirect()->route('manage.labs.index')
            ->with('success', __('manage.success.created', ['item' => __('manage.lab.title', [], 'zh-TW')]));
    }

    public function edit(Lab $lab): Response
    {
        $lab->load(['members:id,name,email']);

        return Inertia::render('manage/labs/edit', [
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
                'teacher_ids' => $lab->members->pluck('id')->values()->all(),
            ],
            'teachers' => $this->userOptions(),
            'tagSuggestions' => $this->buildTagSuggestions('labs'),
        ]);
    }

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
            'teacher_ids.*' => ['integer', 'exists:users,id'],
        ]);

        $memberIds = collect($validated['teacher_ids'] ?? [])
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

        DB::transaction(function () use ($lab, $validated, $memberIds) {
            $lab->update($validated);
            $lab->members()->sync($memberIds);
        });

        TagRegistrar::register($tags, ['labs']);

        return redirect()->route('manage.labs.index')
            ->with('success', __('manage.success.updated', ['item' => __('manage.lab.title', [], 'zh-TW')]));
    }

    public function destroy(Lab $lab)
    {
        $lab->delete();

        return redirect()->route('manage.labs.index')
            ->with('success', __('manage.success.deleted', ['item' => __('manage.lab.title', [], 'zh-TW')]));
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
                'title' => null,
                'title_en' => null,
            ]);
    }
}
