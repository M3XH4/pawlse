import { Link, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowRight,
    Award,
    Bookmark,
    Calendar,
    CheckCircle2,
    Circle,
    Compass,
    FileText,
    Gift,
    Heart,
    HeartHandshake,
    MapPin,
    MessageSquareQuote,
    PawPrint,
    Radio,
    Search,
    ShieldCheck,
    Sparkles,
    Zap,
} from 'lucide-react';
import { BlogCarousel } from '@/components/dashboard/blog-carousel';
import type { DashboardBlogPost } from '@/components/dashboard/blog-carousel';
import {
    DashboardCard,
    DashboardMetricBadge,
    DashboardSectionPage,
} from '@/components/dashboard/section-page';
import { ImageWithFallback } from '@/components/ui/image-with-fallback';
import { useBookmarks } from '@/context/bookmark-context';
import { cn, formatPillLabel } from '@/lib/utils';
import type { SharedData } from '@/types';

interface FeaturedPet {
    id: number;
    name: string;
    type: string;
    breed: string;
    age: string;
    gender: string;
    photo_url: string | null;
    story: string;
}

interface UpcomingEvent {
    id: number;
    title: string;
    date: string | null;
    time: string | null;
    location: string;
    type: string;
}

interface RecentActivity {
    id: string;
    kind: 'adoption' | 'rescue' | 'missing';
    title: string;
    status: string;
    date: string | null;
    href: string;
}

interface CommunityPulse {
    petsAdoptedCount: number;
    petsAvailableCount: number;
    activeRescuesCount: number;
    careSustainability: {
        estDays: number;
        urgencyStatus: string;
        urgencyLabel: string;
        resourceCategory: string;
    };
}

interface MissingAlert {
    id: number;
    name: string;
    species: string;
    breed: string;
    location: string;
    photo_url: string | null;
    reported_at: string;
}

interface GettingStarted {
    hasSubmittedApplicationOrReport: boolean;
    hasJoinedEvent: boolean;
    hasEarnedBadge: boolean;
    hasSharedStory: boolean;
}

interface VolunteerInvite {
    isVolunteer: boolean;
    applicationStatus: string | null;
    isFosterParent: boolean;
}

interface UserDashboardStats {
    adoptionApplicationsCount: number;
    activeAdoptionApplicationsCount: number;
    rescueReportsCount: number;
    missingReportsCount: number;
    donationsCount: number;
    joinedEventsCount: number;
    shelterVisitsCount: number;
    badgesCount: number;
}

interface UserDashboardProps {
    latestBlogs: DashboardBlogPost[];
    blogCategories: Record<string, string>;
    featuredPets: FeaturedPet[];
    upcomingEvents: UpcomingEvent[];
    recentActivities: RecentActivity[];
    communityPulse: CommunityPulse;
    missingAlerts: MissingAlert[];
    gettingStarted: GettingStarted;
    volunteerInvite: VolunteerInvite;
    stats: UserDashboardStats;
}

function formatActivityDate(value: string | null): string {
    if (!value) {
        return 'Recently';
    }

    const parsed = new Date(value);

    if (Number.isNaN(parsed.getTime())) {
        return 'Recently';
    }

    return parsed.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
    });
}

