<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class RouteRedirectController extends Controller
{
    /**
     * 依據目前使用者角色重新導向至對應的後台儀表板。
     */
    public function manageDashboard(Request $request): RedirectResponse
    {
        $user = $request->user();

        if ($user === null) {
            return redirect()->route('home');
        }

        if ($user->isAdmin()) {
            return redirect()->route('manage.admin.dashboard');
        }

        if ($user->isTeacher()) {
            return redirect()->route('manage.teacher.dashboard');
        }

        return redirect()->route('manage.user.dashboard');
    }
}
