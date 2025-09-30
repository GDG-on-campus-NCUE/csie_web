<?php

use App\Http\Controllers\AttachmentDownloadController;
use App\Http\Controllers\BulletinController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\LabController;
use App\Http\Controllers\PeopleController;
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Session;
use Inertia\Inertia;

Route::get('/', HomeController::class)->name('home');

Route::middleware(['auth', 'verified'])->get('/dashboard', function () {
    return redirect()->route('manage.dashboard');
})->name('dashboard');

Route::middleware(['auth', 'verified'])->prefix('profile')->name('profile.')->group(function () {
    Route::get('/', [ProfileController::class, 'index'])->name('index');
    Route::get('/edit', [ProfileController::class, 'edit'])->name('edit');
    Route::patch('/', [ProfileController::class, 'update'])->name('update');
});

Route::group(['as' => 'public.'], function () {
    Route::get('/labs', [LabController::class, 'index'])->name('labs.index');
    Route::get('/labs/{lab:code}', [LabController::class, 'show'])->name('labs.show');

    Route::get('/people', [PeopleController::class, 'index'])->name('people.index');
    Route::get('/people/{user}', [PeopleController::class, 'show'])->name('people.show');

    Route::get('/bulletins', [BulletinController::class, 'index'])->name('bulletins.index');
    Route::get('/bulletins/{slug}', [BulletinController::class, 'show'])->name('bulletins.show');

    Route::get('/attachments/{attachment}', [AttachmentDownloadController::class, 'redirect'])
        ->name('attachments.show');
    Route::get('/attachments/{attachment}/download', [AttachmentDownloadController::class, 'download'])
        ->name('attachments.download');
});

$handleLocaleChange = function (string $locale) {
    $normalized = strtolower(str_replace('_', '-', $locale));
    $supported = ['en', 'zh-tw'];
    if (! in_array($normalized, $supported, true)) {
        $normalized = config('app.locale');
    }
    $canonical = $normalized === 'zh-tw' ? 'zh-TW' : 'en';
    Session::put('locale', $canonical);
    App::setLocale($canonical);
    return Redirect::back();
};

Route::get('/locale/{locale}', $handleLocaleChange)->name('locale.set');
Route::get('/lang/{locale}', $handleLocaleChange)->name('lang.set');

require __DIR__.'/manage.php';
require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
