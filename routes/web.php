<?php

use App\Enums\Role;
use App\Http\Controllers\Admin\AdoptablePetController;
use App\Http\Controllers\Admin\AdoptionManagementController;
use App\Http\Controllers\Admin\DonationMonitoringController;
use App\Http\Controllers\Admin\EventManagementController;
use App\Http\Controllers\Admin\RescueManagementController;
use App\Http\Controllers\Admin\VolunteerManagementController;
use App\Http\Controllers\AdoptController;
use App\Http\Controllers\Adoptions\AdoptionApplicationController;
use App\Http\Controllers\Auth\EmailVerificationOtpController;
use App\Http\Controllers\DashboardRedirectController;
use App\Http\Controllers\DonateController;
use App\Http\Controllers\Donations\DonationController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\PetController;
use App\Http\Controllers\PetReportController;
use App\Http\Controllers\UserNotificationController;
use App\Http\Controllers\VolunteerController;
use App\Http\Controllers\VolunteerDashboardController;
use Illuminate\Support\Facades\Route;
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
Route::get('/adopt', [AdoptController::class, 'index'])->name('adopt');
Route::post('/adopt/apply', [AdoptionApplicationController::class, 'store'])->name('adopt.apply')->middleware('auth');

Route::get('/donate', [DonateController::class, 'index'])->name('donate');
Route::post('/donate/cash', [DonateController::class, 'storeCash'])->name('donate.store-cash');
Route::post('/donate/in-kind', [DonateController::class, 'storeInKind'])->name('donate.store-inkind');
Route::post('/donate/sponsor', [DonateController::class, 'storeSponsor'])->name('donate.store-sponsor');
Route::get('/checkout/{ref}', [DonateController::class, 'checkout'])->name('donate.checkout');
Route::post('/checkout/{ref}/pay', [DonateController::class, 'pay'])->name('donate.pay');

Route::get('/volunteer', [VolunteerController::class, 'index'])->name('volunteer');
Route::post('/volunteer/apply', [VolunteerController::class, 'store'])->name('volunteer.apply')->middleware('auth');
Route::get('/volunteer/switch', [VolunteerController::class, 'switchRole'])->name('volunteer.switch')->middleware('auth');
Route::get('/volunteer/switch-user', [VolunteerController::class, 'switchUser'])->name('volunteer.switch-user')->middleware('auth');

Route::inertia('/rescue', 'rescue')->name('rescue');
Route::post('/pet-reports/rescue', [PetReportController::class, 'storeRescue'])->name('pet-reports.store-rescue');

Route::get('/events', [EventController::class, 'index'])->name('events');
Route::post('/events/{event}/join', [EventController::class, 'joinEvent'])->name('events.join')->middleware('auth');
Route::post('/feeding-schedules/{schedule}/join', [EventController::class, 'joinFeedingRoute'])->name('feeding-schedules.join')->middleware('auth');

Route::get('/missing', [PetReportController::class, 'missingIndex'])->name('missing');
Route::post('/pet-reports/missing', [PetReportController::class, 'storeMissing'])->name('pet-reports.store-missing');

Route::inertia('/sos', 'sos')->name('sos');
Route::post('/pet-reports/sos', [PetReportController::class, 'storeSos'])->name('pet-reports.store-sos');

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
    Route::get('rescue-reports', [PetReportController::class, 'userReports'])->name('rescue-reports');
    Route::inertia('adoption-applications', 'user/adoption-applications')->name('adoption-applications');
    Route::get('donations', [DonationController::class, 'index'])->name('donations');
    Route::inertia('missing-found', 'user/missing-found')->name('missing-found');
    Route::inertia('notifications', 'user/notifications')->name('notifications');
    Route::inertia('account-settings', 'user/account-settings')->name('account-settings');
    Route::get('volunteer-status', [VolunteerDashboardController::class, 'userStatus'])->name('volunteer-status');
});

