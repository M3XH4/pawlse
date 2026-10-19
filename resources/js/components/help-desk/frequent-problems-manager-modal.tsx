import { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { BookOpen, Check, Sparkles, X } from 'lucide-react';
import type { FrequentProblem } from '@/types/help-desk';
import { cn } from '@/lib/utils';

interface FrequentProblemsManagerModalProps {
    isOpen: boolean;
    onClose: () => void;
    editingProblem: FrequentProblem | null;
    role: 'admin' | 'super-admin';
}

export function FrequentProblemsManagerModal({
    isOpen,
    onClose,
    editingProblem,
    role,
}: FrequentProblemsManagerModalProps) {
    const isEdit = Boolean(editingProblem);

    const basePath =
        role === 'super-admin'
            ? '/account/super-admin/help-desk/frequent-problems'
            : '/account/admin/help-desk/frequent-problems';

    const { data, setData, post, put, processing, errors, reset } = useForm({
        title: '',
        category: 'Adoption',
        problem_description: '',
        solution: '',
        target_audience: 'all' as 'all' | 'user' | 'volunteer' | 'admin',
        is_published: true,
        display_order: 0,
    });

    useEffect(() => {
        if (editingProblem) {
            setData({
                title: editingProblem.title,
                category: editingProblem.category,
                problem_description: editingProblem.problem_description || '',
                solution: editingProblem.solution,
                target_audience: editingProblem.target_audience,
                is_published: editingProblem.is_published,
                display_order: editingProblem.display_order,
            });
        } else {
            reset();
        }
    }, [editingProblem, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEdit && editingProblem) {
            put(`${basePath}/${editingProblem.id}`, {
                onSuccess: () => {
                    reset();
                    onClose();
                },
            });
        } else {
            post(basePath, {
                onSuccess: () => {
                    reset();
                    onClose();
                },
            });
        }
    };

    const categories = [
        'Adoption',
        'Rescue & SOS',
        'Foster Care',
        'Donations & Inventory',
        'Volunteer Tasks',
        'Account & Technical',
        'Admin & System Operations',
        'General Inquiry',
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="relative w-full max-w-2xl rounded-3xl border border-gray-100 bg-white p-6 shadow-2xl dark:border-gray-800 dark:bg-gray-900 sm:p-7">
                {/* Header */}
                <div className="flex items-start justify-between border-b border-gray-100 pb-4 dark:border-gray-800">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-100 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300">
                            <BookOpen className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="font-fredoka text-xl font-bold text-gray-900 dark:text-white">
                                {isEdit
                                    ? 'Edit Frequent Problem & Fix'
                                    : 'Add Frequent Problem & Fix'}
                            </h3>
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                Provide step-by-step guidance so users, volunteers, or admins can resolve common issues.
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-200 transition-colors cursor-pointer"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                    {/* Title */}
                    <div>
                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                            Problem Title / Question *
                        </label>
                        <input
                            type="text"
                            placeholder="e.g., How to upload verification receipt for bank transfer donations"
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                            className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs font-medium text-gray-900 placeholder-gray-400 shadow-xs focus:border-paw-orange focus:outline-none focus:ring-2 focus:ring-paw-orange/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                            required
                        />
                        {errors.title && (
                            <p className="mt-1 text-xs text-red-500">{errors.title}</p>
                        )}
                    </div>

                    {/* Category & Audience */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                                Category *
                            </label>
                            <select
                                value={data.category}
                                onChange={(e) => setData('category', e.target.value)}
                                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-800 shadow-xs focus:border-paw-orange focus:outline-none focus:ring-2 focus:ring-paw-orange/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                            >
                                {categories.map((c) => (
                                    <option key={c} value={c}>
                                        {c}
                                    </option>
                                ))}
                            </select>
                            {errors.category && (
                                <p className="mt-1 text-xs text-red-500">{errors.category}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                                Target Audience *
                            </label>
                            <select
                                value={data.target_audience}
                                onChange={(e) =>
                                    setData(
                                        'target_audience',
                                        e.target.value as 'all' | 'user' | 'volunteer' | 'admin'
                                    )
                                }
                                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-800 shadow-xs focus:border-paw-orange focus:outline-none focus:ring-2 focus:ring-paw-orange/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                            >
                                <option value="all">Everyone (All Dashboards)</option>
                                <option value="user">Users only</option>
                                <option value="volunteer">Volunteers only</option>
                                <option value="admin">Admins only</option>
                            </select>
                            {errors.target_audience && (
                                <p className="mt-1 text-xs text-red-500">
                                    {errors.target_audience}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Problem Description */}
                    <div>
                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                            Symptom / Problem Description (Optional)
                        </label>
                        <textarea
                            rows={2}
                            placeholder="Brief context on when or why this problem happens..."
                            value={data.problem_description}
                            onChange={(e) => setData('problem_description', e.target.value)}
                            className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-medium text-gray-900 placeholder-gray-400 shadow-xs focus:border-paw-orange focus:outline-none focus:ring-2 focus:ring-paw-orange/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                        />
                    </div>

                    {/* Solution */}
                    <div>
                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                            Step-by-Step Solution / How to Fix It *
                        </label>
                        <textarea
                            rows={4}
                            placeholder="1. Navigate to...\n2. Click on...\n3. If issue persists, contact..."
                            value={data.solution}
                            onChange={(e) => setData('solution', e.target.value)}
                            className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs font-medium text-gray-900 placeholder-gray-400 shadow-xs focus:border-paw-orange focus:outline-none focus:ring-2 focus:ring-paw-orange/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                            required
                        />
                        {errors.solution && (
                            <p className="mt-1 text-xs text-red-500">{errors.solution}</p>
                        )}
                    </div>

                    {/* Display Order & Is Published */}
                    <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                        <div className="flex items-center gap-3">
                            <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                                Display Order:
                            </label>
                            <input
                                type="number"
                                min={0}
                                value={data.display_order}
                                onChange={(e) =>
                                    setData('display_order', Number(e.target.value))
                                }
                                className="w-20 rounded-xl border border-gray-200 bg-white px-2 py-1 text-xs font-bold text-gray-800 text-center dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                            />
                        </div>

                        <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                                type="checkbox"
                                checked={data.is_published}
                                onChange={(e) => setData('is_published', e.target.checked)}
                                className="h-4 w-4 rounded-md border-gray-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                            />
                            <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                                Published & Visible
                            </span>
                        </label>
                    </div>

                    {/* Footer Buttons */}
                    <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-teal-500/25 hover:bg-teal-700 transition-all cursor-pointer disabled:opacity-60"
                        >
                            <Check className="h-4 w-4" />
                            {processing
                                ? 'Saving...'
                                : isEdit
                                ? 'Update Problem & Fix'
                                : 'Save Frequent Problem'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
