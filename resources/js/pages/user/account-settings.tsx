import { Head } from '@inertiajs/react';
import { Settings } from 'lucide-react';
import {
    DashboardMetricBadge,
    DashboardSectionPage,
} from '@/components/dashboard/section-page';
import SharedAccountSettings from '@/components/dashboard/shared-account-settings';

type Props = {
    mustVerifyEmail?: boolean;
    status?: string;
    canManageTwoFactor?: boolean;
    requiresConfirmation?: boolean;
    twoFactorEnabled?: boolean;
};

export default function UserAccountSettings(props: Props) {
    return (
        <>
            <Head title="Account Settings" />
            <DashboardSectionPage
                title="Account Settings"
                description="Manage your PAWLSE profile, security, notification, and theme preferences."
                badge={<DashboardMetricBadge icon={<Settings className="h-4 w-4" />} label="Profile" />}
            >
                <SharedAccountSettings {...props} />
            </DashboardSectionPage>
        </>
    );
}
