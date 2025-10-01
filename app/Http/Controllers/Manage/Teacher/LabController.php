<?php

namespace App\Http\Controllers\Manage\Teacher;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class LabController extends Controller
{
    /**
     * 顯示實驗室管理頁面。
     */
    public function index(): Response
    {
        return Inertia::render('manage/teacher/labs/index');
    }
}
