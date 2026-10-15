import React from 'react';
import { X, History, TrendingUp, Clock, CheckCircle2, Shield, Calendar, User } from 'lucide-react';
import type { CareSustainabilityHistoryItem } from '@/types/care-sustainability';

interface SustainabilityHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    history: CareSustainabilityHistoryItem[];
}

export function SustainabilityHistoryModal({
    isOpen,
    onClose,
    history,
}: SustainabilityHistoryModalProps) {
    if (!isOpen) return null;

    const getActionBadge = (action: string) => {
        switch (action) {
            case 'recalculated':
                return (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                        ⚡ Recalculated
                    </span>
                );
            case 'timer_extended':
                return (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        📈 Manual Extension
                    </span>
                );
            case 'donation_verified':
                return (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300 border border-green-200 dark:border-green-800">
                        ❤️ Donation Verified
                    </span>
                );
            case 'config_updated':
            default:
                return (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                        ⚙️ Config Updated
                    </span>
                );
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
            <div 
                className="relative w-full max-w-4xl bg-white dark:bg-[#111827] rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden text-gray-800 dark:text-gray-100 max-h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-900/40">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-paw-orange/10 text-paw-orange flex items-center justify-center font-black">
                            <History size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-paw-navy dark:text-white">Care Sustainability Calculation History</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Complete audit log of recalculations, timer extensions, and config adjustments</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Table Content */}
                <div className="p-6 overflow-y-auto space-y-4">
                    {history.length === 0 ? (
                        <div className="text-center py-12 text-gray-400">
                            <Clock size={36} className="mx-auto mb-2 opacity-40" />
                            <p className="text-sm font-bold">No sustainability adjustment history recorded yet.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto rounded-2xl border border-gray-100 dark:border-gray-800">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-gray-50 dark:bg-gray-900/80 text-[10px] uppercase font-black tracking-wider text-gray-400 border-b border-gray-100 dark:border-gray-800">
                                    <tr>
                                        <th className="py-3.5 px-4">Date & Time</th>
                                        <th className="py-3.5 px-4">Action</th>
                                        <th className="py-3.5 px-4">Amount / Days Added</th>
                                        <th className="py-3.5 px-4">Daily Rate</th>
                                        <th className="py-3.5 px-4">Endpoint After</th>
                                        <th className="py-3.5 px-4">Performed By & Notes</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800 font-medium">
                                    {history.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/40 transition-colors">
                                            <td className="py-3.5 px-4 whitespace-nowrap">
                                                <div className="font-bold text-gray-800 dark:text-gray-200">{item.created_at}</div>
                                                <div className="text-[10px] text-gray-400">{item.time_ago}</div>
                                            </td>
                                            <td className="py-3.5 px-4 whitespace-nowrap">
                                                {getActionBadge(item.action)}
                                            </td>
                                            <td className="py-3.5 px-4 whitespace-nowrap">
                                                {item.amount_added > 0 ? (
                                                    <div>
                                                        <span className="font-black text-emerald-600 dark:text-emerald-400">+₱{item.amount_added.toLocaleString()}</span>
                                                        <span className="text-[11px] text-gray-400 ml-1">({item.days_added} days)</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400">—</span>
                                                )}
                                            </td>
                                            <td className="py-3.5 px-4 whitespace-nowrap text-gray-600 dark:text-gray-300">
                                                ₱{item.daily_cost.toLocaleString()}/day
                                            </td>
                                            <td className="py-3.5 px-4 whitespace-nowrap">
                                                <span className="font-mono text-gray-800 dark:text-gray-200">{item.endpoint_after}</span>
                                            </td>
                                            <td className="py-3.5 px-4 max-w-xs">
                                                <div className="font-bold text-paw-navy dark:text-white flex items-center gap-1">
                                                    <User size={12} className="text-gray-400" />
                                                    {item.performed_by}
                                                    {item.donation_ref && (
                                                        <span className="text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-1.5 py-0.5 rounded ml-1">
                                                            #{item.donation_ref}
                                                        </span>
                                                    )}
                                                </div>
                                                {item.notes && (
                                                    <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate mt-0.5">
                                                        {item.notes}
                                                    </p>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 bg-gray-50 dark:bg-gray-900/80 border-t border-gray-100 dark:border-gray-800 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-5 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 font-bold text-xs transition-colors cursor-pointer"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
