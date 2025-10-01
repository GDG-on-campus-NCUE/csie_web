<?php

use App\Http\Controllers\Manage\Settings\AppearanceController;
use App\Http\Controllers\Manage\Settings\PasswordController;
use App\Http\Controllers\Manage\Settings\ProfileController;
use App\Http\Controllers\Manage\SupportController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', 'role:admin,teacher,user'])
    ->prefix('manage/settings')
    ->as('manage.settings.')
    ->group(function () {
        Route::get('/profile', ProfileController::class)->name('profile');
        Route::get('/password', PasswordController::class)->name('password');
        Route::get('/appearance', AppearanceController::class)->name('appearance');
    });

Route::middleware(['auth', 'verified', 'role:admin,teacher,user'])
    ->prefix('manage')
    ->as('manage.')
    ->group(function () {
        Route::get('/support', SupportController::class)->name('support');
    });
