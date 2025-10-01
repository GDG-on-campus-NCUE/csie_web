<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware(['auth', 'verified'])
    ->prefix('manage')
    ->as('manage.')
    ->group(function () {
        Route::redirect('/', '/manage/dashboard')->name('index');

        Route::get('/dashboard', function (Request $request) {
            $user = $request->user();
            $role = $user?->role ?? 'user';

            return Inertia::render('manage/dashboard', [
                'pageRole' => $role,
                'pageSection' => 'dashboard',
            ]);
        })
            ->middleware('role:admin,teacher,user')
            ->name('dashboard');
    });
