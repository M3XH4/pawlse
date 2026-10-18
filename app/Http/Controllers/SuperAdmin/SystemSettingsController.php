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
            'maintenance_message' => 'PAWLSE is currently taking a short paws for scheduled system maintenance. We will be back online shortly!',
        ]);

        if (! isset($settings['maintenance_message'])) {
            $settings['maintenance_message'] = 'PAWLSE is currently taking a short paws for scheduled system maintenance. We will be back online shortly!';
        }

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
            'maintenance_message' => ['nullable', 'string', 'max:500'],
        ]);

        $settings = $request->only([
            'app_name',
            'contact_email',
            'contact_phone',
            'registration_enabled',
            'maintenance_mode',
            'maintenance_message',
        ]);

        if (empty($settings['maintenance_message'])) {
            $settings['maintenance_message'] = 'PAWLSE is currently taking a short paws for scheduled system maintenance. We will be back online shortly!';
        }

        SystemSetting::setValue('system_settings', $settings);

        AuditLog::log('system_settings_update', 'Updated global system configurations');

        return redirect()->back()->with('success', 'System settings saved successfully.');
    }

    /**
     * Quick toggle for platform maintenance mode.
     */
    public function toggleMaintenance(Request $request): RedirectResponse
    {
        $request->validate([
            'maintenance_message' => ['nullable', 'string', 'max:500'],
        ]);

        $settings = SystemSetting::getValue('system_settings', [
            'app_name' => config('app.name', 'PAWLSE'),
            'contact_email' => 'support@pawlse.test',
            'contact_phone' => '09123456789',
            'registration_enabled' => true,
            'maintenance_mode' => false,
            'maintenance_message' => 'PAWLSE is currently taking a short paws for scheduled system maintenance. We will be back online shortly!',
        ]);

        $newMode = ! (bool) ($settings['maintenance_mode'] ?? false);
        $settings['maintenance_mode'] = $newMode;

        if ($request->filled('maintenance_message')) {
            $settings['maintenance_message'] = (string) $request->input('maintenance_message');
        } elseif (empty($settings['maintenance_message'])) {
            $settings['maintenance_message'] = 'PAWLSE is currently taking a short paws for scheduled system maintenance. We will be back online shortly!';
        }

        SystemSetting::setValue('system_settings', $settings);

        AuditLog::log(
            'maintenance_mode_toggle',
            $newMode ? 'Activated platform maintenance mode' : 'Deactivated platform maintenance mode'
        );

        $flashMessage = $newMode
            ? 'Maintenance mode has been activated. Public visitors will now see the maintenance screen.'
            : 'Maintenance mode has been deactivated. The platform is now live and fully accessible.';

        return redirect()->back()->with('success', $flashMessage);
    }
}
