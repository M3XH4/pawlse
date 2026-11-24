import { Form, Head } from '@inertiajs/react';
import { LogIn, Mail } from 'lucide-react';
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
                        <div className="grid gap-5">
                            <div className="grid gap-1.5">
                                <Label htmlFor="email" className="text-[11px] md:text-xs font-black uppercase tracking-widest text-gray-500">Email address</Label>
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
                                        className="w-full h-12 md:h-14 bg-gray-50/70 focus:bg-white px-4 pr-11 rounded-xl md:rounded-2xl border-2 border-gray-200 focus:border-paw-blue outline-none transition-all font-bold shadow-xs text-sm md:text-base"
                                    />
                                    <Mail size={18} className="absolute right-3.5 md:right-4 top-1/2 -translate-y-1/2 text-gray-400 md:w-5 md:h-5 pointer-events-none" />
                                </div>
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-1.5">
                                <div className="flex items-center">
                                    <Label htmlFor="password" className="text-[11px] md:text-xs font-black uppercase tracking-widest text-gray-500">Password</Label>
                                    {canResetPassword && (
                                        <TextLink
                                            href={request()}
                                            className="ml-auto text-[11px] font-black uppercase tracking-widest text-paw-orange hover:underline whitespace-nowrap"
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
                                    className="w-full h-12 md:h-14 bg-gray-50/70 focus:bg-white px-4 pr-11 rounded-xl md:rounded-2xl border-2 border-gray-200 focus:border-paw-blue outline-none transition-all font-bold shadow-xs text-sm md:text-base"
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="flex items-center space-x-2.5 pt-0.5">
                                <Checkbox
                                    id="remember"
                                    name="remember"
                                    tabIndex={3}
                                    className="border-gray-300 data-[state=checked]:bg-paw-orange data-[state=checked]:border-paw-orange"
                                />
                                <Label htmlFor="remember" className="text-sm font-semibold text-gray-600 cursor-pointer">Remember me</Label>
                            </div>

                            <Button
                                type="submit"
                                className={`w-full h-12 md:h-14 rounded-xl md:rounded-[2rem] font-black text-sm md:text-base tracking-widest uppercase transition-all shadow-xl flex items-center justify-center gap-2 md:gap-3 cursor-pointer ${processing ? 'bg-gray-300 text-white cursor-not-allowed' : 'bg-paw-navy text-white hover:bg-paw-orange'}`}
                                tabIndex={4}
                                disabled={processing}
                                data-test="login-button"
                            >
                                {processing && <Spinner showProgress={false} />}
                                <span className="truncate">{processing ? 'AUTHENTICATING...' : 'LOG IN'}</span>
                                {!processing && <LogIn size={20} className="md:w-6 md:h-6 shrink-0" />}
                            </Button>
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
