import { useEffect, useRef, useState } from 'react';
import {
    AlertTriangle,
    Archive,
    Calendar,
    Clock,
    FileText,
    Loader2,
    MessageSquare,
    Send,
    ShieldCheck,
    Users,
    Utensils,
    X,
} from 'lucide-react';
import { MissionSummaryModal } from '@/components/volunteer/mission-summary-modal';
import { getEcho } from '@/echo';
import { cn, formatPhotoUrl } from '@/lib/utils';

export interface GroupChatMember {
    id?: number;
    task_id?: number;
    user_id?: number;
    name: string;
    role: string;
    avatar_path?: string | null;
    status?: string;
    hours_logged?: number;
    is_me?: boolean;
    is_lead?: boolean;
    is_medic?: boolean;
    is_recorder?: boolean;
}

export interface GroupChatMessage {
    id: number;
    group_type: 'feeding' | 'event';
    group_id: number;
    user_id: number;
    message: string;
    created_at: string | null;
    sender: {
        id: number | null;
        name: string;
        avatar_path?: string | null;
        group_role: string;
        is_admin: boolean;
    };
}

interface GroupChatDrawerProps {
    open: boolean;
    onClose: () => void;
    groupType: 'feeding' | 'event';
    groupId: number;
    groupName: string;
    schedule?: string;
    members: GroupChatMember[];
    currentUserId: number;
    isDisbanded?: boolean;
    initialTab?: 'chat' | 'roster';
}

function getCsrfToken(): string {
    return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '';
}

function getInitials(name: string): string {
    return (
        name
            .split(' ')
            .filter(Boolean)
            .slice(0, 2)
            .map((p) => p[0]?.toUpperCase() ?? '')
            .join('') || 'V'
    );
}

