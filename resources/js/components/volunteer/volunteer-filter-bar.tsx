import { Search, X } from 'lucide-react';
import { ModernSelect } from '@/components/ui/modern-select';

export interface VolunteerFilterSelect {
    value: string;
    onChange: (value: string) => void;
    ariaLabel: string;
    defaultLabel: string;
    options: Array<{ value: string; label: string }>;
}

interface VolunteerFilterBarProps {
    search: string;
    searchPlaceholder?: string;
    onSearchChange: (value: string) => void;
    onSearchSubmit: () => void;
    selects?: VolunteerFilterSelect[];
    sort: string;
    onSortChange: (value: string) => void;
    hasActiveFilters: boolean;
    onReset: () => void;
}

export function VolunteerFilterBar({
    search,
    searchPlaceholder = 'Search...',
    onSearchChange,
    onSearchSubmit,
    selects = [],
    sort,
    onSortChange,
    hasActiveFilters,
    onReset,
}: VolunteerFilterBarProps) {
    return (
        <div className="mb-6 flex flex-col lg:flex-row gap-3">
            <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                    type="text"
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && onSearchSubmit()}
                    placeholder={searchPlaceholder}
                    className="w-full pl-10 pr-20 py-2.5 bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] rounded-xl outline-none focus:border-paw-orange transition-all font-semibold text-sm text-[#0B2340] dark:text-[#F8FAFC]"
                />
                <button
                    type="button"
                    onClick={onSearchSubmit}
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-paw-orange/10 text-paw-orange hover:bg-paw-orange hover:text-white rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
                >
                    Search
                </button>
            </div>

            <div className="grid grid-cols-2 sm:flex sm:flex-wrap sm:items-center gap-2">
                {selects.map((select) => (
                    <ModernSelect
                        key={select.ariaLabel}
                        value={select.value}
                        onChange={select.onChange}
                        size="sm"
                        searchable={false}
                        placeholder={select.defaultLabel}
                        options={[
                            { value: '', label: select.defaultLabel },
                            ...select.options,
                        ]}
                        className="w-full sm:w-auto sm:min-w-[145px]"
                        triggerClassName="bg-white dark:bg-[#1E293B] border-[#E2E8F0] dark:border-[#334155] py-2.5 text-xs font-bold"
                    />
                ))}

                <ModernSelect
                    value={sort}
                    onChange={onSortChange}
                    size="sm"
                    searchable={false}
                    options={[
                        { value: 'latest', label: 'Newest First' },
                        { value: 'oldest', label: 'Oldest First' },
                    ]}
                    className={`w-full sm:w-auto sm:min-w-[135px] ${selects.length % 2 === 0 ? 'col-span-2 sm:col-span-1' : ''}`}
                    triggerClassName="bg-white dark:bg-[#1E293B] border-[#E2E8F0] dark:border-[#334155] py-2.5 text-xs font-bold"
                />

                {hasActiveFilters && (
                    <button
                        type="button"
                        onClick={onReset}
                        className="col-span-2 sm:col-span-1 inline-flex items-center justify-center gap-1 px-3 py-2.5 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700 text-xs font-bold transition-all cursor-pointer"
                    >
                        <X size={14} />
                        Reset
                    </button>
                )}
            </div>
        </div>
    );
}
