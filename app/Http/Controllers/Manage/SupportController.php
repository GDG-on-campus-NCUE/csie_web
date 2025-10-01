<?php

namespace App\Http\Controllers\Manage;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class SupportController extends Controller
{
    /**
     * 顯示技術支援頁面。
     */
    public function __invoke(): Response
    {
        return Inertia::render('manage/support/index');
    }
}
