<?php
use App\Http\Controllers\AttachmentDownloadController;
use App\Http\Controllers\PageController;

// basic page
Route::get('/', [PageController::class, 'home'])->name('home');
Route::get('home', function () {
    return redirect()->route('home');
});

// lang settings
// Named differently to avoid collision with the main home route name
Route::get('/lang/{locale}', [PageController::class, 'setLang'])->name('lang.set');

Route::get('/attachments/{attachment}/download', AttachmentDownloadController::class)
    ->name('public.attachments.download');



require __DIR__.'/auth.php';
require __DIR__.'/manage/all.php';
require __DIR__.'/manage/admin.php';
require __DIR__.'/manage/teacher.php';
require __DIR__.'/manage/user.php';
require __DIR__.'/manage/setting.php';
