import { Head } from '@inertiajs/react';
import { AdminPageShell } from '@/components/admin/page-shell';
import SharedAccountSettings from '@/components/dashboard/shared-account-settings';

type Props = {
    mustVerifyEmail?: boolean;
    status?: string;
    canManageTwoFactor?: boolean;
    requiresConfirmation?: boolean;
    twoFactorEnabled?: boolean;
};

export default function AccountSettings(props: Props) {
    return (
        <>
            <Head title="Account Settings" />
            <AdminPageShell title="Account Settings" description="Manage your admin profile, security settings, notification preferences, and color theme.">
                <SharedAccountSettings {...props} />
            </AdminPageShell>
        </>
    );
}