export default function UserDashboard({
    latestBlogs = [],
    blogCategories = {},
    featuredPets = [],
    upcomingEvents = [],
    recentActivities = [],
    communityPulse,
    missingAlerts = [],
    gettingStarted,
    volunteerInvite,
    stats,
}: UserDashboardProps) {
    const { auth } = usePage<SharedData>().props;
    const { bookmarks, isBookmarked, addBookmark, removeBookmark } = useBookmarks();

    const firstName = auth?.user?.name?.split(' ')[0] ?? 'Friend';
    const totalReports = stats.rescueReportsCount + stats.missingReportsCount;
    const totalEventsAndVisits = stats.joinedEventsCount + stats.shelterVisitsCount;

    const activityCards = [
        {
            title: 'Adoption Journey',
            count: stats.adoptionApplicationsCount,
            helper:
                stats.activeAdoptionApplicationsCount > 0
                    ? `${stats.activeAdoptionApplicationsCount} active right now`
                    : stats.adoptionApplicationsCount > 0
                      ? 'View your past applications'
                      : 'Ready to meet your new best friend?',
            href: '/account/user/adoption-applications',
            icon: Heart,
            tone: 'bg-rose-500/10 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400',
        },
        {
            title: 'Rescues & Missing',
            count: totalReports,
            helper:
                totalReports > 0
                    ? `${stats.rescueReportsCount} rescue, ${stats.missingReportsCount} missing`
                    : 'Spot a stray? Help us reach them fast.',
            href: '/account/user/rescue-reports',
            icon: FileText,
            tone: 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400',
        },
        {
            title: 'Kindness Given',
            count: stats.donationsCount,
            helper:
                stats.donationsCount > 0
                    ? 'Thank you for supporting our pets!'
                    : 'Every small gift feeds a rescued pet.',
            href: '/account/user/donations',
            icon: Gift,
            tone: 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400',
        },
        {
            title: 'Events & Visits',
            count: totalEventsAndVisits,
            helper:
                totalEventsAndVisits > 0
                    ? `${stats.joinedEventsCount} events, ${stats.shelterVisitsCount} visits`
                    : 'Join a community event or visit us!',
            href: '/account/user/joined-events',
            icon: Calendar,
            tone: 'bg-sky-500/10 text-sky-600 dark:bg-sky-500/15 dark:text-sky-400',
        },
    ];

    const checklistItems = [
        {
            title: 'Save a favorite pet or story',
            description: 'Tap the bookmark icon on any story or adoptable pet.',
            completed: bookmarks.length > 0,
            href: '/adopt',
        },
        {
            title: 'Join an event',
            description: 'Take part in upcoming shelter drives and community events.',
            completed: gettingStarted.hasJoinedEvent,
            href: '/events',
        },
        {
            title: 'Share a story or submit a report',
            description: 'Inspire the community or help an animal in need.',
            completed: gettingStarted.hasSharedStory || gettingStarted.hasSubmittedApplicationOrReport,
            href: '/account/user/stories',
        },
    ];
    const completedChecklistCount = checklistItems.filter((item) => item.completed).length;

    const sustainabilityTone =
        communityPulse.careSustainability.urgencyStatus === 'stable'
            ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
            : communityPulse.careSustainability.urgencyStatus === 'needs_support'
              ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
              : 'bg-rose-500/15 text-rose-700 dark:text-rose-300';

    const quickWaysToHelp = [
        {
            title: 'Adopt a Pet',
            subtitle: 'Meet dogs & cats looking for a home',
            href: '/adopt',
            icon: PawPrint,
            color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
        },
        {
            title: 'Report a Rescue',
            subtitle: 'Alert our team about an animal in need',
            href: '/rescue',
            icon: AlertTriangle,
            color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
        },
        {
            title: 'Report Missing Pet',
            subtitle: 'Help reunite lost pets with families',
            href: '/missing',
            icon: Search,
            color: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
        },
        {
            title: 'Share Your Story',
            subtitle: 'Inspire others with your pet journey',
            href: '/account/user/stories',
            icon: MessageSquareQuote,
            color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
        },
    ];

    const togglePetBookmark = (pet: FeaturedPet) => {
        if (isBookmarked(pet.id, 'pet')) {
            removeBookmark(pet.id, 'pet');
        } else {
            addBookmark({
                id: pet.id,
                type: 'pet',
                title: pet.name,
                image: pet.photo_url || undefined,
                data: {
                    breed: pet.breed,
                    age: pet.age,
                    gender: pet.gender,
                },
            });
        }
    };

    return (
        <DashboardSectionPage
            title={`Welcome back, ${firstName}!`}
            description="Here is what's happening in the Pawlse community today, along with your personal activity."
            badge={
                <DashboardMetricBadge
                    icon={<Award className="h-4 w-4" />}
                    label={`${stats.badgesCount} ${stats.badgesCount === 1 ? 'Badge' : 'Badges'} Earned`}
                />
            }
        >
            {/* 1. Your Activity at a Glance */}
            <section className="space-y-3">
                <div className="flex items-center justify-between">
                    <h3 className="font-fredoka text-xl font-bold text-[#0B2340] dark:text-[#F8FAFC]">
                        Your Activity at a Glance
                    </h3>
                    <Link
                        href="/account/user/achievements"
                        className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:underline dark:text-emerald-400"
                    >
                        <span>View Badges</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {activityCards.map((card) => {
                        const Icon = card.icon;

                        return (
                            <Link key={card.title} href={card.href} className="group block">
                                <DashboardCard className="flex h-full flex-col justify-between p-5 transition group-hover:-translate-y-0.5 group-hover:border-emerald-300 dark:group-hover:border-emerald-700/60">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">
                                                {card.title}
                                            </p>
                                            <p className="mt-2 font-fredoka text-3xl font-bold text-[#0B2340] dark:text-[#F8FAFC]">
                                                {card.count}
                                            </p>
                                        </div>
                                        <div
                                            className={cn(
                                                'flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl',
                                                card.tone,
                                            )}
                                        >
                                            <Icon className="h-5 w-5" />
                                        </div>
                                    </div>
                                    <div className="mt-4 flex items-center justify-between gap-2 text-xs font-semibold text-[#64748B] dark:text-[#94A3B8]">
                                        <span>{card.helper}</span>
                                        <ArrowRight className="h-3.5 w-3.5 shrink-0 text-emerald-600 transition group-hover:translate-x-0.5 dark:text-emerald-400" />
                                    </div>
                                </DashboardCard>
                            </Link>
                        );
                    })}
                </div>
            </section>

            {/* 2. Shelter & Community Impact Pulse */}
            <DashboardCard className="overflow-hidden border-emerald-200/80 bg-gradient-to-br from-emerald-50/80 via-white to-sky-50/70 p-5 sm:p-6 dark:border-emerald-900/50 dark:from-[#0F172A] dark:via-[#111827] dark:to-emerald-950/30">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                            <HeartHandshake className="h-3.5 w-3.5" />
                            <span>Together We&apos;ve Helped</span>
                        </div>
                        <h3 className="mt-2 font-fredoka text-xl font-bold text-[#0B2340] dark:text-[#F8FAFC]">
                            Shelter & Community Impact Pulse
                        </h3>
                        <p className="mt-0.5 text-sm font-medium text-[#64748B] dark:text-[#94A3B8]">
                            Every adoption, report, and donation keeps our shelter running for animals in need.
                        </p>
                    </div>

                    <Link
                        href="/donate"
                        className="inline-flex w-full lg:w-auto items-center justify-center gap-1.5 lg:self-auto rounded-xl bg-gradient-to-r from-[var(--dashboard-primary-from)] to-[var(--dashboard-primary-to)] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:opacity-95"
                    >
                        <Gift className="h-4 w-4 shrink-0" />
                        <span>Support Shelter Care</span>
                    </Link>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-2xl border border-white/80 bg-white/80 p-4 shadow-xs dark:border-[#1E293B] dark:bg-[#0F172A]/80">
                        <p className="text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">
                            Pets Rehomed
                        </p>
                        <p className="mt-1 font-fredoka text-2xl font-bold text-[#0B2340] dark:text-[#F8FAFC]">
                            {communityPulse.petsAdoptedCount}
                        </p>
                        <p className="mt-1 text-xs font-medium text-[#64748B] dark:text-[#94A3B8]">
                            Happy tails in forever homes
                        </p>
                    </div>

                    <div className="rounded-2xl border border-white/80 bg-white/80 p-4 shadow-xs dark:border-[#1E293B] dark:bg-[#0F172A]/80">
                        <p className="text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">
                            Waiting for Home
                        </p>
                        <p className="mt-1 font-fredoka text-2xl font-bold text-[#0B2340] dark:text-[#F8FAFC]">
                            {communityPulse.petsAvailableCount}
                        </p>
                        <p className="mt-1 text-xs font-medium text-[#64748B] dark:text-[#94A3B8]">
                            Ready to meet adopters
                        </p>
                    </div>

                    <div className="rounded-2xl border border-white/80 bg-white/80 p-4 shadow-xs dark:border-[#1E293B] dark:bg-[#0F172A]/80">
                        <p className="text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">
                            Active Rescues
                        </p>
                        <p className="mt-1 font-fredoka text-2xl font-bold text-[#0B2340] dark:text-[#F8FAFC]">
                            {communityPulse.activeRescuesCount}
                        </p>
                        <p className="mt-1 text-xs font-medium text-[#64748B] dark:text-[#94A3B8]">
                            Ongoing rescue responses
                        </p>
                    </div>

                    <div className="rounded-2xl border border-white/80 bg-white/80 p-4 shadow-xs dark:border-[#1E293B] dark:bg-[#0F172A]/80">
                        <div className="flex items-center justify-between gap-2">
                            <p className="text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">
                                Shelter Care Buffer
                            </p>
                            <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-extrabold', sustainabilityTone)}>
                                {communityPulse.careSustainability.urgencyLabel}
                            </span>
                        </div>
                        <p className="mt-1 font-fredoka text-2xl font-bold text-[#0B2340] dark:text-[#F8FAFC]">
                            {communityPulse.careSustainability.estDays} days
                        </p>
                        <p className="mt-1 truncate text-xs font-medium text-[#64748B] dark:text-[#94A3B8]">
                            Focus: {communityPulse.careSustainability.resourceCategory}
                        </p>
                    </div>
                </div>
            </DashboardCard>

            {/* 3. Generalized & Latest Blogs Carousel */}
            <BlogCarousel posts={latestBlogs} categories={blogCategories} />

            {/* 4. Urgent Missing Pet Alerts */}
            {missingAlerts.length > 0 && (
                <DashboardCard className="border-amber-200/80 p-5 sm:p-6 dark:border-amber-900/40">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-3 py-1 text-xs font-bold text-amber-700 dark:text-amber-300">
                                <Radio className="h-3.5 w-3.5" />
                                <span>Community Lookout</span>
                            </div>
                            <h3 className="mt-2 font-fredoka text-xl font-bold text-[#0B2340] dark:text-[#F8FAFC]">
                                Urgent Missing Pet Alerts
                            </h3>
                            <p className="mt-0.5 text-sm font-medium text-[#64748B] dark:text-[#94A3B8]">
                                Have you seen any of these pets nearby? Help reunite them with their families.
                            </p>
                        </div>

                        <Link
                            href="/missing"
                            className="inline-flex w-full sm:w-auto items-center justify-center gap-1.5 sm:self-auto rounded-xl border border-amber-300 bg-amber-50 px-3.5 py-2 text-xs font-bold text-amber-800 transition hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
                        >
                            <span>View Missing Pet Board</span>
                            <ArrowRight className="h-3.5 w-3.5 shrink-0" />
                        </Link>
                    </div>

                    <div className="mt-4 grid gap-4 md:grid-cols-3">
                        {missingAlerts.map((alert) => (
                            <Link
                                key={alert.id}
                                href="/missing"
                                className="group flex items-center gap-3.5 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-3.5 transition hover:-translate-y-0.5 hover:border-amber-300 dark:border-[#1E293B] dark:bg-[#0F172A]"
                            >
                                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-[#E2E8F0] dark:bg-[#1E293B]">
                                    <ImageWithFallback
                                        src={alert.photo_url || '/images/placeholder-pet.jpg'}
                                        alt={alert.name}
                                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                                    />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center justify-between gap-2">
                                        <h4 className="truncate font-fredoka text-base font-bold text-[#0B2340] dark:text-[#F8FAFC]">
                                            {alert.name}
                                        </h4>
                                        <span className="shrink-0 rounded-full bg-rose-500/10 px-2 py-0.5 text-[10px] font-bold text-rose-600 dark:text-rose-400">
                                            Missing
                                        </span>
                                    </div>
                                    <p className="truncate text-xs font-semibold text-[#64748B] dark:text-[#94A3B8]">
                                        {alert.species} &bull; {alert.breed}
                                    </p>
                                    <p className="mt-1 flex items-center gap-1 truncate text-xs font-medium text-[#64748B] dark:text-[#94A3B8]">
                                        <MapPin className="h-3 w-3 shrink-0 text-amber-600 dark:text-amber-400" />
                                        <span className="truncate">{alert.location}</span>
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </DashboardCard>
            )}

            {/* 5. Getting Started Guide & Volunteer / Foster Invite */}
            <div className="grid gap-6 lg:grid-cols-2">
                <DashboardCard className="p-5 sm:p-6">
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <h3 className="font-fredoka text-lg font-bold text-[#0B2340] dark:text-[#F8FAFC]">
                                Your Next Steps
                            </h3>
                            <p className="mt-0.5 text-xs font-medium text-[#64748B] dark:text-[#94A3B8]">
                                Simple ways to get the most out of your Pawlse account.
                            </p>
                        </div>
                        <span className="shrink-0 whitespace-nowrap rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                            {completedChecklistCount}/{checklistItems.length} Done
                        </span>
                    </div>

                    <div className="mt-4 space-y-2.5">
                        {checklistItems.map((item) => (
                            <Link
                                key={item.title}
                                href={item.href}
                                className="flex items-start gap-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3.5 transition hover:border-emerald-300 dark:border-[#1E293B] dark:bg-[#0F172A]"
                            >
                                {item.completed ? (
                                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                                ) : (
                                    <Circle className="mt-0.5 h-5 w-5 shrink-0 text-[#94A3B8]" />
                                )}
                                <div className="min-w-0 flex-1">
                                    <p
                                        className={cn(
                                            'text-sm font-bold',
                                            item.completed
                                                ? 'text-[#64748B] line-through dark:text-[#94A3B8]'
                                                : 'text-[#0B2340] dark:text-[#F8FAFC]',
                                        )}
                                    >
                                        {item.title}
                                    </p>
                                    <p className="mt-0.5 text-xs font-medium text-[#64748B] dark:text-[#94A3B8]">
                                        {item.description}
                                    </p>
                                </div>
                                <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-[#94A3B8]" />
                            </Link>
                        ))}
                    </div>
                </DashboardCard>

                <DashboardCard className="flex flex-col justify-between border-sky-200/80 bg-gradient-to-br from-sky-50/80 via-white to-indigo-50/70 p-4 sm:p-6 dark:border-sky-900/40 dark:from-[#0F172A] dark:via-[#111827] dark:to-sky-950/30">
                    <div>
                        <div className="inline-flex items-center gap-1.5 rounded-full bg-sky-500/15 px-3 py-1 text-xs font-bold text-sky-700 dark:text-sky-300">
                            {volunteerInvite.isVolunteer ? (
                                <ShieldCheck className="h-3.5 w-3.5" />
                            ) : (
                                <Zap className="h-3.5 w-3.5" />
                            )}
                            <span>
                                {volunteerInvite.isVolunteer
                                    ? 'Verified Volunteer'
                                    : volunteerInvite.isFosterParent
                                      ? 'Approved Foster Parent'
                                      : 'Hands-On Community'}
                            </span>
                        </div>

                        <h3 className="mt-3 font-fredoka text-xl font-bold text-[#0B2340] dark:text-[#F8FAFC]">
                            {volunteerInvite.isVolunteer
                                ? 'Ready to jump into your volunteer tasks?'
                                : 'Want to help animals hands-on?'}
                        </h3>

                        <p className="mt-1.5 text-sm font-medium leading-relaxed text-[#64748B] dark:text-[#94A3B8]">
                            {volunteerInvite.isVolunteer
                                ? 'Switch over to your Volunteer Dashboard anytime to view assigned rescues, feeding routes, and foster care updates.'
                                : volunteerInvite.applicationStatus === 'pending'
                                  ? 'Your volunteer application is currently under review by our shelter coordinators. We will notify you as soon as it is approved!'
                                  : 'Join our volunteer team for rescue missions, shelter care, and community events—or open your home temporarily as a foster parent.'}
                        </p>
                    </div>

                    <div className="mt-5 flex flex-nowrap items-center gap-1.5 sm:gap-3">
                        {volunteerInvite.isVolunteer ? (
                            <Link
                                href="/volunteer/switch"
                                method="post"
                                as="button"
                                className="flex-1 sm:flex-initial justify-center inline-flex cursor-pointer items-center gap-1.5 sm:gap-2 rounded-xl bg-sky-600 px-2.5 sm:px-4 py-2.5 text-[11px] sm:text-xs font-bold tracking-tight sm:tracking-normal whitespace-nowrap text-white shadow-sm transition hover:bg-sky-700"
                            >
                                <Zap className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                                <span>Switch to Volunteer<span className="hidden sm:inline"> Dashboard</span></span>
                            </Link>
                        ) : (
                            <Link
                                href="/volunteer"
                                className="flex-1 sm:flex-initial justify-center inline-flex items-center gap-1.5 sm:gap-2 rounded-xl bg-sky-600 px-2.5 sm:px-4 py-2.5 text-[11px] sm:text-xs font-bold tracking-tight sm:tracking-normal whitespace-nowrap text-white shadow-sm transition hover:bg-sky-700"
                            >
                                <Zap className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                                <span>
                                    {volunteerInvite.applicationStatus === 'pending'
                                        ? 'View Volunteer Program'
                                        : 'Apply as a Volunteer'}
                                </span>
                            </Link>
                        )}

                        <Link
                            href="/account/user/volunteer-status"
                            className="flex-1 sm:flex-initial justify-center inline-flex items-center gap-1 sm:gap-1.5 rounded-xl border border-[#E2E8F0] bg-white px-2.5 sm:px-4 py-2.5 text-[11px] sm:text-xs font-bold tracking-tight sm:tracking-normal whitespace-nowrap text-[#0B2340] transition hover:bg-[#F8FAFC] dark:border-[#334155] dark:bg-[#0F172A] dark:text-[#F8FAFC]"
                        >
                            <span>Check Volunteer Status</span>
                            <ArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
                        </Link>
                    </div>
                </DashboardCard>
            </div>

            {/* 6. Pets Waiting for a Home */}
            {featuredPets.length > 0 && (
                <DashboardCard className="p-5 sm:p-6">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <div className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 px-3 py-1 text-xs font-bold text-rose-600 dark:text-rose-400">
                                <Sparkles className="h-3.5 w-3.5" />
                                <span>Looking for Love</span>
                            </div>
                            <h3 className="mt-2 font-fredoka text-xl font-bold text-[#0B2340] dark:text-[#F8FAFC]">
                                Pets Waiting for a Home
                            </h3>
                            <p className="mt-0.5 text-sm font-medium text-[#64748B] dark:text-[#94A3B8]">
                                Say hello to a few of our rescues currently ready for adoption.
                            </p>
                        </div>

                        <Link
                            href="/adopt"
                            className="inline-flex w-full sm:w-auto items-center justify-center gap-1.5 sm:self-auto rounded-xl border border-[#E2E8F0] bg-white px-3.5 py-2 text-xs font-bold text-[#0B2340] transition hover:border-rose-300 hover:text-rose-600 dark:border-[#334155] dark:bg-[#0F172A] dark:text-[#F8FAFC] dark:hover:text-rose-400"
                        >
                            <span>See All Adoptable Pets</span>
                            <ArrowRight className="h-3.5 w-3.5 shrink-0" />
                        </Link>
                    </div>

                    <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {featuredPets.map((pet) => {
                            const saved = isBookmarked(pet.id, 'pet');

                            return (
                                <div
                                    key={pet.id}
                                    className="group flex flex-col overflow-hidden rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] transition hover:-translate-y-0.5 hover:shadow-md dark:border-[#1E293B] dark:bg-[#0F172A]"
                                >
                                    <div className="relative h-40 w-full overflow-hidden bg-[#E2E8F0] dark:bg-[#1E293B]">
                                        <ImageWithFallback
                                            src={pet.photo_url || '/images/placeholder-pet.jpg'}
                                            alt={pet.name}
                                            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                        />
                                        <span className="absolute left-3 top-3 rounded-lg bg-slate-900/75 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">
                                            {pet.type}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => togglePetBookmark(pet)}
                                            aria-label={saved ? `Remove ${pet.name} from bookmarks` : `Save ${pet.name}`}
                                            className={cn(
                                                'absolute right-3 top-3 inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full shadow-sm backdrop-blur-md transition',
                                                saved
                                                    ? 'bg-rose-500 text-white'
                                                    : 'bg-white/90 text-[#0B2340] hover:bg-white dark:bg-slate-900/80 dark:text-white',
                                            )}
                                        >
                                            <Heart className="h-4 w-4" fill={saved ? 'currentColor' : 'none'} />
                                        </button>
                                    </div>

                                    <div className="flex flex-1 flex-col justify-between p-4">
                                        <div>
                                            <h4 className="font-fredoka text-lg font-bold text-[#0B2340] dark:text-[#F8FAFC]">
                                                {pet.name}
                                            </h4>
                                            <p className="text-xs font-semibold text-[#64748B] dark:text-[#94A3B8]">
                                                {pet.breed} &bull; {pet.age}
                                            </p>
                                            <p className="mt-2 text-xs font-medium text-[#64748B] line-clamp-2 dark:text-[#94A3B8]">
                                                {pet.story}
                                            </p>
                                        </div>

                                        <Link
                                            href={`/adopt/${pet.id}`}
                                            className="mt-3 inline-flex items-center gap-1 text-xs font-extrabold text-emerald-700 hover:gap-1.5 dark:text-emerald-400"
                                        >
                                            <span>Meet {pet.name}</span>
                                            <ArrowRight className="h-3.5 w-3.5" />
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </DashboardCard>
            )}

            {/* 7. Lower Two-Column Grid: Row-aligned so left & right card heights match */}
            <div className="grid gap-6 lg:grid-cols-2">
                <DashboardCard className="flex h-full flex-col p-5 sm:p-6">
                    <div className="flex items-center justify-between gap-2">
                        <h3 className="min-w-0 font-fredoka text-lg font-bold text-[#0B2340] dark:text-[#F8FAFC]">
                            Your Recent Updates
                        </h3>
                        <Link
                            href="/account/user/notifications"
                            className="shrink-0 whitespace-nowrap text-xs font-bold text-emerald-700 hover:underline dark:text-emerald-400"
                        >
                            Notifications
                        </Link>
                    </div>

                    {recentActivities.length === 0 ? (
                        <div className="mt-4 flex flex-1 items-center rounded-xl bg-[#F8FAFC] p-4 text-sm font-medium text-[#64748B] dark:bg-[#0F172A] dark:text-[#94A3B8]">
                            You haven&apos;t submitted any applications or reports yet. When you do, you can track their progress right here!
                        </div>
                    ) : (
                        <div className="mt-4 flex flex-1 flex-col justify-between gap-2.5">
                            {recentActivities.map((item) => (
                                <Link
                                    key={item.id}
                                    href={item.href}
                                    className="flex min-w-0 items-center justify-between gap-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 sm:px-4 py-3 transition hover:border-emerald-300 dark:border-[#1E293B] dark:bg-[#0F172A]"
                                >
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-bold text-[#0B2340] dark:text-[#F8FAFC]">
                                            {item.title}
                                        </p>
                                        <p className="mt-0.5 text-xs font-medium text-[#64748B] dark:text-[#94A3B8]">
                                            {formatActivityDate(item.date)}
                                        </p>
                                    </div>
                                    <span className="shrink-0 whitespace-nowrap rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                                        {formatPillLabel(item.status)}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    )}
                </DashboardCard>

                <DashboardCard className="flex h-full flex-col p-5 sm:p-6">
                    <div className="flex items-center gap-2">
                        <Compass className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                        <h3 className="font-fredoka text-lg font-bold text-[#0B2340] dark:text-[#F8FAFC]">
                            Ways to Help Today
                        </h3>
                    </div>
                    <p className="mt-1 text-xs font-medium text-[#64748B] dark:text-[#94A3B8]">
                        Simple ways to make a difference for animals in our community.
                    </p>

                    <div className="mt-4 grid flex-1 gap-3 sm:grid-cols-2">
                        {quickWaysToHelp.map((action) => {
                            const Icon = action.icon;

                            return (
                                <Link
                                    key={action.title}
                                    href={action.href}
                                    className="group flex h-full min-w-0 items-center gap-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3.5 transition hover:-translate-y-0.5 hover:border-emerald-300 dark:border-[#1E293B] dark:bg-[#0F172A]"
                                >
                                    <div
                                        className={cn(
                                            'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                                            action.color,
                                        )}
                                    >
                                        <Icon className="h-5 w-5" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-bold text-[#0B2340] group-hover:text-emerald-700 dark:text-[#F8FAFC] dark:group-hover:text-emerald-300">
                                            {action.title}
                                        </p>
                                        <p className="mt-0.5 text-xs font-medium text-[#64748B] dark:text-[#94A3B8]">
                                            {action.subtitle}
                                        </p>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </DashboardCard>

                <DashboardCard className="flex h-full flex-col p-5 sm:p-6">
                    <div className="flex items-center justify-between gap-2">
                        <h3 className="min-w-0 font-fredoka text-lg font-bold text-[#0B2340] dark:text-[#F8FAFC]">
                            Upcoming Community Events
                        </h3>
                        <Link
                            href="/events"
                            className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap text-xs font-bold text-emerald-700 hover:underline dark:text-emerald-400"
                        >
                            <span>All Events</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                    </div>

                    {upcomingEvents.length === 0 ? (
                        <div className="mt-4 flex flex-1 items-center rounded-xl bg-[#F8FAFC] p-4 text-sm font-medium text-[#64748B] dark:bg-[#0F172A] dark:text-[#94A3B8]">
                            No upcoming events scheduled right now. Check the Events page for future shelter drives!
                        </div>
                    ) : (
                        <div className="mt-4 flex flex-1 flex-col justify-between gap-2.5">
                            {upcomingEvents.map((event) => (
                                <Link
                                    key={event.id}
                                    href="/events"
                                    className="flex min-w-0 items-center justify-between gap-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 sm:px-4 py-3 transition hover:border-sky-300 dark:border-[#1E293B] dark:bg-[#0F172A]"
                                >
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-bold text-[#0B2340] dark:text-[#F8FAFC]">
                                            {event.title}
                                        </p>
                                        <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs font-medium text-[#64748B] dark:text-[#94A3B8]">
                                            <span className="inline-flex items-center gap-1 shrink-0">
                                                <Calendar className="h-3 w-3 shrink-0" />
                                                {event.date || 'TBA'}
                                            </span>
                                            <span className="inline-flex min-w-0 items-center gap-1">
                                                <MapPin className="h-3 w-3 shrink-0" />
                                                <span className="truncate">{event.location}</span>
                                            </span>
                                        </p>
                                    </div>
                                    <ArrowRight className="h-4 w-4 shrink-0 text-[#94A3B8]" />
                                </Link>
                            ))}
                        </div>
                    )}
                </DashboardCard>

                <DashboardCard className="flex h-full flex-col p-5 sm:p-6">
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex min-w-0 items-center gap-2">
                            <Bookmark className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                            <h3 className="truncate font-fredoka text-lg font-bold text-[#0B2340] dark:text-[#F8FAFC]">
                                Saved Bookmarks
                            </h3>
                        </div>
                        <Link
                            href="/account/user/bookmark"
                            className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap text-xs font-bold text-emerald-700 hover:underline dark:text-emerald-400"
                        >
                            <span>View All ({bookmarks.length})</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                    </div>

                    {bookmarks.length === 0 ? (
                        <p className="mt-4 flex flex-1 items-center rounded-xl bg-[#F8FAFC] p-4 text-sm font-medium text-[#64748B] dark:bg-[#0F172A] dark:text-[#94A3B8]">
                            Tap the bookmark icon on any story or pet above to save it here for quick access.
                        </p>
                    ) : (
                        <div className="mt-4 flex flex-1 flex-col gap-2.5">
                            {bookmarks.slice(0, 3).map((item) => (
                                <Link
                                    key={`${item.type}-${item.id}`}
                                    href="/account/user/bookmark"
                                    className="flex min-w-0 items-center justify-between gap-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 sm:px-4 py-2.5 transition hover:border-emerald-300 dark:border-[#1E293B] dark:bg-[#0F172A]"
                                >
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-bold text-[#0B2340] dark:text-[#F8FAFC]">
                                            {item.title}
                                        </p>
                                        <p className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">
                                            {item.type === 'blog' ? 'Article' : item.type === 'missingPet' ? 'Missing Alert' : item.type}
                                        </p>
                                    </div>
                                    <ArrowRight className="h-4 w-4 shrink-0 text-[#94A3B8]" />
                                </Link>
                            ))}
                        </div>
                    )}
                </DashboardCard>
            </div>
        </DashboardSectionPage>
    );
}
