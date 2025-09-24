<?php

namespace App\Http\Controllers\Manage\Admin;

use App\Http\Controllers\Controller;
use App\Models\Tag;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class TagController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(Tag::class, 'tag');
    }

    public function index(): Response
    {
        $tags = Tag::query()
            ->orderBy('context')
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get()
            ->map(function (Tag $tag) {
                return [
                    'id' => $tag->id,
                    'context' => $tag->context,
                    'context_label' => Tag::CONTEXTS[$tag->context] ?? $tag->context,
                    'name' => $tag->name,
                    'slug' => $tag->slug,
                    'description' => $tag->description,
                    'sort_order' => $tag->sort_order,
                    'created_at' => optional($tag->created_at)?->toIso8601String(),
                    'updated_at' => optional($tag->updated_at)?->toIso8601String(),
                ];
            });

        return Inertia::render('manage/admin/tags/index', [
            'contextOptions' => collect(Tag::CONTEXTS)
                ->map(fn ($label, $value) => ['value' => $value, 'label' => $label])
                ->values(),
            'tags' => $tags,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('manage/admin/tags/create', [
            'contextOptions' => collect(Tag::CONTEXTS)
                ->map(fn ($label, $value) => ['value' => $value, 'label' => $label])
                ->values(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'context' => ['required', Rule::in(array_keys(Tag::CONTEXTS))],
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:500'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ]);

        $slug = $this->prepareSlug(
            (string) ($validated['slug'] ?? ''),
            (string) $validated['name'],
            (string) $validated['context'],
        );

        Tag::create([
            'context' => $validated['context'],
            'name' => $validated['name'],
            'slug' => $slug,
            'description' => $validated['description'] ?? null,
            'sort_order' => $validated['sort_order'] ?? 0,
        ]);

        return redirect()->route('manage.tags.index')->with('success', '標籤建立成功');
    }

    public function show(Tag $tag): Response
    {
        return Inertia::render('manage/admin/tags/show', [
            'tag' => [
                'id' => $tag->id,
                'context' => $tag->context,
                'context_label' => Tag::CONTEXTS[$tag->context] ?? $tag->context,
                'name' => $tag->name,
                'slug' => $tag->slug,
                'description' => $tag->description,
                'sort_order' => $tag->sort_order,
                'created_at' => optional($tag->created_at)?->toIso8601String(),
                'updated_at' => optional($tag->updated_at)?->toIso8601String(),
            ],
            'contextOptions' => collect(Tag::CONTEXTS)
                ->map(fn ($label, $value) => ['value' => $value, 'label' => $label])
                ->values(),
        ]);
    }

    public function edit(Tag $tag): Response
    {
        return Inertia::render('manage/admin/tags/edit', [
            'tag' => [
                'id' => $tag->id,
                'context' => $tag->context,
                'name' => $tag->name,
                'slug' => $tag->slug,
                'description' => $tag->description,
                'sort_order' => $tag->sort_order,
            ],
            'contextOptions' => collect(Tag::CONTEXTS)
                ->map(fn ($label, $value) => ['value' => $value, 'label' => $label])
                ->values(),
        ]);
    }

    public function update(Request $request, Tag $tag): RedirectResponse
    {
        $validated = $request->validate([
            'context' => ['required', Rule::in(array_keys(Tag::CONTEXTS))],
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:500'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ]);

        $slug = $this->prepareSlug(
            (string) ($validated['slug'] ?? ''),
            (string) $validated['name'],
            (string) $validated['context'],
            $tag->id,
        );

        $tag->update([
            'context' => $validated['context'],
            'name' => $validated['name'],
            'slug' => $slug,
            'description' => $validated['description'] ?? null,
            'sort_order' => $validated['sort_order'] ?? 0,
        ]);

        return redirect()->route('manage.tags.index')->with('success', '標籤更新成功');
    }

    public function destroy(Tag $tag): RedirectResponse
    {
        $tag->delete();

        return redirect()->route('manage.tags.index')->with('success', '標籤刪除成功');
    }

    private function prepareSlug(string $slug, string $name, string $context, ?int $ignoreId = null): string
    {
        $base = Str::slug($slug !== '' ? $slug : $name);
        if ($base === '') {
            $base = Str::slug(Str::random(8));
        }

        $candidate = $base;
        $suffix = 1;

        while (Tag::query()
            ->when($ignoreId, fn ($query) => $query->where('id', '!=', $ignoreId))
            ->where('context', $context)
            ->where('slug', $candidate)
            ->exists()) {
            $candidate = $base . '-' . $suffix;
            $suffix++;
        }

        return $candidate;
    }
}
