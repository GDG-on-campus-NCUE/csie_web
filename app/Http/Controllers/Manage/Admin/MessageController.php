<?php

namespace App\Http\Controllers\Manage\Admin;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class MessageController extends Controller
{
    /**
     * 顯示聯絡表單訊息。
     */
    public function index(): Response
    {
        return Inertia::render('manage/admin/messages/index');
    }
}
