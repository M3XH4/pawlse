import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Settings, Save, AlertOctagon, UserPlus, ShieldAlert } from 'lucide-react';
import { DashboardSectionPage, DashboardCard } from '@/components/dashboard/section-page';
import { toast } from 'sonner';

interface SystemSettingsProps {
    settings: {
        app_name: string;
        contact_email: string;
        contact_phone: string;
        registration_enabled: boolean;
        maintenance_mode: boolean;
    };
}

export default function SystemSettings({ settings }: SystemSettingsProps) {
    const { data, setData, post, processing, errors } = useForm({
        app_name: settings.app_name,
        contact_email: settings.contact_email,
        contact_phone: settings.contact_phone,
        registration_enabled: settings.registration_enabled,
        maintenance_mode: settings.maintenance_mode,
    });

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/account/super-admin/system-settings', {
            onSuccess: () => toast.success('System settings saved successfully.'),
            onError: () => toast.error('Failed to save settings.')
        });
    };

    return (
        <DashboardSectionPage
            title="System Settings"
            description="Manage global platform configurations, accessibility settings, and maintenance overrides"
        >
            <div className="mx-auto max-w-2xl">
                <form onSubmit={handleFormSubmit} className="space-y-6">
                    <DashboardCard>
                        <h3 className="font-fredoka text-lg font-bold text-slate-800 dark:text-white mb-1">General System Configurations</h3>
                        <p className="text-xs text-gray-500 mb-4">Core variables used across the public and administrator portals</p>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Application Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 dark:border-slate-850 dark:bg-slate-850 dark:text-white"
                                    value={data.app_name}
                                    onChange={(e) => setData('app_name', e.target.value)}
                                />
                                {errors.app_name && <p className="mt-1 text-xs text-rose-500">{errors.app_name}</p>}
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1">Support Contact Email</label>
                                    <input
                                        type="email"
                                        required
                                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 dark:border-slate-850 dark:bg-slate-850 dark:text-white"
                                        value={data.contact_email}
                                        onChange={(e) => setData('contact_email', e.target.value)}
                                    />
                                    {errors.contact_email && <p className="mt-1 text-xs text-rose-500">{errors.contact_email}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1">Support Contact Phone</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 dark:border-slate-850 dark:bg-slate-850 dark:text-white"
                                        value={data.contact_phone}
                                        onChange={(e) => setData('contact_phone', e.target.value)}
                                    />
                                    {errors.contact_phone && <p className="mt-1 text-xs text-rose-500">{errors.contact_phone}</p>}
                                </div>
                            </div>
                        </div>
                    </DashboardCard>

                    <DashboardCard>
                        <h3 className="font-fredoka text-lg font-bold text-slate-800 dark:text-white mb-1">Access & Performance Rules</h3>
                        <p className="text-xs text-gray-500 mb-4">Set user sign-up rules and trigger maintenance screens</p>

                        <div className="space-y-4">
                            <div className="flex items-start gap-3 border dark:border-slate-800 p-4 rounded-xl">
                                <input
                                    type="checkbox"
                                    id="registration_enabled"
                                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 mt-1"
                                    checked={data.registration_enabled}
                                    onChange={(e) => setData('registration_enabled', e.target.checked)}
                                />
                                <div className="cursor-pointer">
                                    <label htmlFor="registration_enabled" className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                                        <UserPlus className="h-4 w-4 text-indigo-500" />
                                        Enable Public Registrations
                                    </label>
                                    <p className="text-[11px] text-gray-400 mt-0.5">
                                        When checked, users can register new accounts. If disabled, new users can only be created by system admins.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 border border-amber-100 bg-amber-50/10 dark:border-amber-950/20 p-4 rounded-xl">
                                <input
                                    type="checkbox"
                                    id="maintenance_mode"
                                    className="rounded border-gray-300 text-amber-600 focus:ring-amber-500 mt-1"
                                    checked={data.maintenance_mode}
                                    onChange={(e) => setData('maintenance_mode', e.target.checked)}
                                />
                                <div className="cursor-pointer">
                                    <label htmlFor="maintenance_mode" className="text-sm font-bold text-amber-800 dark:text-amber-400 flex items-center gap-1">
                                        <AlertOctagon className="h-4 w-4 text-amber-500" />
                                        Trigger Maintenance Mode
                                    </label>
                                    <p className="text-[11px] text-amber-800/70 dark:text-amber-400/70 mt-0.5">
                                        Forces public pages into a maintenance notice. Only authenticated admins/super-admins can bypass this screen to log in.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </DashboardCard>

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 transition disabled:opacity-50"
                        >
                            <Save className="h-4 w-4" />
                            <span>{processing ? 'Saving Settings...' : 'Save Configuration'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </DashboardSectionPage>
    );
}
