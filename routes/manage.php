<?php

use App\Http\Controllers\Manage\Admin\AttachmentController as AdminAttachmentController;
use App\Http\Controllers\Manage\Admin\ClassroomController as AdminClassroomController;
use App\Http\Controllers\Manage\Admin\ContactMessageController as AdminContactMessageController;
use App\Http\Controllers\Manage\Admin\LabController as AdminLabController;
use App\Http\Controllers\Manage\Admin\PostCategoryController as AdminPostCategoryController;
use App\Http\Controllers\Manage\Admin\ProgramController as AdminProgramController;
use App\Http\Controllers\Manage\Admin\ProjectController as AdminProjectController;
use App\Http\Controllers\Manage\Admin\PublicationController as AdminPublicationController;
use App\Http\Controllers\Manage\Admin\TagController as AdminTagController;
use App\Http\Controllers\Manage\DashboardController;
use App\Http\Controllers\Manage\PostController;
use App\Http\Controllers\Manage\UserController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', 'role:admin|teacher|user'])
    ->prefix('manage')->name('manage.')
    ->group(function () {
        Route::get('/', fn () => redirect()->route('manage.dashboard'));
        Route::get('/dashboard', DashboardController::class)->name('dashboard');
    });

Route::middleware(['auth', 'role:admin|teacher'])
    ->prefix('manage')->name('manage.')
    ->group(function () {
        Route::resource('posts', PostController::class);
        Route::post('posts/bulk', [PostController::class, 'bulk'])->name('posts.bulk');
        Route::resource('post-categories', AdminPostCategoryController::class);

        Route::resource('users', UserController::class)->except(['show']);
        Route::post('users/bulk', [UserController::class, 'bulk'])->name('users.bulk');
        Route::get('users/export', [UserController::class, 'export'])->name('users.export');
        Route::post('users/{user}/restore', [UserController::class, 'restore'])->name('users.restore');

        Route::resource('labs', AdminLabController::class);
        Route::resource('classrooms', AdminClassroomController::class);
        Route::resource('projects', AdminProjectController::class);
        Route::resource('publications', AdminPublicationController::class);

        Route::middleware('role:admin')->group(function () {
            Route::get('academics', [AdminProgramController::class, 'index'])->name('academics.index');
            Route::resource('programs', AdminProgramController::class);
        });

        Route::resource('contact-messages', AdminContactMessageController::class);
        Route::patch('contact-messages/{contactMessage}/spam', [AdminContactMessageController::class, 'markAsSpam'])
            ->name('contact-messages.spam');
        Route::patch('contact-messages/{contactMessage}/resolved', [AdminContactMessageController::class, 'markAsResolved'])
            ->name('contact-messages.resolved');

        Route::resource('attachments', AdminAttachmentController::class)->only(['index', 'destroy']);
        Route::post('attachments/bulk', [AdminAttachmentController::class, 'bulk'])->name('attachments.bulk');
        Route::patch('attachments/{attachment}/restore', [AdminAttachmentController::class, 'restore'])
            ->name('attachments.restore');
        Route::delete('attachments/{attachment}/force', [AdminAttachmentController::class, 'forceDelete'])
            ->name('attachments.force-delete');

        Route::resource('tags', AdminTagController::class);
    });
