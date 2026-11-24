import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface PaginationLinkItem {
    url: string | null;
    label: string;
    active: boolean;
}

interface DashboardPaginationProps {
    links?: PaginationLinkItem[];
    currentPage?: number;
    totalPages?: number;
    onPageChange?: (page: number) => void;
    total?: number;
    count?: number;
    from?: number | null;
    to?: number | null;
    itemName?: string;
    preserveState?: boolean;
    preserveScroll?: boolean;
    className?: string;
}

function stripHtmlEntities(label: string): string {
    return label
        .replace(/&laquo;/g, '«')
        .replace(/&raquo;/g, '»')
        .replace(/<[^>]*>/g, '')
        .trim();
}

/**
 * Unified, theme-aware, responsive pagination bar for all role dashboards.
 * Supports both Laravel/Inertia paginator `links` and client-side `currentPage`/`totalPages`.
 */
export function DashboardPagination({
    links,
    currentPage,
    totalPages,
    onPageChange,
    total,
    count,
    from,
    to,
    itemName = 'records',
    preserveState = true,
    preserveScroll = true,
    className = '',
}: DashboardPaginationProps) {
    const isServerPaginated = Array.isArray(links) && links.length > 0;
    const isClientPaginated = !isServerPaginated && typeof currentPage === 'number' && typeof totalPages === 'number';

    if (isServerPaginated) {
        if (total === 0 || links.length <= 3) {
            return null;
        }
    } else if (isClientPaginated) {
        if ((totalPages ?? 0) <= 1) {
            return null;
        }
    } else {
        return null;
    }

    const summaryText = (() => {
        if (typeof from === 'number' && typeof to === 'number' && typeof total === 'number') {
            return (
                <>
                    Showing <span className="font-bold text-[#0B2340] dark:text-slate-200">{from}–{to}</span> of{' '}
                    <span className="font-bold text-[#0B2340] dark:text-slate-200">{total}</span> {itemName}
                </>
            );
        }
        if (typeof count === 'number' && typeof total === 'number') {
            return (
                <>
                    Showing <span className="font-bold text-[#0B2340] dark:text-slate-200">{count}</span> of{' '}
                    <span className="font-bold text-[#0B2340] dark:text-slate-200">{total}</span> {itemName}
                </>
            );
        }
        if (typeof total === 'number') {
            return (
                <>
                    Total <span className="font-bold text-[#0B2340] dark:text-slate-200">{total}</span> {itemName}
                </>
            );
        }
        return null;
    })();

    if (isClientPaginated && typeof currentPage === 'number' && typeof totalPages === 'number' && onPageChange) {
        const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

        return (
            <div
                className={`flex flex-col items-center justify-between gap-3 border-t border-gray-100 bg-gray-50/50 px-4 py-3.5 sm:flex-row sm:px-6 dark:border-slate-800 dark:bg-slate-900/30 ${className}`}
            >
                {summaryText ? (
                    <p className="text-xs font-medium text-gray-500 dark:text-slate-400">{summaryText}</p>
                ) : (
                    <span className="text-xs font-medium text-gray-500 dark:text-slate-400">
                        Page {currentPage} of {totalPages}
                    </span>
                )}

                <nav className="flex flex-wrap items-center justify-center gap-1.5" aria-label="Pagination">
                    <button
                        type="button"
                        disabled={currentPage <= 1}
                        onClick={() => onPageChange(currentPage - 1)}
                        aria-label="Previous page"
                        className="inline-flex min-h-9 min-w-9 items-center justify-center rounded-xl border border-gray-200 bg-white px-2.5 text-xs font-bold text-gray-600 transition-colors hover:border-[var(--dashboard-primary)] hover:text-[#0B2340] disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:text-white"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>

                    <div className="flex flex-wrap items-center justify-center gap-1.5">
                        {pages.map((page) => (
                            <button
                                key={page}
                                type="button"
                                onClick={() => onPageChange(page)}
                                aria-current={page === currentPage ? 'page' : undefined}
                                className={`inline-flex min-h-8 min-w-8 sm:min-h-9 sm:min-w-9 items-center justify-center rounded-xl border px-2.5 sm:px-3 text-xs font-bold transition-colors ${
                                    page === currentPage
                                        ? 'border-[var(--dashboard-primary)] bg-[var(--dashboard-primary)] text-white shadow-xs'
                                        : 'border-gray-200 bg-white text-gray-600 hover:border-[var(--dashboard-primary)] hover:text-[#0B2340] dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:text-white'
                                }`}
                            >
                                {page}
                            </button>
                        ))}
                    </div>

                    <button
                        type="button"
                        disabled={currentPage >= totalPages}
                        onClick={() => onPageChange(currentPage + 1)}
                        aria-label="Next page"
                        className="inline-flex min-h-8 min-w-8 sm:min-h-9 sm:min-w-9 items-center justify-center rounded-xl border border-gray-200 bg-white px-2.5 text-xs font-bold text-gray-600 transition-colors hover:border-[var(--dashboard-primary)] hover:text-[#0B2340] disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:text-white"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </nav>
            </div>
        );
    }

    return (
        <div
            className={`flex flex-col items-center justify-between gap-3 border-t border-gray-100 bg-gray-50/50 px-4 py-3.5 sm:flex-row sm:px-6 dark:border-slate-800 dark:bg-slate-900/30 ${className}`}
        >
            {summaryText ? (
                <p className="text-xs font-medium text-gray-500 dark:text-slate-400">{summaryText}</p>
            ) : (
                <div />
            )}

            <nav className="flex flex-wrap items-center justify-center gap-1.5" aria-label="Pagination">
                {links?.map((link, idx) => {
                    const cleanLabel = stripHtmlEntities(link.label);
                    const isPrev = cleanLabel.toLowerCase().includes('previous') || cleanLabel.includes('«');
                    const isNext = cleanLabel.toLowerCase().includes('next') || cleanLabel.includes('»');
                    const isEllipsis = cleanLabel === '...';

                    if (isEllipsis) {
                        return (
                            <span
                                key={idx}
                                className="inline-flex min-h-8 min-w-7 sm:min-h-9 sm:min-w-8 items-center justify-center px-1 text-xs font-bold text-gray-400 dark:text-slate-500"
                            >
                                …
                            </span>
                        );
                    }

                    return (
                        <Link
                            key={idx}
                            href={link.url || '#'}
                            preserveState={preserveState}
                            preserveScroll={preserveScroll}
                            onClick={(e) => {
                                if (!link.url) e.preventDefault();
                            }}
                            aria-label={isPrev ? 'Previous page' : isNext ? 'Next page' : `Page ${cleanLabel}`}
                            aria-current={link.active ? 'page' : undefined}
                            className={`inline-flex min-h-8 min-w-8 sm:min-h-9 sm:min-w-9 items-center justify-center rounded-xl border px-2.5 sm:px-3 text-xs font-bold transition-colors ${
                                link.active
                                    ? 'border-[var(--dashboard-primary)] bg-[var(--dashboard-primary)] text-white shadow-xs'
                                    : link.url
                                      ? 'border-gray-200 bg-white text-gray-600 hover:border-[var(--dashboard-primary)] hover:text-[#0B2340] dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:text-white'
                                      : 'cursor-not-allowed border-transparent bg-gray-100 text-gray-400 dark:bg-slate-900/50 dark:text-slate-600'
                            }`}
                        >
                            {isPrev ? (
                                <ChevronLeft className="h-4 w-4" />
                            ) : isNext ? (
                                <ChevronRight className="h-4 w-4" />
                            ) : (
                                cleanLabel
                            )}
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
