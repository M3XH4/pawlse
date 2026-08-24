import { CheckCircle2, Clock } from 'lucide-react';
import {
    DashboardCard,
    DashboardMetricBadge,
    DashboardSectionPage,
} from '@/components/dashboard/section-page';

const participationHistory = [
    {
        title: 'Community Feeding Drive - Tibanga',
        role: 'Food Carrier',
        date: '2026-04-20',
    },
    {
        title: 'Emergency Rescue Operation',
        role: 'Transport',
        date: '2026-04-15',
    },
    {
        title: 'Weekly Feeding - Poblacion',
        role: 'Feeding Lead',
        date: '2026-04-13',
    },
    {
        title: 'Adoption Fair Setup',
        role: 'Event Support',
        date: '2026-04-10',
    },
];

export default function VolunteerParticipationHistory() {
    return (
        <DashboardSectionPage
            title="Participation History"
            description="Your volunteer activity timeline"
            badge={<DashboardMetricBadge icon={<Clock className="h-4 w-4" />} label="4 Events" />}
        >
            <div className="flex flex-col gap-3">
                {participationHistory.map((event) => (
                    <DashboardCard key={`${event.title}-${event.date}`} className="p-5">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-4">
                                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[var(--dashboard-primary)]/10 text-[var(--dashboard-primary)]">
                                    <CheckCircle2 className="h-7 w-7" />
                                </span>
                                <div>
                                    <h3 className="font-fredoka text-lg font-bold text-[#0B2340] dark:text-[#F8FAFC]">
                                        {event.title}
                                    </h3>
                                    <p className="text-sm font-medium text-[#64748B] dark:text-[#94A3B8]">
                                        Role: {event.role}
                                    </p>
                                </div>
                            </div>
                            <time className="text-sm font-bold text-[#94A3B8]" dateTime={event.date}>
                                {event.date}
                            </time>
                        </div>
                    </DashboardCard>
                ))}
            </div>
        </DashboardSectionPage>
    );
}
