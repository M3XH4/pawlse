import { useCallback, useEffect, useMemo, useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import { toast } from 'sonner';
import {
    Award,
    Calendar,
    CheckCircle2,
    Clock,
    Gift,
    Heart,
    HeartHandshake,
    Lock,
    Megaphone,
    PartyPopper,
    Pin,
    PinOff,
    Shield,
    Sparkles,
    Star,
    Trophy,
    Utensils,
    X,
} from 'lucide-react';
import { ConfettiBurst } from '@/components/dashboard/confetti-burst';
import { SandboxDemoControls } from '@/components/dashboard/sandbox-demo-controls';
import {
    DashboardCard,
    DashboardMetricBadge,
    DashboardSectionPage,
} from '@/components/dashboard/section-page';
import { cn } from '@/lib/utils';

export interface AchievementBadgeItem {
    id: number;
    slug: string;
    audience: 'user' | 'volunteer';
    category: string;
    tier: 'bronze' | 'silver' | 'gold' | 'platinum';
    name: string;
    description: string;
    task_label: string;
    progress_value: number;
    target_value: number;
    percentage: number;
    xp_reward: number;
    image_path: string | null;
    is_unlocked: boolean;
    is_newly_unlocked: boolean;
    unlocked_at: string | null;
    unlocked_at_formatted: string | null;
    is_pinned: boolean;
}

export interface AchievementsSummary {
    unlocked_count: number;
    total_count: number;
    total_xp: number;
    rank_title: string;
    next_rank_title: string | null;
    next_rank_xp: number | null;
    pinned_count: number;
    newly_unlocked_count: number;
}

export interface AchievementsPageProps {
    badges: AchievementBadgeItem[];
    nextUp: AchievementBadgeItem[];
    summary: AchievementsSummary;
}

type StatusFilter = 'all' | 'unlocked' | 'in_progress' | 'locked';

const TIER_STYLES: Record<
    AchievementBadgeItem['tier'],
    {
        label: string;
        pill: string;
        ring: string;
        gradient: string;
    }
> = {
    bronze: {
        label: 'Bronze',
        pill: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/60',
        ring: 'ring-amber-400/50',
        gradient: 'from-amber-500 to-orange-600',
    },
    silver: {
        label: 'Silver',
        pill: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700',
        ring: 'ring-slate-400/50',
        gradient: 'from-slate-400 to-slate-600',
    },
    gold: {
        label: 'Gold',
        pill: 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-950/60 dark:text-yellow-300 dark:border-yellow-700/60',
        ring: 'ring-yellow-400/60',
        gradient: 'from-yellow-400 to-amber-500',
    },
    platinum: {
        label: 'Platinum',
        pill: 'bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-950/60 dark:text-cyan-300 dark:border-cyan-700/60',
        ring: 'ring-cyan-400/60',
        gradient: 'from-cyan-400 via-sky-500 to-indigo-500',
    },
};

const CATEGORY_LABELS: Record<string, string> = {
    all: 'All Categories',
    rescue: 'Rescue',
    missing: 'Missing & Found',
    adoption: 'Adoption',
    donation: 'Donations',
    community: 'Community',
    fieldwork: 'Fieldwork',
    foster: 'Foster Care',
    milestone: 'Milestones',
};

const MEDALLION_COLORS: Record<
    AchievementBadgeItem['tier'],
    {
        outerStart: string;
        outerEnd: string;
        innerRing: string;
        stars: number;
    }
> = {
    bronze: {
        outerStart: '#E59A54',
        outerEnd: '#9A4E1C',
        innerRing: '#F7C99B',
        stars: 1,
    },
    silver: {
        outerStart: '#E2E8F0',
        outerEnd: '#64748B',
        innerRing: '#F8FAFC',
        stars: 2,
    },
    gold: {
        outerStart: '#FDE047',
        outerEnd: '#D97706',
        innerRing: '#FEF08A',
        stars: 3,
    },
    platinum: {
        outerStart: '#67E8F9',
        outerEnd: '#4F46E5',
        innerRing: '#E0F2FE',
        stars: 4,
    },
};

function BadgeSprite({
    badge,
    sizeClass = 'h-20 w-20',
}: {
    badge: AchievementBadgeItem;
    sizeClass?: string;
}) {
    const [imgFailed, setImgFailed] = useState(false);
    const tierStyle = TIER_STYLES[badge.tier] ?? TIER_STYLES.bronze;
    const medallion = MEDALLION_COLORS[badge.tier] ?? MEDALLION_COLORS.bronze;

    const FallbackIcon = useMemo(() => {
        switch (badge.category) {
            case 'rescue':
            case 'missing':
                return Shield;
            case 'adoption':
                return Heart;
            case 'donation':
                return Gift;
            case 'foster':
                return HeartHandshake;
            case 'fieldwork':
                return badge.slug.includes('feeder') ||
                    badge.slug.includes('route') ||
                    badge.slug.includes('nourishment')
                    ? Utensils
                    : CheckCircle2;
            case 'milestone':
                return badge.slug.includes('hours') ? Clock : Award;
            case 'community':
                return badge.slug.includes('voice') ||
                    badge.slug.includes('storyteller') ||
                    badge.slug.includes('chronicler')
                    ? Megaphone
                    : Calendar;
            default:
                return Trophy;
        }
    }, [badge.category, badge.slug]);

    const gradId = `medal-${badge.tier}-${badge.id}`;

    return (
        <div
            className={cn(
                'relative flex shrink-0 items-center justify-center rounded-full transition-all',
                sizeClass,
                badge.is_unlocked
                    ? `ring-2 ${tierStyle.ring} shadow-md`
                    : 'opacity-70 grayscale',
            )}
        >
            <div className="h-full w-full overflow-hidden rounded-full">
                {badge.image_path && !imgFailed ? (
                    <img
                        src={badge.image_path}
                        alt={badge.name}
                        onError={() => setImgFailed(true)}
                        className="h-full w-full scale-[1.12] rounded-full object-cover"
                    />
                ) : (
                    <div className="relative flex h-full w-full items-center justify-center rounded-full">
                        <svg
                            viewBox="0 0 100 100"
                            className="absolute inset-0 h-full w-full"
                            aria-hidden="true"
                        >
                            <defs>
                                <linearGradient
                                    id={gradId}
                                    x1="0%"
                                    y1="0%"
                                    x2="100%"
                                    y2="100%"
                                >
                                    <stop
                                        offset="0%"
                                        stopColor={medallion.outerStart}
                                    />
                                    <stop
                                        offset="100%"
                                        stopColor={medallion.outerEnd}
                                    />
                                </linearGradient>
                            </defs>
                            {/* Outer metallic tier ring */}
                            <circle
                                cx="50"
                                cy="50"
                                r="49"
                                fill={`url(#${gradId})`}
                            />
                            {/* Inner highlight ring */}
                            <circle
                                cx="50"
                                cy="50"
                                r="42"
                                fill="none"
                                stroke={medallion.innerRing}
                                strokeWidth="2"
                                strokeOpacity="0.8"
                            />
                            {/* Navy PAWLSE core */}
                            <circle cx="50" cy="50" r="38" fill="#0B2340" />
                            {/* Subtle top sheen */}
                            <path
                                d="M 18 38 A 36 36 0 0 1 82 38"
                                fill="none"
                                stroke="#FFFFFF"
                                strokeWidth="1.5"
                                strokeOpacity="0.18"
                            />
                        </svg>
                        <FallbackIcon className="relative z-10 h-[40%] w-[40%] -translate-y-0.5 text-[#FF750F] drop-shadow-sm" />
                        <div className="absolute bottom-[13%] z-10 flex items-center gap-0.5">
                            {Array.from({ length: medallion.stars }).map(
                                (_, idx) => (
                                    <Star
                                        key={idx}
                                        className="h-2.5 w-2.5 fill-amber-300 text-amber-300"
                                    />
                                ),
                            )}
                        </div>
                    </div>
                )}
            </div>

            {!badge.is_unlocked && (
                <span className="absolute -bottom-0.5 -right-0.5 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-slate-700 text-white shadow dark:border-slate-900">
                    <Lock className="h-3 w-3" />
                </span>
            )}
        </div>
    );
}

export function AchievementsView({
    audience,
    badges,
    nextUp,
    summary,
}: AchievementsPageProps & { audience: 'user' | 'volunteer' }) {
    const page = usePage<{ auth?: { user?: { id?: number } } }>();
    const userId = page.props?.auth?.user?.id ?? 'guest';

    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [pinningId, setPinningId] = useState<number | null>(null);
    const [showConfetti, setShowConfetti] = useState(false);
    const [celebrationMessage, setCelebrationMessage] = useState<{
        title: string;
        subtitle: string;
    } | null>(null);

    const fireAchievementToast = useCallback(
        (options: {
            eyebrow: string;
            title: string;
            subtitle: string;
            badge?: AchievementBadgeItem;
        }) => {
            toast.custom(
                (t) => (
                    <div className="pointer-events-auto flex w-full max-w-md items-center gap-3.5 rounded-2xl border border-orange-200/90 bg-gradient-to-r from-orange-50 via-white to-amber-50/70 p-3.5 text-[#0B2340] shadow-[0_14px_34px_rgba(15,23,42,0.12)] ring-1 ring-orange-500/10 dark:border-orange-900/50 dark:from-slate-900 dark:via-slate-900 dark:to-orange-950/30 dark:text-white dark:shadow-[0_14px_34px_rgba(0,0,0,0.45)]">
                        {options.badge ? (
                            <BadgeSprite
                                badge={options.badge}
                                sizeClass="h-12 w-12"
                            />
                        ) : (
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#FF750F] to-amber-500 text-white shadow-md shadow-orange-500/20">
                                <PartyPopper className="h-6 w-6" />
                            </div>
                        )}

                        <div className="min-w-0 flex-1">
                            <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-[#FF750F] dark:bg-orange-950/60 dark:text-orange-300">
                                <Sparkles className="h-2.5 w-2.5" />
                                {options.eyebrow}
                            </span>
                            <p className="mt-1 truncate font-fredoka text-sm font-bold text-[#0B2340] dark:text-white">
                                {options.title}
                            </p>
                            <p className="line-clamp-2 text-[11px] font-medium text-[#64748B] dark:text-[#94A3B8]">
                                {options.subtitle}
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => toast.dismiss(t)}
                            aria-label="Dismiss notification"
                            className="cursor-pointer self-start rounded-lg p-1 text-slate-400 transition-colors hover:bg-orange-100/70 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                ),
                { duration: 6000 },
            );
        },
        [],
    );

    useEffect(() => {
        const storageKey = `pawlse-rank-${audience}-${userId}`;
        let previousRank: string | null = null;

        try {
            previousRank = localStorage.getItem(storageKey);
            localStorage.setItem(storageKey, summary.rank_title);
        } catch {
            // Ignore storage access errors
        }

        const leveledUp =
            previousRank !== null &&
            previousRank !== summary.rank_title &&
            summary.total_xp > 0;

        const newestBadge = badges.find((b) => b.is_newly_unlocked);

        if (leveledUp) {
            setShowConfetti(true);
            const title = `Congratulations! You leveled up to ${summary.rank_title}!`;
            const subtitle =
                summary.newly_unlocked_count > 0
                    ? `You also unlocked ${summary.newly_unlocked_count} new ${summary.newly_unlocked_count === 1 ? 'badge' : 'badges'} (${summary.total_xp} total Impact XP).`
                    : `Your dedication to PAWLSE has earned you ${summary.total_xp} Impact XP.`;
            setCelebrationMessage({ title, subtitle });
            fireAchievementToast({
                eyebrow: 'Rank Level Up',
                title,
                subtitle,
                badge: newestBadge,
            });
        } else if (summary.newly_unlocked_count > 0) {
            setShowConfetti(true);
            const title =
                newestBadge && summary.newly_unlocked_count === 1
                    ? `${newestBadge.name} Unlocked!`
                    : `${summary.newly_unlocked_count} New Badges Unlocked!`;
            const subtitle =
                newestBadge && summary.newly_unlocked_count === 1
                    ? `+${newestBadge.xp_reward} Impact XP • ${newestBadge.task_label}`
                    : `You are currently ranked ${summary.rank_title} with ${summary.total_xp} Impact XP.`;
            setCelebrationMessage({
                title: `Congratulations! ${title}`,
                subtitle,
            });
            fireAchievementToast({
                eyebrow: 'Badge Unlocked',
                title,
                subtitle,
                badge: newestBadge,
            });
        }
    }, [
        audience,
        badges,
        fireAchievementToast,
        summary.newly_unlocked_count,
        summary.rank_title,
        summary.total_xp,
        userId,
    ]);

    const categories = useMemo(() => {
        const unique = Array.from(new Set(badges.map((b) => b.category)));
        return ['all', ...unique];
    }, [badges]);

    const pinnedBadges = useMemo(
        () => badges.filter((b) => b.is_unlocked && b.is_pinned),
        [badges],
    );

    const filteredBadges = useMemo(() => {
        const filtered = badges.filter((badge) => {
            if (categoryFilter !== 'all' && badge.category !== categoryFilter) {
                return false;
            }
            if (statusFilter === 'unlocked') {
                return badge.is_unlocked;
            }
            if (statusFilter === 'in_progress') {
                return !badge.is_unlocked && badge.progress_value > 0;
            }
            if (statusFilter === 'locked') {
                return !badge.is_unlocked && badge.progress_value === 0;
            }
            return true;
        });

        return [...filtered].sort((a, b) => {
            if (a.is_unlocked !== b.is_unlocked) {
                return a.is_unlocked ? -1 : 1;
            }

            if (a.is_unlocked && b.is_unlocked) {
                if (a.is_pinned !== b.is_pinned) {
                    return a.is_pinned ? -1 : 1;
                }
                return 0;
            }

            if (b.percentage !== a.percentage) {
                return b.percentage - a.percentage;
            }

            return b.progress_value - a.progress_value;
        });
    }, [badges, categoryFilter, statusFilter]);

    const handleTogglePin = (badge: AchievementBadgeItem) => {
        setPinningId(badge.id);
        router.post(
            `/account/${audience}/achievements/${badge.id}/pin`,
            {},
            {
                preserveScroll: true,
                onFinish: () => setPinningId(null),
            },
        );
    };

    const rankProgressPercentage = useMemo(() => {
        if (!summary.next_rank_xp || summary.next_rank_xp <= 0) {
            return 100;
        }
        return Math.min(100, Math.round((summary.total_xp / summary.next_rank_xp) * 100));
    }, [summary.next_rank_xp, summary.total_xp]);

    const title = 'Badges & Achievements';
    const description =
        audience === 'volunteer'
            ? 'Track your fieldwork milestones, service hours, and foster care impact as a PAWLSE volunteer.'
            : 'Earn badges and Impact XP by reporting rescues, adopting, donating, and joining PAWLSE community events.';

    return (
        <DashboardSectionPage
            title={title}
            description={description}
            badge={
                <DashboardMetricBadge
                    icon={<Trophy className="h-4 w-4" />}
                    label={`${summary.unlocked_count} / ${summary.total_count} Unlocked`}
                />
            }
        >
            <ConfettiBurst
                active={showConfetti}
                onComplete={() => setShowConfetti(false)}
            />

            <SandboxDemoControls
                onTriggerConfetti={() => {
                    const sampleBadge =
                        badges.find((b) => b.is_unlocked) ?? badges[0];
                    const title = `Congratulations! You leveled up to ${summary.rank_title}!`;
                    const subtitle = `Sandbox preview: ${summary.total_xp} Impact XP (${summary.unlocked_count} / ${summary.total_count} badges unlocked).`;
                    setShowConfetti(true);
                    setCelebrationMessage({ title, subtitle });
                    fireAchievementToast({
                        eyebrow: 'Badge Unlocked',
                        title: sampleBadge
                            ? `${sampleBadge.name} Unlocked!`
                            : title,
                        subtitle,
                        badge: sampleBadge,
                    });
                }}
            />

            {celebrationMessage && (
                <DashboardCard className="relative overflow-hidden border-orange-200/80 bg-gradient-to-r from-orange-50/90 via-white to-amber-50/60 dark:border-orange-900/40 dark:from-slate-900 dark:via-slate-900 dark:to-orange-950/20">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3.5">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FF750F] to-amber-500 text-white shadow-md shadow-orange-500/20">
                                <PartyPopper className="h-6 w-6" />
                            </div>
                            <div>
                                <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-[#FF750F] dark:bg-orange-950/60 dark:text-orange-300">
                                    <Sparkles className="h-2.5 w-2.5" />
                                    Achievement Milestone
                                </span>
                                <h3 className="mt-1 font-fredoka text-lg font-bold text-[#0B2340] dark:text-white">
                                    {celebrationMessage.title}
                                </h3>
                                <p className="text-xs font-medium text-[#64748B] dark:text-[#94A3B8]">
                                    {celebrationMessage.subtitle}
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setCelebrationMessage(null)}
                            aria-label="Dismiss congratulations"
                            className="cursor-pointer rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </DashboardCard>
            )}

            {/* Top Rank & Impact XP Banner */}
            <DashboardCard className="relative overflow-hidden border-orange-200/70 bg-gradient-to-br from-orange-50/80 via-white to-amber-50/50 dark:border-slate-800 dark:from-slate-900 dark:via-slate-900 dark:to-orange-950/20">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FF750F] to-amber-500 text-white shadow-lg shadow-orange-500/25">
                            <Sparkles className="h-8 w-8" />
                        </div>
                        <div>
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="text-xs font-extrabold uppercase tracking-wider text-[#FF750F]">
                                    Current Rank
                                </span>
                                <span className="rounded-full bg-[#0B2340] px-2.5 py-0.5 text-xs font-bold text-white dark:bg-orange-500/20 dark:text-orange-300">
                                    {summary.total_xp} Impact XP
                                </span>
                            </div>
                            <h3 className="mt-1 font-fredoka text-2xl font-bold text-[#0B2340] dark:text-white">
                                {summary.rank_title}
                            </h3>
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                {summary.next_rank_title && summary.next_rank_xp
                                    ? `${Math.max(0, summary.next_rank_xp - summary.total_xp)} XP until ${summary.next_rank_title}`
                                    : 'Maximum rank achieved — thank you for your extraordinary impact!'}
                            </p>
                        </div>
                    </div>

                    <div className="w-full max-w-md">
                        <div className="mb-1.5 flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300">
                            <span>Rank Progress</span>
                            <span>
                                {summary.next_rank_xp
                                    ? `${summary.total_xp} / ${summary.next_rank_xp} XP`
                                    : 'Max Level'}
                            </span>
                        </div>
                        <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200/80 dark:bg-slate-800">
                            <div
                                className="h-full rounded-full bg-gradient-to-r from-[#FF750F] to-amber-400 transition-all duration-500"
                                style={{ width: `${rankProgressPercentage}%` }}
                            />
                        </div>
                    </div>
                </div>
            </DashboardCard>

            {/* Pinned Showcase & Next Up Grid */}
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                {/* Pinned Showcase */}
                <DashboardCard className="flex flex-col justify-between gap-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-fredoka text-lg font-bold text-[#0B2340] dark:text-white">
                                Pinned Showcase
                            </h3>
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                Pin up to 3 unlocked badges to highlight your proudest milestones.
                            </p>
                        </div>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                            {summary.pinned_count} / 3 Pinned
                        </span>
                    </div>

                    {pinnedBadges.length === 0 ? (
                        <div className="flex items-center gap-3 rounded-xl border border-dashed border-slate-200 bg-slate-50/70 p-4 text-xs font-medium text-slate-500 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400">
                            <Pin className="h-4 w-4 shrink-0 text-[#FF750F]" />
                            <span>
                                No badges pinned yet. Unlock a badge below and click{' '}
                                <strong>Pin</strong> to feature it here!
                            </span>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                            {pinnedBadges.map((badge) => (
                                <div
                                    key={badge.id}
                                    className="flex flex-col items-center rounded-xl border border-orange-200/60 bg-orange-50/40 p-3 text-center dark:border-slate-800 dark:bg-slate-800/40"
                                >
                                    <BadgeSprite badge={badge} sizeClass="h-14 w-14" />
                                    <p className="mt-2 line-clamp-1 text-xs font-bold text-[#0B2340] dark:text-white">
                                        {badge.name}
                                    </p>
                                    <span className="text-[11px] font-semibold text-[#FF750F]">
                                        +{badge.xp_reward} XP
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </DashboardCard>

                {/* Next Up / Closest to Unlocking */}
                <DashboardCard className="flex flex-col justify-between gap-4">
                    <div>
                        <h3 className="font-fredoka text-lg font-bold text-[#0B2340] dark:text-white">
                            Closest to Unlocking
                        </h3>
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                            Complete these tasks next to earn your upcoming badges.
                        </p>
                    </div>

                    {nextUp.length === 0 ? (
                        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 text-xs font-semibold text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300">
                            <Star className="h-4 w-4 shrink-0" />
                            <span>You have unlocked every available badge in this section!</span>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {nextUp.map((badge) => (
                                <div
                                    key={badge.id}
                                    className="flex items-center gap-3 rounded-xl border border-slate-200/80 bg-slate-50/60 p-3 dark:border-slate-800 dark:bg-slate-900/60"
                                >
                                    <BadgeSprite badge={badge} sizeClass="h-12 w-12" />
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center justify-between gap-2">
                                            <p className="truncate text-sm font-bold text-[#0B2340] dark:text-white">
                                                {badge.name}
                                            </p>
                                            <span className="shrink-0 text-xs font-bold text-[#FF750F]">
                                                {badge.progress_value} / {badge.target_value}
                                            </span>
                                        </div>
                                        <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                                            {badge.task_label}
                                        </p>
                                        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                                            <div
                                                className="h-full rounded-full bg-[#FF750F]"
                                                style={{ width: `${badge.percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </DashboardCard>
            </div>

            {/* Filters */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-2">
                    {(
                        [
                            ['all', 'All'],
                            ['unlocked', 'Unlocked'],
                            ['in_progress', 'In Progress'],
                            ['locked', 'Locked'],
                        ] as const
                    ).map(([key, label]) => (
                        <button
                            key={key}
                            type="button"
                            onClick={() => setStatusFilter(key)}
                            className={cn(
                                'cursor-pointer rounded-full px-4 py-1.5 text-xs font-bold transition-all',
                                statusFilter === key
                                    ? 'bg-[#0B2340] text-white shadow-sm dark:bg-[#FF750F]'
                                    : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-800',
                            )}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            type="button"
                            onClick={() => setCategoryFilter(cat)}
                            className={cn(
                                'cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold transition-all',
                                categoryFilter === cat
                                    ? 'bg-orange-100 text-[#FF750F] dark:bg-orange-950/50 dark:text-orange-300'
                                    : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800',
                            )}
                        >
                            {CATEGORY_LABELS[cat] ?? cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Badge Grid */}
            {filteredBadges.length === 0 ? (
                <DashboardCard className="p-10 text-center">
                    <Trophy className="mx-auto mb-3 h-10 w-10 text-slate-300 dark:text-slate-600" />
                    <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
                        No badges match the selected filter.
                    </p>
                </DashboardCard>
            ) : (
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {filteredBadges.map((badge) => {
                        const tierStyle = TIER_STYLES[badge.tier] ?? TIER_STYLES.bronze;

                        return (
                            <DashboardCard
                                key={badge.id}
                                className={cn(
                                    'flex flex-col justify-between gap-4 transition-all',
                                    badge.is_unlocked
                                        ? 'border-orange-200/80 dark:border-orange-900/40'
                                        : 'opacity-90',
                                )}
                            >
                                <div className="flex items-start gap-4">
                                    <BadgeSprite badge={badge} sizeClass="h-20 w-20" />

                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-1.5">
                                            <span
                                                className={cn(
                                                    'rounded-full border px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider',
                                                    tierStyle.pill,
                                                )}
                                            >
                                                {tierStyle.label}
                                            </span>
                                            <span className="rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-bold text-[#FF750F] dark:bg-orange-950/50 dark:text-orange-300">
                                                +{badge.xp_reward} XP
                                            </span>
                                            {badge.is_newly_unlocked && (
                                                <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-extrabold uppercase text-white">
                                                    New!
                                                </span>
                                            )}
                                        </div>

                                        <h4 className="mt-1.5 font-fredoka text-lg font-bold text-[#0B2340] dark:text-white">
                                            {badge.name}
                                        </h4>
                                        <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                                            {badge.description}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-3 border-t border-slate-100 pt-3 dark:border-slate-800">
                                    <div>
                                        <div className="mb-1 flex items-center justify-between text-xs font-bold">
                                            <span className="text-slate-600 dark:text-slate-300">
                                                {badge.task_label}
                                            </span>
                                            <span
                                                className={cn(
                                                    badge.is_unlocked
                                                        ? 'text-emerald-600 dark:text-emerald-400'
                                                        : 'text-[#FF750F]',
                                                )}
                                            >
                                                {badge.progress_value} / {badge.target_value}
                                            </span>
                                        </div>
                                        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                                            <div
                                                className={cn(
                                                    'h-full rounded-full transition-all duration-500',
                                                    badge.is_unlocked
                                                        ? 'bg-emerald-500'
                                                        : 'bg-gradient-to-r from-[#FF750F] to-amber-400',
                                                )}
                                                style={{ width: `${badge.percentage}%` }}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between text-xs">
                                        {badge.is_unlocked ? (
                                            <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                                                <CheckCircle2 className="h-3.5 w-3.5" />
                                                Unlocked {badge.unlocked_at_formatted ?? ''}
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 font-medium text-slate-400">
                                                <Lock className="h-3.5 w-3.5" />
                                                {badge.percentage}% complete
                                            </span>
                                        )}

                                        {badge.is_unlocked && (
                                            <button
                                                type="button"
                                                disabled={pinningId === badge.id}
                                                onClick={() => handleTogglePin(badge)}
                                                className={cn(
                                                    'inline-flex cursor-pointer items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold transition-colors disabled:opacity-50',
                                                    badge.is_pinned
                                                        ? 'bg-[#0B2340] text-white hover:bg-slate-800 dark:bg-[#FF750F]'
                                                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700',
                                                )}
                                            >
                                                {badge.is_pinned ? (
                                                    <>
                                                        <PinOff className="h-3 w-3" />
                                                        Unpin
                                                    </>
                                                ) : (
                                                    <>
                                                        <Pin className="h-3 w-3" />
                                                        Pin
                                                    </>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </DashboardCard>
                        );
                    })}
                </div>
            )}
        </DashboardSectionPage>
    );
}
