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
    FileWarning,
    CheckCircle2,
    Copy,
    Check,
    Info,
    type LucideIcon,
} from 'lucide-react';
import { motion } from 'motion/react';

interface ErrorProps {
    status: number;
    message?: string | null;
    whyItFailed?: string | null;
    whyItHappened?: string | null;
    whatToDo?: string[] | null;
    errorReference?: string | null;
    retryAfterSeconds?: number | null;
    appName?: string;
}

interface StatusDetails {
    badge: string;
    title: string;
    description: string;
    defaultWhyFailed: string;
    defaultWhyHappened: string;
    defaultWhatToDo: string[];
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
        defaultWhyFailed: 'Your request could not be processed by the server.',
        defaultWhyHappened: 'Some of the information or parameters in the link or form were incomplete, malformed, or out of date.',
        defaultWhatToDo: [
            'Go back to the previous page and double-check the information you entered.',
            'If you clicked an external or bookmarked link, try navigating from the PAWLSE homepage instead.',
        ],
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
        defaultWhyFailed: 'This page or action requires you to be signed in.',
        defaultWhyHappened: 'You are currently browsing as a guest, or your login session has ended.',
        defaultWhatToDo: [
            'Click "Sign In Now" below to log in with your PAWLSE account.',
            'If you do not have an account yet, you can register for free on the sign-in page.',
        ],
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
        defaultWhyFailed: 'You could not open this page or complete this action because access is restricted.',
        defaultWhyHappened: 'Your current account role does not have the required permissions for this area.',
        defaultWhatToDo: [
            'Return to your dashboard or the homepage to use features available to your account.',
            'If you are an approved volunteer, make sure you have switched into Volunteer Mode from your dashboard.',
            'Need access? Reach out to our team through the Help Desk.',
        ],
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
        defaultWhyFailed: 'We could not find the page or record you were looking for.',
        defaultWhyHappened: 'The web address (URL) may have a typo, or the pet profile, event, or record has been moved or removed.',
        defaultWhatToDo: [
            'Check the web address in your browser for any spelling mistakes.',
            'Use the "Go Back" button or the quick links below to browse available pets, rescue reports, or events.',
        ],
        icon: Compass,
        glowColor: 'bg-amber-400/20',
        iconBg: 'from-amber-100 to-orange-100 dark:from-amber-950/40 dark:to-orange-950/40',
        iconColor: 'text-amber-600 dark:text-amber-400',
        badgeStyle: 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300',
    },
    405: {
        badge: 'Action Not Allowed Here',
        title: 'Wrong Trail Direction!',
        description: 'This address only accepts form submissions or button actions and cannot be opened directly.',
        defaultWhyFailed: 'This action link cannot be opened directly in your browser.',
        defaultWhyHappened: 'You visited or refreshed an address that only accepts form submissions or button clicks.',
        defaultWhatToDo: [
            'Click "Go Back" to return to the previous page and use the form or button provided there.',
            'Return to the homepage if you were trying to browse the site.',
        ],
        icon: AlertCircle,
        glowColor: 'bg-amber-400/15',
        iconBg: 'from-amber-100 to-orange-100 dark:from-amber-950/40 dark:to-orange-950/40',
        iconColor: 'text-amber-600 dark:text-amber-400',
        badgeStyle: 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300',
    },
    408: {
        badge: 'Request Timed Out',
        title: 'The Trail Took Too Long!',
        description: 'Your request took longer than expected to reach our server.',
        defaultWhyFailed: 'Your request timed out before finishing.',
        defaultWhyHappened: 'A slow internet connection or large photo upload prevented the server from receiving your request in time.',
        defaultWhatToDo: [
            'Check your internet connection and click "Try Again".',
            'If you were uploading photos, try selecting fewer or smaller images at once.',
        ],
        icon: Clock,
        glowColor: 'bg-amber-400/15',
        iconBg: 'from-amber-100 to-orange-100 dark:from-amber-950/40 dark:to-orange-950/40',
        iconColor: 'text-amber-600 dark:text-amber-400',
        badgeStyle: 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300',
        showRefresh: true,
    },
    413: {
        badge: 'Files Too Large',
        title: 'That Load Is Too Heavy!',
        description: 'The photos or documents you attached exceed our maximum upload size limit.',
        defaultWhyFailed: 'Your upload could not go through because the attached files are too large.',
        defaultWhyHappened: 'One or more high-resolution photos or documents exceeded the server upload size limit.',
        defaultWhatToDo: [
            'Click "Go Back" to return to your form.',
            'Select smaller image files (under 8 MB per photo) or upload fewer photos at once.',
        ],
        icon: FileWarning,
        glowColor: 'bg-orange-400/15',
        iconBg: 'from-orange-100 to-amber-100 dark:from-orange-950/40 dark:to-amber-950/40',
        iconColor: 'text-orange-600 dark:text-orange-400',
        badgeStyle: 'border-orange-200 bg-orange-50 text-orange-800 dark:border-orange-900/50 dark:bg-orange-950/40 dark:text-orange-300',
    },
    419: {
        badge: 'Session Expired',
        title: 'Cat Nap Over!',
        description: 'Your security session expired while you were resting. Please refresh the page to wake things back up and continue.',
        defaultWhyFailed: 'Your form or action did not go through because your security session expired.',
        defaultWhyHappened: 'The page was left open without activity for a while, or your sign-in status changed in another browser tab.',
        defaultWhatToDo: [
            'Click "Try Again" below to refresh your security session.',
            'Go back, verify your form entries, and submit your request again.',
        ],
        icon: Clock,
        glowColor: 'bg-amber-400/15',
        iconBg: 'from-amber-100 to-yellow-100 dark:from-amber-950/40 dark:to-yellow-950/40',
        iconColor: 'text-amber-600 dark:text-amber-400',
        badgeStyle: 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300',
        showRefresh: true,
    },
    422: {
        badge: 'Details Need Attention',
        title: 'Almost Ready to Pounce!',
        description: 'Some of the details in your submission were missing or invalid.',
        defaultWhyFailed: 'Your submission could not be saved because some required details need attention.',
        defaultWhyHappened: 'One or more fields were left blank or did not match the expected format.',
        defaultWhatToDo: [
            'Click "Go Back" to return to your form.',
            'Check the highlighted fields and follow the instructions next to each input before submitting again.',
        ],
        icon: AlertCircle,
        glowColor: 'bg-amber-400/15',
        iconBg: 'from-amber-100 to-orange-100 dark:from-amber-950/40 dark:to-orange-950/40',
        iconColor: 'text-amber-600 dark:text-amber-400',
        badgeStyle: 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300',
    },
    429: {
        badge: 'Paws and Breathe',
        title: 'Slow Down, Speedy Paws!',
        description: "You're sending requests faster than a happy tail wag! Please take a quick breather before trying again.",
        defaultWhyFailed: 'Your request was temporarily paused due to too many rapid attempts.',
        defaultWhyHappened: 'To keep PAWLSE fast and reliable for animal emergencies, our security system limits how quickly repeated requests can be sent.',
        defaultWhatToDo: [
            'Wait 30 to 60 seconds before clicking "Try Again".',
            'Avoid clicking submit or refresh buttons multiple times while a page is loading.',
        ],
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
        defaultWhyFailed: 'Your request could not be completed due to an unexpected server error.',
        defaultWhyHappened: 'A temporary technical or database glitch interrupted the process on our end—this was not caused by anything you did.',
        defaultWhatToDo: [
            'Wait a moment and click "Try Again" to reload the page.',
            'If you were submitting a form, check your dashboard first to see if your entry already went through.',
            'If the problem continues, contact our Help Desk or Support team and share the reference code below.',
        ],
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
        defaultWhyFailed: 'PAWLSE is temporarily offline and cannot process your request right now.',
        defaultWhyHappened: 'Our team is performing scheduled maintenance or system updates.',
        defaultWhatToDo: [
            'Wait a few minutes and click "Try Again" to check if the platform is back online.',
            'For urgent animal rescue emergencies, call our 24/7 hotline directly at 09123456789.',
        ],
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
    defaultWhyFailed: 'Your request could not be completed due to an unexpected error.',
    defaultWhyHappened: 'A temporary glitch interrupted the request while loading or saving.',
    defaultWhatToDo: [
        'Click "Go Back" or "Try Again" to retry your action.',
        'Return to the homepage or contact Support if the issue persists.',
    ],
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
    whyItFailed,
    whyItHappened,
    whatToDo,
    errorReference,
    retryAfterSeconds,
    appName = 'PAWLSE',
}: ErrorProps) {
    const page = usePage();
    const auth = page.props.auth as { user?: { id: number; name?: string } | null } | undefined;
    const currentUser = auth?.user ?? null;

    const [isRefreshing, setIsRefreshing] = useState(false);
    const [copiedRef, setCopiedRef] = useState(false);

    const details = statusMap[status] ?? defaultStatusDetails;
    const IconComponent = details.icon;

    const resolvedWhyFailed = whyItFailed || details.defaultWhyFailed;
    const resolvedWhyHappened = whyItHappened || message || details.defaultWhyHappened;
    const resolvedWhatToDo =
        whatToDo && whatToDo.length > 0 ? whatToDo : details.defaultWhatToDo;

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

    const handleCopyReference = () => {
        if (!errorReference || typeof navigator === 'undefined') {
            return;
        }
        navigator.clipboard?.writeText(errorReference);
        setCopiedRef(true);
        setTimeout(() => setCopiedRef(false), 2000);
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
                <main className="mx-auto my-auto w-full max-w-2xl py-6">
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
                        <div className="mb-6 flex flex-wrap items-center justify-center gap-2">
                            <span className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-bold ${details.badgeStyle}`}>
                                <span className="relative flex h-2 w-2" aria-hidden="true">
                                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
                                    <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
                                </span>
                                <span>HTTP {status} &bull; {details.badge}</span>
                            </span>

                            {retryAfterSeconds && retryAfterSeconds > 0 && (
                                <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-bold text-orange-800 dark:border-orange-900/50 dark:bg-orange-950/40 dark:text-orange-300">
                                    <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                                    <span>Retry in ~{retryAfterSeconds}s</span>
                                </span>
                            )}
                        </div>

                        {/* Center Icon Illustration */}
                        <div className={`mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-tr ${details.iconBg} ${details.iconColor} shadow-inner`}>
                            <div className="relative">
                                <IconComponent className="h-10 w-10" aria-hidden="true" />
                                <PawPrint className="absolute -bottom-2 -right-2 h-4 w-4 text-amber-500/80 dark:text-amber-400/80" aria-hidden="true" />
                            </div>
                        </div>

                        {/* Big Error Number & Title */}
                        <div className="text-center">
                            <span className="font-fredoka text-4xl font-extrabold tracking-tight text-amber-500 sm:text-5xl dark:text-amber-400">
                                {status}
                            </span>
                            <h1 className="mt-1.5 font-fredoka text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
                                {details.title}
                            </h1>
                            <p className="mt-2.5 text-sm leading-relaxed text-slate-600 sm:text-base dark:text-slate-300">
                                {message || details.description}
                            </p>
                        </div>

                        {/* Clear 3-Step Breakdown: Why it didn't go through, Why it happened, What to do */}
                        <div
                            aria-label="Error explanation and next steps"
                            className="mt-6 space-y-3 rounded-2xl border border-slate-200/80 bg-slate-50/90 p-4 text-left sm:p-5 dark:border-slate-800 dark:bg-slate-800/50"
                        >
                            <div className="grid gap-3 sm:grid-cols-2">
                                <div className="rounded-xl border border-slate-200/70 bg-white p-3.5 dark:border-slate-700/60 dark:bg-slate-900/70">
                                    <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                                        <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                                        <span>Why It Didn&apos;t Go Through</span>
                                    </div>
                                    <p className="mt-1.5 text-xs leading-relaxed font-semibold text-slate-700 sm:text-sm dark:text-slate-200">
                                        {resolvedWhyFailed}
                                    </p>
                                </div>

                                <div className="rounded-xl border border-slate-200/70 bg-white p-3.5 dark:border-slate-700/60 dark:bg-slate-900/70">
                                    <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                                        <Info className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                                        <span>Why This Happened</span>
                                    </div>
                                    <p className="mt-1.5 text-xs leading-relaxed text-slate-600 sm:text-sm dark:text-slate-300">
                                        {resolvedWhyHappened}
                                    </p>
                                </div>
                            </div>

                            <div className="rounded-xl border border-emerald-200/70 bg-emerald-50/60 p-3.5 dark:border-emerald-900/40 dark:bg-emerald-950/25">
                                <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                                    <span>What You Should Do Next</span>
                                </div>
                                <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-slate-700 sm:text-sm dark:text-slate-200">
                                    {resolvedWhatToDo.map((step, index) => (
                                        <li key={index} className="flex items-start gap-2">
                                            <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                                                {index + 1}
                                            </span>
                                            <span>{step}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {errorReference && (
                                <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200/80 bg-white px-3.5 py-2.5 text-xs dark:border-slate-700/60 dark:bg-slate-900/70">
                                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                                        <span className="font-semibold">Support Reference Code:</span>
                                        <code className="rounded bg-slate-100 px-2 py-0.5 font-mono font-bold text-slate-800 dark:bg-slate-800 dark:text-amber-300">
                                            {errorReference}
                                        </code>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleCopyReference}
                                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-[11px] font-bold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                                    >
                                        {copiedRef ? (
                                            <>
                                                <Check className="h-3 w-3 text-emerald-500" />
                                                <span>Copied</span>
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="h-3 w-3" />
                                                <span>Copy Code</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
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
