import { useState } from 'react';
import { router } from '@inertiajs/react';
import {
    ChevronDown,
    ChevronUp,
    Search,
    Sparkles,
    ThumbsUp,
    HelpCircle,
    BookOpen,
} from 'lucide-react';
import type { FrequentProblem } from '@/types/help-desk';
import { cn } from '@/lib/utils';

interface FrequentProblemsAccordionProps {
    problems: FrequentProblem[];
    categories: string[];
    role: 'user' | 'volunteer' | 'admin' | 'super-admin';
    helpfulRouteName?: string;
}

export function FrequentProblemsAccordion({
    problems,
    categories,
    role,
    helpfulRouteName,
}: FrequentProblemsAccordionProps) {
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [openId, setOpenId] = useState<number | null>(problems[0]?.id ?? null);
    const [likedIds, setLikedIds] = useState<Record<number, boolean>>({});

    const filtered = problems.filter((item) => {
        const matchesCategory =
            selectedCategory === 'all' || item.category === selectedCategory;
        const matchesSearch =
            !search.trim() ||
            item.title.toLowerCase().includes(search.toLowerCase()) ||
            (item.problem_description &&
                item.problem_description.toLowerCase().includes(search.toLowerCase())) ||
            item.solution.toLowerCase().includes(search.toLowerCase());

        return matchesCategory && matchesSearch;
    });

    const handleHelpful = (problem: FrequentProblem) => {
        if (likedIds[problem.id]) return;

        setLikedIds((prev) => ({ ...prev, [problem.id]: true }));

        const targetUrl =
            role === 'volunteer'
                ? `/account/volunteer/help-desk/faq/${problem.id}/helpful`
                : `/account/user/help-desk/faq/${problem.id}/helpful`;

        router.post(targetUrl, {}, { preserveScroll: true });
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search common questions & troubleshooting guides..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-xs font-medium text-gray-800 placeholder-gray-400 shadow-sm transition-all focus:border-paw-orange focus:outline-none focus:ring-2 focus:ring-paw-orange/20 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-100"
                    />
                </div>

                {categories.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                        <button
                            type="button"
                            onClick={() => setSelectedCategory('all')}
                            className={cn(
                                'rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer',
                                selectedCategory === 'all'
                                    ? 'bg-paw-orange text-white shadow-sm'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                            )}
                        >
                            All Topics
                        </button>
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                type="button"
                                onClick={() => setSelectedCategory(cat)}
                                className={cn(
                                    'rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer whitespace-nowrap',
                                    selectedCategory === cat
                                        ? 'bg-paw-orange text-white shadow-sm'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                                )}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {filtered.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-200 p-8 text-center dark:border-gray-800">
                    <BookOpen className="mx-auto mb-3 h-10 w-10 text-gray-300 dark:text-gray-600" />
                    <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
                        No frequent problems matched your search.
                    </p>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Can't find what you need? Open a support ticket below and our team will assist you!
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map((item) => {
                        const isOpen = openId === item.id;
                        return (
                            <div
                                key={item.id}
                                className={cn(
                                    'overflow-hidden rounded-2xl border transition-all duration-200',
                                    isOpen
                                        ? 'border-paw-orange/40 bg-white shadow-md dark:border-paw-orange/30 dark:bg-gray-900/90'
                                        : 'border-gray-200/80 bg-white/70 hover:border-gray-300 dark:border-gray-800 dark:bg-gray-900/40'
                                )}
                            >
                                <button
                                    type="button"
                                    onClick={() => setOpenId(isOpen ? null : item.id)}
                                    className="flex w-full items-start justify-between gap-4 p-4 text-left transition-colors cursor-pointer"
                                >
                                    <div className="flex items-start gap-3">
                                        <div
                                            className={cn(
                                                'mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-xl text-xs font-extrabold',
                                                isOpen
                                                    ? 'bg-paw-orange text-white'
                                                    : 'bg-paw-orange/10 text-paw-orange dark:bg-paw-orange/20'
                                            )}
                                        >
                                            <HelpCircle className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-bold tracking-wide text-gray-600 uppercase dark:bg-gray-800 dark:text-gray-300">
                                                    {item.category}
                                                </span>
                                                {item.helpful_count > 0 && (
                                                    <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                                                        <ThumbsUp className="h-3 w-3" />
                                                        {item.helpful_count} found helpful
                                                    </span>
                                                )}
                                            </div>
                                            <h4 className="mt-1 text-sm font-bold text-gray-900 dark:text-white">
                                                {item.title}
                                            </h4>
                                        </div>
                                    </div>
                                    <div className="mt-1 shrink-0 text-gray-400">
                                        {isOpen ? (
                                            <ChevronUp className="h-4 w-4" />
                                        ) : (
                                            <ChevronDown className="h-4 w-4" />
                                        )}
                                    </div>
                                </button>

                                {isOpen && (
                                    <div className="border-t border-gray-100 bg-gray-50/50 px-5 py-4 dark:border-gray-800/80 dark:bg-gray-900/60">
                                        {item.problem_description && (
                                            <div className="mb-3 rounded-xl bg-amber-500/10 p-3 text-xs text-amber-900 dark:text-amber-200">
                                                <strong className="font-bold">Scenario / Problem: </strong>
                                                <span>{item.problem_description}</span>
                                            </div>
                                        )}

                                        <div className="space-y-2">
                                            <div className="flex items-center gap-1.5 text-xs font-extrabold text-emerald-700 dark:text-emerald-400">
                                                <Sparkles className="h-3.5 w-3.5" />
                                                <span>How to resolve this:</span>
                                            </div>
                                            <div className="whitespace-pre-line text-xs font-medium leading-relaxed text-gray-700 dark:text-gray-300">
                                                {item.solution}
                                            </div>
                                        </div>

                                        {(role === 'user' || role === 'volunteer') && (
                                            <div className="mt-4 flex items-center justify-between border-t border-gray-200/60 pt-3 dark:border-gray-800">
                                                <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400">
                                                    Did this solve your problem?
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleHelpful(item)}
                                                    disabled={likedIds[item.id]}
                                                    className={cn(
                                                        'inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold transition-all cursor-pointer',
                                                        likedIds[item.id]
                                                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                                                            : 'bg-white text-gray-700 hover:bg-gray-100 shadow-xs border border-gray-200 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200'
                                                    )}
                                                >
                                                    <ThumbsUp className="h-3.5 w-3.5" />
                                                    {likedIds[item.id] ? 'Marked Helpful!' : 'Yes, this helped'}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
