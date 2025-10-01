<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware(['auth', 'verified', 'role:admin'])
    ->prefix('manage')
    ->as('manage.')
    ->group(function () {
        Route::get('/tags', function (Request $request) {
            $user = $request->user();
            $role = $user?->role ?? 'admin';

            return Inertia::render('manage/dashboard', [
                'pageRole' => $role,
                'pageSection' => 'tags',
            ]);
        })->name('tags.index');

        Route::get('/users', function (Request $request) {
            $user = $request->user();
            $role = $user?->role ?? 'admin';

            return Inertia::render('manage/dashboard', [
                'pageRole' => $role,
                'pageSection' => 'users',
            ]);
        })->name('users.index');

        Route::get('/attachments', function (Request $request) {
            $user = $request->user();
            $role = $user?->role ?? 'admin';

            return Inertia::render('manage/dashboard', [
                'pageRole' => $role,
                'pageSection' => 'attachments',
            ]);
        })->name('attachments.index');

        Route::get('/messages', function (Request $request) {
            $user = $request->user();
            $role = $user?->role ?? 'admin';

            return Inertia::render('manage/dashboard', [
                'pageRole' => $role,
                'pageSection' => 'messages',
            ]);
        })->name('messages.index');
    });
