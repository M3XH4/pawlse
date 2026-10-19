import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowUpRight,
    BookOpen,
    CheckCircle2,
    Clock,
    Filter,
    HelpCircle,
    LifeBuoy,
    Lock,
    MessageSquare,
    Pencil,
    Plus,
    Search,
    ShieldAlert,
    Sparkles,
    Trash2,
    UserCheck,
} from 'lucide-react';
import {
    DashboardCard,
    DashboardSectionPage,
} from '@/components/dashboard/section-page';
import { CreateTicketModal } from '@/components/help-desk/create-ticket-modal';
import { TicketDetailModal } from '@/components/help-desk/ticket-detail-modal';
import { FrequentProblemsManagerModal } from '@/components/help-desk/frequent-problems-manager-modal';
import type { FrequentProblem, HelpDeskTicket } from '@/types/help-desk';
import { cn } from '@/lib/utils';

interface AdminHelpDeskProps {
    tickets: {
        data: HelpDeskTicket[];
        links: any[];
        total: number;
    };
    frequentProblems: FrequentProblem[];
    categories: string[];
    stats: {
        total: number;
        open: number;
        in_progress: number;
        escalated: number;
        resolved: number;
        frequent_problems_count: number;
        admin_inquiries_to_super: number;
    };
    staffUsers: { id: number; name: string; role: string }[];
    filters: {
        status?: string;
        priority?: string;
        category?: string;
        submitter_role?: string;
        search?: string;
        faq_search?: string;
        faq_category?: string;
        active_tab?: string;
    };
}

