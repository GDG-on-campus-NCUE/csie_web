<?php

namespace App\Http\Controllers\Manage\Settings;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class AppearanceController extends Controller
{
    /**
     * 顯示介面外觀設定頁面。
     */
    public function __invoke(): Response
    {
        return Inertia::render('manage/settings/appearance');
    }
}
