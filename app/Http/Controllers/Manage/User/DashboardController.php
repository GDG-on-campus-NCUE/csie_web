<?php

namespace App\Http\Controllers\Manage\User;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * 顯示一般會員儀表板。
     */
    public function __invoke(): Response
    {
        return Inertia::render('manage/user/dashboard');
    }
}
