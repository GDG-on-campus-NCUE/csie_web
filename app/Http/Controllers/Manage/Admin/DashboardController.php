<?php

namespace App\Http\Controllers\Manage\Admin;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * 顯示管理後台儀表板。
     */
    public function __invoke(): Response
    {
        return Inertia::render('manage/admin/dashboard');
    }
}
