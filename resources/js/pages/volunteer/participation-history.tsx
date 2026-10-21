import { CheckCircle2, Clock, Calendar, Utensils, Heart } from 'lucide-react';
import { Link } from '@inertiajs/react';
import {
    DashboardCard,
    DashboardMetricBadge,
    DashboardSectionPage,
} from '@/components/dashboard/section-page';

interface HistoryItem {
    id: number;
    role: string;
    hours_logged: string | number;
    created_at: string;
    event?: {
        title: string;
        date: string;
    } | null;
    feeding_schedule?: {
        zone: string;
        day: string;
    } | null;
    pet_report?: {
        id: number;
        type?: string | null;
        pet_name?: string | null;
        species?: string | null;
        landmark?: string | null;
    } | null;
    petReport?: {
        id: number;
        type?: string | null;
        pet_name?: string | null;
        species?: string | null;
        landmark?: string | null;
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
            description="Review your timeline of completed volunteer tasks, events, and service hours."
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
                    {historyData.map((item) => {
                        const rescueReport = item.pet_report || item.petReport;
                        const hours = parseFloat(String(item.hours_logged || '0'));
                        return (
                            <DashboardCard key={item.id} className="p-5">
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex items-center gap-4">
                                        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-green-100 text-green-600">
                                            {item.event ? (
                                                <CheckCircle2 className="h-7 w-7" />
                                            ) : rescueReport ? (
                                                <Heart className="h-7 w-7 text-rose-500" />
                                            ) : (
                                                <Utensils className="h-7 w-7" />
                                            )}
                                        </span>
                                        <div>
                                            <h3 className="font-fredoka text-lg font-bold text-[#0B2340] dark:text-white">
                                                {item.event
                                                    ? item.event.title
                                                    : rescueReport
                                                        ? `Rescue: ${rescueReport.pet_name || rescueReport.species || `Case #${rescueReport.id}`}`
                                                        : (item.feeding_schedule?.zone || 'Volunteer Mission')}
                                            </h3>
                                            <div className="flex items-center gap-3 text-sm font-medium text-[#64748B] dark:text-[#94A3B8]">
                                                <span>Role: {item.role}</span>
                                                <span>•</span>
                                                <span className="text-paw-orange font-bold">
                                                    {(isNaN(hours) ? 0 : hours).toFixed(1)} hrs logged
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <time className="text-sm font-bold text-[#94A3B8]" dateTime={item.created_at}>
                                        {item.event
                                            ? item.event.date
                                            : item.feeding_schedule
                                                ? item.feeding_schedule.day
                                                : (item.created_at ? new Date(item.created_at).toLocaleDateString() : '')}
                                    </time>
                                </div>
                            </DashboardCard>
                        );
                    })}

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
