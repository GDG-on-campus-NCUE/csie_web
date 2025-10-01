<?php

namespace App\Http\Controllers\Manage\Admin;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    /**
     * 顯示使用者管理列表。
     */
    public function index(): Response
    {
        return Inertia::render('manage/admin/users/index');
    }
}
