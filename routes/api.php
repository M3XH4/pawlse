<?php

use App\Http\Controllers\Api\AutomationController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Automation API Routes (n8n Integration)
|--------------------------------------------------------------------------
|
| These endpoints are protected by the VerifyAutomationApiKey middleware
| and are designed specifically for n8n automation workflows.
|
*/

Route::prefix('automation')
    ->middleware(['automation.auth', 'throttle:60,1'])
    ->name('api.automation.')
    ->group(function () {
        Route::get('statistics', [AutomationController::class, 'statistics'])->name('statistics');
        Route::get('backup-status', [AutomationController::class, 'backupStatus'])->name('backup-status');
        Route::get('inventory-alerts', [AutomationController::class, 'inventoryAlerts'])->name('inventory-alerts');
        Route::get('feeding/upcoming', [AutomationController::class, 'upcomingFeeding'])->name('feeding.upcoming');
        Route::post('external-intake', [AutomationController::class, 'externalIntake'])->name('external-intake');
    });
