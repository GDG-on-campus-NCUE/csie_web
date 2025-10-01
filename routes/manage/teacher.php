<?php

use App\Http\Controllers\Manage\Teacher\DashboardController;
use App\Http\Controllers\Manage\Teacher\LabController;
use App\Http\Controllers\Manage\Teacher\PostController;
use App\Http\Controllers\Manage\Teacher\ProjectController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', 'role:admin,teacher'])
    ->prefix('manage/teacher')
    ->as('manage.teacher.')
    ->group(function () {
        Route::get('/dashboard', DashboardController::class)->name('dashboard');
        Route::resource('posts', PostController::class)->only(['index']);
        Route::resource('labs', LabController::class)->only(['index']);
        Route::resource('projects', ProjectController::class)->only(['index']);
    });
