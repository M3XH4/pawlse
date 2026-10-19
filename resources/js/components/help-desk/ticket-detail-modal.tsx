import { useState, useRef, useEffect } from 'react';
import { useForm, router } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowUpRight,
    CheckCircle2,
    ChevronDown,
    Clock,
    Lock,
    MessageSquare,
    Search,
    Send,
    ShieldAlert,
    Sparkles,
    User,
    X,
} from 'lucide-react';
import type { FrequentProblem, HelpDeskTicket } from '@/types/help-desk';
import { cn } from '@/lib/utils';

interface TicketDetailModalProps {
    ticket: HelpDeskTicket | null;
    isOpen: boolean;
    onClose: () => void;
    role: 'user' | 'volunteer' | 'admin' | 'super-admin';
    frequentProblems?: FrequentProblem[];
}

export function TicketDetailModal({
    ticket,
    isOpen,
    onClose,
    role,
    frequentProblems = [],
}: TicketDetailModalProps) {
    if (!isOpen || !ticket) return null;

    const isStaff = role === 'admin' || role === 'super-admin';
    const isSuperAdmin = role === 'super-admin';

    const [isEscalating, setIsEscalating] = useState(false);
    const [escalationReason, setEscalationReason] = useState('');

    const [cannedMenuOpen, setCannedMenuOpen] = useState(false);
    const [cannedSearch, setCannedSearch] = useState('');
    const cannedMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                cannedMenuRef.current &&
                !cannedMenuRef.current.contains(event.target as Node)
            ) {
                setCannedMenuOpen(false);
            }
        }
        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === 'Escape') {
                setCannedMenuOpen(false);
            }
        }
        if (cannedMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('keydown', handleKeyDown);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [cannedMenuOpen]);

    const filteredProblems = frequentProblems.filter(
        (p) =>
            p.title.toLowerCase().includes(cannedSearch.toLowerCase()) ||
            p.category.toLowerCase().includes(cannedSearch.toLowerCase()) ||
            p.solution.toLowerCase().includes(cannedSearch.toLowerCase())
    );

    const getCannedCategoryBadgeClass = (category: string) => {
        switch (category?.toLowerCase()) {
            case 'foster care':
                return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
            case 'adoption':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300 border-blue-200 dark:border-blue-800';
            case 'volunteer tasks':
                return 'bg-purple-100 text-purple-800 dark:bg-purple-950/70 dark:text-purple-300 border-purple-200 dark:border-purple-800';
            case 'rescue & sos':
                return 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300 border-rose-200 dark:border-rose-800';
            case 'donations & inventory':
                return 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border-amber-200 dark:border-amber-800';
            default:
                return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/70 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
        }
    };

    const replyForm = useForm({
        message: '',
        is_internal_note: false,
        new_status: '',
    });

    const statusForm = useForm({
        status: ticket.status,
        priority: ticket.priority,
    });

    const handleReplySubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const replyUrl =
            role === 'super-admin'
                ? `/account/super-admin/help-desk/tickets/${ticket.id}/reply`
                : role === 'admin'
                ? `/account/admin/help-desk/tickets/${ticket.id}/reply`
                : role === 'volunteer'
                ? `/account/volunteer/help-desk/tickets/${ticket.id}/reply`
                : `/account/user/help-desk/tickets/${ticket.id}/reply`;

        replyForm.post(replyUrl, {
            preserveScroll: true,
            onSuccess: () => {
                replyForm.reset();
            },
        });
    };

    const handleStatusChange = (newStatus: string) => {
        const updateUrl =
            role === 'super-admin'
                ? `/account/super-admin/help-desk/tickets/${ticket.id}/status`
                : `/account/admin/help-desk/tickets/${ticket.id}/status`;

        router.post(
            updateUrl,
            { status: newStatus },
            {
                preserveScroll: true,
            }
        );
    };

    const handleEscalateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.post(
            `/account/admin/help-desk/tickets/${ticket.id}/escalate`,
            { escalation_reason: escalationReason },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setIsEscalating(false);
                    setEscalationReason('');
                },
            }
        );
    };

    const handleInsertCannedProblem = (problemId: string) => {
        const problem = frequentProblems.find((p) => p.id === Number(problemId));
        if (problem) {
            const formatted = `Hi! Here is how to fix this:\n\n${problem.solution}`;
            const currentMessage = typeof replyForm.data.message === 'string' ? replyForm.data.message : '';
            const nextMessage = currentMessage.trim()
                ? `${currentMessage}\n\n${formatted}`
                : formatted;
            replyForm.setData('message', nextMessage);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'open':
                return 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800';
            case 'in_progress':
                return 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800';
            case 'waiting_on_user':
                return 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800';
            case 'resolved':
                return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
            case 'closed':
                return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700';
            default:
                return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const getPriorityBadge = (priority: string) => {
        switch (priority) {
            case 'urgent':
                return 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800';
            case 'high':
                return 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-950/60 dark:text-orange-300 dark:border-orange-800';
            case 'medium':
                return 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-950/60 dark:text-yellow-300 dark:border-yellow-800';
            default:
                return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="relative flex max-h-[92vh] w-full max-w-3xl flex-col rounded-3xl border border-gray-100 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900 overflow-hidden">
                {/* Header */}
                <div className="flex items-start justify-between border-b border-gray-100 p-5 dark:border-gray-800 shrink-0">
                    <div>
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-xs font-bold text-gray-500 dark:text-gray-400">
                                {ticket.ticket_number}
                            </span>
                            <span
                                className={cn(
                                    'rounded-lg border px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide',
                                    getStatusBadge(ticket.status)
                                )}
                            >
                                {ticket.status.replace(/_/g, ' ')}
                            </span>
                            <span
                                className={cn(
                                    'rounded-lg border px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide',
                                    getPriorityBadge(ticket.priority)
                                )}
                            >
                                {ticket.priority} priority
                            </span>
                            <span className="rounded-lg bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-600 uppercase dark:bg-gray-800 dark:text-gray-300">
                                {ticket.category}
                            </span>
                        </div>
                        <h3 className="mt-2 font-fredoka text-xl font-bold text-gray-900 dark:text-white">
                            {ticket.subject}
                        </h3>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-200 transition-colors cursor-pointer"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Sub-header info / Escalation banner */}
                {ticket.is_escalated && (
                    <div className="bg-purple-500/10 border-b border-purple-200/60 p-3 px-5 text-xs text-purple-900 dark:border-purple-900/40 dark:text-purple-200 flex items-start gap-2 shrink-0">
                        <ShieldAlert className="h-4 w-4 shrink-0 text-purple-600 dark:text-purple-400 mt-0.5" />
                        <div>
                            <strong className="font-bold">
                                Escalated to Super Admin for Guidance
                            </strong>
                            {ticket.escalation_reason && (
                                <p className="mt-0.5 text-[11px] font-medium opacity-90">
                                    Reason: {ticket.escalation_reason}
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* Scrollable conversation content */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                    {/* Initial Ticket Description Message */}
                    <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4 dark:border-gray-800 dark:bg-gray-800/40">
                        <div className="flex items-center justify-between border-b border-gray-200/50 pb-2 mb-2 dark:border-gray-700/50">
                            <div className="flex items-center gap-2">
                                <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-paw-orange/15 text-paw-orange font-bold text-xs">
                                    {ticket.user?.name?.[0] ?? 'U'}
                                </div>
                                <div>
                                    <span className="text-xs font-bold text-gray-900 dark:text-white">
                                        {ticket.user?.name ?? 'User'}
                                    </span>
                                    {ticket.user?.role && (
                                        <span className="ml-1.5 rounded-md bg-gray-200/60 px-1.5 py-0.2 text-[10px] font-semibold text-gray-700 capitalize dark:bg-gray-700 dark:text-gray-300">
                                            {ticket.user.role}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <span className="text-[11px] text-gray-400">
                                {new Date(ticket.created_at).toLocaleString()}
                            </span>
                        </div>
                        <p className="whitespace-pre-line text-xs font-medium leading-relaxed text-gray-800 dark:text-gray-200">
                            {ticket.description}
                        </p>
                    </div>

                    {/* Replies Timeline */}
                    {ticket.replies && ticket.replies.length > 0 && (
                        <div className="space-y-3 pt-2">
                            {ticket.replies.map((reply) => {
                                const isAuthor = reply.user_id === ticket.user_id;
                                const isInternal = reply.is_internal_note;

                                return (
                                    <div
                                        key={reply.id}
                                        className={cn(
                                            'rounded-2xl p-4 transition-all',
                                            isInternal
                                                ? 'border-2 border-dashed border-amber-300 bg-amber-50/70 dark:border-amber-700/60 dark:bg-amber-950/20'
                                                : isAuthor
                                                ? 'border border-gray-100 bg-gray-50/70 dark:border-gray-800 dark:bg-gray-800/40'
                                                : 'border border-blue-100 bg-blue-50/40 dark:border-blue-900/40 dark:bg-blue-950/20'
                                        )}
                                    >
                                        <div className="flex items-center justify-between border-b border-gray-200/40 pb-2 mb-2 dark:border-gray-700/40">
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className={cn(
                                                        'flex h-6 w-6 items-center justify-center rounded-lg text-xs font-bold',
                                                        isInternal
                                                            ? 'bg-amber-200 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
                                                            : isAuthor
                                                            ? 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                                                            : 'bg-blue-200 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                                    )}
                                                >
                                                    {reply.user?.name?.[0] ?? 'S'}
                                                </div>
                                                <span className="text-xs font-bold text-gray-900 dark:text-white">
                                                    {reply.user?.name ?? 'Staff'}
                                                </span>
                                                {reply.user?.role && (
                                                    <span className="rounded-md bg-gray-200/60 px-1.5 py-0.2 text-[10px] font-semibold text-gray-700 capitalize dark:bg-gray-700 dark:text-gray-300">
                                                        {reply.user.role}
                                                    </span>
                                                )}
                                                {isInternal && (
                                                    <span className="inline-flex items-center gap-1 rounded-md bg-amber-200/80 px-2 py-0.5 text-[10px] font-extrabold text-amber-900 dark:bg-amber-900/70 dark:text-amber-200 uppercase tracking-wide">
                                                        <Lock className="h-3 w-3" />
                                                        Internal Staff Note
                                                    </span>
                                                )}
                                            </div>
                                            <span className="text-[11px] text-gray-400">
                                                {new Date(reply.created_at).toLocaleString()}
                                            </span>
                                        </div>
                                        <p className="whitespace-pre-line text-xs font-medium leading-relaxed text-gray-800 dark:text-gray-200">
                                            {reply.message}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer Staff Controls & Reply Form */}
                <div className="border-t border-gray-100 bg-gray-50/60 p-4 dark:border-gray-800 dark:bg-gray-900/70 shrink-0 space-y-3">
                    {/* Admin Actions Bar (Status updates, Escalate to Super Admin, Canned fixes) */}
                    {isStaff && (
                        <div className="space-y-2.5 border-b border-gray-200/50 pb-3 dark:border-gray-800">
                            {/* Canned solution custom UI dropdown */}
                            {frequentProblems.length > 0 && (
                                <div ref={cannedMenuRef} className="relative w-full">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setCannedMenuOpen((prev) => !prev);
                                            setCannedSearch('');
                                        }}
                                        className={cn(
                                            'group flex w-full items-center justify-between gap-3 rounded-xl border px-3.5 py-2 text-left text-xs font-semibold shadow-xs transition-all cursor-pointer',
                                            cannedMenuOpen
                                                ? 'border-amber-400 bg-amber-50/90 ring-2 ring-amber-400/25 dark:border-amber-500 dark:bg-amber-950/40 dark:ring-amber-900/50'
                                                : 'border-amber-300/80 bg-amber-50/50 hover:border-amber-400 hover:bg-amber-50/80 dark:border-amber-900/60 dark:bg-amber-950/20 dark:hover:border-amber-800'
                                        )}
                                    >
                                        <div className="flex items-center gap-2 truncate">
                                            <Sparkles className="h-4 w-4 shrink-0 text-amber-500 dark:text-amber-400" />
                                            <span className="font-bold text-gray-800 dark:text-gray-100 truncate">
                                                ⚡ Insert Canned Solution / Knowledge Base...
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2 shrink-0">
                                            <span className="rounded-full bg-amber-200/70 px-2 py-0.5 text-[10px] font-extrabold text-amber-900 dark:bg-amber-900/70 dark:text-amber-200">
                                                {frequentProblems.length} available
                                            </span>
                                            <ChevronDown
                                                className={cn(
                                                    'h-3.5 w-3.5 text-gray-500 transition-transform duration-200 dark:text-gray-400',
                                                    cannedMenuOpen && 'rotate-180 text-amber-600 dark:text-amber-400'
                                                )}
                                            />
                                        </div>
                                    </button>

                                    {/* Dropdown Menu Overlay */}
                                    {cannedMenuOpen && (
                                        <div className="absolute left-0 bottom-full mb-2 z-50 w-full overflow-hidden rounded-2xl border border-amber-200/90 bg-white shadow-2xl shadow-gray-900/20 dark:border-gray-700 dark:bg-gray-900 animate-in fade-in zoom-in-95 duration-150">
                                            {/* Search input header */}
                                            <div className="border-b border-gray-100 bg-gray-50/90 p-2.5 dark:border-gray-800 dark:bg-gray-800/60">
                                                <div className="relative">
                                                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                                                    <input
                                                        type="text"
                                                        autoFocus
                                                        value={cannedSearch}
                                                        onChange={(e) => setCannedSearch(e.target.value)}
                                                        placeholder="Search solutions by problem title, keyword, or category..."
                                                        className="w-full rounded-xl border border-gray-200 bg-white pl-8 pr-3 py-1.5 text-xs text-gray-800 placeholder-gray-400 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:focus:ring-amber-900/40"
                                                    />
                                                </div>
                                            </div>

                                            {/* List of Solutions */}
                                            <div className="max-h-60 overflow-y-auto p-1.5 divide-y divide-gray-100 dark:divide-gray-800/60">
                                                {filteredProblems.length === 0 ? (
                                                    <div className="p-5 text-center text-xs text-gray-400">
                                                        No canned solutions found matching &ldquo;{cannedSearch}&rdquo;
                                                    </div>
                                                ) : (
                                                    filteredProblems.map((problem) => (
                                                        <button
                                                            key={problem.id}
                                                            type="button"
                                                            onClick={() => {
                                                                handleInsertCannedProblem(String(problem.id));
                                                                setCannedMenuOpen(false);
                                                            }}
                                                            className="w-full text-left p-2.5 rounded-xl hover:bg-amber-50/90 dark:hover:bg-amber-950/40 transition-colors flex flex-col gap-1 cursor-pointer group"
                                                        >
                                                            <div className="flex items-center justify-between gap-2">
                                                                <span
                                                                    className={cn(
                                                                        'rounded-md px-2 py-0.5 text-[10px] font-bold border',
                                                                        getCannedCategoryBadgeClass(problem.category)
                                                                    )}
                                                                >
                                                                    {problem.category}
                                                                </span>
                                                                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                                                                    <span>Insert into reply</span>
                                                                    <ArrowUpRight className="h-3 w-3" />
                                                                </span>
                                                            </div>
                                                            <span className="text-xs font-bold text-gray-900 dark:text-white group-hover:text-amber-800 dark:group-hover:text-amber-300 transition-colors">
                                                                {problem.title}
                                                            </span>
                                                            <span className="line-clamp-2 text-[11px] text-gray-500 dark:text-gray-400 font-normal leading-relaxed">
                                                                {problem.solution}
                                                            </span>
                                                        </button>
                                                    ))
                                                )}
                                            </div>

                                            {/* Footer hint */}
                                            <div className="border-t border-gray-100 bg-gray-50/60 px-3 py-1.5 text-[10px] text-gray-400 dark:border-gray-800 dark:bg-gray-800/40 flex items-center justify-between">
                                                <span>Click a problem to paste solution into reply</span>
                                                <kbd className="rounded bg-gray-200/80 px-1.5 py-0.5 font-mono text-[9px] text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                                                    ESC
                                                </kbd>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Status Quick Select & Escalation */}
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Status:</span>
                                    <select
                                        value={ticket.status}
                                        onChange={(e) => handleStatusChange(e.target.value)}
                                        className="rounded-xl border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-bold text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 cursor-pointer shadow-xs"
                                    >
                                        <option value="open">Open</option>
                                        <option value="in_progress">In Progress</option>
                                        <option value="waiting_on_user">Waiting on User</option>
                                        <option value="resolved">Resolved</option>
                                        <option value="closed">Closed</option>
                                    </select>
                                </div>

                                {/* Escalate to Super Admin button (if role is admin and not yet escalated) */}
                                {role === 'admin' && !ticket.is_escalated && (
                                    <button
                                        type="button"
                                        onClick={() => setIsEscalating(!isEscalating)}
                                        className="inline-flex items-center gap-1.5 rounded-xl border border-purple-200 bg-purple-50 px-3 py-1.5 text-xs font-extrabold text-purple-700 hover:bg-purple-100 dark:border-purple-800 dark:bg-purple-950/50 dark:text-purple-300 transition-colors cursor-pointer"
                                    >
                                        <ArrowUpRight className="h-3.5 w-3.5" />
                                        Ask Super Admin / Escalate
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Escalate Drawer / Form */}
                    {isEscalating && (
                        <form
                            onSubmit={handleEscalateSubmit}
                            className="rounded-2xl border border-purple-200 bg-purple-50/70 p-3.5 dark:border-purple-800 dark:bg-purple-950/40 space-y-2 animate-in fade-in"
                        >
                            <div className="flex items-center gap-2 text-xs font-bold text-purple-900 dark:text-purple-200">
                                <ShieldAlert className="h-4 w-4 text-purple-600" />
                                <span>Question or Reason for Super Admin:</span>
                            </div>
                            <textarea
                                rows={2}
                                value={escalationReason}
                                onChange={(e) => setEscalationReason(e.target.value)}
                                placeholder="Explain why super admin guidance or intervention is required..."
                                className="w-full rounded-xl border border-purple-300 bg-white p-2.5 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 dark:bg-gray-900 dark:text-gray-100"
                                required
                            />
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsEscalating(false)}
                                    className="rounded-lg px-3 py-1 text-xs font-bold text-gray-600 hover:bg-gray-200 dark:text-gray-300 cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="rounded-lg bg-purple-600 px-3 py-1 text-xs font-bold text-white shadow-xs hover:bg-purple-700 cursor-pointer"
                                >
                                    Send to Super Admin
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Reply Form */}
                    <form onSubmit={handleReplySubmit} className="space-y-2.5">
                        <textarea
                            rows={3}
                            value={String(replyForm.data.message || '')}
                            onChange={(e) => replyForm.setData('message', e.target.value)}
                            placeholder={
                                replyForm.data.is_internal_note
                                    ? 'Write a private staff note (hidden from user/volunteer)...'
                                    : 'Type your reply message...'
                            }
                            className={cn(
                                'w-full rounded-2xl border p-3 text-xs font-medium shadow-xs focus:outline-none focus:ring-2 transition-all',
                                replyForm.data.is_internal_note
                                    ? 'border-amber-300 bg-amber-50/50 text-amber-950 placeholder-amber-400 focus:border-amber-400 focus:ring-amber-200 dark:border-amber-700 dark:bg-amber-950/20 dark:text-amber-100'
                                    : 'border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:border-paw-orange focus:ring-paw-orange/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100'
                            )}
                            required
                        />

                        <div className="flex flex-wrap items-center justify-between gap-3">
                            {/* Checkbox for internal note (Staff only) */}
                            {isStaff ? (
                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={replyForm.data.is_internal_note}
                                        onChange={(e) =>
                                            replyForm.setData('is_internal_note', e.target.checked)
                                        }
                                        className="h-4 w-4 rounded-md border-gray-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                                    />
                                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                                        Private Staff Note (Admins & Super Admin only)
                                    </span>
                                </label>
                            ) : (
                                <span className="text-xs text-gray-400">
                                    Our support team will be notified when you reply.
                                </span>
                            )}

                            <div className="flex items-center gap-2 ml-auto">
                                <button
                                    type="submit"
                                    disabled={
                                        replyForm.processing ||
                                        !String(replyForm.data.message || '').trim()
                                    }
                                    className={cn(
                                        'inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold text-white shadow-md transition-all cursor-pointer',
                                        replyForm.data.is_internal_note
                                            ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-500/25'
                                            : 'bg-paw-orange hover:bg-paw-orange-hover shadow-paw-orange/25',
                                        (replyForm.processing ||
                                            !String(replyForm.data.message || '').trim()) &&
                                            'opacity-60 cursor-not-allowed'
                                    )}
                                >
                                    <Send className="h-3.5 w-3.5" />
                                    {replyForm.processing
                                        ? 'Sending...'
                                        : replyForm.data.is_internal_note
                                        ? 'Post Internal Note'
                                        : 'Post Reply'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
