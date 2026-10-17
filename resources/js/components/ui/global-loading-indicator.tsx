import { router } from '@inertiajs/react';
import { Check, Clock } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { CircularProgressSpinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

interface ActiveVisitInfo {
    method: string;
    url: string;
    title: string;
}

/**
 * GlobalLoadingIndicator
 * Listens to all Inertia navigation and request lifecycle events.
 * Displays a top gradient progress bar and an interactive floating loading pill
 * with live elapsed time, percentage, and contextual status hints.
 */
export function GlobalLoadingIndicator() {
    const [isVisible, setIsVisible] = useState(false);
    const [isFinished, setIsFinished] = useState(false);
    const [progress, setProgress] = useState(0);
    const [elapsedMs, setElapsedMs] = useState(0);
    const [visitInfo, setVisitInfo] = useState<ActiveVisitInfo>({
        method: 'GET',
        url: '',
        title: 'Loading page...',
    });

    const startTimeRef = useRef<number>(0);
    const timerIntervalRef = useRef<number | null>(null);
    const finishTimeoutRef = useRef<number | null>(null);

    const formatActionTitle = (method: string, rawUrl: string | URL) => {
        const urlStr = typeof rawUrl === 'string' ? rawUrl : rawUrl.pathname || '';
        const path = urlStr.split('?')[0].replace(/^\//, '');

        if (method.toUpperCase() === 'POST' || method.toUpperCase() === 'PUT' || method.toUpperCase() === 'PATCH') {
            if (path.includes('rescue')) {
return 'Submitting Rescue Report...';
}

            if (path.includes('sos')) {
return 'Broadcasting SOS Emergency...';
}

            if (path.includes('missing')) {
return 'Publishing Missing Pet Report...';
}

            if (path.includes('login')) {
return 'Authenticating...';
}

            if (path.includes('register')) {
return 'Creating Account...';
}

            if (path.includes('donate')) {
return 'Processing Donation...';
}

            if (path.includes('volunteer')) {
return 'Submitting Volunteer Application...';
}

            return 'Saving Changes...';
        }

        if (method.toUpperCase() === 'DELETE') {
            return 'Processing Deletion...';
        }

        // GET Navigation
        if (!path || path === '') {
return 'Loading Home...';
}

        const segments = path.split('/');
        const pageName = segments[segments.length - 1]
            .split('-')
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' ');

        return `Loading ${pageName}...`;
    };

    useEffect(() => {
        const removeStart = router.on('start', (event) => {
            if (finishTimeoutRef.current) {
                window.clearTimeout(finishTimeoutRef.current);
                finishTimeoutRef.current = null;
            }

            const method = event.detail.visit.method.toUpperCase();
            const isFileOrFormData = typeof FormData !== 'undefined' && event.detail.visit.data instanceof FormData;
            const isMutatingDatabaseRequest = method === 'POST' || method === 'PUT' || method === 'PATCH' || method === 'DELETE';

            // Only show global loading on critical database requests and uploads, not tab/link switches
            if (!isMutatingDatabaseRequest && !isFileOrFormData) {
                return;
            }

            const url = typeof event.detail.visit.url === 'string' 
                ? event.detail.visit.url 
                : event.detail.visit.url.toString();

            setVisitInfo({
                method,
                url,
                title: formatActionTitle(method, event.detail.visit.url),
            });

            startTimeRef.current = Date.now();
            setElapsedMs(0);
            setProgress(15);
            setIsFinished(false);
            setIsVisible(true);

            if (timerIntervalRef.current) {
                window.clearInterval(timerIntervalRef.current);
            }

            timerIntervalRef.current = window.setInterval(() => {
                const now = Date.now();
                const elapsed = now - startTimeRef.current;
                setElapsedMs(elapsed);

                // Smooth asymptotic progress estimation
                setProgress((prev) => {
                    if (prev >= 94) {
return prev;
}

                    const increment = Math.max(0.5, (95 - prev) * 0.08);

                    return Math.min(94, prev + increment);
                });
            }, 60);
        });

        const removeProgress = router.on('progress', (event) => {
            if (event.detail.progress && typeof event.detail.progress.percentage === 'number') {
                setProgress(Math.min(98, event.detail.progress.percentage));
            }
        });

        const handleFinish = () => {
            if (timerIntervalRef.current) {
                window.clearInterval(timerIntervalRef.current);
                timerIntervalRef.current = null;
            }

            setProgress(100);
            setIsFinished(true);

            finishTimeoutRef.current = window.setTimeout(() => {
                setIsVisible(false);
                setIsFinished(false);
                setProgress(0);
                setElapsedMs(0);
            }, 500);
        };

        const removeFinish = router.on('finish', handleFinish);
        const removeCancel = router.on('cancel', handleFinish);
        const removeError = router.on('error', handleFinish);

        return () => {
            removeStart();
            removeProgress();
            removeFinish();
            removeCancel();
            removeError();

            if (timerIntervalRef.current) {
window.clearInterval(timerIntervalRef.current);
}

            if (finishTimeoutRef.current) {
window.clearTimeout(finishTimeoutRef.current);
}
        };
    }, []);

    if (!isVisible) {
        return null;
    }

    const elapsedSeconds = `${(elapsedMs / 1000).toFixed(1)}s`;

    let statusTip = 'Connecting to server...';

    if (isFinished) {
        statusTip = `Ready (${elapsedSeconds})`;
    } else if (elapsedMs > 5000) {
        statusTip = 'Taking a little longer than usual, please hold on...';
    } else if (elapsedMs > 2500) {
        statusTip = 'Almost ready...';
    } else {
        statusTip = 'Fetching updates...';
    }

    return (
        <aside 
            aria-label="Navigation loading status"
            aria-busy={!isFinished}
            className="pointer-events-none fixed inset-x-0 top-0 z-[9999] flex flex-col items-center select-none"
        >
            {/* Top Glowing Progress Line */}
            <div className="w-full h-[3px] bg-black/5 dark:bg-white/10 relative overflow-hidden">
                <div
                    className={cn(
                        'h-full transition-all duration-150 ease-out shadow-sm',
                        isFinished
                            ? 'bg-emerald-500'
                            : 'bg-gradient-to-r from-paw-orange via-amber-400 to-paw-blue'
                    )}
                    style={{ width: `${progress}%` }}
                />
                {!isFinished && (
                    <div 
                        className="absolute top-0 bottom-0 w-24 bg-gradient-to-r from-transparent via-white/60 to-transparent blur-xs animate-shimmer"
                        style={{ left: `${Math.max(0, progress - 15)}%` }}
                    />
                )}
            </div>

            {/* Floating Status Pill */}
            <div
                className={cn(
                    'mt-3 mx-4 px-4 py-2 rounded-full border shadow-2xl backdrop-blur-md transition-all duration-300 flex items-center gap-3',
                    isFinished
                        ? 'bg-emerald-50/95 dark:bg-emerald-950/90 border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 scale-95 opacity-90'
                        : 'bg-white/95 dark:bg-gray-900/95 border-gray-200/90 dark:border-gray-800 text-gray-800 dark:text-gray-100'
                )}
            >
                {/* Icon */}
                <div className="shrink-0">
                    {isFinished ? (
                        <div className="size-5 rounded-full bg-emerald-500 text-white flex items-center justify-center animate-in zoom-in-75 duration-200">
                            <Check className="size-3 stroke-[3]" />
                        </div>
                    ) : (
                        <div className="relative size-5 flex items-center justify-center">
                            <CircularProgressSpinner
                                progress={progress}
                                size="sm"
                                className="text-paw-orange stroke-[2.75]"
                            />
                            <span className="absolute size-5 rounded-full bg-paw-orange/20 animate-ping -z-10" />
                        </div>
                    )}
                </div>

                {/* Title & Status */}
                <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-xs sm:text-sm tracking-tight truncate max-w-[200px] sm:max-w-[320px]">
                            {isFinished ? 'Completed!' : visitInfo.title}
                        </span>
                        {!isFinished && (
                            <span className="hidden sm:inline-block text-[11px] text-gray-400 dark:text-gray-500 italic">
                                • {statusTip}
                            </span>
                        )}
                    </div>
                </div>

                {/* Mini Progress Track */}
                {!isFinished && (
                    <div className="flex items-center gap-1.5 pl-2 border-l border-gray-200 dark:border-gray-800">
                        <div className="w-14 sm:w-20 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-gradient-to-r from-paw-orange to-amber-400 rounded-full transition-all duration-150"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <span className="font-mono font-black text-[11px] tabular-nums text-paw-orange">
                            {Math.round(progress)}%
                        </span>
                    </div>
                )}

                {/* Live Elapsed Time Badge */}
                <div className={cn(
                    'flex items-center gap-1 font-mono text-[11px] font-bold tabular-nums px-2 py-0.5 rounded-full shadow-2xs shrink-0',
                    isFinished
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200/60 dark:border-gray-700'
                )}>
                    <Clock className={cn('size-3', isFinished ? 'text-emerald-600' : 'text-paw-orange')} />
                    <span>{elapsedSeconds}</span>
                </div>
            </div>
        </aside>
    );
}