Route::prefix('account/volunteer')->name('account.volunteer.')->middleware($volunteerDashboardMiddleware)->group(function () {
    Route::inertia('/', 'volunteer/profile-information')->name('index');
    Route::inertia('profile', 'volunteer/profile-information')->name('profile');
    Route::get('status', [VolunteerDashboardController::class, 'status'])->name('status');
    Route::get('assigned-tasks', [VolunteerDashboardController::class, 'assignedTasks'])->name('assigned-tasks');
    Route::get('participation-history', [VolunteerDashboardController::class, 'participationHistory'])->name('participation-history');
    Route::get('certificates', [VolunteerDashboardController::class, 'certificates'])->name('certificates');
    Route::get('rescue-reports', [PetReportController::class, 'volunteerReports'])->name('rescue-reports');
    Route::inertia('notifications', 'volunteer/notifications')->name('notifications');
    Route::inertia('account-settings', 'volunteer/account-settings')->name('account-settings');
});

Route::prefix('account/admin')->name('account.admin.')->middleware($adminDashboardMiddleware)->group(function () {
    Route::inertia('dashboard', 'admin/dashboard')->name('dashboard');
    Route::get('rescue-management', [RescueManagementController::class, 'index'])->name('rescue-management');
    Route::post('rescue-management/{report}/assign', [RescueManagementController::class, 'assignVolunteer'])->name('rescue-management.assign');
    Route::post('rescue-management/{report}/status', [RescueManagementController::class, 'updateStatus'])->name('rescue-management.update-status');
    Route::post('rescue-management/{report}/duplicate', [RescueManagementController::class, 'resolveDuplicate'])->name('rescue-management.resolve-duplicate');
    Route::inertia('ai-validation', 'admin/ai-validation')->name('ai-validation');
    Route::get('adoption-management', [AdoptionManagementController::class, 'index'])->name('adoption-management');
    Route::post('adoption-management/applications/{application}/status', [AdoptionManagementController::class, 'updateStatus'])->name('adoption-management.update-status');
    Route::post('adoption-management/pets', [AdoptablePetController::class, 'store'])->name('adoption-management.pets.store');

    // Volunteer Management Dashboard
    Route::get('volunteer-management', [VolunteerManagementController::class, 'index'])->name('volunteer-management');
    Route::post('volunteer-management/applications/{application}/approve', [VolunteerManagementController::class, 'approve'])->name('volunteer-management.approve');
    Route::post('volunteer-management/applications/{application}/reject', [VolunteerManagementController::class, 'reject'])->name('volunteer-management.reject');
    Route::post('volunteer-management/assign', [VolunteerManagementController::class, 'assignTask'])->name('volunteer-management.assign');
    Route::post('volunteer-management/tasks/{task}/status', [VolunteerManagementController::class, 'updateTaskStatus'])->name('volunteer-management.update-task-status');
    Route::post('volunteer-management/issue-certificate', [VolunteerManagementController::class, 'issueCertificate'])->name('volunteer-management.issue-certificate');

    Route::get('donation-monitoring', [DonationMonitoringController::class, 'index'])->name('donation-monitoring');
    Route::post('donation-monitoring/in-kind/{donation}/verify', [DonationMonitoringController::class, 'verifyInKind'])->name('donation-monitoring.in-kind.verify');
    Route::post('donation-monitoring/inventory', [DonationMonitoringController::class, 'storeInventoryItem'])->name('donation-monitoring.inventory.store');
    Route::post('donation-monitoring/inventory/{item}/adjust', [DonationMonitoringController::class, 'adjustStock'])->name('donation-monitoring.inventory.adjust');

    // Event Management Dashboard
    Route::get('events', [EventManagementController::class, 'index'])->name('events');
    Route::post('events', [EventManagementController::class, 'storeEvent'])->name('events.store');
    Route::put('events/{event}', [EventManagementController::class, 'updateEvent'])->name('events.update');
    Route::post('events/{event}/toggle', [EventManagementController::class, 'toggleEventStatus'])->name('events.toggle');
    Route::delete('events/{event}', [EventManagementController::class, 'destroyEvent'])->name('events.destroy');

    Route::post('feeding-schedules', [EventManagementController::class, 'storeFeedingSchedule'])->name('feeding-schedules.store');
    Route::put('feeding-schedules/{schedule}', [EventManagementController::class, 'updateFeedingSchedule'])->name('feeding-schedules.update');
    Route::delete('feeding-schedules/{schedule}', [EventManagementController::class, 'destroyFeedingSchedule'])->name('feeding-schedules.destroy');

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
