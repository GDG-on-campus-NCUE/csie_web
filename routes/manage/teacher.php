<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware(['auth', 'verified', 'role:admin,teacher'])
    ->prefix('manage')
    ->as('manage.')
    ->group(function () {
        Route::get('/posts', function (Request $request) {
            $user = $request->user();
            $role = $user?->role ?? 'teacher';

            return Inertia::render('manage/dashboard', [
                'pageRole' => $role,
                'pageSection' => 'posts',
            ]);
        })->name('posts.index');

        Route::get('/labs', function (Request $request) {
            $user = $request->user();
            $role = $user?->role ?? 'teacher';

            return Inertia::render('manage/dashboard', [
                'pageRole' => $role,
                'pageSection' => 'labs',
            ]);
        })->name('labs.index');

        Route::get('/projects', function (Request $request) {
            $user = $request->user();
            $role = $user?->role ?? 'teacher';

            return Inertia::render('manage/dashboard', [
                'pageRole' => $role,
                'pageSection' => 'projects',
            ]);
        })->name('projects.index');
    });
