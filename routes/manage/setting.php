<?php

use App\Http\Controllers\Manage\Settings\AppearanceController;
use App\Http\Controllers\Manage\Settings\PasswordController;
use App\Http\Controllers\Manage\Settings\ProfileController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', 'role:admin,teacher,user'])
    ->prefix('manage/settings')
    ->as('manage.settings.')
    ->group(function () {
        Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
        Route::put('/profile', [ProfileController::class, 'update'])->name('profile.update');
        Route::delete('/profile/photo', [ProfileController::class, 'deletePhoto'])->name('profile.deletePhoto');

        Route::get('/password', [PasswordController::class, 'edit'])->name('password.edit');
        Route::put('/password', [PasswordController::class, 'update'])->name('password.update');

        Route::get('/appearance', [AppearanceController::class, 'edit'])->name('appearance.edit');
        Route::put('/appearance', [AppearanceController::class, 'update'])->name('appearance.update');
    });

