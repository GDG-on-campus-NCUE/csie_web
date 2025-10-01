<?php
use App\Http\Controllers\RouteRedirectController;

Route::get('/manage/dashboard', [RouteRedirectController::class, 'manageDashboard'])->name('manage.dashboard');
