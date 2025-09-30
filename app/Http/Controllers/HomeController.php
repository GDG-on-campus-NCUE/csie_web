<?php

namespace App\Http\Controllers;

use App\Models\Lab;
use App\Models\Post;
use App\Models\Project;
use App\Models\User;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function __invoke(): Response
    {
        $latestPosts = Post::with('category:id,slug,name,name_en')
            ->published()
            ->orderByDesc('pinned')
            ->orderByDesc('publish_at')
            ->limit(6)
            ->get()
            ->map(fn (Post $post) => [
                'id' => $post->id,
                'slug' => $post->slug,
                'title' => [
                    'zh-TW' => $post->title,
                    'en' => $post->title_en,
                ],
                'summary' => [
                    'zh-TW' => $post->summary,
                    'en' => $post->summary_en,
                ],
                'cover_image_url' => $post->cover_image_url
                    ? (Str::startsWith($post->cover_image_url, ['http://', 'https://', '/'])
                        ? $post->cover_image_url
                        : asset($post->cover_image_url))
                    : null,
                'category' => $post->category ? [
                    'name' => $post->category->name,
                    'name_en' => $post->category->name_en,
                    'slug' => $post->category->slug,
                ] : null,
                'publish_at' => optional($post->publish_at)->toISOString(),
            ]);

        $featuredLabs = Lab::withCount('teachers')
            ->where('visible', true)
            ->orderBy('sort_order')
            ->orderBy('name')
            ->limit(6)
            ->get()
            ->map(fn (Lab $lab) => [
                'id' => $lab->id,
                'code' => $lab->code,
                'name' => [
                    'zh-TW' => $lab->name,
                    'en' => $lab->name_en,
                ],
                'cover_image_url' => $lab->cover_image_url
                    ? (Str::startsWith($lab->cover_image_url, ['http://', 'https://', '/'])
                        ? $lab->cover_image_url
                        : asset($lab->cover_image_url))
                    : null,
                'description' => [
                    'zh-TW' => $lab->description,
                    'en' => $lab->description_en,
                ],
                'teachers_count' => $lab->teachers_count,
            ]);

        $teacherBaseQuery = User::query()
            ->where('status', 'active')
            ->whereHas('userRoles', function ($query) {
                $query->where('status', 'active')
                    ->whereHas('role', fn ($role) => $role->where('name', 'teacher'));
            });

        $spotlightTeachers = (clone $teacherBaseQuery)
            ->with(['profile', 'researchRecords.tags'])
            ->orderBy('name')
            ->limit(4)
            ->get(['id', 'name'])
            ->map(function (User $teacher) {
                $profile = $teacher->profile;
                $avatar = $profile?->avatar_url;

                if ($avatar && ! Str::startsWith($avatar, ['http://', 'https://', '/'])) {
                    $avatar = Storage::disk('public')->url($avatar);
                }

                $expertise = $teacher->researchRecords
                    ->flatMap(fn ($record) => $record->tags->pluck('name'))
                    ->unique()
                    ->values();

                $primaryTitle = '教師';
                if (is_array($profile?->experience) && ! empty($profile->experience)) {
                    $firstExperience = $profile->experience[0];
                    if (is_array($firstExperience) && ! empty($firstExperience['title'])) {
                        $primaryTitle = (string) $firstExperience['title'];
                    } elseif (is_string($firstExperience) && $firstExperience !== '') {
                        $primaryTitle = $firstExperience;
                    }
                }

                $expertiseLabel = $expertise->isNotEmpty() ? $expertise->implode(', ') : null;

                return [
                    'id' => $teacher->id,
                    'slug' => (string) $teacher->id,
                    'name' => [
                        'zh-TW' => $teacher->name,
                        'en' => $teacher->name,
                    ],
                    'title' => [
                        'zh-TW' => $primaryTitle,
                        'en' => $primaryTitle !== '教師' ? $primaryTitle : 'Faculty',
                    ],
                    'photo_url' => $avatar,
                    'expertise' => [
                        'zh-TW' => $expertiseLabel,
                        'en' => $expertiseLabel,
                    ],
                ];
            });

        $teacherCount = (clone $teacherBaseQuery)->count();

        $statistics = [
            [
                'key' => 'faculty',
                'label' => [
                    'zh-TW' => '專任師資',
                    'en' => 'Full-time Faculty',
                ],
                'value' => $teacherCount,
            ],
            [
                'key' => 'labs',
                'label' => [
                    'zh-TW' => '研究實驗室',
                    'en' => 'Research Labs',
                ],
                'value' => Lab::where('visible', true)->count(),
            ],
            [
                'key' => 'projects',
                'label' => [
                    'zh-TW' => '產學合作計畫',
                    'en' => 'Industry Collaborations',
                ],
                'value' => Project::where('visible', true)->count(),
            ],
            [
                'key' => 'posts',
                'label' => [
                    'zh-TW' => '年度公告',
                    'en' => 'Annual Bulletins',
                ],
                'value' => Post::published()
                    ->where('publish_at', '>=', now()->subYear())
                    ->count(),
            ],
        ];

        $heroSlides = $latestPosts->take(3)->map(fn (array $post) => [
            'image' => $post['cover_image_url'] ?? '/images/banner/banner1.png',
            'headline' => $post['title'],
            'summary' => $post['summary'],
            'href' => "/bulletins/{$post['slug']}",
        ]);

        $activeProjects = Project::where('visible', true)
            ->orderByDesc('start_date')
            ->limit(6)
            ->get([
                'id',
                'code',
                'title',
                'title_en',
                'sponsor',
                'website_url',
                'start_date',
                'end_date',
            ])
            ->map(fn (Project $project) => [
                'id' => $project->id,
                'code' => $project->code,
                'title' => [
                    'zh-TW' => $project->title,
                    'en' => $project->title_en,
                ],
                'sponsor' => $project->sponsor,
                'website_url' => $project->website_url,
                'start_date' => optional($project->start_date)->toDateString(),
                'end_date' => optional($project->end_date)->toDateString(),
            ]);

        $quickLinks = [
            [
                'href' => '/bulletins?cat=admission',
                'title' => [
                    'zh-TW' => '招生資訊',
                    'en' => 'Admission',
                ],
                'description' => [
                    'zh-TW' => '碩博士、學士班與在職專班最新招生公告',
                    'en' => 'Latest admission news for undergraduate, graduate, and executive programs.',
                ],
            ],
            [
                'href' => '/bulletins?cat=events',
                'title' => [
                    'zh-TW' => '活動報名',
                    'en' => 'Events',
                ],
                'description' => [
                    'zh-TW' => '系友返校、企業參訪與校園活動即時情報',
                    'en' => 'Stay tuned for alumni gatherings, company visits, and campus events.',
                ],
            ],
            [
                'href' => '/labs',
                'title' => [
                    'zh-TW' => '研究實驗室',
                    'en' => 'Research Labs',
                ],
                'description' => [
                    'zh-TW' => '掌握各研究團隊的最新成果與招生資訊',
                    'en' => 'Discover research teams, latest achievements, and join opportunities.',
                ],
            ],
            [
                'href' => '/people',
                'title' => [
                    'zh-TW' => '師資陣容',
                    'en' => 'Faculty',
                ],
                'description' => [
                    'zh-TW' => '認識專業師資與指導教授研究領域',
                    'en' => 'Meet our faculty members and their research specialties.',
                ],
            ],
        ];

        return Inertia::render('welcome', [
            'heroSlides' => $heroSlides,
            'statistics' => $statistics,
            'latestPosts' => $latestPosts,
            'featuredLabs' => $featuredLabs,
            'spotlightTeachers' => $spotlightTeachers,
            'quickLinks' => $quickLinks,
            'activeProjects' => $activeProjects,
        ]);
    }
}
