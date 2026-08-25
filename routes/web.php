<?php

use App\Enums\Role;
use App\Http\Controllers\Auth\EmailVerificationOtpController;
use App\Http\Controllers\DashboardRedirectController;
use App\Http\Controllers\PetController;
use App\Http\Controllers\UserNotificationController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use Spatie\Permission\Middleware\RoleMiddleware;

$userDashboardMiddleware = ['auth', 'verified', RoleMiddleware::using(Role::User)];
$volunteerDashboardMiddleware = ['auth', 'verified', RoleMiddleware::using(Role::Volunteer)];
$adminDashboardMiddleware = ['auth', 'verified', RoleMiddleware::using([Role::Admin, Role::SuperAdmin])];
$superAdminDashboardMiddleware = ['auth', 'verified', RoleMiddleware::using(Role::SuperAdmin)];

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');
Route::inertia('/about', 'about')->name('about');
Route::inertia('/adopt', 'adopt')->name('adopt');
Route::inertia('/donate', 'donate')->name('donate');

Route::get('/volunteer', function (Request $request) {
    return Inertia::render('volunteer', [
        'selectedEvent' => $request->input('selectedEvent'),
    ]);
});

Route::inertia('/rescue', 'rescue')->name('rescue');
Route::inertia('/events', 'events')->name('events');
Route::inertia('/missing', 'missing')->name('missing');
Route::inertia('/sos', 'sos')->name('sos');

Route::post('/ai/predict', [PetController::class, 'predict']);
Route::post('/ai/generate-names', [PetController::class, 'generateNames']);

Route::middleware('auth')->group(function () {
    Route::get('/email/verify', [EmailVerificationOtpController::class, 'show'])
        ->name('verification.notice');

    Route::post('/email/verify', [EmailVerificationOtpController::class, 'store'])
        ->middleware('throttle:email-verification-otp')
        ->name('verification.verify');

    Route::post('/email/verification-notification', [EmailVerificationOtpController::class, 'resend'])
        ->middleware('throttle:email-verification-otp-resend')
        ->name('verification.send');
});

Route::prefix('account/notifications')->name('account.notifications.')->middleware(['auth', 'verified'])->group(function () {
    Route::patch('{notification}/read', [UserNotificationController::class, 'read'])->name('read');
    Route::patch('read-all', [UserNotificationController::class, 'readAll'])->name('read-all');
});

Route::prefix('account/user')->name('account.user.')->middleware($userDashboardMiddleware)->group(function () {
    Route::inertia('/', 'user/bookmark')->name('index');
    Route::inertia('bookmark', 'user/bookmark')->name('bookmark');
    Route::inertia('rescue-reports', 'user/rescue-reports')->name('rescue-reports');
    Route::inertia('adoption-applications', 'user/adoption-applications')->name('adoption-applications');
    Route::inertia('donations', 'user/donations')->name('donations');
    Route::inertia('missing-found', 'user/missing-found')->name('missing-found');
    Route::inertia('notifications', 'user/notifications')->name('notifications');
    Route::inertia('account-settings', 'user/account-settings')->name('account-settings');
});

Route::prefix('account/volunteer')->name('account.volunteer.')->middleware($volunteerDashboardMiddleware)->group(function () {
    Route::inertia('/', 'volunteer/profile-information')->name('index');
    Route::inertia('profile', 'volunteer/profile-information')->name('profile');
    Route::inertia('status', 'volunteer/volunteer-status')->name('status');
    Route::inertia('assigned-tasks', 'volunteer/assigned-tasks')->name('assigned-tasks');
    Route::inertia('participation-history', 'volunteer/participation-history')->name('participation-history');
    Route::inertia('certificates', 'volunteer/certificates')->name('certificates');
    Route::inertia('rescue-reports', 'volunteer/rescue-reports')->name('rescue-reports');
    Route::inertia('notifications', 'volunteer/notifications')->name('notifications');
    Route::inertia('account-settings', 'volunteer/account-settings')->name('account-settings');
});

Route::prefix('account/admin')->name('account.admin.')->middleware($adminDashboardMiddleware)->group(function () {
    Route::inertia('dashboard', 'admin/dashboard')->name('dashboard');
    Route::inertia('rescue-management', 'admin/rescue-management')->name('rescue-management');
    Route::inertia('ai-validation', 'admin/ai-validation')->name('ai-validation');
    Route::inertia('adoption-management', 'admin/adoption-management')->name('adoption-management');
    Route::inertia('volunteer-management', 'admin/volunteer-management')->name('volunteer-management');
    Route::inertia('donation-monitoring', 'admin/donation-monitoring')->name('donation-monitoring');
    Route::inertia('events', 'admin/events')->name('events');
    Route::inertia('reports-analytics', 'admin/reports-analytics')->name('reports-analytics');
    Route::inertia('notifications', 'admin/notifications')->name('notifications');
    Route::inertia('account-settings', 'admin/account-settings')->name('account-settings');
});

Route::prefix('account/super-admin')->name('account.super-admin.')->middleware($superAdminDashboardMiddleware)->group(function () {
    Route::inertia('dashboard', 'super-admin/dashboard')->name('dashboard');
    Route::inertia('admin-management', 'super-admin/admin-management')->name('admin-management');
    Route::inertia('audit-logs', 'super-admin/audit-logs')->name('audit-logs');
    Route::inertia('archives', 'super-admin/archives')->name('archives');
    Route::inertia('security-access', 'super-admin/security-access')->name('security-access');
    Route::inertia('advanced-analytics', 'super-admin/advanced-analytics')->name('advanced-analytics');
    Route::inertia('backup-restore', 'super-admin/backup-restore')->name('backup-restore');
    Route::inertia('ai-configuration', 'super-admin/ai-configuration')->name('ai-configuration');
    Route::inertia('system-settings', 'super-admin/system-settings')->name('system-settings');
    Route::inertia('notifications', 'super-admin/notifications')->name('notifications');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', DashboardRedirectController::class)->name('dashboard');
});

require __DIR__.'/settings.php';
