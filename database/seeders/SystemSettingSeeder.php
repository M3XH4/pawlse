<?php

namespace Database\Seeders;

use App\Models\SystemSetting;
use Illuminate\Database\Seeder;

class SystemSettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        SystemSetting::setValue('system_settings', [
            'app_name' => 'PAWLSE',
            'contact_email' => 'support@pawlse.test',
            'contact_phone' => '09123456789',
            'registration_enabled' => true,
            'maintenance_mode' => false,
        ]);

        SystemSetting::setValue('ai_settings', [
            'ai_enabled' => true,
            'ai_reporting_enabled' => true,
            'ai_identifying_enabled' => true,
            'ai_confidence_threshold' => 0.70,
            'ai_auto_validation' => false,
        ]);

        SystemSetting::setValue('backup_settings', [
            'auto_enabled' => false,
            'interval' => 'daily',
            'retention_days' => 30,
        ]);
    }
}
