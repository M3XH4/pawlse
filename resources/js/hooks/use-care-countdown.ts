import { useState, useEffect, useMemo } from 'react';
import type { CareSustainabilityData } from '@/types/care-sustainability';

export function useCareCountdown(data?: CareSustainabilityData | null) {
    const calculateSecondsRemaining = () => {
        if (!data?.sustainability_endpoint) return 0;
        const target = new Date(data.sustainability_endpoint).getTime();
        const now = Date.now();
        const diff = Math.floor((target - now) / 1000);
        return Math.max(0, diff);
    };

    // Use server snapshot during initial render so client hydration matches
    // the server-rendered HTML perfectly, preventing hydration mismatch errors.
    const [secondsLeft, setSecondsLeft] = useState<number>(() => {
        if (typeof data?.seconds_remaining === 'number') {
            return data.seconds_remaining;
        }
        return calculateSecondsRemaining();
    });

    useEffect(() => {
        // Once hydrated on client, immediately update to live client time
        setSecondsLeft(calculateSecondsRemaining());

        if (!data?.sustainability_endpoint) return;

        const interval = setInterval(() => {
            const remaining = calculateSecondsRemaining();
            setSecondsLeft(remaining);
            if (remaining <= 0) {
                clearInterval(interval);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [data?.sustainability_endpoint, data?.seconds_remaining]);

    const formatted = useMemo(() => {
        const days = Math.floor(secondsLeft / 86400);
        const hours = Math.floor((secondsLeft % 86400) / 3600);
        const minutes = Math.floor((secondsLeft % 3600) / 60);
        const seconds = secondsLeft % 60;

        const daysStr = String(days).padStart(2, '0');
        const hoursStr = String(hours).padStart(2, '0');
        const minutesStr = String(minutes).padStart(2, '0');
        const secondsStr = String(seconds).padStart(2, '0');

        const estDays = (secondsLeft / 86400).toFixed(1);

        const thresholds = data?.thresholds || {
            stable: 7,
            needs_support: 3,
            urgent: 1,
            critical: 0.25,
        };

        const daysRemaining = secondsLeft / 86400;
        let urgencyStatus: 'STABLE' | 'NEEDS SUPPORT' | 'URGENT' | 'CRITICAL' | 'DEPLETED' = 'DEPLETED';
        let urgencyLabel = 'CARE SUPPORT NEEDED';

        if (secondsLeft <= 0) {
            urgencyStatus = 'DEPLETED';
            urgencyLabel = 'CARE SUPPORT NEEDED';
        } else if (daysRemaining >= thresholds.stable) {
            urgencyStatus = 'STABLE';
            urgencyLabel = 'CARE SUSTAINABLE';
        } else if (daysRemaining >= thresholds.needs_support) {
            urgencyStatus = 'NEEDS SUPPORT';
            urgencyLabel = 'CARE SUPPORT NEEDED';
        } else if (daysRemaining >= thresholds.urgent) {
            urgencyStatus = 'URGENT';
            urgencyLabel = 'URGENT CARE NEEDED';
        } else if (daysRemaining >= thresholds.critical) {
            urgencyStatus = 'CRITICAL';
            urgencyLabel = 'CRITICAL CARE NEEDED';
        } else {
            urgencyStatus = 'DEPLETED';
            urgencyLabel = 'CARE SUPPORT NEEDED';
        }

        const isDepleted = secondsLeft <= 0;

        // Progress percentage for visual meter (e.g., relative to 14 days or stable threshold)
        const maxScaleDays = Math.max(14, (thresholds.stable || 7) * 1.5);
        const progressPercentage = Math.min(100, Math.max(0, (daysRemaining / maxScaleDays) * 100));

        return {
            days,
            hours,
            minutes,
            seconds,
            daysStr,
            hoursStr,
            minutesStr,
            secondsStr,
            fullTimer: `${daysStr} : ${hoursStr} : ${minutesStr} : ${secondsStr}`,
            estDays,
            urgencyStatus,
            urgencyLabel,
            isDepleted,
            progressPercentage,
        };
    }, [secondsLeft, data?.thresholds]);

    return {
        secondsLeft,
        ...formatted,
    };
}
