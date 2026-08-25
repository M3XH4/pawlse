import { Form, Link, usePage } from '@inertiajs/react';
import {
    Bell,
    Check,
    Eye,
    EyeOff,
    Monitor,
    Moon,
    Shield,
    ShieldCheck,
    Sun,
    User as UserIcon,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import SecurityController from '@/actions/App/Http/Controllers/Settings/SecurityController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TwoFactorRecoveryCodes from '@/components/two-factor-recovery-codes';
import TwoFactorSetupModal from '@/components/two-factor-setup-modal';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAppearance } from '@/hooks/use-appearance';
import { useTwoFactorAuth } from '@/hooks/use-two-factor-auth';
import { cn } from '@/lib/utils';
import { send } from '@/routes/verification';
import { disable, enable } from '@/routes/two-factor';

type SharedAccountSettingsProps = {
    mustVerifyEmail?: boolean;
    status?: string;
    canManageTwoFactor?: boolean;
    requiresConfirmation?: boolean;
    twoFactorEnabled?: boolean;
};

type ActiveTab = 'profile' | 'security' | 'notifications' | 'appearance';

export default function SharedAccountSettings({
    mustVerifyEmail = false,
    status = '',
    canManageTwoFactor = false,
    requiresConfirmation = false,
    twoFactorEnabled = false,
}: SharedAccountSettingsProps) {
    const { auth } = usePage().props;
    const user = auth.user;

    const [activeTab, setActiveTab] = useState<ActiveTab>('profile');

    // Appearance State
    const { appearance, updateAppearance } = useAppearance();

    // Two Factor Authentication Setup
    const {
        qrCodeSvg,
        hasSetupData,
        manualSetupKey,
        clearSetupData,
        clearTwoFactorAuthData,
        fetchSetupData,
        recoveryCodesList,
        fetchRecoveryCodes,
        errors: tfaErrors,
    } = useTwoFactorAuth();
    
    const [showSetupModal, setShowSetupModal] = useState<boolean>(false);
    const prevTwoFactorEnabled = useRef(twoFactorEnabled);

    useEffect(() => {
        if (prevTwoFactorEnabled.current && !twoFactorEnabled) {
            clearTwoFactorAuthData();
        }
        prevTwoFactorEnabled.current = twoFactorEnabled;
    }, [twoFactorEnabled, clearTwoFactorAuthData]);

    // Local Storage Notification Preferences State
    const [notifPrefs, setNotifPrefs] = useState({
        rescues: true,
        adoptions: true,
        volunteers: false,
        digest: true,
        security: true,
    });

    useEffect(() => {
        const stored = localStorage.getItem('pawlse-notif-prefs');
        if (stored) {
            try {
                setNotifPrefs(JSON.parse(stored));
            } catch (e) {
                // Ignore parsing errors
            }
        }
    }, []);

    const saveNotifPrefs = () => {
        localStorage.setItem('pawlse-notif-prefs', JSON.stringify(notifPrefs));
        toast.success('Notification preferences updated successfully!');
    };

    if (!user) {
        return (
            <div className="flex h-48 items-center justify-center">
                <p className="text-gray-500">Please sign in to access settings.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 lg:flex-row">
            {/* Sidebar Navigation */}
            <aside className="w-full shrink-0 space-y-1 lg:w-64">
                <div className="mb-4 px-3">
                    <h3 className="font-fredoka text-lg font-bold text-paw-navy dark:text-white">Settings Menu</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Manage account information and security</p>
                </div>
                <nav className="flex flex-row gap-1 overflow-x-auto pb-2 lg:flex-col lg:overflow-x-visible lg:pb-0">
                    {(
                        [
                            { id: 'profile', label: 'Profile Information', icon: UserIcon },
                            { id: 'security', label: 'Password & Security', icon: Shield },
                            { id: 'notifications', label: 'Notifications', icon: Bell },
                            { id: 'appearance', label: 'Theme & Appearance', icon: Sun },
                        ] as const
                    ).map((tab) => {
                        const active = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    'flex min-h-10 items-center gap-3 whitespace-nowrap rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200',
                                    active
                                        ? 'bg-gradient-to-r from-[var(--dashboard-primary-from)] to-[var(--dashboard-primary-to)] text-white shadow-xs'
                                        : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-slate-800'
                                )}
                            >
                                <tab.icon className="h-4.5 w-4.5" />
                                {tab.label}
                            </button>
                        );
                    })}
                </nav>
            </aside>

            {/* Settings Tab Content Wrapper */}
            <div className="flex-1 rounded-2xl border border-gray-100 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                {activeTab === 'profile' && (
                    <div className="space-y-6">
                        <div>
                            <h3 className="font-fredoka text-xl font-bold text-paw-navy dark:text-white">Profile Information</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Update your account's profile name and email address.</p>
                        </div>
                        <hr className="border-gray-100 dark:border-slate-800" />
                        <Form
                            action={ProfileController.update.url()}
                            method="patch"
                            options={{
                                preserveScroll: true,
                                onSuccess: () => toast.success('Profile updated successfully!'),
                            }}
                            className="space-y-6 max-w-xl"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Full Name</Label>
                                        <Input
                                            id="name"
                                            name="name"
                                            defaultValue={user.name}
                                            required
                                            autoComplete="name"
                                            placeholder="Your full name"
                                            className="rounded-xl border-gray-200 focus:ring-[var(--dashboard-ring)] dark:border-slate-800 dark:bg-slate-950"
                                        />
                                        <InputError message={errors.name} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email Address</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            name="email"
                                            defaultValue={user.email}
                                            required
                                            autoComplete="username"
                                            placeholder="Your email address"
                                            className="rounded-xl border-gray-200 focus:ring-[var(--dashboard-ring)] dark:border-slate-800 dark:bg-slate-950"
                                        />
                                        <InputError message={errors.email} />
                                    </div>

                                    {mustVerifyEmail && user.email_verified_at === null && (
                                        <div className="rounded-xl bg-amber-50 p-4 border border-amber-250 dark:bg-amber-950/20 dark:border-amber-900/50">
                                            <p className="text-sm text-amber-800 dark:text-amber-300">
                                                Your email address is unverified.{' '}
                                                <Link
                                                    href={send()}
                                                    as="button"
                                                    className="font-bold underline hover:text-amber-950 dark:hover:text-amber-100"
                                                    onSuccess={() => toast.success('Verification email sent!')}
                                                >
                                                    Click here to resend the verification email.
                                                </Link>
                                            </p>
                                            {status === 'verification-link-sent' && (
                                                <div className="mt-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                                                    A new verification link has been sent to your email address.
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div className="flex justify-end pt-2">
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                            className="rounded-xl bg-paw-navy text-white hover:bg-opacity-90 dark:bg-slate-100 dark:text-slate-900"
                                        >
                                            {processing ? 'Saving...' : 'Save Profile'}
                                        </Button>
                                    </div>
                                </>
                            )}
                        </Form>
                    </div>
                )}

                {activeTab === 'security' && (
                    <div className="space-y-8">
                        {/* Password Settings */}
                        <div className="space-y-6">
                            <div>
                                <h3 className="font-fredoka text-xl font-bold text-paw-navy dark:text-white">Update Password</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Ensure your account is using a long, random password to stay secure.</p>
                            </div>
                            <hr className="border-gray-100 dark:border-slate-800" />
                            <Form
                                action={SecurityController.update.url()}
                                method="put"
                                options={{
                                    preserveScroll: true,
                                    onSuccess: () => toast.success('Password updated successfully!'),
                                }}
                                resetOnSuccess
                                className="space-y-6 max-w-xl"
                            >
                                {({ errors, processing }) => (
                                    <>
                                        <div className="space-y-2">
                                            <Label htmlFor="current_password">Current Password</Label>
                                            <PasswordInput
                                                id="current_password"
                                                name="current_password"
                                                autoComplete="current-password"
                                                placeholder="Current password"
                                                className="rounded-xl border-gray-200 dark:border-slate-800 dark:bg-slate-950"
                                            />
                                            <InputError message={errors.current_password} />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="password">New Password</Label>
                                            <PasswordInput
                                                id="password"
                                                name="password"
                                                autoComplete="new-password"
                                                placeholder="New password"
                                                className="rounded-xl border-gray-200 dark:border-slate-800 dark:bg-slate-950"
                                            />
                                            <InputError message={errors.password} />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="password_confirmation">Confirm Password</Label>
                                            <PasswordInput
                                                id="password_confirmation"
                                                name="password_confirmation"
                                                autoComplete="new-password"
                                                placeholder="Confirm password"
                                                className="rounded-xl border-gray-200 dark:border-slate-800 dark:bg-slate-950"
                                            />
                                            <InputError message={errors.password_confirmation} />
                                        </div>

                                        <div className="flex justify-end pt-2">
                                            <Button
                                                type="submit"
                                                disabled={processing}
                                                className="rounded-xl bg-paw-navy text-white hover:bg-opacity-90 dark:bg-slate-100 dark:text-slate-900"
                                            >
                                                {processing ? 'Updating...' : 'Save Password'}
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </Form>
                        </div>

                        {/* Two Factor Authentication */}
                        {canManageTwoFactor && (
                            <div className="space-y-6 pt-4 border-t border-gray-100 dark:border-slate-800">
                                <div>
                                    <h3 className="font-fredoka text-xl font-bold text-paw-navy dark:text-white">Two-Factor Authentication</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Add additional security to your account using 2FA.</p>
                                </div>
                                <div className="max-w-xl">
                                    {twoFactorEnabled ? (
                                        <div className="space-y-4">
                                            <div className="rounded-xl bg-emerald-50/50 border border-emerald-200 p-4 dark:bg-emerald-950/10 dark:border-emerald-900/50">
                                                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-400 font-semibold text-sm">
                                                    <ShieldCheck className="h-5 w-5" />
                                                    Two-factor authentication is active.
                                                </div>
                                                <p className="mt-1 text-xs text-emerald-700/80 dark:text-emerald-400/80">
                                                    Your account is now extra secure. When logging in, you will be prompted for a verification code.
                                                </p>
                                            </div>

                                            <div className="flex flex-wrap gap-3">
                                                <Form action={disable.url()} method="delete" onSuccess={() => toast.success('2FA Disabled')}>
                                                    {({ processing }) => (
                                                        <Button
                                                            variant="destructive"
                                                            type="submit"
                                                            disabled={processing}
                                                            className="rounded-xl"
                                                        >
                                                            Disable 2FA
                                                        </Button>
                                                    )}
                                                </Form>

                                                <TwoFactorRecoveryCodes
                                                    recoveryCodesList={recoveryCodesList}
                                                    fetchRecoveryCodes={fetchRecoveryCodes}
                                                    errors={tfaErrors}
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                When two-factor authentication is enabled, you will be prompted for a secure, random token during authentication. You may retrieve this token from your phone's Google Authenticator, Authy, or other TOTP application.
                                            </p>
                                            <div>
                                                {hasSetupData ? (
                                                    <Button
                                                        onClick={() => setShowSetupModal(true)}
                                                        className="rounded-xl bg-paw-navy text-white dark:bg-slate-100 dark:text-slate-900"
                                                    >
                                                        Continue setup
                                                    </Button>
                                                ) : (
                                                    <Form
                                                        action={enable.url()}
                                                        method="post"
                                                        onSuccess={() => {
                                                            fetchSetupData();
                                                            setShowSetupModal(true);
                                                        }}
                                                    >
                                                        {({ processing }) => (
                                                            <Button
                                                                type="submit"
                                                                disabled={processing}
                                                                className="rounded-xl bg-paw-navy text-white dark:bg-slate-100 dark:text-slate-900"
                                                            >
                                                                Enable 2FA
                                                            </Button>
                                                        )}
                                                    </Form>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    <TwoFactorSetupModal
                                        isOpen={showSetupModal}
                                        onClose={() => setShowSetupModal(false)}
                                        requiresConfirmation={requiresConfirmation}
                                        twoFactorEnabled={twoFactorEnabled}
                                        qrCodeSvg={qrCodeSvg}
                                        manualSetupKey={manualSetupKey}
                                        clearSetupData={clearSetupData}
                                        fetchSetupData={fetchSetupData}
                                        errors={tfaErrors}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'notifications' && (
                    <div className="space-y-6">
                        <div>
                            <h3 className="font-fredoka text-xl font-bold text-paw-navy dark:text-white">Notification Preferences</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Configure how and when you receive notifications from the platform.</p>
                        </div>
                        <hr className="border-gray-100 dark:border-slate-800" />
                        
                        <div className="space-y-5 max-w-xl">
                            <div className="flex items-start gap-3">
                                <Checkbox
                                    id="notif-rescues"
                                    checked={notifPrefs.rescues}
                                    onCheckedChange={(checked) =>
                                        setNotifPrefs((prev) => ({ ...prev, rescues: !!checked }))
                                    }
                                    className="mt-1"
                                />
                                <div className="space-y-1">
                                    <Label htmlFor="notif-rescues" className="text-sm font-semibold cursor-pointer">Rescue Reports Alerts</Label>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Receive immediate notifications when new rescue cases are reported in your area.</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Checkbox
                                    id="notif-adoptions"
                                    checked={notifPrefs.adoptions}
                                    onCheckedChange={(checked) =>
                                        setNotifPrefs((prev) => ({ ...prev, adoptions: !!checked }))
                                    }
                                    className="mt-1"
                                />
                                <div className="space-y-1">
                                    <Label htmlFor="notif-adoptions" className="text-sm font-semibold cursor-pointer">Adoption Status Updates</Label>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Get notified when there's an update on pet adoption applications or files.</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Checkbox
                                    id="notif-volunteers"
                                    checked={notifPrefs.volunteers}
                                    onCheckedChange={(checked) =>
                                        setNotifPrefs((prev) => ({ ...prev, volunteers: !!checked }))
                                    }
                                    className="mt-1"
                                />
                                <div className="space-y-1">
                                    <Label htmlFor="notif-volunteers" className="text-sm font-semibold cursor-pointer">Volunteer Registrations</Label>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Receive alerts when new volunteer applications are submitted (Admins only).</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Checkbox
                                    id="notif-digest"
                                    checked={notifPrefs.digest}
                                    onCheckedChange={(checked) =>
                                        setNotifPrefs((prev) => ({ ...prev, digest: !!checked }))
                                    }
                                    className="mt-1"
                                />
                                <div className="space-y-1">
                                    <Label htmlFor="notif-digest" className="text-sm font-semibold cursor-pointer">Weekly Summary Digest</Label>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Receive a weekly overview of platform activities, events, and totals.</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Checkbox
                                    id="notif-security"
                                    checked={notifPrefs.security}
                                    onCheckedChange={(checked) =>
                                        setNotifPrefs((prev) => ({ ...prev, security: !!checked }))
                                    }
                                    className="mt-1"
                                />
                                <div className="space-y-1">
                                    <Label htmlFor="notif-security" className="text-sm font-semibold cursor-pointer">Security Alerts</Label>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Always recommend keeping this checked to get alert on logins or password updates.</p>
                                </div>
                            </div>

                            <div className="flex justify-end pt-4">
                                <Button
                                    onClick={saveNotifPrefs}
                                    className="rounded-xl bg-paw-navy text-white hover:bg-opacity-90 dark:bg-slate-100 dark:text-slate-900"
                                >
                                    Save Preferences
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'appearance' && (
                    <div className="space-y-6">
                        <div>
                            <h3 className="font-fredoka text-xl font-bold text-paw-navy dark:text-white">Theme &amp; Appearance</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Personalize how the application looks on your current device.</p>
                        </div>
                        <hr className="border-gray-100 dark:border-slate-800" />
                        
                        <div className="grid gap-4 max-w-xl sm:grid-cols-3">
                            {(
                                [
                                    { value: 'light', icon: Sun, label: 'Light Mode', desc: 'Clean and bright visual style.' },
                                    { value: 'dark', icon: Moon, label: 'Dark Mode', desc: 'Reduced glare for low light.' },
                                    { value: 'system', icon: Monitor, label: 'System Default', desc: 'Syncs with your device theme.' },
                                ] as const
                            ).map((themeOption) => {
                                const selected = appearance === themeOption.value;
                                return (
                                    <button
                                        key={themeOption.value}
                                        onClick={() => {
                                            updateAppearance(themeOption.value);
                                            toast.success(`Theme switched to ${themeOption.label}!`);
                                        }}
                                        className={cn(
                                            'flex flex-col items-center gap-3 rounded-2xl border p-5 text-center transition-all duration-200',
                                            selected
                                                ? 'border-paw-navy bg-paw-navy/5 text-paw-navy dark:border-slate-100 dark:bg-slate-800 dark:text-slate-100'
                                                : 'border-gray-100 bg-white hover:border-gray-200 dark:border-slate-800 dark:bg-slate-950'
                                        )}
                                    >
                                        <themeOption.icon className="h-6 w-6 shrink-0" />
                                        <div>
                                            <div className="text-sm font-bold">{themeOption.label}</div>
                                            <p className="mt-1 text-[11px] leading-tight text-gray-400 dark:text-gray-500">
                                                {themeOption.desc}
                                            </p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
