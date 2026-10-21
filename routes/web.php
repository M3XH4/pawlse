<?php

use App\Enums\Role;
use App\Http\Controllers\AboutController;
use App\Http\Controllers\Admin\AdoptablePetController;
use App\Http\Controllers\Admin\AdoptionManagementController;
use App\Http\Controllers\Admin\AiValidationController;
use App\Http\Controllers\Admin\AnimalMasterRecordController;
use App\Http\Controllers\Admin\BlogManagementController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\DonationMonitoringController;
use App\Http\Controllers\Admin\EventManagementController;
use App\Http\Controllers\Admin\FosterManagementController;
use App\Http\Controllers\Admin\HelpDeskController as AdminHelpDeskController;
use App\Http\Controllers\Admin\ReportsAnalyticsController;
use App\Http\Controllers\Admin\RescueManagementController;
use App\Http\Controllers\Admin\VolunteerManagementController;
use App\Http\Controllers\AdoptController;
use App\Http\Controllers\Adoptions\AdoptionApplicationController;
use App\Http\Controllers\AnimalOverviewController;
use App\Http\Controllers\Auth\EmailVerificationOtpController;
use App\Http\Controllers\BlogController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\DashboardRedirectController;
use App\Http\Controllers\DonateController;
use App\Http\Controllers\Donations\DonationController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\FosterCareController;
use App\Http\Controllers\HelpDeskController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\HonorController;
use App\Http\Controllers\PaymentWebhookController;
use App\Http\Controllers\PetController;
use App\Http\Controllers\PetReportController;
use App\Http\Controllers\PublicTrackingController;
use App\Http\Controllers\RehomingRequestController;
use App\Http\Controllers\ResourceDownloadController;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\Settings\AccountSettingsController;
use App\Http\Controllers\ShelterVisitController;
use App\Http\Controllers\SuperAdmin\AiConfigController;
use App\Http\Controllers\SuperAdmin\AnalyticsController;
use App\Http\Controllers\SuperAdmin\ArchiveController;
use App\Http\Controllers\SuperAdmin\AuditLogController;
use App\Http\Controllers\SuperAdmin\BackupController;
use App\Http\Controllers\SuperAdmin\CommunityHonorController;
use App\Http\Controllers\SuperAdmin\DashboardController as SuperAdminDashboardController;
use App\Http\Controllers\SuperAdmin\HelpDeskController as SuperAdminHelpDeskController;
use App\Http\Controllers\SuperAdmin\PartnerManagementController;
use App\Http\Controllers\SuperAdmin\ResourceManagementController;
use App\Http\Controllers\SuperAdmin\SecurityController;
use App\Http\Controllers\SuperAdmin\SystemSettingsController;
use App\Http\Controllers\SuperAdmin\UserManagementController;
use App\Http\Controllers\UserNotificationController;
use App\Http\Controllers\UserStoryController;
use App\Http\Controllers\VetController;
use App\Http\Controllers\VolunteerController;
use App\Http\Controllers\VolunteerDashboardController;
use Illuminate\Support\Facades\Route;
use Spatie\Permission\Middleware\RoleMiddleware;

$userDashboardMiddleware = ['auth', 'verified', RoleMiddleware::using([Role::User, Role::Volunteer, Role::Admin, Role::SuperAdmin])];
$volunteerDashboardMiddleware = ['auth', 'verified', RoleMiddleware::using(Role::Volunteer)];
$adminDashboardMiddleware = ['auth', 'verified', RoleMiddleware::using([Role::Admin, Role::SuperAdmin])];
$superAdminDashboardMiddleware = ['auth', 'verified', RoleMiddleware::using(Role::SuperAdmin)];

Route::get('/', HomeController::class)->name('home');

