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
            Route::get('/dashboard', DashboardController::class)->name('admin.dashboard');

            Route::resource('posts', PostController::class);
            Route::resource('tags', TagController::class);
            Route::resource('users', UserController::class);
            Route::resource('attachments', AttachmentController::class);
            Route::resource('messages', MessageController::class);
        });
    });
