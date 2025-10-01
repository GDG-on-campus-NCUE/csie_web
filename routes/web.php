<?php
use App\Http\Controllers\PageController;

// basic page
Route::get('/', [PageController::class, 'home'])->name('home');
Route::get('home', function () {
    return redirect()->route('home');
});

// lang settings
Route::get('/lang/{locale}', [PageController::class, 'setLang'])->name('home');

require __DIR__.'/auth.php';
require __DIR__.'/manage/admin.php';
require __DIR__.'/manage/teacher.php';
require __DIR__.'/manage/user.php';
require __DIR__.'/manage/setting.php';
