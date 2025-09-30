<?php

namespace App\Http\Controllers;

use App\Models\Lab;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class PeopleController extends Controller
{
    public function index(Request $request): Response
    {
        $roleFilter = $request->input('role');
        $search = trim((string) $request->input('q', ''));

        $query = User::query()
            ->where('status', 'active')
            ->with([
                'profile.links',
                'labs:id,code,name,name_en',
                'userRoles.role',
                'researchRecords.tags',
            ]);

        if ($roleFilter === 'faculty') {
            $query->whereHas('userRoles', function ($q) {
                $q->where('status', 'active')->whereHas('role', fn ($role) => $role->where('name', 'teacher'));
            });
        } elseif ($roleFilter === 'staff') {
            $query->whereDoesntHave('userRoles', function ($q) {
                $q->where('status', 'active')->whereHas('role', fn ($role) => $role->where('name', 'teacher'));
            });
        }

        if ($search !== '') {
            $query->where(function ($inner) use ($search) {
                $inner->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $users = $query->orderBy('name')->get();

        $people = $users->map(function (User $user) {
            $role = $user->isTeacher() ? 'faculty' : 'staff';
            $profile = $user->profile;
            $avatar = $profile?->avatar_url;
            if ($avatar && ! str_starts_with($avatar, 'http')) {
                $avatar = Storage::disk('public')->url($avatar);
            }

            $expertise = $user->researchRecords
                ->flatMap(fn ($record) => $record->tags->pluck('name')->all())
                ->unique()
                ->values();

            return [
                'id' => $user->id,
                'slug' => (string) $user->id,
                'role' => $role,
                'name' => [
                    'zh-TW' => $user->name,
                    'en' => $user->name,
                ],
                'title' => [
                    'zh-TW' => $role === 'faculty' ? '教師' : '成員',
                    'en' => $role === 'faculty' ? 'Faculty' : 'Member',
                ],
                'email' => $user->email,
                'phone' => null,
                'office' => null,
                'photo_url' => $avatar,
                'expertise' => $expertise->isNotEmpty()
                    ? [
                        'zh-TW' => $expertise->implode(', '),
                        'en' => $expertise->implode(', '),
                    ]
                    : null,
                'bio' => $profile?->bio
                    ? [
                        'zh-TW' => nl2br(e($profile->bio)),
                        'en' => nl2br(e($profile->bio)),
                    ]
                    : null,
                'labs' => $user->labs->map(fn (Lab $lab) => [
                    'code' => $lab->code,
                    'name' => [
                        'zh-TW' => $lab->name,
                        'en' => $lab->name_en,
                    ],
                ])->values()->all(),
            ];
        })->values();

        return Inertia::render('people/index', [
            'people' => $people,
            'filters' => [
                'role' => $roleFilter ?? null,
                'q' => $search !== '' ? $search : null,
            ],
            'statistics' => [
                'faculty' => $people->where('role', 'faculty')->count(),
                'staff' => $people->where('role', 'staff')->count(),
            ],
        ]);
    }

    public function show(User $user): Response
    {
        $user->load(['profile.links', 'labs:id,code,name,name_en', 'userRoles.role', 'researchRecords.tags']);

        $role = $user->isTeacher() ? 'faculty' : 'staff';
        $profile = $user->profile;
        $avatar = $profile?->avatar_url;
        if ($avatar && ! str_starts_with($avatar, 'http')) {
            $avatar = Storage::disk('public')->url($avatar);
        }

        $expertise = $user->researchRecords
            ->flatMap(fn ($record) => $record->tags->pluck('name')->all())
            ->unique()
            ->values();

        $links = $profile?->links->map(fn ($link) => [
            'id' => $link->id,
            'type' => $link->type,
            'label' => $link->label,
            'url' => $link->url,
        ])->values()->all();

        return Inertia::render('people/show', [
            'person' => [
                'id' => $user->id,
                'role' => $role,
                'name' => [
                    'zh-TW' => $user->name,
                    'en' => $user->name,
                ],
                'title' => [
                    'zh-TW' => $role === 'faculty' ? '教師' : '成員',
                    'en' => $role === 'faculty' ? 'Faculty' : 'Member',
                ],
                'email' => $user->email,
                'phone' => null,
                'office' => null,
                'photo_url' => $avatar,
                'bio' => $profile?->bio
                    ? [
                        'zh-TW' => nl2br(e($profile->bio)),
                        'en' => nl2br(e($profile->bio)),
                    ]
                    : null,
                'expertise' => $expertise->isNotEmpty()
                    ? [
                        'zh-TW' => $expertise->implode(', '),
                        'en' => $expertise->implode(', '),
                    ]
                    : null,
                'education' => $profile && ! empty($profile->education)
                    ? [
                        'zh-TW' => $this->toListHtml($profile->education),
                        'en' => $this->toListHtml($profile->education),
                    ]
                    : null,
                'labs' => $user->labs->map(fn (Lab $lab) => [
                    'code' => $lab->code,
                    'name' => [
                        'zh-TW' => $lab->name,
                        'en' => $lab->name_en,
                    ],
                ])->values()->all(),
                'links' => $links,
            ],
        ]);
    }

    private function toListHtml(array $items): string
    {
        $content = collect($items)
            ->filter(fn ($item) => is_string($item) && $item !== '')
            ->map(fn ($item) => '<li>'.e($item).'</li>')
            ->implode('');

        return $content === '' ? '' : '<ul>'.$content.'</ul>';
    }
}
