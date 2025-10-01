<?php
use App\Http\Controllers\RouteRedirectController;

Route::get('/manage/dashboard', [RouteRedirectController::class, 'manage_dashbaord'])->name('manage.dashbaord');
