<?php

use App\Http\Controllers\Manage\User\DashboardController;
use App\Http\Controllers\Manage\User\UserSpaceController;
use App\Http\Controllers\Manage\User\SupportTicketController;
use App\Http\Controllers\Manage\User\SupportFaqController;
use App\Http\Controllers\Manage\User\NotificationController;
use App\Http\Controllers\Manage\User\NotificationPreferenceController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])
    ->prefix('manage')
    ->as('manage.')
    ->group(function () {
        Route::redirect('/', '/manage/dashboard')->name('index');
    });

Route::middleware(['auth', 'verified'])
    ->prefix('manage/user')
    ->as('manage.user.')
    ->group(function () {
        Route::get('/dashboard', DashboardController::class)
            ->middleware('role:admin,teacher,user')
            ->name('dashboard');

        // Space 資源綁定路由
        Route::middleware('role:admin,teacher,user')->group(function () {
            Route::get('/spaces', [UserSpaceController::class, 'index'])->name('spaces.index');
            Route::get('/spaces/create', [UserSpaceController::class, 'create'])->name('spaces.create');
            Route::post('/spaces', [UserSpaceController::class, 'store'])->name('spaces.store');
            Route::get('/spaces/{space}/edit', [UserSpaceController::class, 'edit'])->name('spaces.edit');
            Route::put('/spaces/{space}', [UserSpaceController::class, 'update'])->name('spaces.update');
            Route::delete('/spaces/{space}', [UserSpaceController::class, 'destroy'])->name('spaces.destroy');
            Route::post('/spaces/{space}/sync', [UserSpaceController::class, 'sync'])->name('spaces.sync');
        });

        // Support Ticket 路由
        Route::middleware('role:admin,teacher,user')->group(function () {
            Route::get('/support/tickets', [SupportTicketController::class, 'index'])->name('support.tickets.index');
            Route::get('/support/tickets/create', [SupportTicketController::class, 'create'])->name('support.tickets.create');
            Route::post('/support/tickets', [SupportTicketController::class, 'store'])->name('support.tickets.store');
            Route::get('/support/tickets/{ticket}', [SupportTicketController::class, 'show'])->name('support.tickets.show');
            Route::post('/support/tickets/{ticket}/reply', [SupportTicketController::class, 'reply'])->name('support.tickets.reply');
            Route::put('/support/tickets/{ticket}/close', [SupportTicketController::class, 'close'])->name('support.tickets.close');
        });

        // Support FAQ 路由（公開）
        Route::middleware('role:admin,teacher,user')->group(function () {
            Route::get('/support/faqs', [SupportFaqController::class, 'index'])->name('support.faqs.index');
            Route::get('/support/faqs/{faq}', [SupportFaqController::class, 'show'])->name('support.faqs.show');
        });

        // Notification 路由
        Route::middleware('role:admin,teacher,user')->group(function () {
            Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');
            Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead'])->name('notifications.read');
            Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead'])->name('notifications.read-all');
            Route::delete('/notifications/{id}', [NotificationController::class, 'destroy'])->name('notifications.destroy');
            Route::delete('/notifications/clear', [NotificationController::class, 'clearRead'])->name('notifications.clear');
        });

        // Notification Preferences 路由
        Route::middleware('role:admin,teacher,user')->group(function () {
            Route::get('/settings/notifications', [NotificationPreferenceController::class, 'edit'])->name('settings.notifications.edit');
            Route::put('/settings/notifications', [NotificationPreferenceController::class, 'update'])->name('settings.notifications.update');
        });
    });
