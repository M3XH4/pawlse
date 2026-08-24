import { Form, Head, router } from '@inertiajs/react';
import { LogIn, Mail } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';

type Props = {
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
};

export default function Login({
    status,
    canResetPassword,
    canRegister,
}: Props) {
    const [socialLoading, setSocialLoading] = useState<'google' | 'facebook' | null>(null);

    const handleSocialLogin = (provider: 'google' | 'facebook') => {
        setSocialLoading(provider);
        toast.info(`Connecting to ${provider === 'google' ? 'Google' : 'Facebook'}...`);

        setTimeout(() => {
            toast.success(`Successfully signed in with ${provider === 'google' ? 'Google' : 'Facebook'}!`);
            setSocialLoading(null);
            router.visit('/');
        }, 2000);
    };

    return (
        <>
            <Head title="Log in" />

            <Form
                action={store.url()}
                method="post"
                resetOnSuccess={['password']}
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="email" className="text-[9px] md:text-[10px] md:text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Email address</Label>
                                <div className="relative">
                                    <Input
                                        id="email"
                                        type="email"
                                        name="email"
                                        required
                                        autoFocus
                                        tabIndex={1}
                                        autoComplete="email"
                                        placeholder="name@example.com"
                                        className="w-full bg-background p-3 md:p-4 lg:p-7 pr-12 md:pr-14 lg:pr-16 rounded-xl md:rounded-2xl border-2 border-foreground-100 focus:border-paw-blue outline-none transition-all font-bold shadow-sm text-sm md:text-base"
                                    />
                                    <Mail size={20} className="absolute right-3 md:right-4 lg:right-5 top-1/2 -translate-y-1/2 text-gray-200 md:w-6 md:h-6" />
                                </div>
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <div className="flex items-center">
                                    <Label htmlFor="password" className="text-[9px] md:text-[10px] md:text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Password</Label>
                                    {canResetPassword && (
                                        <TextLink
                                            href={request()}
                                            className="ml-auto mb-2 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-paw-orange hover:underline whitespace-nowrap"
                                            tabIndex={5}
                                        >
                                            Forgot?
                                        </TextLink>
                                    )}
                                </div>
                                <PasswordInput
                                    id="password"
                                    name="password"
                                    required
                                    tabIndex={2}
                                    autoComplete="current-password"
                                    placeholder="********"
                                    className="w-full bg-background p-3 md:p-4 lg:p-7 pr-12 md:pr-14 lg:pr-16 rounded-xl md:rounded-2xl border-2 border-foreground-100 focus:border-paw-blue outline-none transition-all font-bold shadow-sm text-sm md:text-base"
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="flex items-center space-x-3">
                                <Checkbox
                                    id="remember"
                                    name="remember"
                                    tabIndex={3}
                                />
                                <Label htmlFor="remember">Remember me</Label>
                            </div>

                            <Button
                                type="submit"
                                className={`w-full py-4 md:py-5 lg:py-7 rounded-xl md:rounded-[2rem] font-black text-sm md:text-base lg:text-lg tracking-widest uppercase transition-all shadow-xl flex items-center justify-center gap-2 md:gap-4 ${processing ? 'bg-gray-300 text-white cursor-not-allowed' : 'bg-paw-navy text-white hover:bg-paw-orange'}`}
                                tabIndex={4}
                                disabled={processing}
                                data-test="login-button"
                            >
                                {processing && <Spinner />}
                                <span className="truncate">{processing ? 'AUTHENTICATING...' : 'LOG IN'}</span>
                                {!processing && <LogIn size={20} className="md:w-6 md:h-6 shrink-0" />}
                            </Button>
                        </div>

                        {/* Social Login Options */}
                        <div className="md:mt-">
                            <div className="flex items-center gap-2 md:gap-4 mb-4 md:mb-6">
                                <div className="flex-1 h-px bg-gray-100"></div>
                                <span className="text-[9px] md:text-[10px] lg:text-xs font-black text-gray-300 uppercase tracking-widest whitespace-nowrap">Or continue with</span>
                                <div className="flex-1 h-px bg-gray-100"></div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 md:gap-3 lg:gap-4">
                                <button
                                    type="button"
                                    onClick={() => handleSocialLogin('google')}
                                    disabled={socialLoading === 'google'}
                                    className="flex items-center justify-center gap-2 md:gap-3 py-3 md:py-4 px-3 md:px-4 lg:px-6 rounded-xl md:rounded-2xl border-2 border-gray-200 hover:border-paw-blue hover:bg-gray-50 transition-all font-black text-xs md:text-sm uppercase tracking-widest text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {socialLoading === 'google' ? (
                                        <div className="animate-spin rounded-full h-4 w-4 md:h-5 md:w-5 border-2 border-gray-300 border-t-blue-500"></div>
                                    ) : (
                                        <svg width="18" height="18" viewBox="0 0 48 48" fill="none" className="md:w-5 md:h-5">
                                            <path d="M47.532 24.5528C47.532 22.9214 47.3997 21.2811 47.1175 19.6761H24.48V28.9181H37.4434C36.9055 31.8988 35.177 34.5356 32.6461 36.2111V42.2078H40.3801C44.9217 38.0278 47.532 31.8547 47.532 24.5528Z" fill="#4285F4" />
                                            <path d="M24.48 48.0016C30.9529 48.0016 36.4116 45.8764 40.3888 42.2078L32.6549 36.2111C30.5031 37.675 27.7252 38.5039 24.4888 38.5039C18.2275 38.5039 12.9187 34.2798 11.0139 28.6006H3.03296V34.7825C7.10718 42.8868 15.4056 48.0016 24.48 48.0016Z" fill="#34A853" />
                                            <path d="M11.0051 28.6006C9.99973 25.6199 9.99973 22.3922 11.0051 19.4115V13.2296H3.03298C-0.371021 20.0112 -0.371021 28.0009 3.03298 34.7825L11.0051 28.6006Z" fill="#FBBC04" />
                                            <path d="M24.48 9.49932C27.9016 9.44641 31.2086 10.7339 33.6866 13.0973L40.5387 6.24523C36.2 2.17101 30.4414 -0.068932 24.48 0.00161733C15.4055 0.00161733 7.10718 5.11644 3.03296 13.2296L11.005 19.4115C12.901 13.7235 18.2187 9.49932 24.48 9.49932Z" fill="#EA4335" />
                                        </svg>
                                    )}
                                    <span className="hidden md:inline">{socialLoading === 'google' ? 'Connecting...' : 'Google'}</span>
                                    <span className="md:hidden">{socialLoading === 'google' ? '...' : 'Google'}</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleSocialLogin('facebook')}
                                    disabled={socialLoading === 'facebook'}
                                    className="flex items-center justify-center gap-2 md:gap-3 py-3 md:py-4 px-3 md:px-4 lg:px-6 rounded-xl md:rounded-2xl border-2 border-gray-200 hover:border-paw-blue hover:bg-gray-50 transition-all font-black text-xs md:text-sm uppercase tracking-widest text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {socialLoading === 'facebook' ? (
                                        <div className="animate-spin rounded-full h-4 w-4 md:h-5 md:w-5 border-2 border-gray-300 border-t-blue-600"></div>
                                    ) : (
                                        <svg width="18" height="18" viewBox="0 0 48 48" fill="none" className="md:w-5 md:h-5">
                                            <path d="M48 24C48 10.7452 37.2548 0 24 0C10.7452 0 0 10.7452 0 24C0 35.9789 8.77641 45.908 20.25 47.7084V30.9375H14.1562V24H20.25V18.7125C20.25 12.6975 23.8331 9.375 29.3152 9.375C31.9402 9.375 34.6875 9.84375 34.6875 9.84375V15.75H31.6613C28.68 15.75 27.75 17.6002 27.75 19.5V24H34.4062L33.3422 30.9375H27.75V47.7084C39.2236 45.908 48 35.9789 48 24Z" fill="#1877F2" />
                                            <path d="M33.3422 30.9375L34.4062 24H27.75V19.5C27.75 17.6002 28.68 15.75 31.6613 15.75H34.6875V9.84375C34.6875 9.84375 31.9402 9.375 29.3152 9.375C23.8331 9.375 20.25 12.6975 20.25 18.7125V24H14.1562V30.9375H20.25V47.7084C21.4719 47.9012 22.7235 48 24 48C25.2765 48 26.5281 47.9012 27.75 47.7084V30.9375H33.3422Z" fill="white" />
                                        </svg>
                                    )}
                                    <span className="hidden md:inline">{socialLoading === 'facebook' ? 'Connecting...' : 'Facebook'}</span>
                                    <span className="md:hidden">{socialLoading === 'facebook' ? '...' : 'Facebook'}</span>
                                </button>
                            </div>
                        </div>

                        {canRegister && (
                            <div className="text-center text-sm md:text-base text-gray-500 font-bold">
                                Don't have an account?{' '}
                                <TextLink href={register()} tabIndex={5} className="text-paw-orange font-black hover:underline uppercase tracking-widest text-xs md:text-sm">
                                    Sign up
                                </TextLink>
                            </div>
                        )}
                    </>
                )}
            </Form>

            {status && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">
                    {status}
                </div>
            )}
        </>
    );
}

Login.layout = {
    title: ( 
        <>
            Save a Paw, <br />
            <span className="text-paw-orange not-italic">
                Share a Heart.
            </span>
        </>
    ),
    description: 'Access your personalized rescue dashboard, track your donations, and connect with the Iligan pet community.',
    subTitle: 'Welcome Back!',
};
