<?php

namespace App\Http\Controllers;

use App\Models\Person;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class StaffController extends Controller
{
    public function index(Request $request): Response
    {
        $roleFilter = $request->query('role');
        $keyword = $request->query('q');

        $baseQuery = Person::query()
            ->with([
                'teacherProfile.labs:id,code,name,name_en',
                'teacherProfile.links',
                'staffProfile',
            ])
            ->where('visible', true)
            ->where('status', 'active');

        $teachers = (clone $baseQuery)
            ->whereHas('teacherProfile')
            ->when($keyword, function ($query) use ($keyword) {
                $like = "%{$keyword}%";
                $query->where(function ($inner) use ($like) {
                    $inner->where('name', 'like', $like)
                        ->orWhere('name_en', 'like', $like)
                        ->orWhereHas('teacherProfile', function ($profileQuery) use ($like) {
                            $profileQuery->where('title', 'like', $like)
                                ->orWhere('title_en', 'like', $like)
                                ->orWhere('expertise', 'like', $like)
                                ->orWhere('expertise_en', 'like', $like);
                        });
                });
            })
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get()
            ->map(function (Person $person) {
                $profile = $person->teacherProfile;
                $name = $person->name;
                $title = $profile?->title;
                $slug = sprintf('teacher-%d-%s', $person->id, Str::slug($person->getRawOriginal('name_en') ?: ($name['zh-TW'] ?? 'teacher')));

                return [
                    'id' => $person->id,
                    'slug' => $slug,
                    'role' => 'faculty',
                    'name' => [
                        'zh-TW' => $person->getRawOriginal('name') ?? '',
                        'en' => $person->getRawOriginal('name_en') ?? '',
                    ],
                    'title' => [
                        'zh-TW' => $profile?->getRawOriginal('title') ?? '',
                        'en' => $profile?->getRawOriginal('title_en') ?? '',
                    ],
                    'email' => $person->email,
                    'phone' => $person->phone,
                    'office' => $profile?->office,
                    'photo_url' => $person->photo_url
                        ? (Str::startsWith($person->photo_url, ['http://', 'https://', '/'])
                            ? $person->photo_url
                            : asset($person->photo_url))
                        : null,
                    'expertise' => $profile?->expertise ?? ['zh-TW' => [], 'en' => []],
                    'labs' => $profile
                        ? $profile->labs->map(fn ($lab) => [
                            'code' => $lab->code,
                            'name' => [
                                'zh-TW' => $lab->name,
                                'en' => $lab->name_en,
                            ],
                        ])->values()->all()
                        : [],
                ];
            });

        $staff = (clone $baseQuery)
            ->whereHas('staffProfile')
            ->when($keyword, function ($query) use ($keyword) {
                $like = "%{$keyword}%";
                $query->where(function ($inner) use ($like) {
                    $inner->where('name', 'like', $like)
                        ->orWhere('name_en', 'like', $like)
                        ->orWhereHas('staffProfile', function ($profileQuery) use ($like) {
                            $profileQuery->where('position', 'like', $like)
                                ->orWhere('position_en', 'like', $like);
                        });
                });
            })
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get()
            ->map(function (Person $person) {
                $profile = $person->staffProfile;
                $slug = sprintf('staff-%d-%s', $person->id, Str::slug($person->getRawOriginal('name_en') ?: $person->getRawOriginal('name')));

                return [
                    'id' => $person->id,
                    'slug' => $slug,
                    'role' => 'staff',
                    'name' => [
                        'zh-TW' => $person->getRawOriginal('name') ?? '',
                        'en' => $person->getRawOriginal('name_en') ?? '',
                    ],
                    'title' => [
                        'zh-TW' => $profile?->getRawOriginal('position') ?? '',
                        'en' => $profile?->getRawOriginal('position_en') ?? '',
                    ],
                    'email' => $person->email,
                    'phone' => $person->phone,
                    'photo_url' => $person->photo_url
                        ? (Str::startsWith($person->photo_url, ['http://', 'https://', '/'])
                            ? $person->photo_url
                            : asset($person->photo_url))
                        : null,
                    'bio' => $person->bio ?? ['zh-TW' => '', 'en' => ''],
                ];
            });

        $people = match ($roleFilter) {
            'faculty' => $teachers,
            'staff' => $staff,
            default => $teachers->concat($staff)->values(),
        };

        return Inertia::render('people/index', [
            'people' => $people,
            'filters' => [
                'role' => $roleFilter,
                'q' => $keyword,
            ],
            'statistics' => [
                'faculty' => $teachers->count(),
                'staff' => $staff->count(),
            ],
        ]);
    }

    public function show(string $slug): Response
    {
        [$type, $id] = array_pad(explode('-', $slug, 3), 2, null);
        $id = (int) ($id ?? 0);

        if ($type === 'teacher') {
            $person = Person::with(['teacherProfile.labs:id,code,name,name_en', 'teacherProfile.links'])
                ->where('visible', true)
                ->where('status', 'active')
                ->whereHas('teacherProfile')
                ->findOrFail($id);

            $profile = $person->teacherProfile;

            return Inertia::render('people/show', [
                'person' => [
                    'id' => $person->id,
                    'role' => 'faculty',
                    'name' => [
                        'zh-TW' => $person->getRawOriginal('name') ?? '',
                        'en' => $person->getRawOriginal('name_en') ?? '',
                    ],
                    'title' => [
                        'zh-TW' => $profile?->getRawOriginal('title') ?? '',
                        'en' => $profile?->getRawOriginal('title_en') ?? '',
                    ],
                    'email' => $person->email,
                    'phone' => $person->phone,
                    'office' => $profile?->office,
                    'photo_url' => $person->photo_url
                        ? (Str::startsWith($person->photo_url, ['http://', 'https://', '/'])
                            ? $person->photo_url
                            : asset($person->photo_url))
                        : null,
                    'bio' => $person->bio ?? ['zh-TW' => '', 'en' => ''],
                    'expertise' => $profile?->expertise ?? ['zh-TW' => [], 'en' => []],
                    'education' => $profile?->education ?? ['zh-TW' => [], 'en' => []],
                    'labs' => $profile?->labs->map(fn ($lab) => [
                        'code' => $lab->code,
                        'name' => [
                            'zh-TW' => $lab->name,
                            'en' => $lab->name_en,
                        ],
                    ])->values() ?? collect(),
                    'links' => $profile
                        ? $profile->links->map(fn ($link) => [
                            'id' => $link->id,
                            'type' => $link->type,
                            'label' => $link->label,
                            'url' => $link->url,
                        ])->values()->all()
                        : [],
                ],
            ]);
        }

        $person = Person::with('staffProfile')
            ->where('visible', true)
            ->where('status', 'active')
            ->whereHas('staffProfile')
            ->findOrFail($id);

        $profile = $person->staffProfile;

        return Inertia::render('people/show', [
            'person' => [
                'id' => $person->id,
                'role' => 'staff',
                'name' => [
                    'zh-TW' => $person->getRawOriginal('name') ?? '',
                    'en' => $person->getRawOriginal('name_en') ?? '',
                ],
                'title' => [
                    'zh-TW' => $profile?->getRawOriginal('position') ?? '',
                    'en' => $profile?->getRawOriginal('position_en') ?? '',
                ],
                'email' => $person->email,
                'phone' => $person->phone,
                'photo_url' => $person->photo_url
                    ? (Str::startsWith($person->photo_url, ['http://', 'https://', '/'])
                        ? $person->photo_url
                        : asset($person->photo_url))
                    : null,
                'bio' => $person->bio ?? ['zh-TW' => '', 'en' => ''],
            ],
        ]);
    }
}
