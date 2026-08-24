import { Gift } from 'lucide-react';
import {
    DashboardCard,
    DashboardMetricBadge,
    DashboardSectionPage,
} from '@/components/dashboard/section-page';

export default function UserDonations() {
    return (
        <DashboardSectionPage
            title="My Donations"
            description="View your donation history and receipts"
            badge={<DashboardMetricBadge icon={<Gift className="h-4 w-4" />} label="0 Donations" />}
        >
            <DashboardCard>
                <p className="text-sm text-[#64748B] dark:text-[#94A3B8]">
                    Donation receipts and contribution updates will be listed here.
                </p>
            </DashboardCard>
        </DashboardSectionPage>
    );
}
