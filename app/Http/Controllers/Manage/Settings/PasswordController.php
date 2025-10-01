<?php

namespace App\Http\Controllers\Manage\Settings;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class PasswordController extends Controller
{
    /**
     * 顯示安全性設定頁面。
     */
    public function __invoke(): Response
    {
        return Inertia::render('manage/settings/password');
    }
}
