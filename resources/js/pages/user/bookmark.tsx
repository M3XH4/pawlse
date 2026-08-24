import { Bookmark } from 'lucide-react';
import {
    DashboardCard,
    DashboardMetricBadge,
    DashboardSectionPage,
} from '@/components/dashboard/section-page';

export default function UserBookmarks() {
    return (
        <DashboardSectionPage
            title="My Bookmarks"
            description="Your saved items and favorites"
            badge={<DashboardMetricBadge icon={<Bookmark className="h-4 w-4" />} label="0 Saved" />}
        >
            <DashboardCard className="flex min-h-[18rem] items-center justify-center text-center">
                <div className="mx-auto max-w-md">
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-[#F1F5F9] text-[#94A3B8] dark:bg-[#1E293B]">
                        <Bookmark className="h-9 w-9" strokeWidth={1.75} />
                    </div>
                    <h3 className="mt-5 font-fredoka text-xl font-bold text-[#0B2340] dark:text-[#F8FAFC]">
                        No bookmarks yet
                    </h3>
                    <p className="mt-2 text-sm font-medium text-[#64748B] dark:text-[#94A3B8]">
                        Start bookmarking pets, events, and more to access them later.
                    </p>
                </div>
            </DashboardCard>
        </DashboardSectionPage>
    );
}
