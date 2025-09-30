<?php
use App\Http\Controllers\PageController;

// basic page
Route::get('/', [PageController::class, 'home'])->name('home');
Route::get('home', function () {
    return redirect()->route('home');
});

// lang settings
Route::get('/lang/{locale}', [PageController::class, 'setLang'])->name('setLang');

require __DIR__.'/manage.php';
require __DIR__.'/auth.php';
