<?php

namespace App\Http\Middleware;

use App\Models\Attachment;
use App\Models\Post;
use App\Models\Tag;
use App\Models\User;
use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Lang;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $shared = parent::share($request);

        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');

        $availableLocales = ['zh-TW', 'en'];

        $translations = [];
        foreach (['common', 'home', 'manage', 'auth'] as $namespace) {
            foreach ($availableLocales as $locale) {
                $translations[$namespace][$locale] = Lang::get($namespace, [], $locale);
            }
        }

        return [
            ...$shared,
            'name' => config('app.name'),
            'quote' => ['message' => trim($message), 'author' => trim($author)],
            'auth' => [
                        'user' => $request->user()
                    ? fn () => $request->user()->only([
                        'id', 'name', 'email', 'locale', 'status',
                    ]) + [
                        'roles' => $request->user()->getActiveRoles(),
                        'primary_role' => $request->user()->getPrimaryRole(),
                        'avatar' => $request->user()->avatar ?? null,
                        'email_verified_at' => optional($request->user()->email_verified_at)?->toIso8601String(),
                    ]
                    : null,
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'locale' => app()->getLocale(),
            'locales' => $availableLocales,
            // 前端共用的翻譯字串
            'i18n' => $translations,
            'flash' => [
                ...($shared['flash'] ?? []),
                'info' => $request->session()->get('info'),
                'importErrors' => $request->session()->get('importErrors'),
            ],
            'abilities' => fn () => $this->resolveAbilities($request),
        ];
    }

    /**
     * 建立權限對應表，供前端依據權限切換功能。
     */
    protected function resolveAbilities(Request $request): array
    {
        $user = $request->user();

        if (! $user) {
            return [];
        }

        return [
            'manage.posts.view' => $user->can('viewAny', Post::class),
            'manage.posts.create' => $user->can('create', Post::class),
            'manage.tags.view' => $user->can('viewAny', Tag::class),
            'manage.users.view' => $user->can('viewAny', User::class),
            'manage.users.create' => $user->can('create', User::class),
            'manage.attachments.view' => $user->can('viewAny', Attachment::class),
            'manage.attachments.create' => $user->isAdmin(),
            'manage.messages.view' => $user->isAdmin(),
        ];
    }
}
