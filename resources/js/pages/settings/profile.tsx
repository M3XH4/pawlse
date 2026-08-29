import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
    Camera,
    CheckCircle2,
    Lock,
    Mail,
    MapPin,
    Phone,
    Trash2,
    User as UserIcon,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import DeleteUser from '@/components/delete-user';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { PhoneInput } from '@/components/phone-input';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { edit } from '@/routes/profile';
import { send } from '@/routes/verification';

export default function Profile({
    mustVerifyEmail,
    status,
}: {
    mustVerifyEmail: boolean;
    status?: string;
}) {
    const { auth } = usePage().props;
    const user = auth.user;

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

    const {
        data,
        setData,
        post: submitProfile,
        processing,
        errors,
    } = useForm({
        _method: 'patch',
        name: user?.name || '',
        email: user?.email || '',
        phone: (user?.phone as string) || '',
        location: (user?.location as string) || '',
        avatar: null as File | null,
        remove_avatar: false,
    });

    useEffect(() => {
        if (user) {
            setData((prev) => ({
                ...prev,
                name: user.name || '',
                email: user.email || '',
                phone: (user.phone as string) || '',
                location: (user.location as string) || '',
            }));
        }
    }, [user?.name, user?.email, user?.phone, user?.location]);

    if (!user) {
        return null;
    }

    const isEmailVerified = Boolean(user.email_verified_at);

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            toast.error('Profile photo must be less than 2MB.');
            return;
        }

        setData((prev) => ({
            ...prev,
            avatar: file,
            remove_avatar: false,
        }));

        const objectUrl = URL.createObjectURL(file);
        setAvatarPreview(objectUrl);
    };

    const handleRemoveAvatar = () => {
        setData((prev) => ({
            ...prev,
            avatar: null,
            remove_avatar: true,
        }));
        setAvatarPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        submitProfile(ProfileController.update.url(), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => toast.success('Profile updated successfully!'),
        });
    };

    const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name || 'User')}&background=FF750F&color=ffffff&bold=true`;
    const displayAvatar = avatarPreview || (data.remove_avatar ? fallbackAvatar : (user.avatar || fallbackAvatar));

    return (
        <>
            <Head title="Profile settings" />

            <h1 className="sr-only">Profile settings</h1>

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title="Profile information"
                    description="Update your photo, personal details, contact number, and default location."
                />

                {/* Avatar Picker */}
                <div className="flex flex-col sm:flex-row items-center gap-6 rounded-2xl bg-gradient-to-r from-orange-50/70 via-amber-50/30 to-transparent p-6 border border-orange-100/80 dark:border-slate-800 dark:from-slate-950 dark:via-slate-900/50">
                    <div className="relative group">
                        <div className="relative h-24 w-24 rounded-full overflow-hidden border-4 border-white shadow-md ring-2 ring-paw-orange/40 dark:border-slate-800">
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
                            className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-paw-orange text-white flex items-center justify-center shadow-lg border-2 border-white dark:border-slate-900 transition-transform active:scale-95 hover:bg-orange-600 cursor-pointer z-10"
                        >
                            <Camera className="h-4 w-4" />
                        </button>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/png,image/jpeg,image/jpg,image/webp"
                            className="hidden"
                            onChange={handleAvatarChange}
                        />
                    </div>

                    <div className="text-center sm:text-left space-y-1 flex-1">
                        <h4 className="font-fredoka text-lg font-bold text-paw-navy dark:text-white">
                            {user.name}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Accepted formats: JPG, PNG, or WEBP (Max 2MB).
                        </p>
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-1">
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="text-xs font-bold text-paw-orange hover:text-orange-600 dark:hover:text-orange-400 cursor-pointer"
                            >
                                Upload new photo
                            </button>
                            {(user.avatar_path || avatarPreview) && !data.remove_avatar && (
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

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid gap-4 sm:grid-cols-2">
                        {/* Name */}
                        <div className="grid gap-2">
                            <Label htmlFor="name" className="flex items-center gap-1.5">
                                <UserIcon className="h-3.5 w-3.5 text-paw-orange" />
                                Full Name
                            </Label>
                            <Input
                                id="name"
                                name="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                required
                                autoComplete="name"
                                placeholder="Full name"
                                className="rounded-xl"
                            />
                            <InputError message={errors.name} />
                        </div>

                        {/* Email */}
                        <div className="grid gap-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="email" className="flex items-center gap-1.5">
                                    <Mail className="h-3.5 w-3.5 text-paw-orange" />
                                    Email address
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
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    required
                                    readOnly={isEmailVerified}
                                    disabled={isEmailVerified}
                                    autoComplete="username"
                                    placeholder="Email address"
                                    className={cn(
                                        "rounded-xl",
                                        isEmailVerified && "bg-gray-50/90 dark:bg-slate-950/70 text-gray-500 cursor-not-allowed pr-10"
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
                                    Email address is verified and locked for account security.
                                </p>
                            ) : (
                                <InputError message={errors.email} />
                            )}
                        </div>

                        {/* Phone */}
                        <div className="grid gap-2">
                            <Label htmlFor="phone" className="flex items-center gap-1.5">
                                <Phone className="h-3.5 w-3.5 text-paw-orange" />
                                Phone number
                            </Label>
                            <PhoneInput
                                id="phone"
                                name="phone"
                                value={data.phone}
                                onChange={(val) => setData('phone', val)}
                                autoComplete="tel"
                                placeholder="+63 9XX XXX XXXX"
                                className="rounded-xl"
                            />
                            <InputError message={errors.phone} />
                        </div>

                        {/* Location */}
                        <div className="grid gap-2">
                            <Label htmlFor="location" className="flex items-center gap-1.5">
                                <MapPin className="h-3.5 w-3.5 text-paw-orange" />
                                Location / Address
                            </Label>
                            <Input
                                id="location"
                                name="location"
                                value={data.location}
                                onChange={(e) => setData('location', e.target.value)}
                                autoComplete="street-address"
                                placeholder="City or Province"
                                className="rounded-xl"
                            />
                            <InputError message={errors.location} />
                        </div>
                    </div>

                    {mustVerifyEmail && user.email_verified_at === null && (
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Your email address is unverified.{' '}
                                <Link
                                    href={send()}
                                    as="button"
                                    className="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
                                >
                                    Click here to resend the verification email.
                                </Link>
                            </p>

                            {status === 'verification-link-sent' && (
                                <div className="mt-2 text-sm font-medium text-green-600">
                                    A new verification link has been sent to your email address.
                                </div>
                            )}
                        </div>
                    )}

                    <div className="flex items-center gap-4">
                        <Button
                            type="submit"
                            disabled={processing}
                            data-test="update-profile-button"
                            className="rounded-xl bg-paw-navy text-white hover:bg-opacity-90 dark:bg-slate-100 dark:text-slate-900"
                        >
                            {processing ? 'Saving...' : 'Save Profile'}
                        </Button>
                    </div>
                </form>
            </div>

            <DeleteUser />
        </>
    );
}

Profile.layout = {
    breadcrumbs: [
        {
            title: 'Profile settings',
            href: edit(),
        },
    ],
};
