<?php

namespace App\Http\Controllers\Manage\Settings;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * 顯示個人檔案設定頁面。
     */
    public function __invoke(): Response
    {
        return Inertia::render('manage/settings/profile');
    }
}
