import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import { 
    DatabaseBackup, Plus, RefreshCw, Trash2, ShieldAlert, AlertTriangle, 
    Calendar, CheckCircle2, Clock
} from 'lucide-react';
import { DashboardSectionPage, DashboardCard } from '@/components/dashboard/section-page';
import { DashboardPagination } from '@/components/dashboard/pagination';
import { toast } from 'sonner';
import { Spinner } from '@/components/ui/spinner';
import { ModernSelect } from '@/components/ui/modern-select';

interface BackupRecord {
    id: number;
    filename: string;
    disk: string;
    size: string;
    status: 'completed' | 'failed';
    created_at: string;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface BackupRestoreProps {
    backups: {
        data: BackupRecord[];
        links: PaginationLink[];
        total: number;
    };
    settings: {
        auto_enabled: boolean;
        interval: 'daily' | 'weekly' | 'monthly';
        retention_days: number;
    };
}

export default function BackupRestore({ backups, settings }: BackupRestoreProps) {
    const [runningBackup, setRunningBackup] = useState(false);
    const [restoringBackupId, setRestoringBackupId] = useState<number | null>(null);

    const { data, setData, post, processing, errors } = useForm({
        auto_enabled: settings.auto_enabled,
        interval: settings.interval,
        retention_days: settings.retention_days,
    });

    const triggerManualBackup = () => {
        setRunningBackup(true);
        toast.info('Starting manual database dump...');
        router.post('/account/super-admin/backup-restore/run', {}, {
            onSuccess: () => {
                toast.success('Database backup created successfully.');
                setRunningBackup(false);
            },
            onError: (err: any) => {
                toast.error(err.error || 'Backup failed.');
                setRunningBackup(false);
            }
        });
    };

    const triggerRestore = (backup: BackupRecord) => {
        if (confirm(`CRITICAL WARNING: Are you sure you want to restore the database to backup "${backup.filename}"? Current unsaved changes will be overwritten.`)) {
            setRestoringBackupId(backup.id);
            toast.info('Restoring database schema and data...');
            router.post(`/account/super-admin/backup-restore/${backup.id}/restore`, {}, {
                onSuccess: () => {
                    toast.success('Database restored successfully.');
                    setRestoringBackupId(null);
                },
                onError: (err: any) => {
                    toast.error(err.error || 'Restoration failed.');
                    setRestoringBackupId(null);
                }
            });
        }
    };

    const triggerDelete = (backup: BackupRecord) => {
        if (confirm(`Are you sure you want to delete backup file "${backup.filename}"?`)) {
            router.delete(`/account/super-admin/backup-restore/${backup.id}`, {
                onSuccess: () => toast.success('Backup file deleted.'),
                onError: () => toast.error('Failed to delete backup.')
            });
        }
    };

    const handleSaveSettings = (e: React.FormEvent) => {
        e.preventDefault();
        post('/account/super-admin/backup-restore/settings', {
            onSuccess: () => toast.success('Automated backup settings updated.'),
            onError: () => toast.error('Failed to save settings.')
        });
    };

    return (
        <DashboardSectionPage
            title="Backup & Restore"
            description="Create manual database backups, configure automated scheduling, or restore system tables to a past state"
        >
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Left Columns: Backups List */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="rounded-2xl border border-gray-150 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-fredoka text-lg font-bold text-slate-800 dark:text-white">Database Backup Files</h3>
                                <p className="text-xs text-gray-500">History of database exports saved on disk</p>
                            </div>
                            <button
                                onClick={triggerManualBackup}
                                disabled={runningBackup}
                                className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-500 disabled:opacity-50 transition"
                            >
                                {runningBackup ? (
                                    <Spinner showProgress label="Backing Up..." size="xs" />
                                ) : (
                                    <>
                                        <RefreshCw className="h-3.5 w-3.5" />
                                        <span>Run Backup Now</span>
                                    </>
                                )}
                            </button>
                        </div>
                        <hr className="my-4 border-gray-100 dark:border-slate-900" />

                        {/* Backups Table */}
                        <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-slate-800">
                            <table className="w-full border-collapse text-left text-sm text-gray-500 dark:text-gray-400">
                                <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-700 dark:bg-slate-800 dark:text-gray-300">
                                    <tr>
                                        <th className="px-4 py-3">File Name</th>
                                        <th className="px-4 py-3">File Size</th>
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3">Created At</th>
                                        <th className="px-4 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 border-t border-gray-100 dark:divide-slate-900 dark:border-slate-900">
                                    {backups.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-4 py-8 text-center text-xs text-gray-400">
                                                No database backups saved yet.
                                            </td>
                                        </tr>
                                    ) : (
                                        backups.data.map((backup) => (
                                            <tr key={backup.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-900/20">
                                                <td className="px-4 py-3 font-medium text-xs text-slate-800 dark:text-white truncate max-w-xs" title={backup.filename}>
                                                    {backup.filename}
                                                </td>
                                                <td className="px-4 py-3 text-xs font-mono">{backup.size}</td>
                                                <td className="px-4 py-3">
                                                    {backup.status === 'completed' ? (
                                                        <span className="inline-flex items-center gap-1 text-emerald-600 text-xs font-bold">
                                                            <CheckCircle2 className="h-3.5 w-3.5" />
                                                            Completed
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 text-rose-500 text-xs font-bold">
                                                            <ShieldAlert className="h-3.5 w-3.5" />
                                                            Failed
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-xs">{backup.created_at}</td>
                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex justify-end gap-3 text-xs font-semibold">
                                                        <button
                                                            onClick={() => triggerRestore(backup)}
                                                            disabled={restoringBackupId !== null}
                                                            className="text-indigo-600 hover:text-indigo-900 disabled:opacity-50 flex items-center gap-0.5"
                                                        >
                                                            {restoringBackupId === backup.id ? (
                                                                <Spinner showProgress label="Restoring..." size="xs" />
                                                            ) : (
                                                                <>
                                                                    <RefreshCw className="h-3 w-3" />
                                                                    Restore
                                                                </>
                                                            )}
                                                        </button>
                                                        <button
                                                            onClick={() => triggerDelete(backup)}
                                                            className="text-rose-600 hover:text-rose-900 flex items-center gap-0.5"
                                                        >
                                                            <Trash2 className="h-3 w-3" />
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <DashboardPagination
                            links={backups.links}
                            total={backups.total}
                            count={backups.data.length}
                            itemName="backups"
                            className="mt-4 rounded-xl border border-gray-100 dark:border-slate-800"
                        />
                    </div>
                </div>

                {/* Right Column: Settings & Warning */}
                <div className="space-y-6">
                    {/* Schedule Form */}
                    <div className="rounded-2xl border border-gray-150 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                        <h3 className="font-fredoka text-lg font-bold text-slate-800 dark:text-white">Auto Backup Schedule</h3>
                        <p className="text-xs text-gray-500 mb-4">Configure automatic database cron timing</p>
                        
                        <form onSubmit={handleSaveSettings} className="space-y-4">
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="auto_enabled"
                                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                    checked={data.auto_enabled}
                                    onChange={(e) => setData('auto_enabled', e.target.checked)}
                                />
                                <label htmlFor="auto_enabled" className="text-xs font-bold text-gray-700 dark:text-gray-300 cursor-pointer">
                                    Enable Scheduled Backups
                                </label>
                            </div>

                            {data.auto_enabled && (
                                <>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 mb-1">Backup Frequency</label>
                                        <ModernSelect
                                            size="sm"
                                            searchable={false}
                                            value={data.interval}
                                            onChange={(val) => setData('interval', val as 'daily' | 'weekly' | 'monthly')}
                                            options={[
                                                { value: 'daily', label: 'Daily' },
                                                { value: 'weekly', label: 'Weekly' },
                                                { value: 'monthly', label: 'Monthly' },
                                            ]}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 mb-1">Retention Duration (Days)</label>
                                        <input
                                            type="number"
                                            required
                                            min="1"
                                            max="365"
                                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 dark:border-slate-900 dark:bg-slate-900 dark:text-white"
                                            value={data.retention_days}
                                            onChange={(e: any) => setData('retention_days', parseInt(e.target.value))}
                                        />
                                        <p className="text-[10px] text-gray-400 mt-1">Backups older than this will be deleted automatically.</p>
                                    </div>
                                </>
                            )}

                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-500 transition disabled:opacity-50"
                            >
                                Save Configuration
                            </button>
                        </form>
                    </div>

                    {/* Warning Alert */}
                    <div className="rounded-xl border border-rose-100 bg-rose-50/20 p-5 dark:border-rose-950/20 dark:bg-rose-950/5 flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-rose-500 mt-0.5 shrink-0" />
                        <div>
                            <h4 className="text-sm font-bold text-rose-800 dark:text-rose-400">Database Restoration Alert</h4>
                            <p className="text-xs text-rose-800/80 dark:text-rose-400/80 mt-1 leading-relaxed">
                                Restoring a backup will wipe all current user data, adoptions, donation verification files, 
                                and event schedules created since the backup date. Perform restorations with caution.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardSectionPage>
    );
}
