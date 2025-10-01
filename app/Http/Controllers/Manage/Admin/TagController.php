<?php

namespace App\Http\Controllers\Manage\Admin;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class TagController extends Controller
{
    /**
     * 顯示標籤管理列表。
     */
    public function index(): Response
    {
        return Inertia::render('manage/admin/tags/index');
    }
}
