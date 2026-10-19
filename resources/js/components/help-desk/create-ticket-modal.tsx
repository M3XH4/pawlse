import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import {
    AlertCircle,
    LifeBuoy,
    Send,
    ShieldAlert,
    X,
    Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CreateTicketModalProps {
    isOpen: boolean;
    onClose: () => void;
    role: 'user' | 'volunteer' | 'admin' | 'super-admin';
    defaultToSuperAdmin?: boolean;
}

export function CreateTicketModal({
    isOpen,
    onClose,
    role,
    defaultToSuperAdmin = false,
}: CreateTicketModalProps) {
    const isAskSuperAdmin = role === 'admin' && defaultToSuperAdmin;

    const postUrl = isAskSuperAdmin
        ? '/account/admin/help-desk/inquiry'
        : role === 'volunteer'
        ? '/account/volunteer/help-desk/tickets'
        : '/account/user/help-desk/tickets';

    const { data, setData, post, processing, errors, reset } = useForm({
        subject: '',
        category: isAskSuperAdmin ? 'Admin & System Operations' : 'General Inquiry',
        priority: 'medium',
        description: '',
    });

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(postUrl, {
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    const categories =
        role === 'volunteer'
            ? [
                  'Foster Care',
                  'Volunteer Tasks',
                  'Rescue & SOS',
                  'Donations & Inventory',
                  'Account & Technical',
                  'General Inquiry',
              ]
            : role === 'admin'
            ? [
                  'Admin & System Operations',
                  'Policy & Compliance',
                  'Financial & Donations Escalation',
                  'Adoption & Foster Dispute',
                  'Rescue & Field Emergency',
                  'Technical / Database Issue',
              ]
            : [
                  'Adoption Inquiry',
                  'Rescue & Emergency Report',
                  'Donation & Receipts',
                  'Shelter Visit & Booking',
                  'Account & Technical',
                  'General Inquiry',
              ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="relative w-full max-w-xl rounded-3xl border border-gray-100 bg-white p-6 shadow-2xl dark:border-gray-800 dark:bg-gray-900 sm:p-7">
                {/* Header */}
                <div className="flex items-start justify-between border-b border-gray-100 pb-4 dark:border-gray-800">
                    <div className="flex items-center gap-3">
                        <div
                            className={cn(
                                'flex h-10 w-10 items-center justify-center rounded-2xl',
                                isAskSuperAdmin
                                    ? 'bg-purple-100 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400'
                                    : 'bg-paw-orange/15 text-paw-orange'
                            )}
                        >
                            {isAskSuperAdmin ? (
                                <ShieldAlert className="h-5 w-5" />
                            ) : (
                                <LifeBuoy className="h-5 w-5" />
                            )}
                        </div>
                        <div>
                            <h3 className="font-fredoka text-xl font-bold text-gray-900 dark:text-white">
                                {isAskSuperAdmin
                                    ? 'Ask Super Admin for Answers'
                                    : 'Create Support Ticket'}
                            </h3>
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                {isAskSuperAdmin
                                    ? 'Submit an administrative escalation or policy inquiry to the Super Admin.'
                                    : 'Our support team and admins will review your inquiry and reply promptly.'}
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
                    {/* Category & Priority */}
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
                                Priority Level *
                            </label>
                            <select
                                value={data.priority}
                                onChange={(e) => setData('priority', e.target.value)}
                                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-800 shadow-xs focus:border-paw-orange focus:outline-none focus:ring-2 focus:ring-paw-orange/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                            >
                                <option value="low">Low (General question)</option>
                                <option value="medium">Medium (Standard request)</option>
                                <option value="high">High (Time-sensitive)</option>
                                <option value="urgent">Urgent (Immediate attention)</option>
                            </select>
                            {errors.priority && (
                                <p className="mt-1 text-xs text-red-500">{errors.priority}</p>
                            )}
                        </div>
                    </div>

                    {/* Subject */}
                    <div>
                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                            Subject / Issue Title *
                        </label>
                        <input
                            type="text"
                            placeholder="Brief summary of your question or issue"
                            value={data.subject}
                            onChange={(e) => setData('subject', e.target.value)}
                            className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs font-medium text-gray-900 placeholder-gray-400 shadow-xs focus:border-paw-orange focus:outline-none focus:ring-2 focus:ring-paw-orange/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                            required
                        />
                        {errors.subject && (
                            <p className="mt-1 text-xs text-red-500">{errors.subject}</p>
                        )}
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                            Detailed Description *
                        </label>
                        <textarea
                            rows={4}
                            placeholder="Provide all relevant details, reference numbers, or context..."
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs font-medium text-gray-900 placeholder-gray-400 shadow-xs focus:border-paw-orange focus:outline-none focus:ring-2 focus:ring-paw-orange/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                            required
                        />
                        {errors.description && (
                            <p className="mt-1 text-xs text-red-500">{errors.description}</p>
                        )}
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
                            className={cn(
                                'inline-flex items-center gap-2 rounded-xl px-5 py-2 text-xs font-bold text-white shadow-md transition-all cursor-pointer',
                                isAskSuperAdmin
                                    ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-500/25'
                                    : 'bg-paw-orange hover:bg-paw-orange-hover shadow-paw-orange/25',
                                processing && 'opacity-60 cursor-not-allowed'
                            )}
                        >
                            <Send className="h-3.5 w-3.5" />
                            {processing
                                ? 'Submitting...'
                                : isAskSuperAdmin
                                ? 'Send to Super Admin'
                                : 'Submit Ticket'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
