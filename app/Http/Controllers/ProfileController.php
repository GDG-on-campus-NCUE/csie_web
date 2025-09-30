<?php

namespace App\Http\Controllers;

use App\Services\UserRoleProfileSynchronizer;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    public function __construct(protected UserRoleProfileSynchronizer $synchronizer)
    {
    }

    public function index(): Response
    {
        $user = auth()->user()->load([
            'profile.links',
            'labs:id,name,name_en',
            'classrooms:id,name,name_en',
            'researchRecords.tags',
            'userRoles.role',
        ]);

        return Inertia::render('Profile/Index', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'roles' => $user->roles,
                'profile' => $user->profile ? [
                    'avatar_url' => $user->profile->avatar_url,
                    'bio' => $user->profile->bio,
                    'experience' => $user->profile->experience ?? [],
                    'education' => $user->profile->education ?? [],
                    'links' => $user->profile->links->map(fn ($link) => [
                        'id' => $link->id,
                        'type' => $link->type,
                        'label' => $link->label,
                        'url' => $link->url,
                    ])->toArray(),
                ] : null,
                'labs' => $user->labs->map(fn ($lab) => [
                    'id' => $lab->id,
                    'name' => $lab->name,
                    'name_en' => $lab->name_en,
                ])->toArray(),
                'classrooms' => $user->classrooms->map(fn ($classroom) => [
                    'id' => $classroom->id,
                    'name' => $classroom->name,
                    'name_en' => $classroom->name_en,
                ])->toArray(),
                'research_records' => $user->researchRecords->map(fn ($record) => [
                    'id' => $record->id,
                    'title' => $record->title,
                    'type' => $record->type,
                    'description' => $record->description,
                    'published_at' => optional($record->published_at)?->toDateString(),
                    'tags' => $record->tags->map(fn ($tag) => [
                        'id' => $tag->id,
                        'name' => $tag->name,
                    ])->toArray(),
                ])->toArray(),
            ],
        ]);
    }

    public function edit(): Response
    {
        $user = auth()->user()->load('profile.links');

        return Inertia::render('Profile/Edit', [
            'profile' => [
                'avatar_url' => $user->profile->avatar_url ?? null,
                'bio' => $user->profile->bio ?? null,
                'experience' => $user->profile->experience ?? [],
                'education' => $user->profile->education ?? [],
                'links' => $user->profile?->links->map(fn ($link) => [
                    'id' => $link->id,
                    'type' => $link->type,
                    'label' => $link->label,
                    'url' => $link->url,
                    'sort_order' => $link->sort_order,
                ])->toArray() ?? [],
            ],
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $user = auth()->user();

        $data = $request->validate([
            'avatar_url' => ['nullable', 'string', 'max:2048'],
            'bio' => ['nullable', 'string'],
            'experience' => ['nullable', 'array'],
            'experience.*' => ['string'],
            'education' => ['nullable', 'array'],
            'education.*' => ['string'],
            'links' => ['nullable', 'array'],
            'links.*.type' => ['nullable', 'string', 'max:50'],
            'links.*.label' => ['nullable', 'string', 'max:255'],
            'links.*.url' => ['required_with:links', 'string', 'max:2048'],
        ]);

        $profileData = [
            'avatar_url' => $data['avatar_url'] ?? null,
            'bio' => $data['bio'] ?? null,
            'experience' => $data['experience'] ?? [],
            'education' => $data['education'] ?? [],
            'links' => $data['links'] ?? [],
        ];

        $this->synchronizer->synchronizeUserProfile($user, $user->getActiveRoles(), $profileData);

        return redirect()->route('profile.index')->with('success', '個人檔案已更新');
    }
}
