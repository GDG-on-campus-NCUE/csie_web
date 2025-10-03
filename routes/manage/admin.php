<?php

use App\Http\Controllers\Manage\Admin\AttachmentController;
use App\Http\Controllers\Manage\Admin\DashboardController;
use App\Http\Controllers\Manage\Admin\MessageController;
use App\Http\Controllers\Manage\Admin\PostController;
use App\Http\Controllers\Manage\Admin\TagController;
use App\Http\Controllers\Manage\Admin\UserController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', 'role:admin'])
    ->prefix('manage')
    ->as('manage.')
    ->group(function () {
        Route::prefix('admin')->group(function () {
            Route::get('/dashboard', [DashboardController::class, 'index'])->name('admin.dashboard');

            Route::post('posts/bulk', [PostController::class, 'bulk'])->name('posts.bulk');
            Route::patch('posts/{post}/restore', [PostController::class, 'restore'])->name('posts.restore');
            Route::resource('posts', PostController::class);
            Route::get('tags/options', [TagController::class, 'getOptions'])->name('tags.getOptions');
            Route::post('tags/merge', [TagController::class, 'merge'])->name('tags.merge');
            Route::post('tags/split', [TagController::class, 'split'])->name('tags.split');
            Route::resource('tags', TagController::class);
            Route::post('users/bulk-status', [UserController::class, 'bulkStatus'])->name('users.bulk-status');
            Route::post('users/{user}/password-reset', [UserController::class, 'sendPasswordReset'])->name('users.password-reset');
            Route::post('users/{user}/impersonate', [UserController::class, 'impersonate'])->name('users.impersonate');
            Route::post('users/stop-impersonate', [UserController::class, 'stopImpersonate'])->name('users.stop-impersonate');
            Route::resource('users', UserController::class);
            Route::post('attachments/upload', [AttachmentController::class, 'store'])->name('attachments.upload');
            Route::post('attachments/bulk-delete', [AttachmentController::class, 'bulkDelete'])->name('attachments.bulk-delete');
            Route::resource('attachments', AttachmentController::class);
            Route::resource('messages', MessageController::class);
        });
    });
