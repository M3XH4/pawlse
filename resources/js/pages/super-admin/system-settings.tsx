import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { 
    Settings, 
    Save, 
    AlertOctagon, 
    UserPlus, 
    ShieldAlert, 
    Power, 
    CheckCircle2, 
    AlertTriangle, 
    RefreshCw, 
    Info, 
    MessageSquare,
    ShieldCheck
} from 'lucide-react';
import { DashboardSectionPage, DashboardCard } from '@/components/dashboard/section-page';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

interface SystemSettingsProps {
    settings: {
        app_name: string;
        contact_email: string;
        contact_phone: string;
        registration_enabled: boolean;
        maintenance_mode: boolean;
        maintenance_message?: string;
    };
}

export default function SystemSettings({ settings }: SystemSettingsProps) {
    const defaultMaintenanceMessage = 'PAWLSE is currently taking a short paws for scheduled system maintenance. We will be back online shortly!';

    const { data, setData, post, processing, errors } = useForm({
        app_name: settings.app_name,
        contact_email: settings.contact_email,
        contact_phone: settings.contact_phone,
        registration_enabled: settings.registration_enabled,
        maintenance_mode: settings.maintenance_mode,
        maintenance_message: settings.maintenance_message || defaultMaintenanceMessage,
    });

    // Quick toggle modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMessage, setModalMessage] = useState(data.maintenance_message);
    const [isToggling, setIsToggling] = useState(false);

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/account/super-admin/system-settings', {
            onSuccess: () => toast.success('System settings saved successfully.'),
            onError: () => toast.error('Failed to save settings.'),
        });
    };

    const handleQuickToggleMaintenance = () => {
        setIsToggling(true);
        router.post(
            '/account/super-admin/system-settings/maintenance/toggle',
            {
                maintenance_message: modalMessage,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setIsModalOpen(false);
                    const willBeActive = !data.maintenance_mode;
                    setData('maintenance_mode', willBeActive);
                    if (modalMessage) {
                        setData('maintenance_message', modalMessage);
                    }
                    toast.success(
                        willBeActive
                            ? 'Maintenance mode activated. Public access is now restricted.'
                            : 'Maintenance mode deactivated. System is now live.',
                    );
                },
                onError: () => {
                    toast.error('Failed to toggle maintenance mode.');
                },
                onFinish: () => {
                    setIsToggling(false);
                },
            },
        );
    };

    return (
        <DashboardSectionPage
            title="System Settings"
            description="Manage global platform configurations, accessibility settings, and maintenance overrides"
        >
            <div className="mx-auto max-w-3xl space-y-6">
                {/* Dedicated Maintenance Control Panel */}
                <DashboardCard className={data.maintenance_mode ? 'border-amber-400/80 bg-amber-50/20 dark:border-amber-600/40 dark:bg-amber-950/20' : ''}>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <h3 className="font-fredoka text-lg font-bold text-slate-800 dark:text-white">
                                    Platform Maintenance Control
                                </h3>
                                {data.maintenance_mode ? (
                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-900 dark:border-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                                        <span className="relative flex h-2 w-2">
                                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
                                            <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
                                        </span>
                                        Active
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                        Normal / Live
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Emergency switch to take public portal offline for updates, maintenance, or data migrations.
                            </p>
                        </div>

                        {/* Quick action button */}
                        <button
                            type="button"
                            onClick={() => {
                                setModalMessage(data.maintenance_message);
                                setIsModalOpen(true);
                            }}
                            className={
                                data.maintenance_mode
                                    ? 'inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-emerald-600/20 transition hover:bg-emerald-500 active:scale-[0.98]'
                                    : 'inline-flex items-center justify-center gap-2 rounded-xl border border-amber-300 bg-amber-500 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-amber-500/20 transition hover:bg-amber-600 active:scale-[0.98] dark:border-amber-600 dark:bg-amber-600 dark:hover:bg-amber-500'
                            }
                        >
                            <Power className="h-4 w-4" />
                            <span>
                                {data.maintenance_mode
                                    ? 'Deactivate Maintenance (Go Live)'
                                    : 'Activate Maintenance Mode'}
                            </span>
                        </button>
                    </div>

                    {/* Operational explanation box */}
                    <div className="mt-4 rounded-xl border border-slate-150 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-850/40">
                        <div className="flex items-start gap-3">
                            <Info className="mt-0.5 h-4 w-4 shrink-0 text-slate-400 dark:text-slate-500" />
                            <div className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
                                <p className="font-semibold text-slate-800 dark:text-white">
                                    {data.maintenance_mode
                                        ? 'Public traffic is currently restricted.'
                                        : 'Platform is fully accessible to the public.'}
                                </p>
                                <p>
                                    When active, public visitors are shown a friendly maintenance notice.
                                    Administrators and Super Administrators bypass this restriction and can log in normally via <code className="rounded bg-slate-200 px-1 py-0.5 font-mono text-[11px] dark:bg-slate-800">/login</code> to perform administrative tasks.
                                </p>
                            </div>
                        </div>
                    </div>
                </DashboardCard>

                {/* Main Settings Form */}
                <form onSubmit={handleFormSubmit} className="space-y-6">
                    <DashboardCard>
                        <h3 className="font-fredoka text-lg font-bold text-slate-800 dark:text-white mb-1">
                            General System Configurations
                        </h3>
                        <p className="text-xs text-gray-500 mb-4">
                            Core variables used across the public and administrator portals
                        </p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">
                                    Application Name
                                </label>
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
                                    <label className="block text-xs font-semibold text-gray-500 mb-1">
                                        Support Contact Email
                                    </label>
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
                                    <label className="block text-xs font-semibold text-gray-500 mb-1">
                                        Support Contact Phone
                                    </label>
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
                        <h3 className="font-fredoka text-lg font-bold text-slate-800 dark:text-white mb-1">
                            Access & Maintenance Details
                        </h3>
                        <p className="text-xs text-gray-500 mb-4">
                            Configure user registration availability and customizable maintenance announcements
                        </p>

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
                                    <label
                                        htmlFor="registration_enabled"
                                        className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1"
                                    >
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
                                    <label
                                        htmlFor="maintenance_mode"
                                        className="text-sm font-bold text-amber-800 dark:text-amber-400 flex items-center gap-1"
                                    >
                                        <AlertOctagon className="h-4 w-4 text-amber-500" />
                                        Trigger Maintenance Mode
                                    </label>
                                    <p className="text-[11px] text-amber-800/70 dark:text-amber-400/70 mt-0.5">
                                        Forces public pages into a maintenance notice. Only authenticated admins and super-admins can bypass this screen.
                                    </p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1">
                                    <MessageSquare className="h-3.5 w-3.5 text-amber-500" />
                                    Maintenance Notice Message
                                </label>
                                <textarea
                                    rows={3}
                                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 dark:border-slate-850 dark:bg-slate-850 dark:text-white"
                                    placeholder="Enter message displayed to public visitors during maintenance..."
                                    value={data.maintenance_message}
                                    onChange={(e) => setData('maintenance_message', e.target.value)}
                                />
                                <p className="text-[11px] text-gray-400 mt-1">
                                    This explanation is displayed on the maintenance screen whenever maintenance mode is active.
                                </p>
                                {errors.maintenance_message && (
                                    <p className="mt-1 text-xs text-rose-500">{errors.maintenance_message}</p>
                                )}
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

            {/* Quick Maintenance Confirmation Dialog */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
                            {data.maintenance_mode ? (
                                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                            ) : (
                                <AlertTriangle className="h-6 w-6 text-amber-600" />
                            )}
                        </div>
                        <DialogTitle className="text-center font-fredoka text-xl">
                            {data.maintenance_mode
                                ? 'Resume Live Operations?'
                                : 'Activate Maintenance Mode?'}
                        </DialogTitle>
                        <DialogDescription className="text-center text-xs text-slate-500 dark:text-slate-400">
                            {data.maintenance_mode
                                ? 'Deactivating maintenance mode will immediately restore public access to the homepage, pet adoptions, rescue submissions, and all visitor portals.'
                                : 'Activating maintenance mode will immediately block public traffic and display the maintenance notice. Authorized administrators can still log in to manage records.'}
                        </DialogDescription>
                    </DialogHeader>

                    {!data.maintenance_mode && (
                        <div className="space-y-2 py-2">
                            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                                Visitor Announcement Notice
                            </label>
                            <textarea
                                rows={3}
                                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500 dark:border-slate-800 dark:bg-slate-850 dark:text-white"
                                value={modalMessage}
                                onChange={(e) => setModalMessage(e.target.value)}
                                placeholder="Explain why the platform is down..."
                            />
                        </div>
                    )}

                    <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 pt-2">
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            disabled={isToggling}
                            className="w-full sm:w-auto rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleQuickToggleMaintenance}
                            disabled={isToggling}
                            className={
                                data.maintenance_mode
                                    ? 'inline-flex w-full sm:w-auto items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-500 disabled:opacity-50'
                                    : 'inline-flex w-full sm:w-auto items-center justify-center gap-1.5 rounded-xl bg-amber-600 px-5 py-2 text-xs font-bold text-white hover:bg-amber-500 disabled:opacity-50'
                            }
                        >
                            {isToggling ? (
                                <>
                                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                                    <span>Processing...</span>
                                </>
                            ) : data.maintenance_mode ? (
                                <>
                                    <Power className="h-3.5 w-3.5" />
                                    <span>Yes, Go Live</span>
                                </>
                            ) : (
                                <>
                                    <Power className="h-3.5 w-3.5" />
                                    <span>Yes, Activate Maintenance</span>
                                </>
                            )}
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </DashboardSectionPage>
    );
}
