<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Session;
use Inertia\Inertia;

// Frontend Controllers
use App\Http\Controllers\AttachmentDownloadController;
use App\Http\Controllers\BulletinController;
use App\Http\Controllers\LabController;
use App\Http\Controllers\StaffController;
use App\Http\Controllers\HomeController;

Route::get('/', HomeController::class)->name('home');

// Public Routes
Route::group(['as' => 'public.'], function () {
    // Labs
    Route::get('/labs', [LabController::class, 'index'])->name('labs.index');
    Route::get('/labs/{lab:code}', [LabController::class, 'show'])->name('labs.show');

    // People/Staff
    Route::get('/people', [StaffController::class, 'index'])->name('people.index');
    Route::get('/people/{slug}', [StaffController::class, 'show'])->name('people.show');

    // Bulletins
    Route::get('/bulletins', [BulletinController::class, 'index'])->name('bulletins.index');
    Route::get('/bulletins/{slug}', [BulletinController::class, 'show'])->name('bulletins.show');

    // Attachments (public access)
    Route::get('/attachments/{attachment}', [AttachmentDownloadController::class, 'redirect'])
        ->name('attachments.show');
    Route::get('/attachments/{attachment}/download', [AttachmentDownloadController::class, 'download'])
        ->name('attachments.download');
});

// Locale switcher: sets session locale and redirects back
Route::get('/locale/{locale}', function (string $locale) {
    $normalized = strtolower(str_replace('_', '-', $locale));
    $supported = ['en', 'zh-tw'];
    if (! in_array($normalized, $supported, true)) {
        $normalized = config('app.locale');
    }
    // Map to canonical format used by resources/lang folder
    $canonical = $normalized === 'zh-tw' ? 'zh-TW' : 'en';
    Session::put('locale', $canonical);
    App::setLocale($canonical);
    return Redirect::back();
})->name('locale.set');

// Include additional route files
require __DIR__.'/manage.php';
require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
