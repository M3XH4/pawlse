import { Form, Head } from '@inertiajs/react';
import { CheckCircle2, Mail, Send } from 'lucide-react';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { login } from '@/routes';
import { email } from '@/routes/password';

export default function ForgotPassword({ status }: { status?: string }) {
    return (
        <>
            <Head title="Forgot Password" />

            <div className="flex flex-col gap-6">
                <p className="text-sm md:text-base text-gray-500 font-medium leading-relaxed">
                    Forgot your password? No problem. Enter your email address and we will send you a secure link to reset it.
                </p>

                {status && (
                    <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-emerald-800 dark:text-emerald-300 flex items-start gap-3 shadow-sm">
                        <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <div className="text-sm font-semibold leading-relaxed">
                            {status}
                        </div>
                    </div>
                )}

                <Form action={email.url()} method="post" className="flex flex-col gap-6">
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-6">
                                <div className="grid gap-2">
                                    <Label htmlFor="email" className="text-[9px] md:text-[10px] md:text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
                                        Email address
                                    </Label>
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
                                        <Mail size={20} className="absolute right-3 md:right-4 lg:right-5 top-1/2 -translate-y-1/2 text-gray-400 md:w-6 md:h-6" />
                                    </div>
                                    <InputError message={errors.email} />
                                </div>

                                <Button
                                    type="submit"
                                    className={`w-full py-4 md:py-5 lg:py-7 rounded-xl md:rounded-[2rem] font-black text-sm md:text-base lg:text-lg tracking-widest uppercase transition-all shadow-xl flex items-center justify-center gap-2 md:gap-4 ${processing ? 'bg-gray-300 text-white cursor-not-allowed' : 'bg-paw-navy text-white hover:bg-paw-orange'}`}
                                    tabIndex={2}
                                    disabled={processing}
                                    data-test="email-password-reset-link-button"
                                >
                                    {processing && <Spinner />}
                                    <span className="truncate">{processing ? 'SENDING LINK...' : 'SEND RESET LINK'}</span>
                                    {!processing && <Send size={20} className="md:w-6 md:h-6 shrink-0" />}
                                </Button>
                            </div>

                            <div className="text-center text-sm md:text-base text-gray-500 font-bold">
                                Remember your password?{' '}
                                <TextLink href={login()} tabIndex={3} className="text-paw-orange font-black hover:underline uppercase tracking-widest text-xs md:text-sm">
                                    Log in
                                </TextLink>
                            </div>
                        </>
                    )}
                </Form>
            </div>
        </>
    );
}

ForgotPassword.layout = {
    title: (
        <>
            Don't Worry, <br />
            <span className="text-paw-orange not-italic">
                We've Got You.
            </span>
        </>
    ),
    description: "Enter your registered email address and we'll send you a password reset link to get you back to caring for paws.",
    subTitle: 'Reset Password',
};
