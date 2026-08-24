import { DatabaseBackup } from 'lucide-react';
import {
    DashboardCard,
    DashboardMetricBadge,
    DashboardSectionPage,
} from '@/components/dashboard/section-page';

export default function SuperAdminBackupRestore() {
    return (
        <DashboardSectionPage
            title="Backup & Restore"
            description="Monitor backup health and restore readiness"
            badge={<DashboardMetricBadge icon={<DatabaseBackup className="h-4 w-4" />} label="Stable" />}
        >
            <DashboardCard>
                <p className="text-sm text-[#64748B] dark:text-[#94A3B8]">
                    Backup schedules, restore points, and system snapshots will appear here.
                </p>
            </DashboardCard>
        </DashboardSectionPage>
    );
}
