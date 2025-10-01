<?php

namespace App\Http\Controllers\Manage\Admin;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class AttachmentController extends Controller
{
    /**
     * 顯示附件資源列表。
     */
    public function index(): Response
    {
        return Inertia::render('manage/admin/attachments/index');
    }
}