Route::get('/about', [AboutController::class, 'index'])->name('about');
Route::get('/search', [SearchController::class, 'index'])->name('search');
Route::get('/vet', [VetController::class, 'index'])->name('vet');
Route::get('/honor', [HonorController::class, 'index'])->name('honor');
Route::get('/resources/{resourceFile}/download', [ResourceDownloadController::class, 'download'])->name('resources.download');
Route::get('/animals', [AnimalOverviewController::class, 'index'])->name('animals.index');
Route::get('/animals/{pet}', [AdoptController::class, 'show'])->name('animals.show');
Route::get('/adopt', [AdoptController::class, 'index'])->name('adopt');
Route::get('/track', [PublicTrackingController::class, 'index'])->name('track');
Route::get('/adopt/track', [AdoptionApplicationController::class, 'track'])->name('adopt.track');
Route::get('/adopt/{pet}', [AdoptController::class, 'show'])->name('adopt.show');
Route::post('/adopt/apply', [AdoptionApplicationController::class, 'store'])->name('adopt.apply');
Route::post('/adopt/applications/{application}/resubmit', [AdoptionApplicationController::class, 'resubmit'])->name('adopt.resubmit');
Route::post('/shelter-visits', [ShelterVisitController::class, 'store'])->name('shelter-visits.store');
Route::post('/rehoming-requests', [RehomingRequestController::class, 'store'])->name('rehoming-requests.store');
Route::post('/contact', [ContactController::class, 'store'])->name('contact.store')->middleware('throttle:5,1');

Route::get('/donate', [DonateController::class, 'index'])->name('donate');
Route::post('/donate/cash', [DonateController::class, 'storeCash'])->name('donate.store-cash')->middleware('throttle:15,1');
Route::post('/donate/in-kind', [DonateController::class, 'storeInKind'])->name('donate.store-inkind')->middleware('throttle:15,1');
Route::post('/donate/sponsor', [DonateController::class, 'storeSponsor'])->name('donate.store-sponsor')->middleware('throttle:15,1');
Route::get('/checkout/{ref}', [DonateController::class, 'checkout'])->name('donate.checkout');
Route::post('/checkout/{ref}/pay', [DonateController::class, 'pay'])->name('donate.pay');
Route::post('/checkout/{ref}/proof', [DonateController::class, 'submitProof'])->name('donate.checkout.proof')->middleware('throttle:15,1');
Route::post('/webhooks/payment', [PaymentWebhookController::class, 'handle'])->name('webhooks.payment');

Route::get('/volunteer', [VolunteerController::class, 'index'])->name('volunteer');
Route::post('/volunteer/apply', [VolunteerController::class, 'store'])->name('volunteer.apply')->middleware('auth');
Route::match(['get', 'post'], '/volunteer/switch', [VolunteerController::class, 'switchRole'])->name('volunteer.switch')->middleware('auth');
Route::match(['get', 'post'], '/volunteer/switch-user', [VolunteerController::class, 'switchUser'])->name('volunteer.switch-user')->middleware('auth');

Route::get('/rescue', [PetController::class, 'index'])->name('rescue');
Route::post('/pet-reports/rescue', [PetReportController::class, 'storeRescue'])->name('pet-reports.store-rescue');

Route::get('/events', [EventController::class, 'index'])->name('events');
Route::post('/events/{event}/join', [EventController::class, 'joinEvent'])->name('events.join')->middleware('throttle:15,1');
Route::post('/events/{event}/leave', [EventController::class, 'leaveEvent'])->name('events.leave')->middleware('auth');
Route::get('/certificates/{certificate}/view', [EventController::class, 'showPublicCertificate'])->name('certificates.public.show')->middleware('signed');
Route::post('/feeding-schedules/{schedule}/join', [EventController::class, 'joinFeedingRoute'])->name('feeding-schedules.join')->middleware('auth');
Route::post('/feeding-schedules/{schedule}/leave', [EventController::class, 'leaveFeedingRoute'])->name('feeding-schedules.leave')->middleware('auth');

Route::get('/blog', [BlogController::class, 'index'])->name('blog.index');
Route::get('/blog/{slug}', [BlogController::class, 'show'])->name('blog.show');
Route::post('/blog/{post}/react', [BlogController::class, 'react'])->name('blog.react');
Route::post('/blog/{post}/share', [BlogController::class, 'share'])->name('blog.share');

Route::get('/missing', [PetReportController::class, 'missingIndex'])->name('missing');
Route::get('/missing/track', [PublicTrackingController::class, 'missingTrack'])->name('missing.track');
Route::post('/missing/reports/{report}/reunited', [PetReportController::class, 'markReunited'])->name('missing.reunited');
Route::post('/pet-reports/missing', [PetReportController::class, 'storeMissing'])->name('pet-reports.store-missing');

