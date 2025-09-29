<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureManageRole
{
    /**
     * 處理傳入的請求。
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response|RedirectResponse
    {
        $user = $request->user();

        $allowedRoles = collect($roles)
            ->flatMap(static fn (string $role) => preg_split('/[|,]/', $role) ?: [$role])
            ->map(static fn (string $role) => trim($role))
            ->filter()
            ->unique()
            ->values()
            ->all();

        if (! $user || ! in_array($user->role, $allowedRoles, true)) {
            if ($request->expectsJson() || ! $request->isMethod('GET')) {
                abort(Response::HTTP_FORBIDDEN);
            }

            return redirect()->route('home');
        }

        return $next($request);
    }
}
