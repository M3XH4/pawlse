import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    PawPrint,
    Home,
    ArrowLeft,
    RefreshCw,
    LogIn,
    ShieldAlert,
    Compass,
    Clock,
    ZapOff,
    AlertTriangle,
    Wrench,
    AlertCircle,
    Heart,
    Siren,
    HelpCircle,
    Phone,
    Mail,
    Search,
    LayoutDashboard,
    type LucideIcon,
} from 'lucide-react';
import { motion } from 'motion/react';

interface ErrorProps {
    status: number;
    message?: string | null;
    appName?: string;
}

interface StatusDetails {
    badge: string;
    title: string;
    description: string;
    icon: LucideIcon;
    glowColor: string;
    iconBg: string;
    iconColor: string;
    badgeStyle: string;
    showRefresh?: boolean;
    showLogin?: boolean;
}

const statusMap: Record<number, StatusDetails> = {
    400: {
        badge: 'Invalid Request',
        title: 'Unrecognized Bark',
        description: 'The server could not understand your request. Please check the address or try again from the homepage.',
        icon: AlertCircle,
        glowColor: 'bg-amber-400/15',
        iconBg: 'from-amber-100 to-orange-100 dark:from-amber-950/40 dark:to-orange-950/40',
        iconColor: 'text-amber-600 dark:text-amber-400',
        badgeStyle: 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300',
    },
    401: {
        badge: 'Sign In Required',
        title: 'Hold Your Paws!',
        description: 'You need an authorized account to enter this territory. Please sign in or register to continue.',
        icon: LogIn,
        glowColor: 'bg-sky-400/15',
        iconBg: 'from-sky-100 to-amber-100 dark:from-sky-950/40 dark:to-amber-950/40',
        iconColor: 'text-sky-600 dark:text-sky-400',
        badgeStyle: 'border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-900/50 dark:bg-sky-950/40 dark:text-sky-300',
        showLogin: true,
    },
    403: {
        badge: 'Restricted Territory',
        title: 'Paws Off! Access Denied',
        description: "You don't have permission to explore this kennel or view these records. If you believe this is an error, please reach out to our team.",
        icon: ShieldAlert,
        glowColor: 'bg-rose-400/15',
        iconBg: 'from-rose-100 to-amber-100 dark:from-rose-950/40 dark:to-amber-950/40',
        iconColor: 'text-rose-600 dark:text-rose-400',
        badgeStyle: 'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300',
        showLogin: true,
    },
    404: {
        badge: 'Page Lost in the Park',
        title: 'This Page Wandered Off!',
        description: "We sniffed high and low, but couldn't find the page you're searching for. It may have trotted away, been adopted, or the URL might have a typo.",
        icon: Compass,
        glowColor: 'bg-amber-400/20',
        iconBg: 'from-amber-100 to-orange-100 dark:from-amber-950/40 dark:to-orange-950/40',
        iconColor: 'text-amber-600 dark:text-amber-400',
        badgeStyle: 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300',
    },
    419: {
        badge: 'Session Expired',
        title: 'Cat Nap Over!',
        description: 'Your security session expired while you were resting. Please refresh the page to wake things back up and continue.',
        icon: Clock,
        glowColor: 'bg-amber-400/15',
        iconBg: 'from-amber-100 to-yellow-100 dark:from-amber-950/40 dark:to-yellow-950/40',
        iconColor: 'text-amber-600 dark:text-amber-400',
        badgeStyle: 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300',
        showRefresh: true,
    },
    429: {
        badge: 'Paws and Breathe',
        title: 'Slow Down, Speedy Paws!',
        description: "You're sending requests faster than a happy tail wag! Please take a quick breather before trying again.",
        icon: ZapOff,
        glowColor: 'bg-orange-400/15',
        iconBg: 'from-orange-100 to-amber-100 dark:from-orange-950/40 dark:to-amber-950/40',
        iconColor: 'text-orange-600 dark:text-orange-400',
        badgeStyle: 'border-orange-200 bg-orange-50 text-orange-800 dark:border-orange-900/50 dark:bg-orange-950/40 dark:text-orange-300',
        showRefresh: true,
    },
    500: {
        badge: 'Technical Hiccup',
        title: 'Leash Got Tangled!',
        description: 'Something unexpected snapped on our end. Our technical rescue crew has been dispatched to sort it out right away.',
        icon: AlertTriangle,
        glowColor: 'bg-rose-400/20',
        iconBg: 'from-rose-100 to-orange-100 dark:from-rose-950/40 dark:to-orange-950/40',
        iconColor: 'text-rose-600 dark:text-rose-400',
        badgeStyle: 'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300',
        showRefresh: true,
    },
    503: {
        badge: 'Scheduled Checkup',
        title: 'Taking a Short Paws!',
        description: "PAWLSE is temporarily unavailable for scheduled maintenance or health checkups. We'll be back on all four paws shortly!",
        icon: Wrench,
        glowColor: 'bg-amber-400/20',
        iconBg: 'from-amber-100 to-orange-100 dark:from-amber-950/40 dark:to-orange-950/40',
        iconColor: 'text-amber-600 dark:text-amber-400',
        badgeStyle: 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300',
        showRefresh: true,
    },
};

