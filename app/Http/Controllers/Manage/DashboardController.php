<?php

namespace App\Http\Controllers\Manage;

use App\Actions\Admin\BuildAdminDashboardData;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request, BuildAdminDashboardData $buildDashboardData): Response
    {
        $user = $request->user();

        $dashboard = null;
        if ($user && in_array($user->role, ['admin', 'manager'], true)) {
            $dashboard = $buildDashboardData();
        }

        return Inertia::render('manage/dashboard', [
            'adminDashboard' => $dashboard,
        ]);
    }
}

