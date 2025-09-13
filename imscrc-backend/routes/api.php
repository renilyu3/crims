<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\VisitorCheckinController;
use App\Http\Controllers\Api\PDLController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\ScheduleController;
use App\Http\Controllers\Api\FacilityController;
use App\Http\Controllers\Api\ProgramController;
use App\Http\Controllers\Api\ConflictController;
use App\Http\Controllers\Api\ActiveVisitorController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    // User/Account Management Routes
    Route::apiResource('users', UserController::class);
    Route::get('users-search', [UserController::class, 'search']);
    Route::get('users-statistics', [UserController::class, 'statistics']);
    Route::post('users/{user}/toggle-status', [UserController::class, 'toggleStatus']);

    // PDL Management Routes
    Route::apiResource('pdls', PDLController::class);
    Route::get('pdls-search', [PDLController::class, 'search']);
    Route::get('pdls-statistics', [PDLController::class, 'statistics']);
    Route::get('pdls-eligible', [PDLController::class, 'eligible']);
    Route::post('pdls/{pdl}/photo', [PDLController::class, 'uploadPhoto']);
    Route::delete('pdls/{pdl}/photo', [PDLController::class, 'deletePhoto']);

    // Active Visitors Management Routes (New Separate Table)
    Route::apiResource('active-visitors', ActiveVisitorController::class);
    Route::post('active-visitors/{id}/check-out', [ActiveVisitorController::class, 'checkOut']);
    Route::get('active-visitors-statistics', [ActiveVisitorController::class, 'statistics']);
    Route::post('active-visitors/{id}/photo', [ActiveVisitorController::class, 'uploadPhoto']);
    Route::delete('active-visitors/{id}/photo', [ActiveVisitorController::class, 'deletePhoto']);

    // Visitor Check-in History Routes (Completed Visits)
    Route::get('visitor-checkins', [VisitorCheckinController::class, 'index']);
    Route::get('visitor-checkins/statistics', [VisitorCheckinController::class, 'statistics']);
    Route::get('visitor-checkins/{id}', [VisitorCheckinController::class, 'show']);
    Route::delete('visitor-checkins/{id}', [VisitorCheckinController::class, 'destroy']);

    // Scheduling Routes
    Route::apiResource('schedules', ScheduleController::class);
    Route::get('schedules-calendar', [ScheduleController::class, 'calendar']);
    Route::get('schedules-today', [ScheduleController::class, 'today']);
    Route::get('schedules-upcoming', [ScheduleController::class, 'upcoming']);

    // Facilities Routes
    Route::apiResource('facilities', FacilityController::class);
    Route::post('facilities/{id}/check-availability', [FacilityController::class, 'checkAvailability']);
    Route::get('facilities-types', [FacilityController::class, 'types']);

    // Programs Routes
    Route::apiResource('programs', ProgramController::class);
    Route::get('programs-types', [ProgramController::class, 'types']);
    Route::get('programs/{id}/enrollment', [ProgramController::class, 'enrollment']);

    // Conflict Management Routes
    Route::get('conflicts', [ConflictController::class, 'index']);
    Route::get('conflicts/{id}', [ConflictController::class, 'show']);
    Route::post('conflicts/{id}/resolve', [ConflictController::class, 'resolve']);
    Route::post('conflicts/{id}/acknowledge', [ConflictController::class, 'acknowledge']);
    Route::post('conflicts/{id}/ignore', [ConflictController::class, 'ignore']);
    Route::get('conflicts-unresolved', [ConflictController::class, 'unresolved']);
    Route::post('conflicts-check', [ConflictController::class, 'check']);
    Route::get('conflicts-statistics', [ConflictController::class, 'statistics']);
});