Route::inertia('/sos', 'sos')->name('sos');
Route::post('/pet-reports/sos', [PetReportController::class, 'storeSos'])->name('pet-reports.store-sos');

Route::post('/ai/predict', [PetController::class, 'predict'])->middleware('throttle:30,1');
Route::post('/ai/generate-names', [PetController::class, 'generateNames'])->middleware('throttle:60,1');

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
    Route::get('stream', [UserNotificationController::class, 'stream'])->name('stream');
    Route::get('poll', [UserNotificationController::class, 'poll'])->name('poll');
    Route::post('read-tab', [UserNotificationController::class, 'readTab'])->name('read-tab');
    Route::patch('read-all', [UserNotificationController::class, 'readAll'])->name('read-all');
    Route::delete('clear-all', [UserNotificationController::class, 'clearAll'])->name('clear-all');
    Route::patch('{notification}/read', [UserNotificationController::class, 'read'])->name('read');
    Route::delete('{notification}', [UserNotificationController::class, 'destroy'])->name('destroy');
});

Route::prefix('account/user')->name('account.user.')->middleware($userDashboardMiddleware)->group(function () {
    Route::inertia('/', 'user/bookmark')->name('index');
    Route::inertia('bookmark', 'user/bookmark')->name('bookmark');
    Route::get('rescue-reports', [PetReportController::class, 'userReports'])->name('rescue-reports');
    Route::get('adoption-applications', [AdoptionApplicationController::class, 'index'])->name('adoption-applications');
    Route::get('shelter-visits', [ShelterVisitController::class, 'index'])->name('shelter-visits');
    Route::post('shelter-visits/{visit}/cancel', [ShelterVisitController::class, 'cancel'])->name('shelter-visits.cancel');
    Route::get('rehoming-requests', [RehomingRequestController::class, 'index'])->name('rehoming-requests');
    Route::post('rehoming-requests/{rehomingRequest}/cancel', [RehomingRequestController::class, 'cancel'])->name('rehoming-requests.cancel');
    Route::get('donations', [DonationController::class, 'index'])->name('donations');
    Route::get('missing-found', [PetReportController::class, 'userMissingFoundReports'])->name('missing-found');
    Route::get('joined-events', [EventController::class, 'userJoinedEvents'])->name('joined-events');
    Route::get('certificates', [VolunteerDashboardController::class, 'userCertificates'])->name('certificates');
    Route::get('stories', [UserStoryController::class, 'index'])->name('stories.index');
    Route::post('stories', [UserStoryController::class, 'store'])->name('stories.store');
    Route::match(['put', 'post'], 'stories/{post}', [UserStoryController::class, 'update'])->name('stories.update');
    Route::delete('stories/{post}', [UserStoryController::class, 'destroy'])->name('stories.destroy');
    Route::inertia('notifications', 'user/notifications')->name('notifications');
    Route::get('account-settings', [AccountSettingsController::class, 'index'])->name('account-settings');
    Route::get('volunteer-status', [VolunteerDashboardController::class, 'userStatus'])->name('volunteer-status');
    Route::get('help-desk', [HelpDeskController::class, 'userIndex'])->name('help-desk');
    Route::post('help-desk/tickets', [HelpDeskController::class, 'storeTicket'])->name('help-desk.tickets.store');
    Route::post('help-desk/tickets/{ticket}/reply', [HelpDeskController::class, 'replyTicket'])->name('help-desk.tickets.reply');
    Route::post('help-desk/faq/{faq}/helpful', [HelpDeskController::class, 'markFaqHelpful'])->name('help-desk.faq.helpful');
});

