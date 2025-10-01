<?php

namespace App\Http\Controllers\Manage\Teacher;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class PostController extends Controller
{
    /**
     * 顯示教師公告管理頁面。
     */
    public function index(): Response
    {
        return Inertia::render('manage/teacher/posts/index');
    }
}
