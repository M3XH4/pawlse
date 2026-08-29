import { Form, Head } from '@inertiajs/react';
import { KeyRound, Mail } from 'lucide-react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { login } from '@/routes';
import { update } from '@/routes/password';

type Props = {
    token: string;
    email: string;
};

export default function ResetPassword({ token, email }: Props) {
    return (
        <>
            <Head title="Reset Password" />

            <div className="flex flex-col gap-6">
                <p className="text-sm md:text-base text-gray-500 font-medium leading-relaxed">
                    Enter a new secure password for your account below.
                </p>

                <Form
                    action={update.url()}
                    method="post"
                    transform={(data) => ({ ...data, token, email })}
                    resetOnSuccess={['password', 'password_confirmation']}
                    className="flex flex-col gap-6"
                >
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
                                            autoComplete="email"
                                            value={email}
                                            readOnly
                                            className="w-full bg-muted/50 p-3 md:p-4 lg:p-7 pr-12 md:pr-14 lg:pr-16 rounded-xl md:rounded-2xl border-2 border-foreground-100 font-bold shadow-sm text-sm md:text-base cursor-not-allowed opacity-80"
                                        />
                                        <Mail size={20} className="absolute right-3 md:right-4 lg:right-5 top-1/2 -translate-y-1/2 text-gray-400 md:w-6 md:h-6" />
                                    </div>
                                    <InputError message={errors.email} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="password" className="text-[9px] md:text-[10px] md:text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
                                        New Password
                                    </Label>
                                    <PasswordInput
                                        id="password"
                                        name="password"
                                        required
                                        autoFocus
                                        tabIndex={1}
                                        autoComplete="new-password"
                                        placeholder="••••••••"
                                        className="w-full bg-background p-3 md:p-4 lg:p-7 pr-12 md:pr-14 lg:pr-16 rounded-xl md:rounded-2xl border-2 border-foreground-100 focus:border-paw-blue outline-none transition-all font-bold shadow-sm text-sm md:text-base"
                                    />
                                    <InputError message={errors.password} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="password_confirmation" className="text-[9px] md:text-[10px] md:text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
                                        Confirm New Password
                                    </Label>
                                    <PasswordInput
                                        id="password_confirmation"
                                        name="password_confirmation"
                                        required
                                        tabIndex={2}
                                        autoComplete="new-password"
                                        placeholder="••••••••"
                                        className="w-full bg-background p-3 md:p-4 lg:p-7 pr-12 md:pr-14 lg:pr-16 rounded-xl md:rounded-2xl border-2 border-foreground-100 focus:border-paw-blue outline-none transition-all font-bold shadow-sm text-sm md:text-base"
                                    />
                                    <InputError message={errors.password_confirmation} />
                                </div>

                                <Button
                                    type="submit"
                                    className={`w-full py-4 md:py-5 lg:py-7 rounded-xl md:rounded-[2rem] font-black text-sm md:text-base lg:text-lg tracking-widest uppercase transition-all shadow-xl flex items-center justify-center gap-2 md:gap-4 ${processing ? 'bg-gray-300 text-white cursor-not-allowed' : 'bg-paw-navy text-white hover:bg-paw-orange'}`}
                                    tabIndex={3}
                                    disabled={processing}
                                    data-test="reset-password-button"
                                >
                                    {processing && <Spinner />}
                                    <span className="truncate">{processing ? 'RESETTING PASSWORD...' : 'RESET PASSWORD'}</span>
                                    {!processing && <KeyRound size={20} className="md:w-6 md:h-6 shrink-0" />}
                                </Button>
                            </div>

                            <div className="text-center text-sm md:text-base text-gray-500 font-bold">
                                Return to{' '}
                                <TextLink href={login()} tabIndex={4} className="text-paw-orange font-black hover:underline uppercase tracking-widest text-xs md:text-sm">
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

ResetPassword.layout = {
    title: (
        <>
            Create A <br />
            <span className="text-paw-orange not-italic">
                New Password.
            </span>
        </>
    ),
    description: 'Ensure your account stays secure with a strong password. You can then log back in right away.',
    subTitle: 'Set New Password',
};
