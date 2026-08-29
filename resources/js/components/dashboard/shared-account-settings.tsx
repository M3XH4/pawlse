import { Form, Link, useForm, usePage } from '@inertiajs/react';
import {
    Bell,
    Camera,
    Check,
    CheckCircle2,
    Eye,
    EyeOff,
    Lock,
    Mail,
    MapPin,
    Monitor,
    Moon,
    Phone,
    Shield,
    ShieldCheck,
    Sun,
    Trash2,
    UploadCloud,
    User as UserIcon,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import SecurityController from '@/actions/App/Http/Controllers/Settings/SecurityController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { PhoneInput } from '@/components/phone-input';
import TwoFactorRecoveryCodes from '@/components/two-factor-recovery-codes';
import TwoFactorSetupModal from '@/components/two-factor-setup-modal';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAppearance } from '@/hooks/use-appearance';
import { useTwoFactorAuth } from '@/hooks/use-two-factor-auth';
import { formatPhoneNumber } from '@/lib/phone-formatter';
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

    // Profile form state
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

    const {
        data: profileData,
        setData: setProfileData,
        post: submitProfile,
        processing: profileProcessing,
        errors: profileErrors,
    } = useForm({
        _method: 'patch',
        name: user?.name || '',
        email: user?.email || '',
        phone: (user?.phone as string) || '',
        location: (user?.location as string) || '',
        avatar: null as File | null,
        remove_avatar: false,
    });

    // Keep form in sync when user prop updates
    useEffect(() => {
        if (user) {
            setProfileData((prev) => ({
                ...prev,
                name: user.name || '',
                email: user.email || '',
                phone: (user.phone as string) || '',
                location: (user.location as string) || '',
            }));
        }
    }, [user?.name, user?.email, user?.phone, user?.location]);

    const isEmailVerified = Boolean(user?.email_verified_at);

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            toast.error('Profile photo must be less than 2MB.');
            return;
        }

        setProfileData((prev) => ({
            ...prev,
            avatar: file,
            remove_avatar: false,
        }));

        const objectUrl = URL.createObjectURL(file);
        setAvatarPreview(objectUrl);
    };

    const handleRemoveAvatar = () => {
        setProfileData((prev) => ({
            ...prev,
            avatar: null,
            remove_avatar: true,
        }));
        setAvatarPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const onProfileSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        submitProfile(ProfileController.update.url(), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Profile information updated successfully!');
            },
        });
    };

    if (!user) {
        return (
            <div className="flex h-48 items-center justify-center">
                <p className="text-gray-500">Please sign in to access settings.</p>
            </div>
        );
    }

    const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.name || 'User')}&background=FF750F&color=ffffff&bold=true`;
    const displayAvatar = avatarPreview || (profileData.remove_avatar ? fallbackAvatar : (user.avatar || fallbackAvatar));

    return (
        <div className="flex flex-col gap-6 lg:flex-row">
            {/* Sidebar Navigation */}
            <aside className="w-full shrink-0 space-y-1 lg:w-64">
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
                                    'flex min-h-10 items-center gap-3 whitespace-nowrap rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 cursor-pointer',
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
                            <p className="text-sm text-gray-500 dark:text-gray-400">Update your avatar, personal details, contact number, and default location.</p>
                        </div>
                        <hr className="border-gray-100 dark:border-slate-800" />

                        {/* Modern Avatar Image Picker Banner */}
                        <div className="flex flex-col sm:flex-row items-center gap-6 rounded-2xl bg-gradient-to-r from-orange-50/70 via-amber-50/30 to-transparent p-6 border border-orange-100/80 dark:border-slate-800 dark:from-slate-950 dark:via-slate-900/50">
                            <div className="relative group">
                                <div className="relative h-28 w-28 rounded-full overflow-hidden border-4 border-white shadow-md ring-2 ring-paw-orange/40 dark:border-slate-800">
                                    <img
                                        src={displayAvatar}
                                        alt={user.name}
                                        className="h-full w-full object-cover transition duration-200 group-hover:scale-105"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                                        aria-label="Change profile photo"
                                    >
                                        <span className="text-white text-xs font-bold">Change</span>
                                    </button>
                                </div>

                                {/* Floating Camera Badge Button */}
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    title="Upload profile picture"
                                    aria-label="Upload profile picture"
                                    className="absolute bottom-0 right-0 h-9 w-9 rounded-full bg-paw-orange text-white flex items-center justify-center shadow-lg border-2 border-white dark:border-slate-900 transition-transform active:scale-95 hover:bg-orange-600 cursor-pointer z-10"
                                >
                                    <Camera className="h-4.5 w-4.5" />
                                </button>

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/png,image/jpeg,image/jpg,image/webp"
                                    className="hidden"
                                    onChange={handleAvatarChange}
                                />
                            </div>

                            <div className="text-center sm:text-left space-y-1.5 flex-1">
                                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                                    <h4 className="font-fredoka text-xl font-bold text-paw-navy dark:text-white">
                                        {user.name}
                                    </h4>
                                    <span className="inline-flex items-center rounded-full bg-paw-orange/10 px-2.5 py-0.5 text-xs font-bold text-paw-orange uppercase tracking-wider">
                                        {user.role}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Choose a friendly profile photo. Accepted formats: JPG, PNG, or WEBP (Max 2MB).
                                </p>
                                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-1">
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="text-xs font-bold text-paw-orange hover:text-orange-600 dark:hover:text-orange-400 cursor-pointer"
                                    >
                                        Upload new photo
                                    </button>
                                    {(user.avatar_path || avatarPreview) && !profileData.remove_avatar && (
                                        <>
                                            <span className="text-gray-300 dark:text-gray-700">•</span>
                                            <button
                                                type="button"
                                                onClick={handleRemoveAvatar}
                                                className="text-xs font-medium text-rose-500 hover:text-rose-600 cursor-pointer flex items-center gap-1"
                                            >
                                                <Trash2 className="h-3 w-3" /> Remove photo
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Profile Form */}
                        <form onSubmit={onProfileSubmit} className="space-y-6">
                            <div className="grid gap-5 md:grid-cols-2">
                                {/* Full Name */}
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-xs font-black uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                                        <UserIcon className="h-3.5 w-3.5 text-paw-orange" />
                                        Full Name
                                    </Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        value={profileData.name}
                                        onChange={(e) => setProfileData('name', e.target.value)}
                                        required
                                        autoComplete="name"
                                        placeholder="Your full name"
                                        className="rounded-xl border-gray-200 focus:ring-paw-orange/20 focus:border-paw-orange dark:border-slate-800 dark:bg-slate-950 font-medium"
                                    />
                                    <InputError message={profileErrors.name} />
                                </div>

                                {/* Email Address */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="email" className="text-xs font-black uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                                            <Mail className="h-3.5 w-3.5 text-paw-orange" />
                                            Email Address
                                        </Label>
                                        {isEmailVerified && (
                                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200/60 dark:border-emerald-900/60">
                                                <CheckCircle2 className="h-3 w-3" /> Verified
                                            </span>
                                        )}
                                    </div>
                                    <div className="relative">
                                        <Input
                                            id="email"
                                            type="email"
                                            name="email"
                                            value={profileData.email}
                                            onChange={(e) => setProfileData('email', e.target.value)}
                                            required
                                            readOnly={isEmailVerified}
                                            disabled={isEmailVerified}
                                            autoComplete="username"
                                            placeholder="Your email address"
                                            className={cn(
                                                "rounded-xl font-medium transition-colors",
                                                isEmailVerified
                                                    ? "bg-gray-50/90 dark:bg-slate-950/70 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-slate-800 cursor-not-allowed pr-10"
                                                    : "border-gray-200 focus:ring-paw-orange/20 focus:border-paw-orange dark:border-slate-800 dark:bg-slate-950"
                                            )}
                                        />
                                        {isEmailVerified && (
                                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                                                <Lock className="h-4 w-4" />
                                            </div>
                                        )}
                                    </div>
                                    {isEmailVerified ? (
                                        <p className="text-[11px] text-gray-400 dark:text-gray-500">
                                            Email address is verified and permanently linked to your account for security.
                                        </p>
                                    ) : (
                                        <InputError message={profileErrors.email} />
                                    )}
                                </div>

                                {/* Phone Number */}
                                <div className="space-y-2">
                                    <Label htmlFor="phone" className="text-xs font-black uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                                        <Phone className="h-3.5 w-3.5 text-paw-orange" />
                                        Phone Number
                                    </Label>
                                    <PhoneInput
                                        id="phone"
                                        name="phone"
                                        value={profileData.phone}
                                        onChange={(val) => setProfileData('phone', val)}
                                        autoComplete="tel"
                                        placeholder="+63 9XX XXX XXXX"
                                        className="rounded-xl border-gray-200 focus:ring-paw-orange/20 focus:border-paw-orange dark:border-slate-800 dark:bg-slate-950 font-medium"
                                    />
                                    <p className="text-[11px] text-gray-400 dark:text-gray-500">
                                        Optional (10 or 11 digits). Auto-fills your contact details when submitting pet reports or applications.
                                    </p>
                                    <InputError message={profileErrors.phone} />
                                </div>

                                {/* Location / Address */}
                                <div className="space-y-2">
                                    <Label htmlFor="location" className="text-xs font-black uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                                        <MapPin className="h-3.5 w-3.5 text-paw-orange" />
                                        Location / Address
                                    </Label>
                                    <Input
                                        id="location"
                                        name="location"
                                        value={profileData.location}
                                        onChange={(e) => setProfileData('location', e.target.value)}
                                        autoComplete="street-address"
                                        placeholder="e.g. Barangay San Antonio, Pasig City"
                                        className="rounded-xl border-gray-200 focus:ring-paw-orange/20 focus:border-paw-orange dark:border-slate-800 dark:bg-slate-950 font-medium"
                                    />
                                    <p className="text-[11px] text-gray-400 dark:text-gray-500">
                                        Optional. Used for default local notifications and pet assistance proximity.
                                    </p>
                                    <InputError message={profileErrors.location} />
                                </div>
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
                                    disabled={profileProcessing}
                                    className="rounded-xl bg-paw-navy text-white hover:bg-opacity-90 dark:bg-slate-100 dark:text-slate-900 px-6 font-bold cursor-pointer"
                                >
                                    {profileProcessing ? 'Saving Changes...' : 'Save Profile Changes'}
                                </Button>
                            </div>
                        </form>
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
