import { LayoutGrid, Table2 } from 'lucide-react';
import { useEffect, useState } from 'react';

export type ViewMode = 'table' | 'cards';

/**
 * Defaults to 'cards' on mobile (< 768px) and 'table' on tablet/desktop (>= 768px),
 * while allowing the user to override the mode manually.
 */
export function useResponsiveViewMode(storageKey?: string): [ViewMode, (mode: ViewMode) => void] {
    const [mode, setMode] = useState<ViewMode>(() => {
        if (typeof window === 'undefined') {
            return 'table';
        }
        if (storageKey) {
            try {
                const saved = localStorage.getItem(storageKey);
                if (saved === 'table' || saved === 'cards') {
                    return saved;
                }
            } catch {
                // Ignore storage errors
            }
        }
        return window.innerWidth < 768 ? 'cards' : 'table';
    });

    useEffect(() => {
        if (storageKey) {
            try {
                const saved = localStorage.getItem(storageKey);
                if (saved === 'table' || saved === 'cards') {
                    return;
                }
            } catch {
                // Ignore storage errors
            }
        }

        const mediaQuery = window.matchMedia('(max-width: 767px)');
        const onChange = (e: MediaQueryListEvent) => {
            setMode(e.matches ? 'cards' : 'table');
        };
        mediaQuery.addEventListener('change', onChange);
        return () => mediaQuery.removeEventListener('change', onChange);
    }, [storageKey]);

    const updateMode = (next: ViewMode) => {
        setMode(next);
        if (storageKey) {
            try {
                localStorage.setItem(storageKey, next);
            } catch {
                // Ignore storage errors
            }
        }
    };

    return [mode, updateMode];
}

export function ViewModeToggle({
    mode,
    onChange,
    className = '',
}: {
    mode: ViewMode;
    onChange: (mode: ViewMode) => void;
    className?: string;
}) {
    return (
        <div
            className={`inline-flex items-center rounded-xl border border-gray-200 bg-gray-100/80 p-0.5 dark:border-slate-800 dark:bg-slate-900 ${className}`}
            role="group"
            aria-label="View mode"
        >
            <button
                type="button"
                onClick={() => onChange('table')}
                aria-pressed={mode === 'table'}
                className={`inline-flex flex-1 sm:flex-initial items-center justify-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold whitespace-nowrap transition-all ${
                    mode === 'table'
                        ? 'bg-white text-[#0B2340] shadow-xs dark:bg-slate-800 dark:text-white'
                        : 'text-gray-500 hover:text-gray-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
            >
                <Table2 className="h-3.5 w-3.5" />
                <span>Table</span>
            </button>
            <button
                type="button"
                onClick={() => onChange('cards')}
                aria-pressed={mode === 'cards'}
                className={`inline-flex flex-1 sm:flex-initial items-center justify-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold whitespace-nowrap transition-all ${
                    mode === 'cards'
                        ? 'bg-white text-[#0B2340] shadow-xs dark:bg-slate-800 dark:text-white'
                        : 'text-gray-500 hover:text-gray-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
            >
                <LayoutGrid className="h-3.5 w-3.5" />
                <span>Cards</span>
            </button>
        </div>
    );
}
