import { Link, usePage } from '@inertiajs/react';
import {
    ArrowUpRight,
    Bot,
    Check,
    Loader2,
    RefreshCw,
    Send,
    ThumbsDown,
    ThumbsUp,
    Trash2,
    X,
    Zap,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { getEcho } from '@/echo';
import type { SharedData } from '@/types';
import type { DashboardTheme } from '@/types/dashboard';

interface AssistantAction {
    label: string;
    href: string;
    priority: 'high' | 'medium' | 'low';
    count?: number;
}

interface AssistantQuickAction {
    id: string;
    label: string;
    kind: 'confirm_post' | 'prefill_ticket' | 'navigate';
    href?: string;
    confirmText?: string;
}

interface AssistantStat {
    label: string;
    value: string;
    delta?: string;
}

interface AssistantApiResponse {
    reply: string;
    actions: AssistantAction[];
    quickActions?: AssistantQuickAction[];
    stats?: AssistantStat[];
    suggestedPrompts: string[];
    dashboardRole: string;
    priorityCount?: number;
    feedbackId?: number | null;
}

interface ChatMessage {
    id: string;
    sender: 'assistant' | 'user';
    text: string;
    actions?: AssistantAction[];
    quickActions?: AssistantQuickAction[];
    stats?: AssistantStat[];
    feedbackId?: number | null;
    rating?: 'up' | 'down' | null;
}

const THEME_STYLES: Record<
    DashboardTheme,
    {
        fab: string;
        header: string;
        userBubble: string;
        chip: string;
    }
> = {
    user: {
        fab: 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30 focus:ring-emerald-500',
        header: 'from-emerald-600 to-teal-600',
        userBubble: 'bg-emerald-600 text-white',
        chip: 'border-emerald-200 bg-emerald-50/70 text-emerald-800 hover:bg-emerald-100 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-200 dark:hover:bg-emerald-900/50',
    },
    volunteer: {
        fab: 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/30 focus:ring-blue-500',
        header: 'from-blue-600 to-indigo-600',
        userBubble: 'bg-blue-600 text-white',
        chip: 'border-blue-200 bg-blue-50/70 text-blue-800 hover:bg-blue-100 dark:border-blue-800/60 dark:bg-blue-950/40 dark:text-blue-200 dark:hover:bg-blue-900/50',
    },
    admin: {
        fab: 'bg-teal-600 hover:bg-teal-500 shadow-teal-600/30 focus:ring-teal-500',
        header: 'from-teal-600 to-cyan-600',
        userBubble: 'bg-teal-600 text-white',
        chip: 'border-teal-200 bg-teal-50/70 text-teal-800 hover:bg-teal-100 dark:border-teal-800/60 dark:bg-teal-950/40 dark:text-teal-200 dark:hover:bg-teal-900/50',
    },
    'super-admin': {
        fab: 'bg-purple-600 hover:bg-purple-500 shadow-purple-600/30 focus:ring-purple-500',
        header: 'from-purple-600 to-indigo-600',
        userBubble: 'bg-purple-600 text-white',
        chip: 'border-purple-200 bg-purple-50/70 text-purple-800 hover:bg-purple-100 dark:border-purple-800/60 dark:bg-purple-950/40 dark:text-purple-200 dark:hover:bg-purple-900/50',
    },
};

function getCsrfToken(): string {
    return (
        document
            .querySelector('meta[name="csrf-token"]')
            ?.getAttribute('content') ?? ''
    );
}

function priorityDotColor(priority: AssistantAction['priority']): string {
    if (priority === 'high') {
        return 'bg-rose-500';
    }
    if (priority === 'medium') {
        return 'bg-amber-500';
    }

    return 'bg-emerald-500';
}

export function DashboardAssistantFab({ theme }: { theme: DashboardTheme }) {
    const page = usePage<SharedData>();
    const userId = page.props.auth?.user?.id ?? 'guest';
    const currentPath = page.url.split('?')[0] || '/';
    const storageKey = `pawlse-assistant-chat:${userId}:${theme}`;

    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<ChatMessage[]>(() => {
        try {
            const saved = localStorage.getItem(storageKey);
            if (saved) {
                const parsed = JSON.parse(saved) as ChatMessage[];
                if (Array.isArray(parsed) && parsed.length > 0) {
                    return parsed;
                }
            }
        } catch {
            // Ignore storage errors
        }

        return [];
    });
    const [suggestedPrompts, setSuggestedPrompts] = useState<string[]>([]);
    const [priorityCount, setPriorityCount] = useState<number>(0);
    const [pendingQuickAction, setPendingQuickAction] =
        useState<AssistantQuickAction | null>(null);
    const [ticketSubject, setTicketSubject] = useState('');
    const [executingAction, setExecutingAction] = useState(false);

    const scrollRef = useRef<HTMLDivElement>(null);
    const styles = THEME_STYLES[theme];

    const scrollToBottom = useCallback(() => {
        requestAnimationFrame(() => {
            if (scrollRef.current) {
                scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
            }
        });
    }, []);

    // Persist chat messages in localStorage across dashboard tabs
    useEffect(() => {
        try {
            if (messages.length > 0) {
                localStorage.setItem(
                    storageKey,
                    JSON.stringify(messages.slice(-30)),
                );
            } else {
                localStorage.removeItem(storageKey);
            }
        } catch {
            // Ignore storage errors
        }
    }, [messages, storageKey]);

    const loadSummary = useCallback(
        async (replaceMessages = false) => {
            if (replaceMessages) {
                setLoading(true);
            }
            try {
                const res = await fetch(
                    `/account/assistant/summary?dashboard_role=${encodeURIComponent(theme)}&page_path=${encodeURIComponent(currentPath)}`,
                    {
                        headers: { Accept: 'application/json' },
                    },
                );

                if (!res.ok) {
                    return;
                }

                const data = (await res.json()) as AssistantApiResponse;
                setPriorityCount(data.priorityCount ?? 0);
                setSuggestedPrompts(data.suggestedPrompts ?? []);

                if (replaceMessages) {
                    setMessages([
                        {
                            id: `summary-${Date.now()}`,
                            sender: 'assistant',
                            text: data.reply,
                            actions: data.actions,
                            quickActions: data.quickActions,
                            stats: data.stats,
                        },
                    ]);
                    scrollToBottom();
                } else {
                    setMessages((prev) => {
                        if (prev.length > 0) {
                            return prev;
                        }

                        return [
                            {
                                id: `summary-${Date.now()}`,
                                sender: 'assistant',
                                text: data.reply,
                                actions: data.actions,
                                quickActions: data.quickActions,
                                stats: data.stats,
                            },
                        ];
                    });
                }
            } catch {
                if (replaceMessages) {
                    setMessages((prev) => [
                        ...prev,
                        {
                            id: `err-${Date.now()}`,
                            sender: 'assistant',
                            text: 'Sorry, I could not load your dashboard briefing right now. Please try again.',
                        },
                    ]);
                }
            } finally {
                if (replaceMessages) {
                    setLoading(false);
                }
            }
        },
        [currentPath, scrollToBottom, theme],
    );

    // Load initial priority badge count & summary on mount
    useEffect(() => {
        void loadSummary(false);
    }, [loadSummary]);

    // Subscribe to Laravel Reverb domain events to keep priority badge & summary live
    useEffect(() => {
        const echo = getEcho();
        if (!echo) {
            return;
        }

        const handleRealtimeEvent = () => {
            void loadSummary(false);
        };

        const publicChannel = echo.channel('app-realtime');
        publicChannel.listen('.app.event', handleRealtimeEvent);

        const privateChannelName =
            typeof userId === 'number' ? `users.${userId}` : null;
        if (privateChannelName) {
            echo.private(privateChannelName).listen(
                '.app.event',
                handleRealtimeEvent,
            );
        }

        return () => {
            publicChannel.stopListening('.app.event', handleRealtimeEvent);
            if (privateChannelName) {
                echo.leave(privateChannelName);
            }
        };
    }, [loadSummary, userId]);

    const sendMessage = async (textToSend: string) => {
        const trimmed = textToSend.trim();
        if (!trimmed || loading) {
            return;
        }

        const userMsg: ChatMessage = {
            id: `user-${Date.now()}`,
            sender: 'user',
            text: trimmed,
        };

        setMessages((prev) => [...prev, userMsg]);
        setInput('');
        setLoading(true);
        scrollToBottom();

        try {
            const res = await fetch('/account/assistant/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                },
                body: JSON.stringify({
                    message: trimmed,
                    dashboard_role: theme,
                    page_path: currentPath,
                }),
            });

            if (!res.ok) {
                throw new Error('Request failed');
            }

            const data = (await res.json()) as AssistantApiResponse;
            if (typeof data.priorityCount === 'number') {
                setPriorityCount(data.priorityCount);
            }

            setMessages((prev) => [
                ...prev,
                {
                    id: `assistant-${Date.now()}`,
                    sender: 'assistant',
                    text: data.reply,
                    actions: data.actions,
                    quickActions: data.quickActions,
                    stats: data.stats,
                    feedbackId: data.feedbackId ?? null,
                    rating: null,
                },
            ]);
            if (data.suggestedPrompts?.length) {
                setSuggestedPrompts(data.suggestedPrompts);
            }
        } catch {
            setMessages((prev) => [
                ...prev,
                {
                    id: `err-${Date.now()}`,
                    sender: 'assistant',
                    text: 'I ran into an issue answering that. Please try again in a moment.',
                },
            ]);
        } finally {
            setLoading(false);
            scrollToBottom();
        }
    };

    const executeConfirmedQuickAction = async () => {
        if (!pendingQuickAction || executingAction) {
            return;
        }

        setExecutingAction(true);
        try {
            const payload =
                pendingQuickAction.kind === 'prefill_ticket'
                    ? {
                          subject:
                              ticketSubject.trim() ||
                              'Support inquiry from Dashboard Assistant',
                          message:
                              input.trim() ||
                              'Submitted via Pawlse Dashboard Assistant.',
                      }
                    : {};

            const res = await fetch('/account/assistant/quick-action', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                },
                body: JSON.stringify({
                    action_id: pendingQuickAction.id,
                    payload,
                }),
            });

            const data = (await res.json()) as {
                ok?: boolean;
                message?: string;
            };

            setMessages((prev) => [
                ...prev,
                {
                    id: `qa-${Date.now()}`,
                    sender: 'assistant',
                    text:
                        data.message ??
                        (res.ok
                            ? 'Action completed.'
                            : 'Unable to complete action.'),
                },
            ]);
            setPendingQuickAction(null);
            setTicketSubject('');
            scrollToBottom();
        } catch {
            setMessages((prev) => [
                ...prev,
                {
                    id: `qa-err-${Date.now()}`,
                    sender: 'assistant',
                    text: 'Failed to execute that quick action. Please try again.',
                },
            ]);
        } finally {
            setExecutingAction(false);
        }
    };

    const submitFeedback = async (
        messageId: string,
        feedbackId: number,
        rating: 'up' | 'down',
    ) => {
        setMessages((prev) =>
            prev.map((m) => (m.id === messageId ? { ...m, rating } : m)),
        );

        try {
            await fetch('/account/assistant/feedback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                },
                body: JSON.stringify({
                    feedback_id: feedbackId,
                    rating,
                }),
            });
        } catch {
            // Non-blocking feedback
        }
    };

    const clearHistory = () => {
        setMessages([]);
        try {
            localStorage.removeItem(storageKey);
        } catch {
            // Ignore storage errors
        }
        void loadSummary(true);
    };

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        void sendMessage(input);
    };

    return (
        <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3">
            {open && (
                <div
                    role="dialog"
                    aria-label="Pawlse Dashboard Assistant"
                    className="flex max-h-[75vh] w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl sm:w-96 dark:border-slate-800 dark:bg-slate-950"
                >
                    {/* Header */}
                    <div
                        className={`flex items-center justify-between bg-gradient-to-r ${styles.header} px-4 py-2.5 text-white`}
                    >
                        <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/20 ring-1 ring-white/25 backdrop-blur-xs">
                                <Bot className="h-4 w-4 text-white" />
                            </div>
                            <span className="font-fredoka text-sm font-bold tracking-wide">
                                Pawlse Assistant
                            </span>
                        </div>
                        <div className="flex items-center gap-1 rounded-xl bg-white/10 p-0.5 backdrop-blur-xs">
                            <button
                                type="button"
                                onClick={() => void loadSummary(true)}
                                disabled={loading}
                                title="Refresh briefing"
                                aria-label="Refresh briefing"
                                className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-white/85 transition hover:bg-white/20 hover:text-white disabled:opacity-50"
                            >
                                <RefreshCw
                                    className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`}
                                />
                            </button>
                            <button
                                type="button"
                                onClick={clearHistory}
                                disabled={loading}
                                title="Clear chat history"
                                aria-label="Clear chat history"
                                className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-white/85 transition hover:bg-white/20 hover:text-white disabled:opacity-50"
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                                type="button"
                                onClick={() => setOpen(false)}
                                aria-label="Close assistant"
                                className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-white/85 transition hover:bg-white/20 hover:text-white"
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div
                        ref={scrollRef}
                        className="flex-1 space-y-3 overflow-y-auto bg-slate-50/70 p-3.5 text-xs dark:bg-slate-900/50"
                    >
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex flex-col gap-1.5 ${
                                    msg.sender === 'user'
                                        ? 'items-end'
                                        : 'items-start'
                                }`}
                            >
                                <div
                                    className={`max-w-[88%] whitespace-pre-line rounded-2xl px-3.5 py-2.5 leading-relaxed shadow-xs ${
                                        msg.sender === 'user'
                                            ? `${styles.userBubble} rounded-br-sm`
                                            : 'rounded-bl-sm border border-slate-200/80 bg-white text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200'
                                    }`}
                                >
                                    {msg.text.replace(/\*\*/g, '')}
                                </div>

                                {/* Inline Analytics Stat Cards */}
                                {msg.stats && msg.stats.length > 0 && (
                                    <div className="grid w-full max-w-[92%] grid-cols-1 gap-1.5 sm:grid-cols-3">
                                        {msg.stats.map((stat) => (
                                            <div
                                                key={`${msg.id}-${stat.label}`}
                                                className="rounded-xl border border-slate-200 bg-white p-2 shadow-2xs dark:border-slate-800 dark:bg-slate-900"
                                            >
                                                <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                                                    {stat.label}
                                                </p>
                                                <p className="mt-0.5 text-sm font-bold text-slate-900 dark:text-white">
                                                    {stat.value}
                                                </p>
                                                {stat.delta && (
                                                    <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                                                        {stat.delta}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Navigation Action Pills */}
                                {msg.actions && msg.actions.length > 0 && (
                                    <div className="flex w-full max-w-[92%] flex-col gap-1.5">
                                        {msg.actions.map((action) => (
                                            <Link
                                                key={`${msg.id}-${action.href}-${action.label}`}
                                                href={action.href}
                                                onClick={() => setOpen(false)}
                                                className="inline-flex w-full items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-700 shadow-2xs transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                                            >
                                                <span className="flex min-w-0 items-center gap-2">
                                                    <span
                                                        className={`h-1.5 w-1.5 shrink-0 rounded-full ${priorityDotColor(action.priority)}`}
                                                    />
                                                    <span className="truncate">
                                                        {action.label}
                                                    </span>
                                                </span>
                                                <ArrowUpRight className="h-3.5 w-3.5 shrink-0 opacity-60" />
                                            </Link>
                                        ))}
                                    </div>
                                )}

                                {/* One-Click Quick Action Chips */}
                                {msg.quickActions &&
                                    msg.quickActions.length > 0 && (
                                        <div className="flex max-w-[92%] flex-wrap gap-1.5">
                                            {msg.quickActions.map((qa) =>
                                                qa.kind === 'navigate' &&
                                                qa.href ? (
                                                    <Link
                                                        key={`${msg.id}-${qa.id}`}
                                                        href={qa.href}
                                                        onClick={() =>
                                                            setOpen(false)
                                                        }
                                                        className="inline-flex items-center gap-1 rounded-xl border border-indigo-200 bg-indigo-50/70 px-2.5 py-1 text-[11px] font-semibold text-indigo-800 transition hover:bg-indigo-100 dark:border-indigo-800/60 dark:bg-indigo-950/40 dark:text-indigo-200"
                                                    >
                                                        <Zap className="h-3 w-3" />
                                                        <span>{qa.label}</span>
                                                    </Link>
                                                ) : (
                                                    <button
                                                        key={`${msg.id}-${qa.id}`}
                                                        type="button"
                                                        onClick={() =>
                                                            setPendingQuickAction(
                                                                qa,
                                                            )
                                                        }
                                                        className="inline-flex items-center gap-1 rounded-xl border border-indigo-200 bg-indigo-50/70 px-2.5 py-1 text-[11px] font-semibold text-indigo-800 transition hover:bg-indigo-100 dark:border-indigo-800/60 dark:bg-indigo-950/40 dark:text-indigo-200"
                                                    >
                                                        <Zap className="h-3 w-3" />
                                                        <span>{qa.label}</span>
                                                    </button>
                                                ),
                                            )}
                                        </div>
                                    )}

                                {/* Helpfulness Feedback */}
                                {msg.sender === 'assistant' &&
                                    msg.feedbackId && (
                                        <div className="flex items-center gap-1 pl-1">
                                            <button
                                                type="button"
                                                aria-label="Helpful"
                                                onClick={() =>
                                                    void submitFeedback(
                                                        msg.id,
                                                        msg.feedbackId!,
                                                        'up',
                                                    )
                                                }
                                                className={`rounded-md p-1 transition ${
                                                    msg.rating === 'up'
                                                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300'
                                                        : 'text-slate-400 hover:bg-slate-200/70 hover:text-slate-600 dark:hover:bg-slate-800'
                                                }`}
                                            >
                                                <ThumbsUp className="h-3 w-3" />
                                            </button>
                                            <button
                                                type="button"
                                                aria-label="Not helpful"
                                                onClick={() =>
                                                    void submitFeedback(
                                                        msg.id,
                                                        msg.feedbackId!,
                                                        'down',
                                                    )
                                                }
                                                className={`rounded-md p-1 transition ${
                                                    msg.rating === 'down'
                                                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300'
                                                        : 'text-slate-400 hover:bg-slate-200/70 hover:text-slate-600 dark:hover:bg-slate-800'
                                                }`}
                                            >
                                                <ThumbsDown className="h-3 w-3" />
                                            </button>
                                        </div>
                                    )}
                            </div>
                        ))}

                        {loading && (
                            <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                <span>Checking permitted records...</span>
                            </div>
                        )}
                    </div>

                    {/* Quick Action Confirmation Bar */}
                    {pendingQuickAction && (
                        <div className="border-t border-indigo-200 bg-indigo-50/90 p-2.5 text-xs dark:border-indigo-900/60 dark:bg-indigo-950/50">
                            <p className="font-semibold text-indigo-950 dark:text-indigo-200">
                                {pendingQuickAction.confirmText ??
                                    pendingQuickAction.label}
                            </p>
                            {pendingQuickAction.kind === 'prefill_ticket' && (
                                <input
                                    type="text"
                                    value={ticketSubject}
                                    onChange={(e) =>
                                        setTicketSubject(e.target.value)
                                    }
                                    placeholder="Ticket subject..."
                                    className="mt-1.5 w-full rounded-lg border border-indigo-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:outline-hidden dark:border-indigo-800 dark:bg-slate-900 dark:text-white"
                                />
                            )}
                            <div className="mt-2 flex items-center justify-end gap-1.5">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setPendingQuickAction(null);
                                        setTicketSubject('');
                                    }}
                                    className="rounded-lg px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-200/70 dark:text-slate-300 dark:hover:bg-slate-800"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    disabled={executingAction}
                                    onClick={() =>
                                        void executeConfirmedQuickAction()
                                    }
                                    className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
                                >
                                    <Check className="h-3 w-3" />
                                    <span>
                                        {executingAction
                                            ? 'Running...'
                                            : 'Confirm'}
                                    </span>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Quick Prompt Pills (single-row horizontal scroll) */}
                    {suggestedPrompts.length > 0 && (
                        <div className="flex items-center gap-1.5 overflow-x-auto border-t border-slate-200/80 bg-white px-3 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden dark:border-slate-800 dark:bg-slate-950">
                            {suggestedPrompts.map((prompt) => (
                                <button
                                    key={prompt}
                                    type="button"
                                    disabled={loading}
                                    onClick={() => void sendMessage(prompt)}
                                    className={`shrink-0 whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-semibold transition disabled:opacity-50 ${styles.chip}`}
                                >
                                    {prompt}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Input */}
                    <form
                        onSubmit={handleSubmit}
                        className="flex items-center gap-2 border-t border-slate-200/80 bg-white p-2.5 dark:border-slate-800 dark:bg-slate-950"
                    >
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask what we should do next..."
                            maxLength={500}
                            className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:border-slate-300 focus:bg-white focus:outline-hidden dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500"
                        />
                        <button
                            type="submit"
                            disabled={loading || !input.trim()}
                            aria-label="Send message"
                            className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-white transition disabled:opacity-40 ${styles.fab}`}
                        >
                            <Send className="h-3.5 w-3.5" />
                        </button>
                    </form>
                </div>
            )}

            {/* Floating Action Button with Proactive Priority Badge */}
            <button
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                aria-label={
                    open ? 'Close Pawlse Assistant' : 'Open Pawlse Assistant'
                }
                aria-expanded={open}
                className={`group relative flex h-13 w-13 items-center justify-center rounded-full text-white shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-hidden focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-950 ${styles.fab}`}
            >
                {open ? (
                    <X className="h-6 w-6 transition-transform duration-200" />
                ) : (
                    <Bot className="h-6 w-6 transition-transform duration-200 group-hover:rotate-6" />
                )}
                {!open && priorityCount > 0 && (
                    <span
                        aria-label={`${priorityCount} priority items`}
                        className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-rose-500 px-1 text-[10px] font-bold text-white shadow-xs dark:border-slate-950"
                    >
                        {priorityCount > 99 ? '99+' : priorityCount}
                    </span>
                )}
            </button>
        </div>
    );
}
