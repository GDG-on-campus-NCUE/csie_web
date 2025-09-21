<?php

use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\ProfileController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware(['auth', 'verified', 'role:admin|teacher|user'])
    ->prefix('manage')
    ->name('manage.')
    ->group(function () {
        Route::redirect('settings', '/manage/settings/profile');

        Route::prefix('settings')
            ->name('settings.')
            ->group(function () {
                Route::get('profile', [ProfileController::class, 'edit'])->name('profile.edit');
                Route::patch('profile', [ProfileController::class, 'update'])->name('profile.update');
                Route::delete('profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

                Route::get('password', [PasswordController::class, 'edit'])->name('password.edit');

                Route::put('password', [PasswordController::class, 'update'])
                    ->middleware('throttle:6,1')
                    ->name('password.update');

            });
    });
