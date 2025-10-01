<?php

namespace App\Http\Controllers\Manage\Teacher;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class ProjectController extends Controller
{
    /**
     * 顯示研究計畫管理頁面。
     */
    public function index(): Response
    {
        return Inertia::render('manage/teacher/projects/index');
    }
}
