<?php

use App\Http\Controllers\Manage\Admin\AttachmentController;
use App\Http\Controllers\Manage\Admin\DashboardController;
use App\Http\Controllers\Manage\Admin\MessageController;
use App\Http\Controllers\Manage\Admin\PostController;
use App\Http\Controllers\Manage\Admin\TagController;
use App\Http\Controllers\Manage\Admin\UserController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', 'role:admin'])
    ->prefix('manage/admin')
    ->as('manage.admin.')
    ->group(function () {
        Route::get('/dashboard', DashboardController::class)->name('dashboard');

        Route::resource('posts', PostController::class)->only(['index', 'create', 'show', 'edit']);
        Route::resource('tags', TagController::class)->only(['index']);
        Route::resource('users', UserController::class)->only(['index']);
        Route::resource('attachments', AttachmentController::class)->only(['index']);
        Route::resource('messages', MessageController::class)->only(['index']);
    });
