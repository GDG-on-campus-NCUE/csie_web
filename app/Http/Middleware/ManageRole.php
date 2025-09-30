<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Symfony\Component\HttpFoundation\Response as BaseResponse;

class ManageRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string $role): BaseResponse
    {
        // Check if user is authenticated
        if (!$request->user()) {
            return redirect()->route('login');
        }

        $user = $request->user();

        // 使用新的角色系統檢查權限
        if (!$user->hasRoleOrHigher($role)) {
            // Return appropriate response based on request type
            if ($request->expectsJson() || $request->is('api/*')) {
                return response()->json([
                    'message' => 'Insufficient privileges for this action.',
                    'required_role' => $role,
                    'user_roles' => $user->getActiveRoles(),
                ], 403);
            }

            abort(403, 'Insufficient privileges to access this resource.');
        }

        return $next($request);
    }

    // 移除舊的階層檢查方法，改用 User Model 的新方法
}
