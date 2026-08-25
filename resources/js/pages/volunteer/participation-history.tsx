import { CheckCircle2, Clock, Calendar, Utensils } from 'lucide-react';
import { Link } from '@inertiajs/react';
import {
    DashboardCard,
    DashboardMetricBadge,
    DashboardSectionPage,
} from '@/components/dashboard/section-page';

interface HistoryItem {
    id: number;
    role: string;
    hours_logged: string;
    created_at: string;
    event?: {
        title: string;
        date: string;
    } | null;
    feeding_schedule?: {
        zone: string;
        day: string;
    } | null;
}

interface ParticipationHistoryProps {
    history: {
        data: HistoryItem[];
        links: any[];
        total: number;
    };
}

export default function VolunteerParticipationHistory({ history }: ParticipationHistoryProps) {
    const historyData = history?.data || [];

    return (
        <DashboardSectionPage
            title="Participation History"
            description="Your volunteer activity timeline"
            badge={<DashboardMetricBadge icon={<Clock className="h-4 w-4" />} label={`${history?.total || 0} Events`} />}
        >
            {historyData.length === 0 ? (
                <DashboardCard className="p-8 text-center text-gray-500 font-bold">
                    <CheckCircle2 className="mx-auto mb-4 text-gray-300" size={48} />
                    <p className="text-sm">You haven't completed any volunteer tasks yet.</p>
                    <p className="text-xs text-gray-400 mt-1">Once admins verify your participation, they will show up here.</p>
                </DashboardCard>
            ) : (
                <div className="flex flex-col gap-3">
                    {historyData.map((item) => (
                        <DashboardCard key={item.id} className="p-5">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex items-center gap-4">
                                    <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-green-100 text-green-600">
                                        {item.event ? <CheckCircle2 className="h-7 w-7" /> : <Utensils className="h-7 w-7" />}
                                    </span>
                                    <div>
                                        <h3 className="font-fredoka text-lg font-bold text-[#0B2340] dark:text-white">
                                            {item.event ? item.event.title : item.feeding_schedule?.zone}
                                        </h3>
                                        <div className="flex items-center gap-3 text-sm font-medium text-[#64748B] dark:text-[#94A3B8]">
                                            <span>Role: {item.role}</span>
                                            <span>•</span>
                                            <span className="text-paw-orange font-bold">{parseFloat(item.hours_logged)} hrs logged</span>
                                        </div>
                                    </div>
                                </div>
                                <time className="text-sm font-bold text-[#94A3B8]" dateTime={item.created_at}>
                                    {item.event ? item.event.date : item.feeding_schedule?.day}
                                </time>
                            </div>
                        </DashboardCard>
                    ))}

                    {/* Pagination */}
                    {history.links && history.links.length > 3 && (
                        <div className="flex justify-center gap-1 mt-6">
                            {history.links.map((link, idx) => {
                                if (link.url === null) return (
                                    <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-400 rounded-lg text-xs font-bold" dangerouslySetInnerHTML={{ __html: link.label }} />
                                );
                                return (
                                    <Link
                                        key={idx}
                                        href={link.url}
                                        className={`px-3 py-1 rounded-lg text-xs font-bold ${
                                            link.active ? 'bg-paw-orange text-white' : 'bg-white text-paw-navy hover:bg-paw-orange/10 border'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </DashboardSectionPage>
    );
}
