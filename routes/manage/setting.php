<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware(['auth', 'verified', 'role:admin,teacher,user'])
    ->prefix('manage/settings')
    ->as('manage.settings.')
    ->group(function () {
        Route::get('/profile', function (Request $request) {
            $user = $request->user();
            $role = $user?->role ?? 'user';

            return Inertia::render('manage/dashboard', [
                'pageRole' => $role,
                'pageSection' => 'settings.profile',
            ]);
        })->name('profile');

        Route::get('/password', function (Request $request) {
            $user = $request->user();
            $role = $user?->role ?? 'user';

            return Inertia::render('manage/dashboard', [
                'pageRole' => $role,
                'pageSection' => 'settings.password',
            ]);
        })->name('password');

        Route::get('/appearance', function (Request $request) {
            $user = $request->user();
            $role = $user?->role ?? 'user';

            return Inertia::render('manage/dashboard', [
                'pageRole' => $role,
                'pageSection' => 'settings.appearance',
            ]);
        })->name('appearance');
    });

Route::middleware(['auth', 'verified', 'role:admin,teacher,user'])
    ->prefix('manage')
    ->as('manage.')
    ->group(function () {
        Route::get('/support', function (Request $request) {
            $user = $request->user();
            $role = $user?->role ?? 'user';

            return Inertia::render('manage/dashboard', [
                'pageRole' => $role,
                'pageSection' => 'support',
            ]);
        })->name('support');
    });
