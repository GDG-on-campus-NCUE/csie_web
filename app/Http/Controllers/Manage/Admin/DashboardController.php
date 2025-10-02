<?php

namespace App\Http\Controllers\Manage\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\Manage\DashboardResource;
use App\Services\DashboardMetricService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(private readonly DashboardMetricService $dashboardMetricService)
    {
    }

    /**
     * 顯示管理後台儀表板。
     */
    public function index(Request $request): Response
    {
        $dashboard = $this->dashboardMetricService->getAdminDashboardData($request->user());

        return Inertia::render('manage/admin/dashboard', [
            'dashboard' => DashboardResource::make($dashboard)->resolve(),
        ]);
    }
}
