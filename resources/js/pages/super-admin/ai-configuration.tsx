import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import { 
    Sparkles, Percent, Target, Zap, CheckCircle2, XCircle, RotateCcw,
    AlertCircle, Activity
} from 'lucide-react';
import { DashboardSectionPage, DashboardCard } from '@/components/dashboard/section-page';
import { toast } from 'sonner';

interface PredictionLog {
    id: number;
    feature: string;
    input_data: any;
    output_data: any;
    confidence: number | null;
    is_accurate: boolean | null;
    created_at: string;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface AiConfigurationProps {
    settings: {
        ai_enabled: boolean;
        ai_reporting_enabled: boolean;
        ai_identifying_enabled: boolean;
        ai_confidence_threshold: number;
        ai_auto_validation: boolean;
    };
    logs: {
        data: PredictionLog[];
        links: PaginationLink[];
        total: number;
    };
    stats: {
        total_requests: number;
        average_confidence: number;
        accuracy_rate: number;
    };
}

export default function AiConfiguration({ settings, logs, stats }: AiConfigurationProps) {
    const { data, setData, post, processing } = useForm({
        ai_enabled: settings.ai_enabled,
        ai_reporting_enabled: settings.ai_reporting_enabled,
        ai_identifying_enabled: settings.ai_identifying_enabled,
        ai_confidence_threshold: settings.ai_confidence_threshold,
        ai_auto_validation: settings.ai_auto_validation,
    });

    const handleSaveConfig = (e: React.FormEvent) => {
        e.preventDefault();
        post('/account/super-admin/ai-configuration/settings', {
            onSuccess: () => toast.success('AI configurations saved.'),
            onError: () => toast.error('Failed to save AI configurations.')
        });
    };

    const handleCalibrateAccuracy = (logId: number, accuracy: boolean | null) => {
        router.post(`/account/super-admin/ai-configuration/logs/${logId}/accuracy`, {
            is_accurate: accuracy
        }, {
            onSuccess: () => toast.success('Accuracy calibration saved.'),
            onError: () => toast.error('Failed to calibrate prediction.')
        });
    };

    const formatInputData = (log: PredictionLog) => {
        if (!log.input_data) return 'None';
        if (log.feature === 'pet_prediction') {
            return `Image: ${log.input_data.image_name || 'Uploaded File'}`;
        }
        return JSON.stringify(log.input_data);
    };

    const formatOutputData = (log: PredictionLog) => {
        if (!log.output_data) return 'None';
        if (log.feature === 'pet_prediction') {
            const predictions = log.output_data.predictions || [];
            if (predictions.length > 0) {
                return `Species: ${predictions[0].label || 'unknown'} (${Math.round(predictions[0].confidence * 100)}%)`;
            }
            return log.output_data.label 
                ? `Species: ${log.output_data.label} (${Math.round((log.output_data.confidence || 0) * 100)}%)`
                : JSON.stringify(log.output_data);
        }
        if (log.feature === 'name_generation') {
            const names = log.output_data.names || log.output_data.suggestions || [];
            return Array.isArray(names) ? `Generated Names: ${names.slice(0, 3).join(', ')}` : JSON.stringify(log.output_data);
        }
        return JSON.stringify(log.output_data);
    };

    return (
        <DashboardSectionPage
            title="AI Configuration"
            description="Manage integrated machine learning services, confidence settings, and review predictive model performance"
        >
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Left Columns: Config Panel & Logs */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Settings Form */}
                    <div className="rounded-2xl border border-gray-150 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                        <h3 className="font-fredoka text-lg font-bold text-slate-800 dark:text-white">Predictive Model Rules</h3>
                        <p className="text-xs text-gray-500 mb-4">Toggle features and change score thresholds</p>
                        
                        <form onSubmit={handleSaveConfig} className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="flex items-center gap-2 border dark:border-slate-800 p-3 rounded-xl">
                                    <input
                                        type="checkbox"
                                        id="ai_enabled"
                                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                        checked={data.ai_enabled}
                                        onChange={(e) => setData('ai_enabled', e.target.checked)}
                                    />
                                    <label htmlFor="ai_enabled" className="text-xs font-bold text-gray-700 dark:text-gray-300 cursor-pointer">
                                        Enable AI Integrations (Global)
                                    </label>
                                </div>

                                <div className="flex items-center gap-2 border dark:border-slate-800 p-3 rounded-xl">
                                    <input
                                        type="checkbox"
                                        id="ai_reporting_enabled"
                                        disabled={!data.ai_enabled}
                                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 disabled:opacity-50"
                                        checked={data.ai_reporting_enabled}
                                        onChange={(e) => setData('ai_reporting_enabled', e.target.checked)}
                                    />
                                    <label htmlFor="ai_reporting_enabled" className="text-xs font-bold text-gray-700 dark:text-gray-300 cursor-pointer">
                                        AI Pet Reports Validation
                                    </label>
                                </div>

                                <div className="flex items-center gap-2 border dark:border-slate-800 p-3 rounded-xl">
                                    <input
                                        type="checkbox"
                                        id="ai_identifying_enabled"
                                        disabled={!data.ai_enabled}
                                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 disabled:opacity-50"
                                        checked={data.ai_identifying_enabled}
                                        onChange={(e) => setData('ai_identifying_enabled', e.target.checked)}
                                    />
                                    <label htmlFor="ai_identifying_enabled" className="text-xs font-bold text-gray-700 dark:text-gray-300 cursor-pointer">
                                        AI Breed & Species Identification
                                    </label>
                                </div>

                                <div className="flex items-center gap-2 border dark:border-slate-800 p-3 rounded-xl">
                                    <input
                                        type="checkbox"
                                        id="ai_auto_validation"
                                        disabled={!data.ai_enabled}
                                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 disabled:opacity-50"
                                        checked={data.ai_auto_validation}
                                        onChange={(e) => setData('ai_auto_validation', e.target.checked)}
                                    />
                                    <label htmlFor="ai_auto_validation" className="text-xs font-bold text-gray-700 dark:text-gray-300 cursor-pointer">
                                        Auto-approve High Confidence Reports
                                    </label>
                                </div>
                            </div>

                            {data.ai_enabled && (
                                <div className="border dark:border-slate-800 p-4 rounded-xl">
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="block text-xs font-semibold text-gray-500">Confidence Score Threshold</label>
                                        <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">
                                            {Math.round(data.ai_confidence_threshold * 100)}%
                                        </span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.05"
                                        className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                                        value={data.ai_confidence_threshold}
                                        onChange={(e: any) => setData('ai_confidence_threshold', parseFloat(e.target.value))}
                                    />
                                    <p className="text-[10px] text-gray-400 mt-2">
                                        Reports with AI confidence above this setting can bypass manual review if Auto-approve is enabled.
                                    </p>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-500 disabled:opacity-50 transition"
                            >
                                <Sparkles className="h-4 w-4" />
                                <span>Save Rules Configuration</span>
                            </button>
                        </form>
                    </div>

                    {/* AI Prediction logs */}
                    <div className="rounded-2xl border border-gray-150 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                        <h3 className="font-fredoka text-lg font-bold text-slate-800 dark:text-white">AI Log Calibration</h3>
                        <p className="text-xs text-gray-500 mb-4">Validate predictions manually to calibrate platform accuracy stats</p>
                        
                        <div className="overflow-hidden rounded-xl border border-gray-100 dark:border-slate-800">
                            <table className="w-full border-collapse text-left text-sm text-gray-500 dark:text-gray-400">
                                <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-700 dark:bg-slate-800 dark:text-gray-300">
                                    <tr>
                                        <th className="px-4 py-3">Feature</th>
                                        <th className="px-4 py-3">Input Data</th>
                                        <th className="px-4 py-3">AI Prediction</th>
                                        <th className="px-4 py-3">Confidence</th>
                                        <th className="px-4 py-3">Calibrated Acc.</th>
                                        <th className="px-4 py-3 text-right">Calibrate Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 border-t border-gray-100 dark:divide-slate-850 dark:border-slate-850">
                                    {logs.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-4 py-8 text-center text-xs text-gray-400">
                                                No AI predictions logged yet.
                                            </td>
                                        </tr>
                                    ) : (
                                        logs.data.map((log) => (
                                            <tr key={log.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-850/20">
                                                <td className="px-4 py-3 font-semibold text-xs text-indigo-600 dark:text-indigo-400 uppercase">
                                                    {log.feature.replace('_', ' ')}
                                                </td>
                                                <td className="px-4 py-3 text-xs truncate max-w-xs">{formatInputData(log)}</td>
                                                <td className="px-4 py-3 text-xs font-medium text-slate-800 dark:text-white truncate max-w-xs">{formatOutputData(log)}</td>
                                                <td className="px-4 py-3 text-xs font-mono">
                                                    {log.confidence ? `${Math.round(log.confidence * 100)}%` : '—'}
                                                </td>
                                                <td className="px-4 py-3 text-xs">
                                                    {log.is_accurate === null ? (
                                                        <span className="text-gray-400">Not verified</span>
                                                    ) : log.is_accurate ? (
                                                        <span className="inline-flex items-center gap-0.5 text-emerald-600 font-bold">
                                                            <CheckCircle2 className="h-3.5 w-3.5" /> Correct
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-0.5 text-rose-500 font-bold">
                                                            <XCircle className="h-3.5 w-3.5" /> Incorrect
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex justify-end gap-2 text-xs font-bold">
                                                        <button
                                                            onClick={() => handleCalibrateAccuracy(log.id, true)}
                                                            className={`p-1 rounded-md border ${
                                                                log.is_accurate === true ? 'bg-emerald-50 text-emerald-600 border-emerald-300' : 'text-gray-400 hover:text-emerald-600 border-gray-200'
                                                            }`}
                                                            title="Mark as Accurate"
                                                        >
                                                            <CheckCircle2 className="h-3.5 w-3.5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleCalibrateAccuracy(log.id, false)}
                                                            className={`p-1 rounded-md border ${
                                                                log.is_accurate === false ? 'bg-rose-50 text-rose-600 border-rose-300' : 'text-gray-400 hover:text-rose-600 border-gray-200'
                                                            }`}
                                                            title="Mark as Inaccurate"
                                                        >
                                                            <XCircle className="h-3.5 w-3.5" />
                                                        </button>
                                                        {log.is_accurate !== null && (
                                                            <button
                                                                onClick={() => handleCalibrateAccuracy(log.id, null)}
                                                                className="p-1 rounded-md border text-gray-400 hover:text-gray-600 border-gray-200"
                                                                title="Clear calibration"
                                                            >
                                                                <RotateCcw className="h-3.5 w-3.5" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {logs.links.length > 3 && (
                            <div className="flex items-center justify-between mt-4">
                                <p className="text-[11px] text-gray-500">
                                    Total AI transactions: <span className="font-medium">{logs.total}</span>
                                </p>
                                <nav className="isolate inline-flex -space-x-px rounded-md shadow-xs" aria-label="Pagination">
                                    {logs.links.map((link, idx) => (
                                        <button
                                            key={idx}
                                            disabled={!link.url}
                                            onClick={() => link.url && router.visit(link.url)}
                                            className={`relative inline-flex items-center px-3 py-1.5 text-xs font-semibold ${
                                                link.active
                                                    ? 'z-10 bg-indigo-600 text-white'
                                                    : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:text-gray-300 dark:ring-slate-850'
                                            } ${idx === 0 ? 'rounded-l-md' : ''} ${
                                                idx === logs.links.length - 1 ? 'rounded-r-md' : ''
                                            }`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </nav>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Stats Overview */}
                <div className="space-y-6">
                    {/* Performance Cards */}
                    <div className="rounded-2xl border border-gray-150 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                        <h3 className="font-fredoka text-lg font-bold text-slate-800 dark:text-white">AI Health Statistics</h3>
                        <p className="text-xs text-gray-500 mb-4">Core performance tracking metrics</p>
                        
                        <div className="space-y-4">
                            <div className="p-3 border dark:border-slate-800 rounded-xl flex items-center justify-between">
                                <div>
                                    <span className="text-xs font-semibold text-gray-400">Total Requests</span>
                                    <h4 className="font-fredoka text-xl font-bold mt-1 text-slate-800 dark:text-white">{stats.total_requests}</h4>
                                </div>
                                <Activity className="h-5 w-5 text-indigo-500" />
                            </div>

                            <div className="p-3 border dark:border-slate-800 rounded-xl flex items-center justify-between">
                                <div>
                                    <span className="text-xs font-semibold text-gray-400">Average Score Confidence</span>
                                    <h4 className="font-fredoka text-xl font-bold mt-1 text-slate-800 dark:text-white">{Math.round(stats.average_confidence * 100)}%</h4>
                                </div>
                                <Percent className="h-5 w-5 text-cyan-500" />
                            </div>

                            <div className="p-3 border dark:border-slate-800 rounded-xl flex items-center justify-between">
                                <div>
                                    <span className="text-xs font-semibold text-gray-400">Calibrated Accuracy Rate</span>
                                    <h4 className="font-fredoka text-xl font-bold mt-1 text-emerald-600">{stats.accuracy_rate}%</h4>
                                </div>
                                <Target className="h-5 w-5 text-emerald-500" />
                            </div>
                        </div>
                    </div>

                    {/* Quick Tips */}
                    <div className="rounded-xl border border-indigo-100 bg-indigo-50/20 p-5 dark:border-indigo-950/20 dark:bg-indigo-950/5 flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-indigo-500 mt-0.5 shrink-0" />
                        <div>
                            <h4 className="text-sm font-bold text-indigo-800 dark:text-indigo-400">Model Tuning Advice</h4>
                            <p className="text-xs text-indigo-800/80 dark:text-indigo-400/80 mt-1 leading-relaxed">
                                Calibrate recent predictions to recalculate accuracy. If accuracy falls below 75%, 
                                consider raising the Confidence Score Threshold to filter out weaker model guesses.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardSectionPage>
    );
}
