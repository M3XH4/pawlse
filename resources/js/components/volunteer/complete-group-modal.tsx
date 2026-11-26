import { useEffect, useState } from 'react';
import { CheckCircle2, Clock, UserCheck, UserX, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AttendanceMemberInput {
    task_id: number;
    name: string;
    role: string;
    hours_logged?: number;
    status?: string;
}

export interface AttendeeSubmission {
    task_id: number;
    attended: boolean;
    hours_logged: number;
}

interface CompleteGroupModalProps {
    open: boolean;
    onClose: () => void;
    title: string;
    subtitle?: string;
    groupType: 'feeding' | 'event';
    members: AttendanceMemberInput[];
    submitting?: boolean;
    onSubmit: (attendees: AttendeeSubmission[]) => void;
}

function resolveDefaultHours(groupType: 'feeding' | 'event', role: string, existing?: number): number {
    if (existing && existing > 0) {
        return existing;
    }
    if (groupType === 'feeding') {
        return 1.5;
    }
    return role.toLowerCase() === 'participant' ? 2.0 : 4.0;
}

export function CompleteGroupModal({
    open,
    onClose,
    title,
    subtitle,
    groupType,
    members,
    submitting = false,
    onSubmit,
}: CompleteGroupModalProps) {
    const [rows, setRows] = useState<
        Array<{ task_id: number; name: string; role: string; attended: boolean; hours_logged: string }>
    >([]);

    useEffect(() => {
        if (!open) {
            return;
        }
        setRows(
            members.map((m) => {
                const isNoShow = m.status === 'no_show';
                const defaultHrs = resolveDefaultHours(groupType, m.role, m.hours_logged);
                return {
                    task_id: m.task_id,
                    name: m.name,
                    role: m.role,
                    attended: !isNoShow,
                    hours_logged: isNoShow ? '0' : String(defaultHrs),
                };
            })
        );
    }, [open, members, groupType]);

    if (!open) {
        return null;
    }

    const attendedCount = rows.filter((r) => r.attended).length;
    const noShowCount = rows.length - attendedCount;

    const handleToggle = (taskId: number, attended: boolean) => {
        setRows((prev) =>
            prev.map((row) => {
                if (row.task_id !== taskId) {
                    return row;
                }
                const defaultHrs = resolveDefaultHours(groupType, row.role);
                return {
                    ...row,
                    attended,
                    hours_logged: attended
                        ? row.hours_logged === '0'
                            ? String(defaultHrs)
                            : row.hours_logged
                        : '0',
                };
            })
        );
    };

    const handleHoursChange = (taskId: number, value: string) => {
        setRows((prev) =>
            prev.map((row) => (row.task_id === taskId ? { ...row, hours_logged: value } : row))
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(
            rows.map((r) => ({
                task_id: r.task_id,
                attended: r.attended,
                hours_logged: r.attended ? Math.max(0, parseFloat(r.hours_logged) || 0) : 0,
            }))
        );
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
            onClick={(e) => {
                if (e.target === e.currentTarget && !submitting) {
                    onClose();
                }
            }}
        >
            <div className="flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-2xl dark:border-gray-800 dark:bg-slate-900">
                <div className="flex items-start justify-between gap-3 border-b border-gray-100 p-6 dark:border-gray-800">
                    <div>
                        <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                            Finalize Attendance &amp; Disband Group
                        </span>
                        <h3 className="mt-1.5 font-fredoka text-xl font-bold text-[#0B2340] dark:text-white">
                            {title}
                        </h3>
                        {subtitle && (
                            <p className="mt-0.5 text-xs font-semibold text-gray-500 dark:text-gray-400">
                                {subtitle}
                            </p>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={submitting}
                        className="cursor-pointer rounded-xl p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800"
                    >
                        <X className="size-4" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
                    <div className="flex-1 space-y-3 overflow-y-auto p-6">
                        <p className="text-xs font-medium text-gray-600 dark:text-gray-300">
                            Confirm who showed up and adjust individual hours. Members marked{' '}
                            <strong>No Show</strong> receive <strong>0 hours</strong> and no certificate. All
                            logs and chat history will be preserved after the group is disbanded.
                        </p>

                        <div className="space-y-2.5">
                            {rows.map((row) => (
                                <div
                                    key={row.task_id}
                                    className={cn(
                                        'flex flex-col gap-3 rounded-2xl border p-3.5 sm:flex-row sm:items-center sm:justify-between',
                                        row.attended
                                            ? 'border-emerald-200 bg-emerald-50/40 dark:border-emerald-900/40 dark:bg-emerald-950/20'
                                            : 'border-rose-200 bg-rose-50/40 dark:border-rose-900/40 dark:bg-rose-950/20'
                                    )}
                                >
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-bold text-[#0B2340] dark:text-white">
                                            {row.name}
                                        </p>
                                        <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">
                                            Role: {row.role}
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => handleToggle(row.task_id, true)}
                                            className={cn(
                                                'inline-flex cursor-pointer items-center gap-1 rounded-xl px-2.5 py-1.5 text-[11px] font-bold transition',
                                                row.attended
                                                    ? 'bg-emerald-600 text-white shadow-xs'
                                                    : 'bg-white text-gray-500 hover:bg-gray-100 dark:bg-slate-800 dark:text-gray-300'
                                            )}
                                        >
                                            <UserCheck className="size-3.5" />
                                            Attended
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleToggle(row.task_id, false)}
                                            className={cn(
                                                'inline-flex cursor-pointer items-center gap-1 rounded-xl px-2.5 py-1.5 text-[11px] font-bold transition',
                                                !row.attended
                                                    ? 'bg-rose-600 text-white shadow-xs'
                                                    : 'bg-white text-gray-500 hover:bg-gray-100 dark:bg-slate-800 dark:text-gray-300'
                                            )}
                                        >
                                            <UserX className="size-3.5" />
                                            No Show
                                        </button>
                                        <div className="flex items-center gap-1 rounded-xl border border-gray-200 bg-white px-2 py-1 dark:border-gray-700 dark:bg-slate-800">
                                            <Clock className="size-3 text-paw-orange" />
                                            <input
                                                type="number"
                                                step="0.5"
                                                min="0"
                                                max="24"
                                                disabled={!row.attended}
                                                value={row.hours_logged}
                                                onChange={(e) => handleHoursChange(row.task_id, e.target.value)}
                                                className="w-12 bg-transparent text-right text-xs font-bold text-[#0B2340] focus:outline-none disabled:opacity-50 dark:text-white"
                                            />
                                            <span className="text-[10px] font-bold text-gray-400">hrs</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 bg-gray-50/70 px-6 py-4 dark:border-gray-800 dark:bg-slate-900/90">
                        <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
                            {attendedCount} attended • {noShowCount} no-show
                        </span>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={submitting}
                                className="cursor-pointer rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-bold uppercase text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:bg-slate-800 dark:text-gray-300"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-black uppercase tracking-wider text-white transition hover:bg-emerald-700 disabled:opacity-60"
                            >
                                <CheckCircle2 className="size-3.5" />
                                {submitting ? 'Finalizing...' : 'Complete & Disband Group'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