export function GroupChatDrawer({
    open,
    onClose,
    groupType,
    groupId,
    groupName,
    schedule,
    members,
    currentUserId,
    isDisbanded: initialDisbanded = false,
    initialTab = 'chat',
}: GroupChatDrawerProps) {
    const [activeTab, setActiveTab] = useState<'chat' | 'roster'>(initialTab);
    const [messages, setMessages] = useState<GroupChatMessage[]>([]);
    const [isDisbanded, setIsDisbanded] = useState(initialDisbanded);
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [draft, setDraft] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [sosOpen, setSosOpen] = useState(false);
    const [sosIncidentType, setSosIncidentType] = useState('animal_bite');
    const [sosSeverity, setSosSeverity] = useState('moderate');
    const [sosLocation, setSosLocation] = useState('');
    const [sosDescription, setSosDescription] = useState('');
    const [sosSending, setSosSending] = useState(false);
    const [sosNotice, setSosNotice] = useState<string | null>(null);
    const [summaryOpen, setSummaryOpen] = useState(false);
    const bottomRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        setActiveTab(initialTab);
    }, [initialTab, groupType, groupId]);

    useEffect(() => {
        setIsDisbanded(initialDisbanded);
    }, [initialDisbanded, groupType, groupId]);

    useEffect(() => {
        if (!open || !groupId) {
            return;
        }

        let cancelled = false;
        setLoading(true);
        setError(null);

        fetch(`/account/field-groups/${groupType}/${groupId}/messages`, {
            headers: {
                Accept: 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            },
        })
            .then(async (res) => {
                if (!res.ok) {
                    throw new Error('Unable to load group chat messages.');
                }
                return res.json();
            })
            .then((data) => {
                if (cancelled) {
                    return;
                }
                setMessages(Array.isArray(data.messages) ? data.messages : []);
                if (typeof data.group?.is_disbanded === 'boolean') {
                    setIsDisbanded(data.group.is_disbanded);
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

        const echo = getEcho();
        const channelName = `field-group.${groupType}.${groupId}`;
        if (echo) {
            echo.private(channelName).listen('.group.message.sent', (incoming: GroupChatMessage) => {
                setMessages((prev) => {
                    if (prev.some((m) => m.id === incoming.id)) {
                        return prev;
                    }
                    return [...prev, incoming];
                });
            });
        }

        return () => {
            cancelled = true;
            if (echo) {
                echo.leave(channelName);
            }
        };
    }, [open, groupType, groupId]);

    useEffect(() => {
        if (open && activeTab === 'chat') {
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, open, activeTab]);

    if (!open) {
        return null;
    }

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = draft.trim();
        if (!trimmed || sending || isDisbanded) {
            return;
        }

        setSending(true);
        setError(null);

        try {
            const res = await fetch(`/account/field-groups/${groupType}/${groupId}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify({ message: trimmed }),
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || 'Failed to send message.');
            }

            if (data.message) {
                setMessages((prev) =>
                    prev.some((m) => m.id === data.message.id) ? prev : [...prev, data.message]
                );
            }
            setDraft('');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to send message.');
        } finally {
            setSending(false);
        }
    };

    const handleSendSos = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!sosDescription.trim() || sosSending) {
            return;
        }
        setSosSending(true);
        setError(null);
        setSosNotice(null);

        try {
            const res = await fetch(`/account/field-groups/${groupType}/${groupId}/sos`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify({
                    incident_type: sosIncidentType,
                    severity: sosSeverity,
                    location: sosLocation || null,
                    description: sosDescription.trim(),
                }),
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || 'Failed to send SOS alert.');
            }

            if (data.message) {
                setMessages((prev) =>
                    prev.some((m) => m.id === data.message.id) ? prev : [...prev, data.message]
                );
            }
            setSosOpen(false);
            setSosLocation('');
            setSosDescription('');
            setSosNotice(`SOS alert sent! Notified ${data.notified_count ?? 0} Field Medic(s), Route Lead(s), and Admins.`);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to send SOS alert.');
        } finally {
            setSosSending(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs"
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    onClose();
                }
            }}
        >
            <div className="flex h-full w-full max-w-md flex-col border-l border-gray-100 bg-white shadow-2xl dark:border-gray-800 dark:bg-slate-900">
                {/* Header */}
                <div className="shrink-0 border-b border-gray-100 bg-gradient-to-br from-slate-50 via-white to-sky-50/40 p-5 dark:border-gray-800 dark:from-slate-800/70 dark:via-slate-900 dark:to-slate-900">
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-paw-blue/15 text-paw-blue">
                                {groupType === 'feeding' ? (
                                    <Utensils className="size-5" />
                                ) : (
                                    <Calendar className="size-5" />
                                )}
                            </div>
                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-1.5">
                                    <span className="rounded-full bg-paw-blue/10 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-paw-blue">
                                        {groupType === 'feeding' ? 'Feeding Route' : 'Event Team'}
                                    </span>
                                    {isDisbanded && (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-slate-700 dark:bg-slate-700 dark:text-slate-200">
                                            <Archive className="size-2.5" />
                                            Disbanded
                                        </span>
                                    )}
                                </div>
                                <h3 className="mt-1 truncate font-fredoka text-lg font-bold text-[#0B2340] dark:text-white">
                                    {groupName}
                                </h3>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="cursor-pointer rounded-xl p-1.5 text-gray-400 transition hover:bg-gray-100 dark:hover:bg-slate-800"
                            aria-label="Close drawer"
                        >
                            <X className="size-4" />
                        </button>
                    </div>

                    {schedule && (
                        <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] font-bold text-gray-500 dark:text-gray-400">
                            <span className="inline-flex items-center gap-1.5 rounded-lg border border-gray-100 bg-white px-2.5 py-1 dark:border-gray-800 dark:bg-slate-800">
                                <Clock className="size-3 text-paw-orange" />
                                {schedule}
                            </span>
                            <span className="inline-flex items-center gap-1.5 rounded-lg border border-gray-100 bg-white px-2.5 py-1 dark:border-gray-800 dark:bg-slate-800">
                                <Users className="size-3 text-paw-blue" />
                                {members.length} member(s)
                            </span>
                            <button
                                type="button"
                                onClick={() => setSummaryOpen(true)}
                                className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-gray-100 bg-white px-2.5 py-1 text-paw-blue transition hover:bg-paw-blue hover:text-white dark:border-gray-800 dark:bg-slate-800"
                            >
                                <FileText className="size-3" />
                                Mission Summary
                            </button>
                            {!isDisbanded && (
                                <button
                                    type="button"
                                    onClick={() => setSosOpen((prev) => !prev)}
                                    className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 font-black text-rose-600 transition hover:bg-rose-600 hover:text-white dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300"
                                >
                                    <AlertTriangle className="size-3" />
                                    SOS Alert
                                </button>
                            )}
                        </div>
                    )}

                    {/* Drawer Tabs */}
                    <div className="mt-4 grid grid-cols-2 gap-1.5 rounded-xl bg-gray-100 p-1 dark:bg-slate-800">
                        <button
                            type="button"
                            onClick={() => setActiveTab('chat')}
                            className={cn(
                                'flex cursor-pointer items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-bold transition',
                                activeTab === 'chat'
                                    ? 'bg-white text-[#0B2340] shadow-xs dark:bg-slate-900 dark:text-white'
                                    : 'text-gray-500 hover:text-[#0B2340] dark:text-gray-400 dark:hover:text-white'
                            )}
                        >
                            <MessageSquare className="size-3.5" />
                            Group Chat
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('roster')}
                            className={cn(
                                'flex cursor-pointer items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-bold transition',
                                activeTab === 'roster'
                                    ? 'bg-white text-[#0B2340] shadow-xs dark:bg-slate-900 dark:text-white'
                                    : 'text-gray-500 hover:text-[#0B2340] dark:text-gray-400 dark:hover:text-white'
                            )}
                        >
                            <Users className="size-3.5" />
                            Team Roster ({members.length})
                        </button>
                    </div>
                </div>

                {/* Body */}
                {activeTab === 'chat' ? (
                    <>
                        <div className="flex-1 space-y-3 overflow-y-auto p-5">
                            {sosNotice && (
                                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-xs font-bold text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-300">
                                    {sosNotice}
                                </div>
                            )}

                            {sosOpen && !isDisbanded && (
                                <form
                                    onSubmit={handleSendSos}
                                    className="space-y-2.5 rounded-2xl border-2 border-rose-300 bg-rose-50/80 p-3.5 dark:border-rose-800 dark:bg-rose-950/40"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-rose-700 dark:text-rose-300">
                                            <AlertTriangle className="size-3.5" />
                                            Quick SOS / Field Injury Alert
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => setSosOpen(false)}
                                            className="cursor-pointer text-xs font-bold text-rose-500"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <select
                                            value={sosIncidentType}
                                            onChange={(e) => setSosIncidentType(e.target.value)}
                                            className="rounded-xl border border-rose-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-[#0B2340] dark:border-rose-800 dark:bg-slate-900 dark:text-white"
                                        >
                                            <option value="animal_bite">Animal Bite</option>
                                            <option value="scratch">Scratch / Wound</option>
                                            <option value="fall_or_sprain">Fall / Sprain</option>
                                            <option value="heat_exhaustion">Heat Exhaustion</option>
                                            <option value="vehicle_or_traffic">Traffic Incident</option>
                                            <option value="other">Other Injury</option>
                                        </select>
                                        <select
                                            value={sosSeverity}
                                            onChange={(e) => setSosSeverity(e.target.value)}
                                            className="rounded-xl border border-rose-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-[#0B2340] dark:border-rose-800 dark:bg-slate-900 dark:text-white"
                                        >
                                            <option value="minor">Minor</option>
                                            <option value="moderate">Moderate</option>
                                            <option value="severe">Severe</option>
                                            <option value="critical">Critical</option>
                                        </select>
                                    </div>
                                    <input
                                        type="text"
                                        value={sosLocation}
                                        onChange={(e) => setSosLocation(e.target.value)}
                                        placeholder="Exact street or landmark (optional)"
                                        className="w-full rounded-xl border border-rose-200 bg-white px-3 py-1.5 text-xs font-medium text-[#0B2340] dark:border-rose-800 dark:bg-slate-900 dark:text-white"
                                    />
                                    <textarea
                                        required
                                        rows={2}
                                        value={sosDescription}
                                        onChange={(e) => setSosDescription(e.target.value)}
                                        placeholder="Describe what happened so your Field Medic & Route Lead can respond..."
                                        className="w-full rounded-xl border border-rose-200 bg-white px-3 py-1.5 text-xs font-medium text-[#0B2340] dark:border-rose-800 dark:bg-slate-900 dark:text-white"
                                    />
                                    <button
                                        type="submit"
                                        disabled={sosSending || !sosDescription.trim()}
                                        className="w-full cursor-pointer rounded-xl bg-rose-600 py-2 text-xs font-black uppercase tracking-wider text-white transition hover:bg-rose-700 disabled:opacity-50"
                                    >
                                        {sosSending ? 'Alerting Medic & Lead...' : 'Send SOS Alert Now'}
                                    </button>
                                </form>
                            )}

                            {isDisbanded && (
                                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-300">
                                    This group has been disbanded. Chat history is preserved in read-only mode.
                                </div>
                            )}

                            {loading ? (
                                <div className="flex h-40 items-center justify-center text-gray-400">
                                    <Loader2 className="size-5 animate-spin" />
                                </div>
                            ) : error ? (
                                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-600 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
                                    {error}
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="flex h-48 flex-col items-center justify-center text-center text-gray-400">
                                    <MessageSquare className="mb-2 size-8 opacity-40" />
                                    <p className="text-xs font-bold">No messages yet</p>
                                    <p className="mt-1 text-[11px]">
                                        Coordinate with your team members and leads right here.
                                    </p>
                                </div>
                            ) : (
                                messages.map((msg) => {
                                    const isMe = msg.user_id === currentUserId;
                                    const isAdmin = msg.sender.is_admin;
                                    const avatarSrc = msg.sender.avatar_path
                                        ? formatPhotoUrl(msg.sender.avatar_path)
                                        : null;
                                    const timeLabel = msg.created_at
                                        ? new Date(msg.created_at).toLocaleTimeString([], {
                                              hour: '2-digit',
                                              minute: '2-digit',
                                          })
                                        : '';

                                    return (
                                        <div
                                            key={msg.id}
                                            className={cn(
                                                'flex gap-2.5',
                                                isMe ? 'flex-row-reverse' : 'flex-row'
                                            )}
                                        >
                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100 text-[10px] font-black text-[#0B2340] dark:bg-slate-800 dark:text-white">
                                                {avatarSrc ? (
                                                    <img
                                                        src={avatarSrc}
                                                        alt={msg.sender.name}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <span>{getInitials(msg.sender.name)}</span>
                                                )}
                                            </div>
                                            <div
                                                className={cn(
                                                    'max-w-[78%] space-y-1',
                                                    isMe ? 'items-end text-right' : 'items-start text-left'
                                                )}
                                            >
                                                <div
                                                    className={cn(
                                                        'flex flex-wrap items-center gap-1.5 text-[11px]',
                                                        isMe ? 'justify-end' : 'justify-start'
                                                    )}
                                                >
                                                    <span className="font-bold text-[#0B2340] dark:text-white">
                                                        {isMe ? 'You' : msg.sender.name}
                                                    </span>
                                                    {isAdmin ? (
                                                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-amber-800 dark:bg-amber-900/50 dark:text-amber-200">
                                                            <ShieldCheck className="size-2.5" />
                                                            Admin
                                                        </span>
                                                    ) : (
                                                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                                            {msg.sender.group_role}
                                                        </span>
                                                    )}
                                                    {timeLabel && (
                                                        <span className="text-[10px] text-gray-400">
                                                            {timeLabel}
                                                        </span>
                                                    )}
                                                </div>
                                                <div
                                                    className={cn(
                                                        'inline-block rounded-2xl px-3.5 py-2 text-xs leading-relaxed shadow-2xs',
                                                        msg.message.startsWith('[SOS ALERT')
                                                            ? 'border-2 border-rose-400 bg-rose-50 font-bold text-rose-900 dark:border-rose-700 dark:bg-rose-950/60 dark:text-rose-100'
                                                            : isAdmin
                                                              ? 'border-2 border-amber-300 bg-amber-50 font-semibold text-amber-950 dark:border-amber-600/70 dark:bg-amber-950/50 dark:text-amber-100'
                                                              : isMe
                                                                ? 'bg-paw-blue font-medium text-white'
                                                                : 'border border-gray-100 bg-gray-50 font-medium text-[#0B2340] dark:border-gray-800 dark:bg-slate-800 dark:text-gray-100'
                                                    )}
                                                >
                                                    {msg.message}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={bottomRef} />
                        </div>

                        {/* Composer */}
                        <form
                            onSubmit={handleSend}
                            className="shrink-0 border-t border-gray-100 bg-gray-50/70 p-4 dark:border-gray-800 dark:bg-slate-900/90"
                        >
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={draft}
                                    onChange={(e) => setDraft(e.target.value)}
                                    placeholder={
                                        isDisbanded
                                            ? 'Group disbanded (read-only)'
                                            : 'Write a message to the group...'
                                    }
                                    disabled={isDisbanded || sending}
                                    maxLength={1000}
                                    className="flex-1 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs text-[#0B2340] placeholder:text-gray-400 focus:border-paw-blue focus:outline-none disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-slate-800 dark:text-white"
                                />
                                <button
                                    type="submit"
                                    disabled={isDisbanded || sending || !draft.trim()}
                                    className="inline-flex cursor-pointer items-center justify-center rounded-xl bg-paw-orange px-3.5 py-2 text-xs font-black uppercase text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {sending ? (
                                        <Loader2 className="size-4 animate-spin" />
                                    ) : (
                                        <Send className="size-4" />
                                    )}
                                </button>
                            </div>
                        </form>
                    </>
                ) : (
                    <div className="flex-1 space-y-3 overflow-y-auto p-5">
                        {members.map((member, idx) => {
                            const avatarSrc = member.avatar_path
                                ? formatPhotoUrl(member.avatar_path)
                                : null;
                            const roleLower = member.role.toLowerCase();
                            const isLead = member.is_lead ?? roleLower.includes('lead');
                            const isMedic = member.is_medic ?? roleLower.includes('medic');
                            const isRecorder = member.is_recorder ?? roleLower.includes('recorder');

                            return (
                                <div
                                    key={member.task_id ?? member.id ?? idx}
                                    className="flex items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-white p-3.5 shadow-2xs dark:border-gray-800 dark:bg-slate-800/50"
                                >
                                    <div className="flex min-w-0 items-center gap-3">
                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100 text-xs font-black text-[#0B2340] dark:bg-slate-700 dark:text-white">
                                            {avatarSrc ? (
                                                <img
                                                    src={avatarSrc}
                                                    alt={member.name}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <span>{getInitials(member.name)}</span>
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="truncate text-xs font-bold text-[#0B2340] dark:text-white">
                                                {member.name}
                                                {(member.is_me || member.user_id === currentUserId) && (
                                                    <span className="ml-1.5 rounded-full bg-paw-blue/10 px-2 py-0.5 text-[10px] font-black text-paw-blue">
                                                        You
                                                    </span>
                                                )}
                                            </p>
                                            {typeof member.hours_logged === 'number' && member.status && (
                                                <p className="mt-0.5 text-[11px] font-semibold text-gray-500 dark:text-gray-400">
                                                    {member.status === 'no_show'
                                                        ? 'No Show (0 hrs)'
                                                        : member.status === 'completed'
                                                          ? `Completed (${member.hours_logged} hrs)`
                                                          : 'Active'}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <span
                                        className={cn(
                                            'shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase',
                                            isLead
                                                ? 'border-sky-300 bg-sky-100 text-sky-800 dark:border-sky-800 dark:bg-sky-950/60 dark:text-sky-300'
                                                : isMedic
                                                  ? 'border-emerald-300 bg-emerald-100 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                                  : isRecorder
                                                    ? 'border-paw-orange/30 bg-paw-orange/15 text-paw-orange'
                                                    : 'border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                                        )}
                                    >
                                        {member.role}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <MissionSummaryModal
                open={summaryOpen}
                onClose={() => setSummaryOpen(false)}
                groupType={groupType}
                groupId={groupId}
            />
        </div>
    );
}
