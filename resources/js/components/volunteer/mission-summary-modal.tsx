import { useEffect, useState } from 'react';
import {
    Award,
    CheckCircle2,
    Download,
    FileText,
    HeartHandshake,
    Loader2,
    Printer,
    Users,
    Utensils,
    X,
    XCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MissionSummaryData {
    group: {
        type: 'feeding' | 'event';
        id: number;
        name: string;
        schedule: string;
        is_disbanded: boolean;
        disbanded_at: string | null;
    };
    leadership: {
        route_leads: string[];
        recorders: string[];
        medics: string[];
    };
    attendance: {
        attended_count: number;
        no_show_count: number;
        pending_count: number;
        total_hours_logged: number;
        members: Array<{
            task_id: number;
            name: string;
            role: string;
            status: string;
            hours_logged: number;
        }>;
    };
    feeding: {
        total_strays_fed: number;
        total_food_packs_distributed: number;
        food_packs_allocated: number | null;
        remaining_packs: number | null;
        sponsorship: {
            id: number;
            public_reference: string;
            donor_name: string;
            occasion?: string | null;
            preferred_date?: string | null;
            packs_distributed: number;
            strays_fed: number;
        } | null;
        distribution_logs: Array<{
            id: number;
            street_or_stop: string;
            food_type: string;
            food_packs_distributed: number;
            strays_fed: number;
            recorded_by: string;
            recorded_at: string | null;
        }>;
    };
}

interface MissionSummaryModalProps {
    open: boolean;
    onClose: () => void;
    groupType: 'feeding' | 'event';
    groupId: number;
}

export function MissionSummaryModal({
    open,
    onClose,
    groupType,
    groupId,
}: MissionSummaryModalProps) {
    const [summary, setSummary] = useState<MissionSummaryData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!open || !groupId) {
            return;
        }

        let cancelled = false;
        setLoading(true);
        setError(null);

        fetch(`/account/field-groups/${groupType}/${groupId}/summary`, {
            headers: {
                Accept: 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            },
        })
            .then(async (res) => {
                if (!res.ok) {
                    throw new Error('Unable to load mission summary.');
                }
                return res.json();
            })
            .then((data: MissionSummaryData) => {
                if (!cancelled) {
                    setSummary(data);
                }
            })
            .catch((err: Error) => {
                if (!cancelled) {
                    setError(err.message);
                }
            })
            .finally(() => {
                if (!cancelled) {
                    setLoading(false);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [open, groupType, groupId]);

    if (!open) {
        return null;
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs print:static print:bg-white print:p-0"
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    onClose();
                }
            }}
        >
            <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-2xl dark:border-gray-800 dark:bg-slate-900 print:max-h-none print:border-0 print:shadow-none">
                <div className="flex items-start justify-between gap-3 border-b border-gray-100 p-6 dark:border-gray-800">
                    <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-paw-blue/15 text-paw-blue">
                            <FileText className="size-5" />
                        </div>
                        <div>
                            <span className="rounded-full bg-paw-blue/10 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-paw-blue">
                                Post-Mission Summary Report
                            </span>
                            <h3 className="mt-1 font-fredoka text-xl font-bold text-[#0B2340] dark:text-white">
                                {summary?.group.name ?? 'Loading...'}
                            </h3>
                            {summary && (
                                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                                    {summary.group.schedule}
                                    {summary.group.is_disbanded && ' • Disbanded'}
                                </p>
                            )}
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="cursor-pointer rounded-xl p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 print:hidden"
                    >
                        <X className="size-4" />
                    </button>
                </div>

                <div className="flex-1 space-y-5 overflow-y-auto p-6">
                    {loading ? (
                        <div className="flex h-40 items-center justify-center text-gray-400">
                            <Loader2 className="size-6 animate-spin" />
                        </div>
                    ) : error ? (
                        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-600">
                            {error}
                        </div>
                    ) : summary ? (
                        <>
                            {/* Key Metrics */}
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-3 dark:border-gray-800 dark:bg-slate-800/50">
                                    <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                                        Attended
                                    </p>
                                    <p className="mt-1 font-fredoka text-xl font-bold text-emerald-600">
                                        {summary.attendance.attended_count}
                                    </p>
                                </div>
                                <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-3 dark:border-gray-800 dark:bg-slate-800/50">
                                    <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                                        No Show
                                    </p>
                                    <p className="mt-1 font-fredoka text-xl font-bold text-rose-600">
                                        {summary.attendance.no_show_count}
                                    </p>
                                </div>
                                <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-3 dark:border-gray-800 dark:bg-slate-800/50">
                                    <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                                        Total Hours
                                    </p>
                                    <p className="mt-1 font-fredoka text-xl font-bold text-paw-orange">
                                        {summary.attendance.total_hours_logged} hrs
                                    </p>
                                </div>
                                <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-3 dark:border-gray-800 dark:bg-slate-800/50">
                                    <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                                        {summary.group.type === 'feeding' ? 'Strays Fed' : 'Total Roster'}
                                    </p>
                                    <p className="mt-1 font-fredoka text-xl font-bold text-paw-blue">
                                        {summary.group.type === 'feeding'
                                            ? summary.feeding.total_strays_fed
                                            : summary.attendance.members.length}
                                    </p>
                                </div>
                            </div>

                            {/* Leadership */}
                            <div className="rounded-2xl border border-gray-100 p-4 dark:border-gray-800">
                                <h4 className="mb-2.5 flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-gray-400">
                                    <Award className="size-3.5 text-paw-orange" />
                                    Key Roles
                                </h4>
                                <div className="grid grid-cols-1 gap-2 text-xs sm:grid-cols-3">
                                    <div>
                                        <span className="font-bold text-gray-500">Route Lead:</span>{' '}
                                        <span className="font-semibold text-[#0B2340] dark:text-white">
                                            {summary.leadership.route_leads.join(', ') || 'None'}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="font-bold text-gray-500">Recorder:</span>{' '}
                                        <span className="font-semibold text-[#0B2340] dark:text-white">
                                            {summary.leadership.recorders.join(', ') || 'None'}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="font-bold text-gray-500">Field Medic:</span>{' '}
                                        <span className="font-semibold text-[#0B2340] dark:text-white">
                                            {summary.leadership.medics.join(', ') || 'None'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Sponsored Feeding Impact */}
                            {summary.group.type === 'feeding' && summary.feeding.sponsorship && (
                                <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 dark:border-amber-900/50 dark:bg-amber-950/30">
                                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-800 dark:text-amber-300">
                                        <HeartHandshake className="size-4" />
                                        Linked Feeding Sponsorship ({summary.feeding.sponsorship.public_reference})
                                    </div>
                                    <p className="mt-1 text-xs font-semibold text-amber-950 dark:text-amber-100">
                                        Sponsored by <strong>{summary.feeding.sponsorship.donor_name}</strong>
                                        {summary.feeding.sponsorship.occasion
                                            ? ` • ${summary.feeding.sponsorship.occasion}`
                                            : ''}
                                    </p>
                                    <p className="mt-0.5 text-[11px] font-bold text-amber-800 dark:text-amber-300">
                                        Cumulative Sponsorship Impact: {summary.feeding.sponsorship.packs_distributed} packs distributed •{' '}
                                        {summary.feeding.sponsorship.strays_fed} strays fed
                                    </p>
                                </div>
                            )}

                            {/* Attendance & Individual Hours */}
                            <div>
                                <h4 className="mb-2 flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-gray-400">
                                    <Users className="size-3.5 text-paw-blue" />
                                    Attendance &amp; Individual Hours
                                </h4>
                                <div className="divide-y divide-gray-100 rounded-2xl border border-gray-100 dark:divide-gray-800 dark:border-gray-800">
                                    {summary.attendance.members.map((member) => (
                                        <div
                                            key={member.task_id}
                                            className="flex items-center justify-between gap-3 px-4 py-2.5 text-xs"
                                        >
                                            <div>
                                                <p className="font-bold text-[#0B2340] dark:text-white">
                                                    {member.name}
                                                </p>
                                                <p className="text-[11px] text-gray-500">{member.role}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className={cn(
                                                        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase',
                                                        member.status === 'completed'
                                                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                                                            : member.status === 'no_show'
                                                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                                                              : 'bg-gray-100 text-gray-600'
                                                    )}
                                                >
                                                    {member.status === 'completed' ? (
                                                        <CheckCircle2 className="size-3" />
                                                    ) : member.status === 'no_show' ? (
                                                        <XCircle className="size-3" />
                                                    ) : null}
                                                    {member.status.replace('_', ' ')}
                                                </span>
                                                <span className="w-14 text-right font-bold text-paw-orange">
                                                    {member.hours_logged.toFixed(1)} hrs
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Street Food Distribution Logs */}
                            {summary.group.type === 'feeding' && (
                                <div>
                                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                                        <h4 className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-gray-400">
                                            <Utensils className="size-3.5 text-paw-orange" />
                                            Street Food Distribution ({summary.feeding.total_food_packs_distributed} packs)
                                        </h4>
                                        {summary.feeding.food_packs_allocated !== null && (
                                            <span className="text-[11px] font-bold text-gray-500">
                                                Allocated: {summary.feeding.food_packs_allocated} • Remaining:{' '}
                                                {summary.feeding.remaining_packs}
                                            </span>
                                        )}
                                    </div>
                                    {summary.feeding.distribution_logs.length === 0 ? (
                                        <p className="rounded-xl bg-gray-50 p-3 text-xs font-semibold text-gray-400 dark:bg-slate-800/50">
                                            No street food distribution stops logged.
                                        </p>
                                    ) : (
                                        <div className="divide-y divide-gray-100 rounded-2xl border border-gray-100 dark:divide-gray-800 dark:border-gray-800">
                                            {summary.feeding.distribution_logs.map((log) => (
                                                <div
                                                    key={log.id}
                                                    className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 text-xs"
                                                >
                                                    <div>
                                                        <p className="font-bold text-[#0B2340] dark:text-white">
                                                            {log.street_or_stop}
                                                        </p>
                                                        <p className="text-[11px] text-gray-500">
                                                            {log.food_packs_distributed}x {log.food_type} • {log.strays_fed}{' '}
                                                            strays fed
                                                        </p>
                                                    </div>
                                                    <span className="text-[11px] font-semibold text-gray-400">
                                                        by {log.recorded_by}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    ) : null}
                </div>

                <div className="flex flex-wrap items-center justify-end gap-2 border-t border-gray-100 bg-gray-50/70 px-6 py-4 dark:border-gray-800 dark:bg-slate-900/90 print:hidden">
                    <a
                        href={`/account/field-groups/${groupType}/${groupId}/summary/export`}
                        className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-bold uppercase text-[#0B2340] transition hover:bg-gray-100 dark:border-gray-700 dark:bg-slate-800 dark:text-white"
                    >
                        <Download className="size-3.5" />
                        Export CSV
                    </a>
                    <button
                        type="button"
                        onClick={() => window.print()}
                        className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-paw-blue px-3.5 py-2 text-xs font-bold uppercase text-white transition hover:bg-blue-700"
                    >
                        <Printer className="size-3.5" />
                        Print
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="cursor-pointer rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-bold uppercase text-gray-600 transition hover:bg-gray-100 dark:border-gray-700 dark:bg-slate-800 dark:text-gray-300"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