Route::prefix('account/volunteer')->name('account.volunteer.')->middleware($volunteerDashboardMiddleware)->group(function () {
    Route::get('/', [VolunteerDashboardController::class, 'profile'])->name('index');
    Route::get('profile', [VolunteerDashboardController::class, 'profile'])->name('profile');
    Route::post('profile', [VolunteerDashboardController::class, 'updateProfile'])->name('profile.update');
    Route::get('status', [VolunteerDashboardController::class, 'status'])->name('status');
    Route::get('assigned-tasks', [VolunteerDashboardController::class, 'assignedTasks'])->name('assigned-tasks');
    Route::delete('assigned-tasks/{task}', [VolunteerDashboardController::class, 'cancelTask'])->name('assigned-tasks.cancel');
    Route::get('participation-history', [VolunteerDashboardController::class, 'participationHistory'])->name('participation-history');
    Route::get('certificates', [VolunteerDashboardController::class, 'certificates'])->name('certificates');
    Route::get('rescue-reports', [PetReportController::class, 'volunteerReports'])->name('rescue-reports');
    Route::post('rescue-reports/{report}/status', [PetReportController::class, 'updateStatus'])->name('rescue-reports.update-status');
    Route::get('foster-care', [FosterCareController::class, 'index'])->name('foster-care');
    Route::post('foster-care/{placement}/updates', [FosterCareController::class, 'storeUpdate'])->name('foster-care.updates.store');
    Route::post('apply-foster', [FosterCareController::class, 'applyFoster'])->name('apply-foster');
    Route::inertia('notifications', 'volunteer/notifications')->name('notifications');
    Route::get('account-settings', [AccountSettingsController::class, 'index'])->name('account-settings');
    Route::get('help-desk', [HelpDeskController::class, 'volunteerIndex'])->name('help-desk');
    Route::post('help-desk/tickets', [HelpDeskController::class, 'storeTicket'])->name('help-desk.tickets.store');
    Route::post('help-desk/tickets/{ticket}/reply', [HelpDeskController::class, 'replyTicket'])->name('help-desk.tickets.reply');
    Route::post('help-desk/faq/{faq}/helpful', [HelpDeskController::class, 'markFaqHelpful'])->name('help-desk.faq.helpful');
});

