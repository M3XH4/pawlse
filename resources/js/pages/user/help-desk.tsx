import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import {
    CheckCircle2,
    Clock,
    HelpCircle,
    LifeBuoy,
    MessageSquare,
    Plus,
    Search,
    Sparkles,
} from 'lucide-react';
import {
    DashboardCard,
    DashboardMetricBadge,
    DashboardSectionPage,
} from '@/components/dashboard/section-page';
import { FrequentProblemsAccordion } from '@/components/help-desk/FrequentProblemsAccordion';
import { CreateTicketModal } from '@/components/help-desk/CreateTicketModal';
import { TicketDetailModal } from '@/components/help-desk/TicketDetailModal';
import type { FrequentProblem, HelpDeskTicket } from '@/types/help-desk';
import { cn } from '@/lib/utils';

interface UserHelpDeskProps {
    tickets: {
        data: HelpDeskTicket[];
        links: any[];
        total: number;
    };
    frequentProblems: FrequentProblem[];
    categories: string[];
    stats: {
        total_tickets: number;
        open_tickets: number;
        resolved_tickets: number;
        faqs_count: number;
    };
    filters: {
        search?: string;
        faq_category?: string;
    };
}

export default function UserHelpDesk({
    tickets,
    frequentProblems,
    categories,
    stats,
}: UserHelpDeskProps) {
    const [activeTab, setActiveTab] = useState<'faqs' | 'tickets'>('faqs');
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
    const selectedTicket = tickets.data.find((t) => t.id === selectedTicketId) ?? null;

    return (
        <DashboardSectionPage
            title="Help Desk & Support"
            description="Find instant solutions to common issues or reach out to shelter staff and administrators for assistance."
            badge={
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setCreateModalOpen(true)}
                        className="inline-flex min-h-11 items-center gap-2 rounded-full bg-paw-orange px-5 text-sm font-bold text-white shadow-md shadow-paw-orange/25 hover:bg-paw-orange-hover transition-all cursor-pointer"
                    >
                        <Plus className="h-4 w-4" />
                        <span>Submit Ticket</span>
                    </button>
                </div>
            }
        >
            {/* Metric Highlights */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
                <DashboardCard className="p-4 flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
                        <HelpCircle className="h-5 w-5" />
                    </div>
                    <div>
                        <div className="text-xl font-black text-gray-900 dark:text-white">
                            {stats.faqs_count}
                        </div>
                        <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                            Frequent Fixes
                        </div>
                    </div>
                </DashboardCard>

                <DashboardCard className="p-4 flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                        <Clock className="h-5 w-5" />
                    </div>
                    <div>
                        <div className="text-xl font-black text-gray-900 dark:text-white">
                            {stats.open_tickets}
                        </div>
                        <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                            Active Tickets
                        </div>
                    </div>
                </DashboardCard>

                <DashboardCard className="p-4 flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                        <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <div>
                        <div className="text-xl font-black text-gray-900 dark:text-white">
                            {stats.resolved_tickets}
                        </div>
                        <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                            Resolved
                        </div>
                    </div>
                </DashboardCard>

                <DashboardCard className="p-4 flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300">
                        <LifeBuoy className="h-5 w-5" />
                    </div>
                    <div>
                        <div className="text-xl font-black text-gray-900 dark:text-white">
                            {stats.total_tickets}
                        </div>
                        <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                            Total Submissions
                        </div>
                    </div>
                </DashboardCard>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-gray-100 pb-px dark:border-gray-800">
                <button
                    type="button"
                    onClick={() => setActiveTab('faqs')}
                    className={cn(
                        'flex items-center gap-2 border-b-2 px-5 py-3 text-xs font-bold transition-all -mb-px cursor-pointer',
                        activeTab === 'faqs'
                            ? 'border-paw-orange text-paw-orange'
                            : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
                    )}
                >
                    <Sparkles className="h-4 w-4" />
                    <span>Frequent Problems & Solutions</span>
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                        {frequentProblems.length}
                    </span>
                </button>

                <button
                    type="button"
                    onClick={() => setActiveTab('tickets')}
                    className={cn(
                        'flex items-center gap-2 border-b-2 px-5 py-3 text-xs font-bold transition-all -mb-px cursor-pointer',
                        activeTab === 'tickets'
                            ? 'border-paw-orange text-paw-orange'
                            : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
                    )}
                >
                    <MessageSquare className="h-4 w-4" />
                    <span>My Support Tickets</span>
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                        {tickets.total}
                    </span>
                </button>
            </div>

            {/* Tab 1: Frequent Problems & Fixes */}
            {activeTab === 'faqs' && (
                <div className="space-y-4">
                    <DashboardCard className="p-6">
                        <div className="mb-4">
                            <h3 className="font-fredoka text-lg font-bold text-gray-900 dark:text-white">
                                Common Questions & Troubleshooting Guides
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Check these verified solutions first for fast answers to adoption, rescue, or donation questions.
                            </p>
                        </div>
                        <FrequentProblemsAccordion
                            problems={frequentProblems}
                            categories={categories}
                            role="user"
                        />
                    </DashboardCard>
                </div>
            )}

            {/* Tab 2: My Support Tickets */}
            {activeTab === 'tickets' && (
                <div className="space-y-4">
                    {tickets.data.length === 0 ? (
                        <DashboardCard className="p-12 text-center">
                            <LifeBuoy className="mx-auto mb-3 h-12 w-12 text-gray-300 dark:text-gray-600" />
                            <h4 className="font-fredoka text-base font-bold text-gray-800 dark:text-gray-200">
                                No support tickets yet
                            </h4>
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                                If you have questions about your pet applications, donations, or rescue reports, feel free to open a ticket!
                            </p>
                            <button
                                type="button"
                                onClick={() => setCreateModalOpen(true)}
                                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-paw-orange px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-paw-orange-hover transition-colors cursor-pointer"
                            >
                                <Plus className="h-4 w-4" />
                                Submit Your First Ticket
                            </button>
                        </DashboardCard>
                    ) : (
                        <div className="space-y-3">
                            {tickets.data.map((ticket) => (
                                <DashboardCard
                                    key={ticket.id}
                                    className="p-5 transition-all hover:border-paw-orange/40 cursor-pointer"
                                    onClick={() => setSelectedTicketId(ticket.id)}
                                >
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                        <div className="space-y-1 flex-1 min-w-0 pr-2">
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
                                                <span className="rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-600 uppercase dark:bg-gray-800 dark:text-gray-300">
                                                    {ticket.category}
                                                </span>
                                            </div>
                                            <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                                                {ticket.subject}
                                            </h4>
                                            <p className="line-clamp-1 text-xs text-gray-500 dark:text-gray-400">
                                                {ticket.description}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-3 shrink-0 sm:flex-col sm:items-end">
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedTicketId(ticket.id);
                                                }}
                                                className="inline-flex items-center gap-1.5 rounded-xl bg-paw-orange px-4 py-2 text-xs font-bold text-white shadow-md shadow-paw-orange/20 hover:bg-paw-orange-hover transition-all cursor-pointer"
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

            {/* Create Ticket Modal */}
            <CreateTicketModal
                isOpen={createModalOpen}
                onClose={() => setCreateModalOpen(false)}
                role="user"
            />

            {/* Ticket Conversation Detail Modal */}
            <TicketDetailModal
                ticket={selectedTicket}
                isOpen={Boolean(selectedTicket)}
                onClose={() => setSelectedTicketId(null)}
                role="user"
                frequentProblems={frequentProblems}
            />
        </DashboardSectionPage>
    );
}
