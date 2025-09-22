<?php

namespace App\Http\Controllers\Manage\Admin;

use App\Http\Controllers\Controller;
use App\Models\Publication;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PublicationController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(Publication::class, 'publication');
    }
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $perPage = (int) $request->input('per_page', 15);
        if ($perPage < 1) {
            $perPage = 15;
        }

        if ($perPage > 200) {
            $perPage = 200;
        }

        $publications = Publication::orderBy('year', 'desc')
            ->orderBy('title->zh-TW')
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('manage/admin/publications/index', [
            'publications' => $publications,
            'perPage' => $perPage,
            'perPageOptions' => [15, 30, 50, 100, 200],
            'filters' => $request->only(['per_page']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('manage/admin/publications/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|array',
            'title.zh-TW' => 'required|string|max:255',
            'title.en' => 'nullable|string|max:255',
            'authors_text' => 'required|array',
            'authors_text.zh-TW' => 'required|string',
            'authors_text.en' => 'nullable|string',
            'abstract' => 'nullable|array',
            'abstract.zh-TW' => 'nullable|string',
            'abstract.en' => 'nullable|string',
            'year' => 'required|integer|min:1900|max:' . (date('Y') + 5),
            'type' => 'required|in:journal,conference,book,other',
            'venue' => 'nullable|string',
            'doi' => 'nullable|string',
            'url' => 'nullable|url',
            'visible' => 'boolean',
        ]);

        // Transform nested array data to flat fields
        $publicationData = [
            'title' => $validated['title']['zh-TW'] ?? '',
            'title_en' => $validated['title']['en'] ?? $validated['title']['zh-TW'] ?? '',
            'authors_text' => $validated['authors_text']['zh-TW'] ?? '',
            'authors_text_en' => $validated['authors_text']['en'] ?? $validated['authors_text']['zh-TW'] ?? '',
            'abstract' => $validated['abstract']['zh-TW'] ?? null,
            'abstract_en' => $validated['abstract']['en'] ?? $validated['abstract']['zh-TW'] ?? null,
            'year' => $validated['year'],
            'type' => $validated['type'],
            'venue' => $validated['venue'] ?? null,
            'doi' => $validated['doi'] ?? null,
            'url' => $validated['url'] ?? null,
            'visible' => $validated['visible'] ?? true,
        ];

        Publication::create($publicationData);

        return redirect()->route('manage.publications.index')
            ->with('success', '論文建立成功');
    }

    /**
     * Display the specified resource.
     */
    public function show(Publication $publication)
    {
        return Inertia::render('manage/admin/publications/show', [
            'publication' => $publication,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Publication $publication)
    {
        return Inertia::render('manage/admin/publications/edit', [
            'publication' => $publication,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Publication $publication)
    {
        $validated = $request->validate([
            'title' => 'required|array',
            'title.zh-TW' => 'required|string|max:255',
            'title.en' => 'nullable|string|max:255',
            'authors_text' => 'required|array',
            'authors_text.zh-TW' => 'required|string',
            'authors_text.en' => 'nullable|string',
            'abstract' => 'nullable|array',
            'abstract.zh-TW' => 'nullable|string',
            'abstract.en' => 'nullable|string',
            'year' => 'required|integer|min:1900|max:' . (date('Y') + 5),
            'type' => 'required|in:journal,conference,book,other',
            'venue' => 'nullable|string',
            'doi' => 'nullable|string',
            'url' => 'nullable|url',
            'visible' => 'boolean',
        ]);

        // Transform nested array data to flat fields
        $publicationData = [
            'title' => $validated['title']['zh-TW'] ?? '',
            'title_en' => $validated['title']['en'] ?? $validated['title']['zh-TW'] ?? '',
            'authors_text' => $validated['authors_text']['zh-TW'] ?? '',
            'authors_text_en' => $validated['authors_text']['en'] ?? $validated['authors_text']['zh-TW'] ?? '',
            'abstract' => $validated['abstract']['zh-TW'] ?? null,
            'abstract_en' => $validated['abstract']['en'] ?? $validated['abstract']['zh-TW'] ?? null,
            'year' => $validated['year'],
            'type' => $validated['type'],
            'venue' => $validated['venue'] ?? null,
            'doi' => $validated['doi'] ?? null,
            'url' => $validated['url'] ?? null,
            'visible' => $validated['visible'] ?? true,
        ];

        $publication->update($publicationData);

        return redirect()->route('manage.publications.index')
            ->with('success', '論文更新成功');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Publication $publication)
    {
        $publication->delete();

        return redirect()->route('manage.publications.index')
            ->with('success', '論文刪除成功');
    }
}
