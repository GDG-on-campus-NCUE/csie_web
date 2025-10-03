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
        Route::resource('posts', PostController::class);
        Route::resource('labs', LabController::class);

        // 實驗室成員管理
        Route::post('labs/{lab}/members', [LabController::class, 'addMember'])
            ->name('labs.members.add');
        Route::delete('labs/{lab}/members/{user}', [LabController::class, 'removeMember'])
            ->name('labs.members.remove');

        Route::resource('projects', ProjectController::class);
    });
