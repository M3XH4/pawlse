import { Head, useForm, Form } from '@inertiajs/react';
import { REGEXP_ONLY_DIGITS } from 'input-otp';
import { LogOut, RefreshCw, ShieldCheck } from 'lucide-react';
import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from '@/components/ui/input-otp';
import { Spinner } from '@/components/ui/spinner';
import { logout } from '@/routes';
import { send, verify } from '@/routes/verification';

type Props = {
    status?: string;
    email: string;
    cooldownSeconds: number;
    expiresAt?: string;
    attempts: number;
    maxAttempts: number;
};

export default function VerifyEmail({
    status,
    email,
    cooldownSeconds,
    expiresAt,
    attempts,
    maxAttempts,
}: Props) {
    const [cooldown, setCooldown] = useState(cooldownSeconds);
    const { data, setData, post, processing, errors } = useForm({
        otp: '',
    });

    useEffect(() => {
        const timer = window.setTimeout(() => {
            setCooldown(cooldownSeconds);
        }, 0);

        return () => window.clearTimeout(timer);
    }, [cooldownSeconds]);

    useEffect(() => {
        if (cooldown <= 0) {
            return;
        }

        const timer = window.setTimeout(() => {
            setCooldown((current) => Math.max(current - 1, 0));
        }, 1000);

        return () => window.clearTimeout(timer);
    }, [cooldown]);

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        post(verify.url(), {
            preserveScroll: true,
            onError: () => setData('otp', ''),
        });
    };

    return (
        <>
            <Head title="Email verification" />

            <div className="space-y-6 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-paw-blue/10 text-paw-blue">
                    <ShieldCheck aria-hidden="true" size={28} />
                </div>

                <div className="space-y-2">
                    <p className="text-sm font-bold text-gray-500">
                        We sent a 6-digit code to
                    </p>
                    <p className="break-words text-base font-black text-paw-navy">
                        {email}
                    </p>
                </div>

                {status === 'verification-code-sent' && (
                    <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-bold text-green-700">
                        A fresh verification code has been sent.
                    </div>
                )}

                <form onSubmit={submit} className="space-y-5">
                    <div className="flex justify-center">
                        <InputOTP
                            maxLength={6}
                            value={data.otp}
                            onChange={(value) => setData('otp', value)}
                            pattern={REGEXP_ONLY_DIGITS}
                            inputMode="numeric"
                            autoFocus
                            aria-label="Six digit email verification code"
                            disabled={processing}
                            containerClassName="gap-2 sm:gap-3"
                        >
                            <InputOTPGroup className="gap-2 sm:gap-3">
                                {Array.from({ length: 6 }).map((_, index) => (
                                    <InputOTPSlot
                                        key={index}
                                        index={index}
                                        className="h-11 w-10 rounded-xl border-2 border-foreground-100 text-base font-black shadow-sm sm:h-14 sm:w-12 sm:text-xl"
                                    />
                                ))}
                            </InputOTPGroup>
                        </InputOTP>
                    </div>

                    <InputError message={errors.otp} />

                    <div className="space-y-1 text-xs font-bold text-gray-400">
                        <p>
                            Attempts used: {attempts} of {maxAttempts}
                        </p>
                        {expiresAt && (
                            <p>
                                Code expires{' '}
                                {new Date(expiresAt).toLocaleTimeString([], {
                                    hour: 'numeric',
                                    minute: '2-digit',
                                })}
                            </p>
                        )}
                    </div>

                    <Button
                        type="submit"
                        disabled={processing || data.otp.length !== 6}
                        className="w-full rounded-xl bg-paw-navy py-4 font-black uppercase tracking-widest text-white shadow-xl hover:bg-paw-orange disabled:cursor-not-allowed disabled:bg-gray-300"
                    >
                        {processing && <Spinner />}
                        Verify email
                    </Button>
                </form>

                <Form action={send.url()} method="post" className="space-y-3">
                    {({ processing: resending, errors: resendErrors }) => (
                        <>
                            <Button
                                type="submit"
                                variant="secondary"
                                disabled={resending || cooldown > 0}
                                className="w-full gap-2 rounded-xl font-black uppercase tracking-widest"
                            >
                                {resending ? (
                                    <Spinner />
                                ) : (
                                    <RefreshCw aria-hidden="true" size={16} />
                                )}
                                {cooldown > 0
                                    ? `Resend in ${cooldown}s`
                                    : 'Resend code'}
                            </Button>
                            <InputError message={resendErrors.otp} />
                        </>
                    )}
                </Form>

                <TextLink
                    href={logout()}
                    method="post"
                    as="button"
                    className="mx-auto inline-flex items-center gap-2 text-sm font-black uppercase tracking-widest text-gray-500 hover:text-paw-orange"
                >
                    <LogOut aria-hidden="true" size={16} />
                    Log out
                </TextLink>
            </div>
        </>
    );
}

VerifyEmail.layout = {
    title: 'Verify email',
    description: 'Enter the code we sent to your email address.',
    subTitle: 'Almost there',
};
