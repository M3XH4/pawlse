<?php

namespace App\Support;

use App\Models\SystemSetting;

/**
 * Isolated helper for Demo / Sandbox Mode.
 *
 * To remove Sandbox Mode completely from the codebase:
 * 1. Delete this file and resources/js/components/dashboard/sandbox-demo-controls.tsx
 * 2. Remove 'isSandboxMode' from HandleInertiaRequests.php
 * 3. Remove 'sandbox_mode' from SystemSettingsController.php and super-admin/system-settings.tsx
 * 4. Remove <SandboxDemoControls /> from achievements-view.tsx
 */
class SandboxMode
{
    public static function isAllowedInEnvironment(): bool
    {
        return ! app()->isProduction();
    }

    public static function isEnabled(): bool
    {
        if (! self::isAllowedInEnvironment()) {
            return false;
        }

        return (bool) rescue(
            fn () => SystemSetting::getValue('system_settings')['sandbox_mode'] ?? false,
            false,
            false,
        );
    }
}