Route::prefix('account/admin')->name('account.admin.')->middleware($adminDashboardMiddleware)->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Foster Home Management Dashboard
    Route::get('foster-management', [FosterManagementController::class, 'index'])->name('foster-management');
    Route::post('foster-management/assign', [FosterManagementController::class, 'assign'])->name('foster-management.assign');
    Route::post('foster-management/placements/{placement}/transfer', [FosterManagementController::class, 'transfer'])->name('foster-management.transfer');
    Route::post('foster-management/placements/{placement}/end', [FosterManagementController::class, 'endPlacement'])->name('foster-management.end');
    Route::post('foster-management/placements/{placement}/instructions', [FosterManagementController::class, 'updateInstructions'])->name('foster-management.instructions');
    Route::post('foster-management/foster-parents', [FosterManagementController::class, 'storeFosterParent'])->name('foster-management.foster-parents.store');
    Route::put('foster-management/foster-parents/{fosterParent}', [FosterManagementController::class, 'updateFosterParent'])->name('foster-management.foster-parents.update');
    Route::post('foster-management/updates/{update}/acknowledge', [FosterManagementController::class, 'acknowledgeUpdate'])->name('foster-management.updates.acknowledge');
    Route::get('my-foster-pets', [FosterCareController::class, 'index'])->name('my-foster-pets');
    Route::post('my-foster-pets/{placement}/updates', [FosterCareController::class, 'storeUpdate'])->name('my-foster-pets.updates.store');

    Route::get('rescue-management', [RescueManagementController::class, 'index'])->name('rescue-management');
    Route::post('rescue-management/{report}/assign', [RescueManagementController::class, 'assignVolunteer'])->name('rescue-management.assign');
    Route::post('rescue-management/{report}/status', [RescueManagementController::class, 'updateStatus'])->name('rescue-management.update-status');
    Route::post('rescue-management/{report}/duplicate', [RescueManagementController::class, 'resolveDuplicate'])->name('rescue-management.resolve-duplicate');
    Route::get('ai-validation', [AiValidationController::class, 'index'])->name('ai-validation');
    Route::post('ai-validation/{report}/approve', [AiValidationController::class, 'approve'])->name('ai-validation.approve');
    Route::post('ai-validation/{report}/reject', [AiValidationController::class, 'reject'])->name('ai-validation.reject');
    // Animal Master Records
    Route::get('animal-records', [AnimalMasterRecordController::class, 'index'])->name('animal-records');
    Route::post('animal-records', [AnimalMasterRecordController::class, 'store'])->name('animal-records.store');
    Route::put('animal-records/{animal}', [AnimalMasterRecordController::class, 'update'])->name('animal-records.update');
    Route::delete('animal-records/{animal}', [AnimalMasterRecordController::class, 'destroy'])->name('animal-records.destroy');
    Route::post('animal-records/{animal}/medical', [AnimalMasterRecordController::class, 'storeMedicalRecord'])->name('animal-records.medical.store');
    Route::put('animal-records/medical/{medicalRecord}', [AnimalMasterRecordController::class, 'updateMedicalRecord'])->name('animal-records.medical.update');
    Route::delete('animal-records/medical/{medicalRecord}', [AnimalMasterRecordController::class, 'deleteMedicalRecord'])->name('animal-records.medical.destroy');

    Route::get('adoption-management', [AdoptionManagementController::class, 'index'])->name('adoption-management');
    Route::post('adoption-management/applications/{application}/status', [AdoptionManagementController::class, 'updateStatus'])->name('adoption-management.update-status');
    Route::post('adoption-management/shelter-visits/settings', [AdoptionManagementController::class, 'updateVisitSettings'])->name('adoption-management.shelter-visits.settings');
    Route::post('adoption-management/shelter-visits/{visit}/status', [AdoptionManagementController::class, 'updateVisitStatus'])->name('adoption-management.shelter-visits.update-status');
    Route::post('adoption-management/rehoming-requests/{rehomingRequest}/status', [AdoptionManagementController::class, 'updateRehomingStatus'])->name('adoption-management.rehoming-requests.update-status');
    Route::post('adoption-management/rehoming-requests/{rehomingRequest}/intake', [AdoptionManagementController::class, 'intakeRehomingRequest'])->name('adoption-management.rehoming-requests.intake');
    Route::post('adoption-management/post-adoption-follow-ups', [AdoptionManagementController::class, 'storeFollowUp'])->name('adoption-management.post-adoption-follow-ups.store');
    Route::post('adoption-management/pets', [AdoptablePetController::class, 'store'])->name('adoption-management.pets.store');
    Route::post('adoption-management/pets/{pet}/needs', [AdoptablePetController::class, 'storeNeed'])->name('adoption-management.pets.needs.store');
    Route::put('adoption-management/needs/{need}', [AdoptablePetController::class, 'updateNeed'])->name('adoption-management.needs.update');
    Route::delete('adoption-management/needs/{need}', [AdoptablePetController::class, 'destroyNeed'])->name('adoption-management.needs.destroy');

    // Volunteer Management Dashboard
    Route::get('volunteer-management', [VolunteerManagementController::class, 'index'])->name('volunteer-management');
    Route::post('volunteer-management/applications/{application}/approve', [VolunteerManagementController::class, 'approve'])->name('volunteer-management.approve');
    Route::post('volunteer-management/applications/{application}/reject', [VolunteerManagementController::class, 'reject'])->name('volunteer-management.reject');
    Route::post('volunteer-management/assign', [VolunteerManagementController::class, 'assignTask'])->name('volunteer-management.assign');
    Route::post('volunteer-management/tasks/{task}/status', [VolunteerManagementController::class, 'updateTaskStatus'])->name('volunteer-management.update-task-status');
    Route::post('volunteer-management/issue-certificate', [VolunteerManagementController::class, 'issueCertificate'])->name('volunteer-management.issue-certificate');

    Route::get('donation-monitoring', [DonationMonitoringController::class, 'index'])->name('donation-monitoring');
    Route::post('donation-monitoring/donations/{donation}/verify-cash', [DonationMonitoringController::class, 'verifyCash'])->name('donation-monitoring.verify-cash');
    Route::post('donation-monitoring/donations/{donation}/reject', [DonationMonitoringController::class, 'rejectDonation'])->name('donation-monitoring.reject');
    Route::post('donation-monitoring/in-kind/{donation}/verify', [DonationMonitoringController::class, 'verifyInKind'])->name('donation-monitoring.in-kind.verify');
    Route::post('donation-monitoring/inventory', [DonationMonitoringController::class, 'storeInventoryItem'])->name('donation-monitoring.inventory.store');
    Route::put('donation-monitoring/inventory/{item}', [DonationMonitoringController::class, 'updateInventoryItem'])->name('donation-monitoring.inventory.update');
    Route::delete('donation-monitoring/inventory/{item}', [DonationMonitoringController::class, 'destroyInventoryItem'])->name('donation-monitoring.inventory.destroy');
    Route::post('donation-monitoring/inventory/{item}/batches', [DonationMonitoringController::class, 'storeBatch'])->name('donation-monitoring.inventory.batches.store');
    Route::post('donation-monitoring/inventory/batches/{batch}/adjust', [DonationMonitoringController::class, 'adjustBatchStock'])->name('donation-monitoring.inventory.batches.adjust');
    Route::post('donation-monitoring/inventory/{item}/adjust', [DonationMonitoringController::class, 'adjustStock'])->name('donation-monitoring.inventory.adjust');
    Route::post('donation-monitoring/sustainability/recalculate', [DonationMonitoringController::class, 'recalculateSustainability'])->name('donation-monitoring.sustainability.recalculate');
    Route::post('donation-monitoring/sustainability/config', [DonationMonitoringController::class, 'updateSustainabilityConfig'])->name('donation-monitoring.sustainability.config');
    Route::post('donation-monitoring/sustainability/extend', [DonationMonitoringController::class, 'extendSustainabilityTimer'])->name('donation-monitoring.sustainability.extend');

    // Event Management Dashboard
    Route::get('events', [EventManagementController::class, 'index'])->name('events');
    Route::post('events', [EventManagementController::class, 'storeEvent'])->name('events.store');
    Route::put('events/{event}', [EventManagementController::class, 'updateEvent'])->name('events.update');
    Route::post('events/{event}/toggle', [EventManagementController::class, 'toggleEventStatus'])->name('events.toggle');
    Route::post('events/{event}/approve', [EventManagementController::class, 'approveEvent'])->name('events.approve');
    Route::post('events/{event}/reject', [EventManagementController::class, 'rejectEvent'])->name('events.reject');
    Route::post('events/attendees/{task}/complete', [EventManagementController::class, 'completeAttendee'])->name('events.attendees.complete');
    Route::post('events/{event}/issue-certificates', [EventManagementController::class, 'issueEventCertificates'])->name('events.issue-certificates');
    Route::delete('events/{event}', [EventManagementController::class, 'destroyEvent'])->name('events.destroy');

    Route::post('feeding-schedules', [EventManagementController::class, 'storeFeedingSchedule'])->name('feeding-schedules.store');
    Route::put('feeding-schedules/{schedule}', [EventManagementController::class, 'updateFeedingSchedule'])->name('feeding-schedules.update');
    Route::delete('feeding-schedules/{schedule}', [EventManagementController::class, 'destroyFeedingSchedule'])->name('feeding-schedules.destroy');

    // Blog & Articles Management
    Route::get('blog-management', [BlogManagementController::class, 'index'])->name('blog-management');
    Route::post('blog-management', [BlogManagementController::class, 'store'])->name('blog-management.store');
    Route::put('blog-management/{post}', [BlogManagementController::class, 'update'])->name('blog-management.update');
    Route::delete('blog-management/{post}', [BlogManagementController::class, 'destroy'])->name('blog-management.destroy');
    Route::patch('blog-management/{post}/toggle-status', [BlogManagementController::class, 'toggleStatus'])->name('blog-management.toggle-status');
    Route::post('blog-management/{post}/approve', [BlogManagementController::class, 'approve'])->name('blog-management.approve');
    Route::post('blog-management/{post}/reject', [BlogManagementController::class, 'reject'])->name('blog-management.reject');

    Route::get('reports-analytics', [ReportsAnalyticsController::class, 'index'])->name('reports-analytics');
    Route::get('reports-analytics/export', [ReportsAnalyticsController::class, 'export'])->name('reports-analytics.export');
    Route::inertia('notifications', 'admin/notifications')->name('notifications');
    Route::get('account-settings', [AccountSettingsController::class, 'index'])->name('account-settings');
    Route::get('help-desk', [AdminHelpDeskController::class, 'index'])->name('help-desk');
    Route::post('help-desk/inquiry', [AdminHelpDeskController::class, 'storeInquiryToSuperAdmin'])->name('help-desk.inquiry');
    Route::post('help-desk/tickets/{ticket}/reply', [AdminHelpDeskController::class, 'replyTicket'])->name('help-desk.tickets.reply');
    Route::post('help-desk/tickets/{ticket}/status', [AdminHelpDeskController::class, 'updateStatus'])->name('help-desk.tickets.update-status');
    Route::post('help-desk/tickets/{ticket}/escalate', [AdminHelpDeskController::class, 'escalateToSuperAdmin'])->name('help-desk.tickets.escalate');
    Route::post('help-desk/frequent-problems', [AdminHelpDeskController::class, 'storeFrequentProblem'])->name('help-desk.frequent-problems.store');
    Route::put('help-desk/frequent-problems/{frequentProblem}', [AdminHelpDeskController::class, 'updateFrequentProblem'])->name('help-desk.frequent-problems.update');
    Route::delete('help-desk/frequent-problems/{frequentProblem}', [AdminHelpDeskController::class, 'destroyFrequentProblem'])->name('help-desk.frequent-problems.destroy');
});

