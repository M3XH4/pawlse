import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { 
    Wrench, 
    PawPrint, 
    Mail, 
    Phone, 
    RefreshCw, 
    LogIn, 
    ShieldCheck, 
    Clock, 
    HeartHandshake 
} from 'lucide-react';

interface MaintenanceProps {
    appName?: string;
    message?: string;
    contactEmail?: string;
    contactPhone?: string;
}

export default function Maintenance({
    appName = 'PAWLSE',
    message = 'PAWLSE is currently taking a short paws for scheduled system maintenance. We are working hard to bring everything back as quickly as possible!',
    contactEmail = 'support@pawlse.test',
    contactPhone = '09123456789',
}: MaintenanceProps) {
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleRefresh = () => {
        setIsRefreshing(true);
        router.reload({
            onFinish: () => setIsRefreshing(false),
        });
    };

    return (
        <>
            <Head title={`Under Maintenance - ${appName}`}>
                <meta name="robots" content="noindex, nofollow" />
            </Head>

            <div className="min-h-screen bg-linear-to-b from-amber-50/60 via-slate-50 to-orange-50/30 font-quicksand text-slate-800 antialiased dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-100 flex flex-col justify-between p-4 sm:p-6 lg:p-8">
                {/* Header branding */}
                <header className="mx-auto w-full max-w-4xl flex items-center justify-between py-4">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/20">
                            <PawPrint className="h-6 w-6" />
                        </div>
                        <div>
                            <span className="font-fredoka text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                                {appName}
                            </span>
                            <span className="block text-[11px] font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                                Animal Rescue & Care
                            </span>
                        </div>
                    </div>

                    <Link
                        href="/login"
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white/80 px-3.5 py-2 text-xs font-bold text-slate-700 shadow-xs backdrop-blur-xs transition hover:bg-white hover:text-slate-900 dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                    >
                        <LogIn className="h-3.5 w-3.5 text-amber-500" />
                        <span>Admin Login</span>
                    </Link>
                </header>

                {/* Main Card */}
                <main className="mx-auto my-auto w-full max-w-xl py-8">
                    <div className="relative overflow-hidden rounded-3xl border border-amber-200/70 bg-white/90 p-6 sm:p-10 shadow-2xl shadow-amber-500/10 backdrop-blur-md dark:border-amber-950/40 dark:bg-slate-900/90">
                        {/* Decorative background glow */}
                        <div className="pointer-events-none absolute -top-24 -right-24 h-48 w-48 rounded-full bg-amber-400/15 blur-3xl" />
                        <div className="pointer-events-none absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-orange-400/15 blur-3xl" />

                        {/* Top badge */}
                        <div className="mb-6 flex justify-center">
                            <span className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-1.5 text-xs font-bold text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300">
                                <span className="relative flex h-2 w-2">
                                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
                                    <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
                                </span>
                                System Maintenance in Progress
                            </span>
                        </div>

                        {/* Center Icon Illustration */}
                        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-tr from-amber-100 to-orange-100 text-amber-600 shadow-inner dark:from-amber-950/40 dark:to-orange-950/40 dark:text-amber-400">
                            <div className="relative">
                                <PawPrint className="h-12 w-12 text-amber-500 dark:text-amber-400" />
                                <Wrench className="absolute -bottom-1 -right-1 h-6 w-6 text-orange-600 dark:text-orange-400" />
                            </div>
                        </div>

                        {/* Title and Message */}
                        <div className="text-center">
                            <h1 className="font-fredoka text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
                                Taking a Short Paws!
                            </h1>
                            <p className="mt-4 text-sm sm:text-base leading-relaxed text-slate-600 dark:text-slate-300">
                                {message}
                            </p>
                        </div>

                        {/* Emergency / Contact Information */}
                        <div className="mt-8 rounded-2xl border border-slate-150 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-850/60">
                            <div className="mb-2.5 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                <HeartHandshake className="h-4 w-4 text-amber-500" />
                                <span>Urgent Animal Care & Inquiries</span>
                            </div>

                            <div className="grid gap-2.5 sm:grid-cols-2">
                                {contactEmail && (
                                    <a
                                        href={`mailto:${contactEmail}`}
                                        className="flex items-center gap-2.5 rounded-xl border border-slate-200/60 bg-white p-3 text-xs font-semibold text-slate-700 transition hover:border-amber-300 hover:text-amber-600 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 dark:hover:text-amber-400"
                                    >
                                        <Mail className="h-4 w-4 shrink-0 text-amber-500" />
                                        <span className="truncate">{contactEmail}</span>
                                    </a>
                                )}

                                {contactPhone && (
                                    <a
                                        href={`tel:${contactPhone}`}
                                        className="flex items-center gap-2.5 rounded-xl border border-slate-200/60 bg-white p-3 text-xs font-semibold text-slate-700 transition hover:border-amber-300 hover:text-amber-600 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 dark:hover:text-amber-400"
                                    >
                                        <Phone className="h-4 w-4 shrink-0 text-orange-500" />
                                        <span className="truncate">{contactPhone}</span>
                                    </a>
                                )}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                            <button
                                type="button"
                                onClick={handleRefresh}
                                disabled={isRefreshing}
                                className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-3 text-sm font-bold text-white shadow-md shadow-amber-500/20 transition hover:opacity-95 disabled:opacity-50"
                            >
                                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                                <span>{isRefreshing ? 'Checking Status...' : 'Check If We’re Back'}</span>
                            </button>

                            <Link
                                href="/login"
                                className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-750 dark:hover:text-white"
                            >
                                <ShieldCheck className="h-4 w-4 text-slate-400" />
                                <span>Staff Bypass Portal</span>
                            </Link>
                        </div>
                    </div>
                </main>

                {/* Footer */}
                <footer className="mx-auto w-full max-w-4xl py-4 text-center text-xs text-slate-400 dark:text-slate-500">
                    <p>© {new Date().getFullYear()} {appName}. Dedicated to saving lives and caring for our furry companions.</p>
                </footer>
            </div>
        </>
    );
}
