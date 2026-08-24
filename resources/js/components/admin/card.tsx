import { cn } from '@/lib/utils';

export function AdminCard({
    title,
    children,
    className,
}: {
    title?: string;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div
            className={cn(
                'rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.06)] dark:border-[#1E293B] dark:bg-[#111827] dark:shadow-[0_8px_30px_rgba(0,0,0,0.25)]',
                className,
            )}
        >
            {title ? (
                <h2 className="font-fredoka text-xl font-bold uppercase tracking-wide text-[#0B2340] dark:text-[#F8FAFC]">
                    {title}
                </h2>
            ) : null}
            {children}
        </div>
    );
}
