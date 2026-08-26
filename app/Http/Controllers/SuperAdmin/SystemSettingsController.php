<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\SystemSetting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SystemSettingsController extends Controller
{
    /**
     * Display System Settings screen.
     */
    public function index(Request $request): Response
    {
        $settings = SystemSetting::getValue('system_settings', [
            'app_name' => config('app.name', 'PAWLSE'),
            'contact_email' => 'support@pawlse.test',
            'contact_phone' => '09123456789',
            'registration_enabled' => true,
            'maintenance_mode' => false,
        ]);

        return Inertia::render('super-admin/system-settings', [
            'settings' => $settings,
        ]);
    }

    /**
     * Save updated system settings.
     */
    public function update(Request $request): RedirectResponse
    {
        $request->validate([
            'app_name' => ['required', 'string', 'max:100'],
            'contact_email' => ['required', 'email', 'max:255'],
            'contact_phone' => ['required', 'string', 'max:20'],
            'registration_enabled' => ['required', 'boolean'],
            'maintenance_mode' => ['required', 'boolean'],
        ]);

        SystemSetting::setValue('system_settings', $request->only([
            'app_name',
            'contact_email',
            'contact_phone',
            'registration_enabled',
            'maintenance_mode',
        ]));

        AuditLog::log('system_settings_update', 'Updated global system configurations');

        return redirect()->back()->with('success', 'System settings saved successfully.');
    }
}