const defaultStatusDetails: StatusDetails = {
    badge: 'Error Occurred',
    title: 'Unexpected Bump in the Road',
    description: 'An unexpected issue occurred while loading this page. Please try heading back to safety or check back later.',
    icon: AlertCircle,
    glowColor: 'bg-amber-400/15',
    iconBg: 'from-amber-100 to-orange-100 dark:from-amber-950/40 dark:to-orange-950/40',
    iconColor: 'text-amber-600 dark:text-amber-400',
    badgeStyle: 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300',
    showRefresh: true,
};

export default function ErrorPage({
    status = 404,
    message,
    appName = 'PAWLSE',
}: ErrorProps) {
    const page = usePage();
    const auth = page.props.auth as { user?: { id: number; name?: string } | null } | undefined;
    const currentUser = auth?.user ?? null;

    const [isRefreshing, setIsRefreshing] = useState(false);
    const details = statusMap[status] ?? defaultStatusDetails;
    const IconComponent = details.icon;

    const handleRefresh = () => {
        setIsRefreshing(true);
        window.location.reload();
    };

    const handleGoBack = () => {
        if (
            typeof window !== 'undefined' &&
            window.history.length > 1 &&
            document.referrer &&
            document.referrer.includes(window.location.host)
        ) {
            window.history.back();
        } else {
            router.visit('/');
        }
    };

    return (
        <>
            <Head title={`${status} - ${details.title} | ${appName}`}>
                <meta name="robots" content="noindex, nofollow" />
            </Head>

            <div className="flex min-h-screen flex-col justify-between bg-linear-to-b from-amber-50/60 via-slate-50 to-orange-50/30 p-4 font-quicksand text-slate-800 antialiased sm:p-6 lg:p-8 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-100">
                {/* Header branding */}
                <header className="mx-auto flex w-full max-w-4xl items-center justify-between py-4">
                    <Link
                        href="/"
                        aria-label={`${appName} Home`}
                        className="group flex items-center gap-2.5 transition"
                    >
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/20 transition group-hover:scale-105">
                            <PawPrint className="h-6 w-6" aria-hidden="true" />
                        </div>
                        <div>
                            <span className="font-fredoka text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                                {appName}
                            </span>
                            <span className="block text-[11px] font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                                Animal Rescue & Care
                            </span>
                        </div>
                    </Link>

                    <div className="flex items-center gap-2">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white/80 px-3.5 py-2 text-xs font-bold text-slate-700 shadow-xs backdrop-blur-xs transition hover:bg-white hover:text-slate-900 dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                        >
                            <Home className="h-3.5 w-3.5 text-amber-500" aria-hidden="true" />
                            <span className="hidden sm:inline">Return to</span> Home
                        </Link>

                        {currentUser ? (
                            <Link
                                href="/dashboard"
                                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white/80 px-3.5 py-2 text-xs font-bold text-slate-700 shadow-xs backdrop-blur-xs transition hover:bg-white hover:text-slate-900 dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                            >
                                <LayoutDashboard className="h-3.5 w-3.5 text-amber-500" aria-hidden="true" />
                                <span>Dashboard</span>
                            </Link>
                        ) : (
                            <Link
                                href="/login"
                                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white/80 px-3.5 py-2 text-xs font-bold text-slate-700 shadow-xs backdrop-blur-xs transition hover:bg-white hover:text-slate-900 dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                            >
                                <LogIn className="h-3.5 w-3.5 text-amber-500" aria-hidden="true" />
                                <span>Sign In</span>
                            </Link>
                        )}
                    </div>
                </header>

                {/* Main Card */}
                <main className="mx-auto my-auto w-full max-w-xl py-6">
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35, ease: 'easeOut' }}
                        className="relative overflow-hidden rounded-3xl border border-amber-200/70 bg-white/90 p-6 shadow-2xl shadow-amber-500/10 backdrop-blur-md sm:p-10 dark:border-amber-950/40 dark:bg-slate-900/90"
                    >
                        {/* Decorative background glow */}
                        <div className={`pointer-events-none absolute -top-24 -right-24 h-48 w-48 rounded-full ${details.glowColor} blur-3xl`} />
                        <div className="pointer-events-none absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-orange-400/15 blur-3xl" />

                        {/* Top badge with status code */}
                        <div className="mb-6 flex justify-center">
                            <span className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-bold ${details.badgeStyle}`}>
                                <span className="relative flex h-2 w-2" aria-hidden="true">
                                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
                                    <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
                                </span>
                                <span>HTTP {status} &bull; {details.badge}</span>
                            </span>
                        </div>

                        {/* Center Icon Illustration */}
                        <div className={`mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-tr ${details.iconBg} ${details.iconColor} shadow-inner`}>
                            <div className="relative">
                                <IconComponent className="h-12 w-12" aria-hidden="true" />
                                <PawPrint className="absolute -bottom-2 -right-2 h-5 w-5 text-amber-500/80 dark:text-amber-400/80" aria-hidden="true" />
                            </div>
                        </div>

                        {/* Big Error Number & Title */}
                        <div className="text-center">
                            <span className="font-fredoka text-5xl font-extrabold tracking-tight text-amber-500 sm:text-6xl dark:text-amber-400">
                                {status}
                            </span>
                            <h1 className="mt-2 font-fredoka text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
                                {details.title}
                            </h1>
                            <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base dark:text-slate-300">
                                {message || details.description}
                            </p>

                            {/* Additional server message note if provided alongside description */}
                            {message && message !== details.description && (
                                <div className="mt-4 rounded-xl border border-amber-200/60 bg-amber-50/70 p-3 text-xs text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200">
                                    <span className="font-bold">Details:</span> {message}
                                </div>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                            <button
                                type="button"
                                onClick={handleGoBack}
                                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-slate-900 sm:w-auto dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-750 dark:hover:text-white"
                            >
                                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                                <span>Go Back</span>
                            </button>

                            <Link
                                href="/"
                                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-3 text-sm font-bold text-white shadow-md shadow-amber-500/20 transition hover:opacity-95 sm:w-auto"
                            >
                                <Home className="h-4 w-4" aria-hidden="true" />
                                <span>Return to Homepage</span>
                            </Link>

                            {details.showRefresh && (
                                <button
                                    type="button"
                                    onClick={handleRefresh}
                                    disabled={isRefreshing}
                                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-amber-300/80 bg-amber-50 px-5 py-3 text-sm font-bold text-amber-800 transition hover:bg-amber-100 disabled:opacity-50 sm:w-auto dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-200 dark:hover:bg-amber-900/60"
                                >
                                    <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} aria-hidden="true" />
                                    <span>{isRefreshing ? 'Refreshing...' : 'Try Again'}</span>
                                </button>
                            )}

                            {/* Login or Dashboard CTA depending on auth state */}
                            {details.showLogin && (
                                currentUser ? (
                                    <Link
                                        href="/dashboard"
                                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-300/80 bg-emerald-50 px-5 py-3 text-sm font-bold text-emerald-800 transition hover:bg-emerald-100 sm:w-auto dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200 dark:hover:bg-emerald-900/60"
                                    >
                                        <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
                                        <span>Go to Dashboard</span>
                                    </Link>
                                ) : (
                                    <Link
                                        href="/login"
                                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-sky-300/80 bg-sky-50 px-5 py-3 text-sm font-bold text-sky-800 transition hover:bg-sky-100 sm:w-auto dark:border-sky-900 dark:bg-sky-950/50 dark:text-sky-200 dark:hover:bg-sky-900/60"
                                    >
                                        <LogIn className="h-4 w-4" aria-hidden="true" />
                                        <span>Sign In Now</span>
                                    </Link>
                                )
                            )}
                        </div>

                        {/* Quick Pathways Exploration */}
                        <div className="mt-8 border-t border-slate-100 pt-6 dark:border-slate-800">
                            <span className="mb-3 block text-center text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                Helpful Trails to Explore
                            </span>

                            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                                <Link
                                    href="/adopt"
                                    className="flex flex-col items-center justify-center rounded-2xl border border-slate-150 bg-slate-50/60 p-3 text-center transition hover:border-amber-300 hover:bg-amber-50/50 dark:border-slate-800 dark:bg-slate-850/40 dark:hover:border-amber-800"
                                >
                                    <Heart className="h-4 w-4 text-amber-500" />
                                    <span className="mt-1.5 text-xs font-bold text-slate-700 dark:text-slate-200">Adopt Pets</span>
                                    <span className="text-[11px] text-slate-400 dark:text-slate-500">Find a friend</span>
                                </Link>

                                <Link
                                    href="/sos"
                                    className="flex flex-col items-center justify-center rounded-2xl border border-slate-150 bg-slate-50/60 p-3 text-center transition hover:border-rose-300 hover:bg-rose-50/50 dark:border-slate-800 dark:bg-slate-850/40 dark:hover:border-rose-800"
                                >
                                    <Siren className="h-4 w-4 text-rose-500" />
                                    <span className="mt-1.5 text-xs font-bold text-slate-700 dark:text-slate-200">Report SOS</span>
                                    <span className="text-[11px] text-slate-400 dark:text-slate-500">Animal emergency</span>
                                </Link>

                                <Link
                                    href="/missing"
                                    className="flex flex-col items-center justify-center rounded-2xl border border-slate-150 bg-slate-50/60 p-3 text-center transition hover:border-amber-300 hover:bg-amber-50/50 dark:border-slate-800 dark:bg-slate-850/40 dark:hover:border-amber-800"
                                >
                                    <Search className="h-4 w-4 text-amber-500" />
                                    <span className="mt-1.5 text-xs font-bold text-slate-700 dark:text-slate-200">Lost & Found</span>
                                    <span className="text-[11px] text-slate-400 dark:text-slate-500">Search pets</span>
                                </Link>

                                <Link
                                    href="/volunteer"
                                    className="flex flex-col items-center justify-center rounded-2xl border border-slate-150 bg-slate-50/60 p-3 text-center transition hover:border-sky-300 hover:bg-sky-50/50 dark:border-slate-800 dark:bg-slate-850/40 dark:hover:border-sky-800"
                                >
                                    <HelpCircle className="h-4 w-4 text-sky-500" />
                                    <span className="mt-1.5 text-xs font-bold text-slate-700 dark:text-slate-200">Volunteer</span>
                                    <span className="text-[11px] text-slate-400 dark:text-slate-500">Join the pack</span>
                                </Link>
                            </div>
                        </div>

                        {/* Emergency Contact */}
                        <div className="mt-6 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-200/60 bg-slate-50/80 px-4 py-3 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-400">
                            <span className="font-semibold text-slate-700 dark:text-slate-300">
                                Need urgent animal rescue assistance?
                            </span>
                            <div className="flex items-center gap-3">
                                <a
                                    href="tel:09123456789"
                                    className="inline-flex items-center gap-1 font-bold text-amber-600 hover:underline dark:text-amber-400"
                                >
                                    <Phone className="h-3.5 w-3.5" />
                                    <span>09123456789</span>
                                </a>
                                <a
                                    href="mailto:support@pawlse.test"
                                    className="inline-flex items-center gap-1 font-semibold text-slate-500 hover:text-amber-600 dark:hover:text-amber-400"
                                >
                                    <Mail className="h-3.5 w-3.5" />
                                    <span>Support</span>
                                </a>
                            </div>
                        </div>
                    </motion.div>
                </main>

                {/* Footer */}
                <footer className="mx-auto w-full max-w-4xl py-4 text-center text-xs text-slate-400 dark:text-slate-500">
                    <p>&copy; {new Date().getFullYear()} {appName}. Dedicated to saving lives and caring for our furry companions.</p>
                </footer>
            </div>
        </>
    );
}
