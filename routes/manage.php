<?php

use Illuminate\Support\Facades\Route;

// 管理後台控制器
use App\Http\Controllers\Manage\DashboardController;
use App\Http\Controllers\Manage\UserController;
use App\Http\Controllers\Manage\PostController;
use App\Http\Controllers\Manage\Admin\StaffController as AdminStaffController;
use App\Http\Controllers\Manage\Admin\LabController as AdminLabController;
use App\Http\Controllers\Manage\Admin\TeacherController as AdminTeacherController;
use App\Http\Controllers\Manage\Admin\ClassroomController as AdminClassroomController;
use App\Http\Controllers\Manage\Admin\PostCategoryController as AdminPostCategoryController;
use App\Http\Controllers\Manage\Admin\ProgramController as AdminProgramController;
use App\Http\Controllers\Manage\Admin\AcademicController as AdminAcademicController;
use App\Http\Controllers\Manage\Admin\ProjectController as AdminProjectController;
use App\Http\Controllers\Manage\Admin\PublicationController as AdminPublicationController;
use App\Http\Controllers\Manage\Admin\ContactMessageController as AdminContactMessageController;
use App\Http\Controllers\Manage\Admin\AttachmentController as AdminAttachmentController;
use App\Http\Controllers\Manage\Admin\TagController as AdminTagController;

// 基本的管理後台功能，允許所有已驗證的角色訪問
Route::middleware(['auth', 'verified', 'role:admin|teacher|user'])
    ->prefix('manage')->name('manage.')
    ->group(function () {
        Route::get('/', function () {
            return redirect()->route('manage.dashboard');
        });

        Route::get('/dashboard', DashboardController::class)->name('dashboard');
    });

// 進階管理功能，僅限管理員和教師
Route::middleware(['auth', 'role:admin|teacher'])
    ->prefix('manage')->name('manage.')
    ->group(function () {

        // 公告管理
        Route::resource('posts', PostController::class);
        Route::post('posts/bulk', [PostController::class, 'bulk'])->name('posts.bulk');
        Route::resource('post-categories', AdminPostCategoryController::class);

        // 使用者管理
        Route::resource('users', UserController::class)->except(['show']);
        Route::post('users/bulk', [UserController::class, 'bulk'])->name('users.bulk');
        Route::get('users/export', [UserController::class, 'export'])->name('users.export');
        Route::post('users/{user}/restore', [UserController::class, 'restore'])->name('users.restore');

        // 教師專用路由 (適用於所有角色，但內容會依角色調整)
        Route::prefix('teacher')->name('teacher.')->group(function () {
            Route::get('posts', [PostController::class, 'index'])->name('posts');
            Route::get('labs', [AdminLabController::class, 'index'])->name('labs');
        });

        // 師資與職員管理
        Route::resource('staff', AdminStaffController::class);
        Route::patch('staff/{staff}/status', [AdminStaffController::class, 'toggleStatus'])
            ->name('staff.toggle-status');
        Route::patch('staff/{staff}/visibility', [AdminStaffController::class, 'toggleVisibility'])
            ->name('staff.toggle-visibility');
        Route::patch('staff/{staff}/restore', [AdminStaffController::class, 'restore'])
            ->name('staff.restore');
        Route::delete('staff/{staff}/force', [AdminStaffController::class, 'forceDelete'])
            ->name('staff.force-delete');
        Route::resource('teachers', AdminTeacherController::class);
        Route::patch('teachers/{teacher}/status', [AdminTeacherController::class, 'toggleStatus'])
            ->name('teachers.toggle-status');
        Route::patch('teachers/{teacher}/visibility', [AdminTeacherController::class, 'toggleVisibility'])
            ->name('teachers.toggle-visibility');
        Route::patch('teachers/{teacher}/restore', [AdminTeacherController::class, 'restore'])
            ->name('teachers.restore');
        Route::delete('teachers/{teacher}/force', [AdminTeacherController::class, 'forceDelete'])
            ->name('teachers.force-delete');

        // 學術研究管理
        Route::resource('labs', AdminLabController::class);
        Route::resource('classrooms', AdminClassroomController::class);
        Route::resource('projects', AdminProjectController::class);
        Route::resource('publications', AdminPublicationController::class);

        // 學制管理僅限管理員使用
        Route::middleware('role:admin')->group(function () {
            Route::get('academics', [AdminAcademicController::class, 'index'])->name('academics.index');
            Route::resource('programs', AdminProgramController::class);
        });

        // 聯絡我們管理
        Route::resource('contact-messages', AdminContactMessageController::class);
        Route::patch('contact-messages/{contactMessage}/spam', [AdminContactMessageController::class, 'markAsSpam'])
            ->name('contact-messages.spam');
        Route::patch('contact-messages/{contactMessage}/resolved', [AdminContactMessageController::class, 'markAsResolved'])
            ->name('contact-messages.resolved');

        // 附件管理
        Route::resource('attachments', AdminAttachmentController::class)->only(['index', 'destroy']);
        Route::post('attachments/bulk', [AdminAttachmentController::class, 'bulk'])->name('attachments.bulk');
        Route::patch('attachments/{attachment}/restore', [AdminAttachmentController::class, 'restore'])
            ->name('attachments.restore');
        Route::delete('attachments/{attachment}/force', [AdminAttachmentController::class, 'forceDelete'])
            ->name('attachments.force-delete');

        // 標籤管理
        Route::resource('tags', AdminTagController::class);
    });