Route::prefix('account/super-admin')->name('account.super-admin.')->middleware($superAdminDashboardMiddleware)->group(function () {
    Route::get('dashboard', [SuperAdminDashboardController::class, 'index'])->name('dashboard');

    Route::get('user-management', [UserManagementController::class, 'index'])->name('user-management');
    Route::post('user-management', [UserManagementController::class, 'store'])->name('user-management.store');
    Route::put('user-management/{user}', [UserManagementController::class, 'update'])->name('user-management.update');
    Route::delete('user-management/{user}', [UserManagementController::class, 'destroy'])->name('user-management.destroy');
    Route::post('user-management/{id}/restore', [UserManagementController::class, 'restore'])->name('user-management.restore');
    Route::post('roles', [UserManagementController::class, 'storeRole'])->name('roles.store');
    Route::put('roles/{role}/permissions', [UserManagementController::class, 'updateRolePermissions'])->name('roles.permissions.update');
    Route::delete('roles/{role}', [UserManagementController::class, 'destroyRole'])->name('roles.destroy');

    Route::get('audit-logs', [AuditLogController::class, 'index'])->name('audit-logs');

    Route::get('archives', [ArchiveController::class, 'index'])->name('archives');
    Route::post('archives/{type}/{id}/restore', [ArchiveController::class, 'restore'])->name('archives.restore');
    Route::delete('archives/{type}/{id}/force', [ArchiveController::class, 'forceDelete'])->name('archives.force-delete');

    Route::get('security-access', [SecurityController::class, 'index'])->name('security-access');

    Route::get('backup-restore', [BackupController::class, 'index'])->name('backup-restore');
    Route::post('backup-restore/run', [BackupController::class, 'runBackup'])->name('backup-restore.run');
    Route::post('backup-restore/{backup}/restore', [BackupController::class, 'restoreBackup'])->name('backup-restore.restore');
    Route::delete('backup-restore/{backup}', [BackupController::class, 'destroyBackup'])->name('backup-restore.destroy');
    Route::post('backup-restore/settings', [BackupController::class, 'updateSettings'])->name('backup-restore.settings');

    Route::get('ai-configuration', [AiConfigController::class, 'index'])->name('ai-configuration');
    Route::post('ai-configuration/settings', [AiConfigController::class, 'updateSettings'])->name('ai-configuration.settings');
    Route::post('ai-configuration/toggle', [AiConfigController::class, 'toggleAiFeatures'])->name('ai-configuration.toggle');
    Route::get('ai-configuration/health', [AiConfigController::class, 'healthCheck'])->name('ai-configuration.health');
    Route::post('ai-configuration/logs/{log}/accuracy', [AiConfigController::class, 'toggleAccuracy'])->name('ai-configuration.logs.accuracy');

    Route::get('system-settings', [SystemSettingsController::class, 'index'])->name('system-settings');
    Route::post('system-settings', [SystemSettingsController::class, 'update'])->name('system-settings.update');
    Route::post('system-settings/maintenance/toggle', [SystemSettingsController::class, 'toggleMaintenance'])->name('system-settings.maintenance.toggle');

    Route::inertia('advanced-analytics', 'super-admin/advanced-analytics')->name('advanced-analytics');
    Route::get('analytics', [AnalyticsController::class, 'index'])->name('analytics');
    Route::get('analytics/export', [AnalyticsController::class, 'export'])->name('analytics.export');
    Route::get('partners', [PartnerManagementController::class, 'index'])->name('partners');
    Route::post('partners', [PartnerManagementController::class, 'store'])->name('partners.store');
    Route::put('partners/{partner}', [PartnerManagementController::class, 'update'])->name('partners.update');
    Route::delete('partners/{partner}', [PartnerManagementController::class, 'destroy'])->name('partners.destroy');
    Route::post('partners/{id}/restore', [PartnerManagementController::class, 'restore'])->name('partners.restore');
    Route::patch('partners/{partner}/toggle-status', [PartnerManagementController::class, 'toggleStatus'])->name('partners.toggle-status');

    Route::get('resources', [ResourceManagementController::class, 'index'])->name('resources');
    Route::post('resources', [ResourceManagementController::class, 'store'])->name('resources.store');
    Route::put('resources/{resourceFile}', [ResourceManagementController::class, 'update'])->name('resources.update');
    Route::delete('resources/{resourceFile}', [ResourceManagementController::class, 'destroy'])->name('resources.destroy');
    Route::post('resources/{id}/restore', [ResourceManagementController::class, 'restore'])->name('resources.restore');
    Route::patch('resources/{resourceFile}/toggle-status', [ResourceManagementController::class, 'toggleStatus'])->name('resources.toggle-status');

    Route::get('community-honors', [CommunityHonorController::class, 'index'])->name('community-honors');
    Route::post('community-honors', [CommunityHonorController::class, 'store'])->name('community-honors.store');
    Route::put('community-honors/{communityHonor}', [CommunityHonorController::class, 'update'])->name('community-honors.update');
    Route::delete('community-honors/{communityHonor}', [CommunityHonorController::class, 'destroy'])->name('community-honors.destroy');
    Route::post('community-honors/stats', [CommunityHonorController::class, 'updateStats'])->name('community-honors.stats');

    Route::inertia('notifications', 'super-admin/notifications')->name('notifications');
    Route::get('account-settings', [AccountSettingsController::class, 'index'])->name('account-settings');
    Route::get('help-desk', [SuperAdminHelpDeskController::class, 'index'])->name('help-desk');
    Route::post('help-desk/tickets/{ticket}/reply', [SuperAdminHelpDeskController::class, 'replyTicket'])->name('help-desk.tickets.reply');
    Route::post('help-desk/tickets/{ticket}/status', [SuperAdminHelpDeskController::class, 'updateStatus'])->name('help-desk.tickets.update-status');
    Route::post('help-desk/frequent-problems', [SuperAdminHelpDeskController::class, 'storeFrequentProblem'])->name('help-desk.frequent-problems.store');
    Route::put('help-desk/frequent-problems/{frequentProblem}', [SuperAdminHelpDeskController::class, 'updateFrequentProblem'])->name('help-desk.frequent-problems.update');
    Route::delete('help-desk/frequent-problems/{frequentProblem}', [SuperAdminHelpDeskController::class, 'destroyFrequentProblem'])->name('help-desk.frequent-problems.destroy');

    // Event Management Dashboard (Super Admin)
    Route::get('events', [EventManagementController::class, 'index'])->name('events');
    Route::post('events', [EventManagementController::class, 'storeEvent'])->name('events.store');
    Route::put('events/{event}', [EventManagementController::class, 'updateEvent'])->name('events.update');
    Route::post('events/{event}/toggle', [EventManagementController::class, 'toggleEventStatus'])->name('events.toggle');
    Route::post('events/{event}/approve', [EventManagementController::class, 'approveEvent'])->name('events.approve');
    Route::post('events/{event}/reject', [EventManagementController::class, 'rejectEvent'])->name('events.reject');
    Route::post('events/attendees/{task}/complete', [EventManagementController::class, 'completeAttendee'])->name('events.attendees.complete');
    Route::post('events/{event}/issue-certificates', [EventManagementController::class, 'issueEventCertificates'])->name('events.issue-certificates');
    Route::delete('events/{event}', [EventManagementController::class, 'destroyEvent'])->name('events.destroy');

    Route::post('feeding-schedules', [EventManagementController::class, 'storeFeedingSchedule'])->name('feeding-schedules.store');
    Route::put('feeding-schedules/{schedule}', [EventManagementController::class, 'updateFeedingSchedule'])->name('feeding-schedules.update');
    Route::delete('feeding-schedules/{schedule}', [EventManagementController::class, 'destroyFeedingSchedule'])->name('feeding-schedules.destroy');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', DashboardRedirectController::class)->name('dashboard');
});

require __DIR__.'/settings.php';
