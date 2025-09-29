<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\PostCategoryController;
use App\Http\Controllers\Api\PostController;
use App\Http\Controllers\Api\AttachmentController;
use App\Http\Controllers\Api\TeacherController;
use App\Http\Controllers\Api\TeacherLinkController;
use App\Http\Controllers\Api\StaffController;
use App\Http\Controllers\Api\LabController;
use App\Http\Controllers\Api\ProjectController;
use App\Http\Controllers\Api\PublicationController;
use App\Http\Controllers\Api\ContactMessageController;
use App\Http\Controllers\Api\ProgramController;


Route::prefix('v1')->group(function () {
    Route::apiResource('post-categories', PostCategoryController::class);
    Route::apiResource('posts', PostController::class);
    Route::apiResource('attachments', AttachmentController::class)->only(['index','show','store','update','destroy']);

    Route::apiResource('teachers', TeacherController::class);
    Route::apiResource('teacher-links', TeacherLinkController::class);
    Route::apiResource('staff', StaffController::class);

    Route::apiResource('labs', LabController::class);
    Route::apiResource('projects', ProjectController::class);
    Route::apiResource('publications', PublicationController::class);

    Route::apiResource('contact-messages', ContactMessageController::class)->only(['index','show','store','update','destroy']);

    Route::apiResource('programs', ProgramController::class);
});

