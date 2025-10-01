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
            ->map(static fn (string $role) => strtolower(trim($role)))
            ->filter()
            ->unique()
            ->values()
            ->all();

        // 使用新的角色系統檢查權限
        $hasPermission = false;
        if ($user) {
            if ($allowedRoles === []) {
                $hasPermission = true;
            } else {
                foreach ($allowedRoles as $role) {
                    if ($user->hasRoleOrHigher($role)) {
                        $hasPermission = true;

                        break;
                    }
                }
            }
        }

        if (!$hasPermission) {
            if ($request->expectsJson() || ! $request->isMethod('GET')) {
                abort(Response::HTTP_FORBIDDEN);
            }

            return redirect()->route('home');
        }

        return $next($request);
    }
}
