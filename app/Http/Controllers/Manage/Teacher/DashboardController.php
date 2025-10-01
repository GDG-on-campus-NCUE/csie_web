<?php

namespace App\Http\Controllers\Manage\Teacher;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * 顯示教師後台儀表板。
     */
    public function __invoke(): Response
    {
        return Inertia::render('manage/teacher/dashboard');
    }
}
