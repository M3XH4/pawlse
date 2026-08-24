import { Moon, Sun } from 'lucide-react';
import { useAppearance } from '@/hooks/use-appearance';

export function DashboardThemeToggle() {
    const { updateAppearance } = useAppearance();

    return (
        <button
            type="button"
            onClick={() => {
                const isDark = document.documentElement.classList.contains('dark');
                updateAppearance(isDark ? 'light' : 'dark');
            }}
            className="flex h-9 w-9 items-center justify-center rounded-full text-[#64748B] transition-all duration-200 hover:bg-[#F1F5F9] hover:text-[#0B2340] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--dashboard-ring)]/50 dark:text-[#94A3B8] dark:hover:bg-[#1E293B] dark:hover:text-[#F8FAFC]"
            aria-label="Toggle theme"
            title="Toggle theme"
        >
            <Moon className="h-5 w-5 dark:hidden" />
            <Sun className="hidden h-5 w-5 dark:block" />
        </button>
    );
}
