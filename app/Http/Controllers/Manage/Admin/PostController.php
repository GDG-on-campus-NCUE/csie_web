<?php

namespace App\Http\Controllers\Manage\Admin;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class PostController extends Controller
{
    /**
     * 顯示公告列表頁面。
     */
    public function index(): Response
    {
        return Inertia::render('manage/admin/posts/index', [
            // 範例資料：實務上會從資料庫取得
            'posts' => [
                [
                    'id' => 1,
                    'title' => 'CSIE 新進師資公告',
                    'status' => 'published',
                    'updated_at' => '2024-03-18',
                ],
                [
                    'id' => 2,
                    'title' => '期中考試教室調整',
                    'status' => 'review',
                    'updated_at' => '2024-03-17',
                ],
                [
                    'id' => 3,
                    'title' => '學生競賽獲獎名單',
                    'status' => 'draft',
                    'updated_at' => '2024-03-16',
                ],
            ],
        ]);
    }

    /**
     * 顯示新增公告頁面。
     */
    public function create(): Response
    {
        return Inertia::render('manage/admin/posts/create');
    }

    /**
     * 顯示公告詳細內容。
     */
    public function show(string $post): Response
    {
        return Inertia::render('manage/admin/posts/show', [
            'post' => [
                'id' => (int) $post,
                'title' => 'CSIE 新進師資公告',
                'status' => 'published',
                'content' => '這裡會呈現公告的完整內容，包含附件與多語資訊。',
                'updated_at' => '2024-03-18 09:30',
                'author' => '系辦公室',
            ],
        ]);
    }

    /**
     * 顯示編輯公告頁面。
     */
    public function edit(string $post): Response
    {
        return Inertia::render('manage/admin/posts/edit', [
            'post' => [
                'id' => (int) $post,
                'title' => 'CSIE 新進師資公告',
                'status' => 'published',
                'content' => '這裡會載入公告的既有內容，供後續編輯更新。',
                'updated_at' => '2024-03-18 09:30',
                'author' => '系辦公室',
            ],
        ]);
    }
}
