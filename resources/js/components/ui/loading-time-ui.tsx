import { Clock, Sparkles } from 'lucide-react';
import type { ReactNode } from 'react';
import React from 'react';
import { CircularProgressSpinner } from '@/components/ui/spinner';
import { useLoadingTimer } from '@/hooks/use-loading-timer';
import { cn } from '@/lib/utils';

export interface LoadingTimeUIProps {
    isLoading?: boolean;
    progress?: number;
    showProgress?: boolean;
    showTime?: boolean;
    showStatusHint?: boolean;
    label?: string;
    description?: string;
    estimatedTime?: string;
    size?: 'xs' | 'sm' | 'md' | 'lg';
    variant?: 'inline' | 'pill' | 'card' | 'bar' | 'overlay';
    icon?: ReactNode;
    className?: string;
    progressBarClassName?: string;
}

export function LoadingTimeUI({
    isLoading = true,
    progress: controlledProgress,
    showProgress = true,
    showTime = true,
    showStatusHint = false,
    label = 'Loading...',
    description,
    estimatedTime,
    size = 'md',
    variant = 'pill',
    icon,
    className,
    progressBarClassName,
}: LoadingTimeUIProps) {
    const timer = useLoadingTimer({ isLoading });
    const currentProgress = controlledProgress !== undefined ? Math.min(100, Math.max(0, controlledProgress)) : timer.progress;
    const timeDisplay = timer.elapsedSeconds;

    if (!isLoading && variant === 'overlay') {
        return null;
    }

    // Default icon: spinning progress ring that visibly expands as it spins
    const iconElement = icon || (
        <CircularProgressSpinner
            progress={currentProgress}
            size={size}
            className="text-paw-orange shrink-0"
        />
    );

    // 1. INLINE VARIANT: Perfect for buttons, table cells, or inline spans
    if (variant === 'inline') {
        return (
            <span className={cn('inline-flex items-center gap-2 select-none', className)}>
                {iconElement}
                {label && <span className="font-medium">{label}</span>}
                {showTime && (
                    <span className="inline-flex items-center gap-1 font-mono text-[11px] font-bold tabular-nums px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/15 opacity-90 shadow-2xs">
                        <Clock className="size-2.5 opacity-70" />
                        {timeDisplay}
                    </span>
                )}
                {showProgress && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold tabular-nums opacity-90">
                        <span className="w-12 h-1.5 bg-black/15 dark:bg-white/20 rounded-full overflow-hidden inline-block align-middle">
                            <span 
                                className="h-full bg-current rounded-full transition-all duration-150 block"
                                style={{ width: `${currentProgress}%` }}
                            />
                        </span>
                        <span>{Math.round(currentProgress)}%</span>
                    </span>
                )}
            </span>
        );
    }

    // 2. BAR VARIANT: Progress bar across container with time & label
    if (variant === 'bar') {
        return (
            <div className={cn('w-full flex flex-col gap-1.5 select-none', className)}>
                <div className="flex items-center justify-between text-xs font-medium">
                    <span className="flex items-center gap-1.5 font-bold text-gray-700 dark:text-gray-200">
                        {iconElement}
                        {label}
                    </span>
                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                        {showTime && (
                            <span className="flex items-center gap-1 font-mono tabular-nums text-[11px] bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">
                                <Clock className="size-3" />
                                {timeDisplay}
                            </span>
                        )}
                        {showProgress && (
                            <span className="font-bold tabular-nums text-paw-orange">
                                {Math.round(currentProgress)}%
                            </span>
                        )}
                    </div>
                </div>
                {showProgress && (
                    <div className={cn('w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden shadow-inner', progressBarClassName)}>
                        <div 
                            className="h-full bg-gradient-to-r from-paw-orange via-amber-500 to-amber-400 rounded-full transition-all duration-150"
                            style={{ width: `${currentProgress}%` }}
                        />
                    </div>
                )}
                {showStatusHint && (
                    <span className="text-[11px] text-gray-400 italic">
                        {timer.statusHint}
                    </span>
                )}
            </div>
        );
    }

    // 3. CARD VARIANT: Structured card with full details
    if (variant === 'card') {
        return (
            <div className={cn(
                'rounded-2xl border border-gray-200/80 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md p-5 shadow-xl select-none flex flex-col gap-4',
                size === 'sm' && 'p-3 gap-2.5',
                size === 'lg' && 'p-7 gap-5',
                className
            )}>
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-xl bg-paw-orange/10 dark:bg-paw-orange/20 flex items-center justify-center shrink-0">
                            {iconElement}
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900 dark:text-white text-sm sm:text-base leading-snug">
                                {label}
                            </h4>
                            {description && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                    {description}
                                </p>
                            )}
                        </div>
                    </div>
                    {showTime && (
                        <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 font-mono text-xs font-bold text-gray-700 dark:text-gray-300 tabular-nums">
                            <Clock className="size-3.5 text-paw-orange" />
                            <span>{timeDisplay}</span>
                        </div>
                    )}
                </div>

                {showProgress && (
                    <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-gray-500 dark:text-gray-400 font-medium">
                                {timer.statusHint}
                            </span>
                            <span className="font-black text-paw-orange font-mono">
                                {Math.round(currentProgress)}%
                            </span>
                        </div>
                        <div className="w-full h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden p-0.5">
                            <div 
                                className="h-full bg-gradient-to-r from-paw-orange to-amber-400 rounded-full transition-all duration-150 shadow-sm"
                                style={{ width: `${currentProgress}%` }}
                            />
                        </div>
                    </div>
                )}

                {estimatedTime && (
                    <div className="flex items-center gap-1.5 text-[11px] text-gray-400 font-medium pt-1 border-t border-gray-100 dark:border-gray-800/80">
                        <Sparkles className="size-3 text-amber-500" />
                        <span>Estimated duration: {estimatedTime}</span>
                    </div>
                )}
            </div>
        );
    }

    // 4. OVERLAY VARIANT: Full modal or backdrop overlay
    if (variant === 'overlay') {
        return (
            <div className={cn(
                'fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200',
                className
            )}>
                <LoadingTimeUI
                    isLoading={isLoading}
                    progress={controlledProgress}
                    showProgress={showProgress}
                    showTime={showTime}
                    showStatusHint={true}
                    label={label}
                    description={description || 'Please do not close or refresh this tab.'}
                    estimatedTime={estimatedTime}
                    size="lg"
                    variant="card"
                    className="w-full max-w-md shadow-2xl border-2 border-paw-orange/20"
                />
            </div>
        );
    }

    // 5. PILL VARIANT (Default): Sleek floating pill / badge
    return (
        <div className={cn(
            'inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/90 dark:bg-gray-900/90 border border-gray-200/80 dark:border-gray-700/80 shadow-md backdrop-blur-md select-none text-xs text-gray-800 dark:text-gray-200 transition-all',
            size === 'xs' && 'px-2 py-0.5 text-[10px] gap-1.5',
            size === 'sm' && 'px-2.5 py-1 text-xs gap-2',
            size === 'lg' && 'px-5 py-2.5 text-sm gap-3.5',
            className
        )}>
            {iconElement}
            <span className="font-semibold tracking-tight whitespace-nowrap">{label}</span>

            {showProgress && (
                <div className="flex items-center gap-1.5 pl-1 border-l border-gray-200 dark:border-gray-700">
                    <div className="w-12 sm:w-16 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-paw-orange rounded-full transition-all duration-150"
                            style={{ width: `${currentProgress}%` }}
                        />
                    </div>
                    <span className="font-mono font-bold text-[11px] tabular-nums text-paw-orange">
                        {Math.round(currentProgress)}%
                    </span>
                </div>
            )}

            {showTime && (
                <div className="flex items-center gap-1 pl-1 border-l border-gray-200 dark:border-gray-700 font-mono text-[11px] font-bold tabular-nums text-gray-600 dark:text-gray-300">
                    <Clock className="size-3 text-paw-orange" />
                    <span>{timeDisplay}</span>
                </div>
            )}
        </div>
    );
}
