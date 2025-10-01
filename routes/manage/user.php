<?php

use App\Http\Controllers\Manage\User\DashboardController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])
    ->prefix('manage')
    ->as('manage.')
    ->group(function () {
        Route::redirect('/', '/manage/user/dashboard')->name('index');
    });

Route::middleware(['auth', 'verified'])
    ->prefix('manage/user')
    ->as('manage.user.')
    ->group(function () {
        Route::get('/dashboard', DashboardController::class)
            ->middleware('role:admin,teacher,user')
            ->name('dashboard');
    });
