<?php

namespace App\Http\Controllers;

use App\Models\Lab;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class LabController extends Controller
{
    public function index(Request $request): Response
    {
        $keyword = $request->query('q');

        $labs = Lab::where('visible', true)
            ->with('teachers:id,name')
            ->when($keyword, function ($query) use ($keyword) {
                $like = "%{$keyword}%";
                $query->where(function ($inner) use ($like) {
                    $inner->where('name', 'like', $like)
                        ->orWhere('name_en', 'like', $like)
                        ->orWhere('description', 'like', $like)
                        ->orWhere('description_en', 'like', $like);
                });
            })
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get()
            ->map(fn (Lab $lab) => [
                'id' => $lab->id,
                'code' => $lab->code,
                'name' => [
                    'zh-TW' => $lab->name,
                    'en' => $lab->name_en,
                ],
                'description' => [
                    'zh-TW' => $lab->description,
                    'en' => $lab->description_en,
                ],
                'cover_image_url' => $lab->cover_image_url
                    ? (Str::startsWith($lab->cover_image_url, ['http://', 'https://', '/'])
                        ? $lab->cover_image_url
                        : asset($lab->cover_image_url))
                    : null,
                'website_url' => $lab->website_url,
                'email' => $lab->email,
                'phone' => $lab->phone,
                'teachers' => $lab->teachers->map(fn ($teacher) => [
                    'id' => $teacher->id,
                    'name' => [
                        'zh-TW' => $teacher->name,
                        'en' => $teacher->name,
                    ],
                ])->values(),
            ]);

        return Inertia::render('labs/index', [
            'labs' => $labs,
            'filters' => [
                'q' => $keyword,
            ],
        ]);
    }

    public function show(Lab $lab): Response
    {
        return Inertia::render('labs/show', [
            'lab' => [
                'id' => $lab->id,
                'code' => $lab->code,
                'name' => [
                    'zh-TW' => $lab->name,
                    'en' => $lab->name_en,
                ],
                'description' => [
                    'zh-TW' => $lab->description,
                    'en' => $lab->description_en,
                ],
                'cover_image_url' => $lab->cover_image_url
                    ? (Str::startsWith($lab->cover_image_url, ['http://', 'https://', '/'])
                        ? $lab->cover_image_url
                        : asset($lab->cover_image_url))
                    : null,
                'website_url' => $lab->website_url,
                'email' => $lab->email,
                'phone' => $lab->phone,
                'teachers' => $lab->teachers()->orderBy('name')->get()->map(fn ($teacher) => [
                    'id' => $teacher->id,
                    'name' => [
                        'zh-TW' => $teacher->name,
                        'en' => $teacher->name,
                    ],
                ])->values(),
            ],
        ]);
    }
}
