import { useCallback, useEffect, useRef, useState } from 'react';

export interface UseLoadingTimerOptions {
    isLoading?: boolean;
    estimatedDurationMs?: number;
    initialProgress?: number;
    maxSimulatedProgress?: number;
    onTick?: (elapsedMs: number) => void;
}

export interface LoadingTimerState {
    elapsedMs: number;
    elapsedSeconds: string;
    formattedTime: string;
    progress: number;
    statusHint: string;
    reset: () => void;
}

/**
 * High-precision timer and progress simulator for loading states.
 * Provides live elapsed time (in tenths of seconds) and realistic progress curves
 * so users always know how long they have been waiting and that progress is active.
 */
export function useLoadingTimer(options: UseLoadingTimerOptions = {}): LoadingTimerState {
    const {
        isLoading = true,
        estimatedDurationMs = 3000,
        initialProgress = 12,
        maxSimulatedProgress = 95,
        onTick,
    } = options;

    const [elapsedMs, setElapsedMs] = useState(0);
    const [progress, setProgress] = useState(isLoading ? initialProgress : 0);
    const startTimeRef = useRef<number | null>(null);
    const onTickRef = useRef(onTick);

    useEffect(() => {
        onTickRef.current = onTick;
    }, [onTick]);

    const reset = useCallback(() => {
        startTimeRef.current = null;
        setElapsedMs(0);
        setProgress(isLoading ? initialProgress : 0);
    }, [isLoading, initialProgress]);

    useEffect(() => {
        if (!isLoading) {
            startTimeRef.current = null;

            return;
        }

        startTimeRef.current = Date.now();

        const timerId = window.setInterval(() => {
            if (startTimeRef.current === null) {
                startTimeRef.current = Date.now();
            }

            const now = Date.now();
            const elapsed = now - startTimeRef.current;

            setElapsedMs(elapsed);
            onTickRef.current?.(elapsed);

            // Calculate simulated progress based on asymptotic curve
            const ratio = elapsed / Math.max(1000, estimatedDurationMs);
            const calculatedProgress = Math.min(
                maxSimulatedProgress,
                Math.round(initialProgress + (maxSimulatedProgress - initialProgress) * (1 - Math.exp(-ratio * 2.2)))
            );

            setProgress(calculatedProgress);
        }, 80);

        return () => {
            window.clearInterval(timerId);
        };
    }, [isLoading, estimatedDurationMs, initialProgress, maxSimulatedProgress]);

    const seconds = (elapsedMs / 1000).toFixed(1);
    const elapsedSeconds = `${seconds}s`;

    const totalSeconds = Math.floor(elapsedMs / 1000);
    const tenths = Math.floor((elapsedMs % 1000) / 100);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;

    const formattedTime = mins > 0 
        ? `${mins}:${secs.toString().padStart(2, '0')}.${tenths}` 
        : `${secs}.${tenths}s`;

    let statusHint = 'Connecting...';

    if (elapsedMs < 1200) {
        statusHint = 'Starting...';
    } else if (elapsedMs < 3000) {
        statusHint = 'Processing request...';
    } else if (elapsedMs < 6000) {
        statusHint = 'Almost there, please wait...';
    } else {
        statusHint = 'Working on server response, hang tight...';
    }

    return {
        elapsedMs,
        elapsedSeconds,
        formattedTime,
        progress,
        statusHint,
        reset,
    };
}