export default function AdminHelpDesk({
    tickets,
    frequentProblems,
    categories,
    stats,
    filters,
}: AdminHelpDeskProps) {
    const [activeTab, setActiveTab] = useState<'incoming' | 'escalated' | 'faqs'>(
        (filters.active_tab as any) || 'incoming'
    );
    const [askSuperModalOpen, setAskSuperModalOpen] = useState(false);
    const [faqModalOpen, setFaqModalOpen] = useState(false);
    const [editingFaq, setEditingFaq] = useState<FrequentProblem | null>(null);
    const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
    const selectedTicket = tickets.data.find((t) => t.id === selectedTicketId) ?? null;

    // Filters
    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [priorityFilter, setPriorityFilter] = useState(filters.priority || 'all');
    const [categoryFilter, setCategoryFilter] = useState(filters.category || 'all');
    const [roleFilter, setRoleFilter] = useState(filters.submitter_role || 'all');

    const handleApplyFilters = () => {
        router.get(
            '/account/admin/help-desk',
            {
                search: search || undefined,
                status: statusFilter !== 'all' ? statusFilter : undefined,
                priority: priorityFilter !== 'all' ? priorityFilter : undefined,
                category: categoryFilter !== 'all' ? categoryFilter : undefined,
                submitter_role: roleFilter !== 'all' ? roleFilter : undefined,
                active_tab: activeTab,
            },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleDeleteFaq = (faq: FrequentProblem) => {
        if (confirm(`Are you sure you want to delete "${faq.title}"?`)) {
            router.delete(`/account/admin/help-desk/frequent-problems/${faq.id}`, {
                preserveScroll: true,
            });
        }
    };

    const displayedTickets =
        activeTab === 'escalated'
            ? tickets.data.filter((t) => t.is_escalated || t.target_role === 'super-admin')
            : tickets.data;

    return (
        <DashboardSectionPage
            title="Help Desk & Ticket Operations"
            description="Answer questions from users and volunteers, escalate questions to Super Admin, and manage frequent problems & solutions."
            badge={
                <div className="flex flex-wrap items-center gap-2">
                    <button
                        type="button"
                        onClick={() => {
                            setEditingFaq(null);
                            setFaqModalOpen(true);
                        }}
                        className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-teal-200 bg-teal-50 px-3.5 text-xs font-bold text-teal-700 hover:bg-teal-100 dark:border-teal-800 dark:bg-teal-950/40 dark:text-teal-300 transition-colors cursor-pointer"
                    >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Add Frequent Problem</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setAskSuperModalOpen(true)}
                        className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-purple-600 px-4 text-xs font-bold text-white shadow-md shadow-purple-500/25 hover:bg-purple-700 transition-all cursor-pointer"
                    >
                        <ShieldAlert className="h-3.5 w-3.5" />
                        <span>Ask Super Admin</span>
                    </button>
                </div>
            }
        >
            {/* Stat Cards */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5 sm:gap-4">
                <DashboardCard className="p-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-teal-100 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300">
                        <LifeBuoy className="h-5 w-5" />
                    </div>
                    <div>
                        <div className="text-xl font-black text-gray-900 dark:text-white">
                            {stats.total}
                        </div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                            Total Tickets
                        </div>
                    </div>
                </DashboardCard>

                <DashboardCard className="p-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                        <Clock className="h-5 w-5" />
                    </div>
                    <div>
                        <div className="text-xl font-black text-gray-900 dark:text-white">
                            {stats.open}
                        </div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                            Open
                        </div>
                    </div>
                </DashboardCard>

                <DashboardCard className="p-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300">
                        <ArrowUpRight className="h-5 w-5" />
                    </div>
                    <div>
                        <div className="text-xl font-black text-gray-900 dark:text-white">
                            {stats.escalated}
                        </div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                            Super Admin Escalations
                        </div>
                    </div>
                </DashboardCard>

                <DashboardCard className="p-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                        <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <div>
                        <div className="text-xl font-black text-gray-900 dark:text-white">
                            {stats.resolved}
                        </div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                            Resolved
                        </div>
                    </div>
                </DashboardCard>

                <DashboardCard className="p-4 flex items-center gap-3 col-span-2 sm:col-span-1">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
                        <BookOpen className="h-5 w-5" />
                    </div>
                    <div>
                        <div className="text-xl font-black text-gray-900 dark:text-white">
                            {stats.frequent_problems_count}
                        </div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                            Frequent Fixes
                        </div>
                    </div>
                </DashboardCard>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-gray-100 pb-px dark:border-gray-800">
                <button
                    type="button"
                    onClick={() => setActiveTab('incoming')}
                    className={cn(
                        'flex items-center gap-2 border-b-2 px-5 py-3 text-xs font-bold transition-all -mb-px cursor-pointer',
                        activeTab === 'incoming'
                            ? 'border-teal-600 text-teal-600 dark:border-teal-400 dark:text-teal-400'
                            : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
                    )}
                >
                    <MessageSquare className="h-4 w-4" />
                    <span>Incoming Tickets</span>
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                        {tickets.total}
                    </span>
                </button>

                <button
                    type="button"
                    onClick={() => setActiveTab('escalated')}
                    className={cn(
                        'flex items-center gap-2 border-b-2 px-5 py-3 text-xs font-bold transition-all -mb-px cursor-pointer',
                        activeTab === 'escalated'
                            ? 'border-purple-600 text-purple-600 dark:border-purple-400 dark:text-purple-400'
                            : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
                    )}
                >
                    <ShieldAlert className="h-4 w-4" />
                    <span>Ask Super Admin & Escalations</span>
                    <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-bold text-purple-700 dark:bg-purple-900/50 dark:text-purple-300">
                        {stats.escalated}
                    </span>
                </button>

                <button
                    type="button"
                    onClick={() => setActiveTab('faqs')}
                    className={cn(
                        'flex items-center gap-2 border-b-2 px-5 py-3 text-xs font-bold transition-all -mb-px cursor-pointer',
                        activeTab === 'faqs'
                            ? 'border-teal-600 text-teal-600 dark:border-teal-400 dark:text-teal-400'
                            : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
                    )}
                >
                    <BookOpen className="h-4 w-4" />
                    <span>Frequent Problems & Solutions</span>
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                        {frequentProblems.length}
                    </span>
                </button>
            </div>

            {/* TAB 1 & 2: Tickets view (Incoming or Escalated) */}
            {(activeTab === 'incoming' || activeTab === 'escalated') && (
                <div className="space-y-4">
                    {/* Filters Bar */}
                    <DashboardCard className="p-4">
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-5">
                            {/* Search */}
                            <div className="sm:col-span-2 relative">
                                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search by ticket #, user name, subject..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}
                                    className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-9 pr-3 text-xs text-gray-900 placeholder-gray-400 focus:border-teal-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                                />
                            </div>

                            {/* Status */}
                            <div>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="w-full rounded-xl border border-gray-200 bg-white px-2.5 py-2 text-xs font-semibold text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                                >
                                    <option value="all">All Statuses</option>
                                    <option value="open">Open</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="waiting_on_user">Waiting on User</option>
                                    <option value="resolved">Resolved</option>
                                    <option value="closed">Closed</option>
                                </select>
                            </div>

                            {/* Priority */}
                            <div>
                                <select
                                    value={priorityFilter}
                                    onChange={(e) => setPriorityFilter(e.target.value)}
                                    className="w-full rounded-xl border border-gray-200 bg-white px-2.5 py-2 text-xs font-semibold text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                                >
                                    <option value="all">All Priorities</option>
                                    <option value="urgent">Urgent</option>
                                    <option value="high">High</option>
                                    <option value="medium">Medium</option>
                                    <option value="low">Low</option>
                                </select>
                            </div>

                            {/* Filter Button */}
                            <button
                                type="button"
                                onClick={handleApplyFilters}
                                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-teal-700 transition-colors cursor-pointer"
                            >
                                <Filter className="h-3.5 w-3.5" />
                                <span>Filter</span>
                            </button>
                        </div>
                    </DashboardCard>

                    {/* Tickets List */}
                    {displayedTickets.length === 0 ? (
                        <DashboardCard className="p-12 text-center">
                            <LifeBuoy className="mx-auto mb-3 h-12 w-12 text-gray-300 dark:text-gray-600" />
                            <h4 className="font-fredoka text-base font-bold text-gray-800 dark:text-gray-200">
                                {activeTab === 'escalated'
                                    ? 'No escalated tickets or inquiries to Super Admin'
                                    : 'No tickets found matching current filters'}
                            </h4>
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                All incoming support inquiries have been answered or no tickets match the filter.
                            </p>
                        </DashboardCard>
                    ) : (
                        <div className="space-y-3">
                            {displayedTickets.map((ticket) => (
                                <DashboardCard
                                    key={ticket.id}
                                    className="p-5 transition-all hover:border-teal-500/50 cursor-pointer"
                                    onClick={() => setSelectedTicketId(ticket.id)}
                                >
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                        <div className="space-y-1.5 flex-1 min-w-0 pr-2">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="font-mono text-xs font-bold text-gray-400">
                                                    {ticket.ticket_number}
                                                </span>
                                                <span
                                                    className={cn(
                                                        'rounded-md px-2 py-0.5 text-[10px] font-extrabold uppercase',
                                                        ticket.status === 'open' &&
                                                            'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300',
                                                        ticket.status === 'in_progress' &&
                                                            'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
                                                        ticket.status === 'waiting_on_user' &&
                                                            'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300',
                                                        ticket.status === 'resolved' &&
                                                            'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
                                                        ticket.status === 'closed' &&
                                                            'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                                                    )}
                                                >
                                                    {ticket.status.replace(/_/g, ' ')}
                                                </span>

                                                <span
                                                    className={cn(
                                                        'rounded-md px-2 py-0.5 text-[10px] font-bold uppercase',
                                                        ticket.priority === 'urgent' &&
                                                            'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300',
                                                        ticket.priority === 'high' &&
                                                            'bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300',
                                                        ticket.priority === 'medium' &&
                                                            'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/60 dark:text-yellow-300',
                                                        ticket.priority === 'low' &&
                                                            'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                                                    )}
                                                >
                                                    {ticket.priority}
                                                </span>

                                                {ticket.is_escalated && (
                                                    <span className="inline-flex items-center gap-1 rounded-md bg-purple-100 px-2 py-0.5 text-[10px] font-extrabold text-purple-700 dark:bg-purple-950/60 dark:text-purple-300">
                                                        <ShieldAlert className="h-3 w-3" />
                                                        Escalated to Super Admin
                                                    </span>
                                                )}

                                                <span className="rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-600 uppercase dark:bg-gray-800 dark:text-gray-300">
                                                    {ticket.category}
                                                </span>
                                            </div>

                                            <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                                                {ticket.subject}
                                            </h4>

                                            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                                                <span>
                                                    From:{' '}
                                                    <strong className="text-gray-800 dark:text-gray-200">
                                                        {ticket.user?.name}
                                                    </strong>{' '}
                                                    ({ticket.user?.role})
                                                </span>
                                                {ticket.assigned_to && (
                                                    <span>
                                                        Assigned:{' '}
                                                        <strong className="text-teal-600 dark:text-teal-400">
                                                            {ticket.assigned_to.name}
                                                        </strong>
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 shrink-0 sm:flex-col sm:items-end">
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedTicketId(ticket.id);
                                                }}
                                                className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-teal-600/20 hover:bg-teal-700 transition-all cursor-pointer"
                                            >
                                                <MessageSquare className="h-3.5 w-3.5" />
                                                <span>Reply to Ticket</span>
                                            </button>
                                            <div className="flex items-center gap-2 text-[11px] text-gray-400">
                                                <span>
                                                    {ticket.replies?.length ?? 0}{' '}
                                                    {(ticket.replies?.length ?? 0) === 1
                                                        ? 'reply'
                                                        : 'replies'}
                                                </span>
                                                <span>•</span>
                                                <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </DashboardCard>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* TAB 3: Frequent Problems & Canned Fixes Manager */}
            {activeTab === 'faqs' && (
                <div className="space-y-4">
                    <DashboardCard className="p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                            <div>
                                <h3 className="font-fredoka text-lg font-bold text-gray-900 dark:text-white">
                                    Knowledge Base & Frequent Problems
                                </h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Add solutions to frequent problems. These are shown to users and can be inserted into ticket replies with one click.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    setEditingFaq(null);
                                    setFaqModalOpen(true);
                                }}
                                className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-teal-700 transition-colors cursor-pointer shrink-0"
                            >
                                <Plus className="h-4 w-4" />
                                Add Frequent Problem
                            </button>
                        </div>

                        {frequentProblems.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-gray-200 p-8 text-center dark:border-gray-800">
                                <BookOpen className="mx-auto mb-3 h-10 w-10 text-gray-300 dark:text-gray-600" />
                                <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                    No frequent problems added yet
                                </p>
                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                    Click "Add Frequent Problem" to document common fixes and canned solutions.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {frequentProblems.map((problem) => (
                                    <div
                                        key={problem.id}
                                        className="rounded-2xl border border-gray-100 bg-gray-50/50 p-4 transition-all dark:border-gray-800 dark:bg-gray-800/40"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="space-y-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className="rounded-md bg-teal-100 px-2 py-0.5 text-[10px] font-bold text-teal-800 dark:bg-teal-950/60 dark:text-teal-300 uppercase">
                                                        {problem.category}
                                                    </span>
                                                    <span className="rounded-md bg-gray-200/80 px-2 py-0.5 text-[10px] font-semibold text-gray-700 dark:bg-gray-700 dark:text-gray-300 capitalize">
                                                        Audience: {problem.target_audience}
                                                    </span>
                                                    {problem.helpful_count > 0 && (
                                                        <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                                                            ★ {problem.helpful_count} helpful votes
                                                        </span>
                                                    )}
                                                    <span
                                                        className={cn(
                                                            'rounded-md px-1.5 py-0.2 text-[10px] font-bold',
                                                            problem.is_published
                                                                ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40'
                                                                : 'text-amber-600 bg-amber-50 dark:bg-amber-950/40'
                                                        )}
                                                    >
                                                        {problem.is_published ? 'Published' : 'Draft'}
                                                    </span>
                                                </div>
                                                <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                                                    {problem.title}
                                                </h4>
                                                <p className="whitespace-pre-line text-xs font-medium text-gray-600 dark:text-gray-300 line-clamp-2">
                                                    {problem.solution}
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-1.5 shrink-0">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setEditingFaq(problem);
                                                        setFaqModalOpen(true);
                                                    }}
                                                    className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-200 hover:text-gray-700 dark:hover:bg-gray-700 dark:hover:text-gray-200 transition-colors cursor-pointer"
                                                    title="Edit problem"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteFaq(problem)}
                                                    className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400 transition-colors cursor-pointer"
                                                    title="Delete problem"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </DashboardCard>
                </div>
            )}

            {/* Ask Super Admin Inquiry Modal */}
            <CreateTicketModal
                isOpen={askSuperModalOpen}
                onClose={() => setAskSuperModalOpen(false)}
                role="admin"
                defaultToSuperAdmin={true}
            />

            {/* Ticket Conversation Detail Modal */}
            <TicketDetailModal
                ticket={selectedTicket}
                isOpen={Boolean(selectedTicket)}
                onClose={() => setSelectedTicketId(null)}
                role="admin"
                frequentProblems={frequentProblems}
            />

            {/* Frequent Problems Add/Edit Modal */}
            <FrequentProblemsManagerModal
                isOpen={faqModalOpen}
                onClose={() => setFaqModalOpen(false)}
                editingProblem={editingFaq}
                role="admin"
            />
        </DashboardSectionPage>
    );
}
