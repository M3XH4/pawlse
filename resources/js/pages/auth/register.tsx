import { Form, Head } from '@inertiajs/react';
import { UserPlus } from 'lucide-react';
import { useState } from 'react';
import LegalTermsModal from '@/components/auth/legal-terms-modal';
import PasswordStrengthIndicator from '@/components/auth/password-strength-indicator';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { login } from '@/routes';
import { store } from '@/routes/register';

export default function Register() {
    const [password, setPassword] = useState('');
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [legalModalOpen, setLegalModalOpen] = useState(false);
    const [legalModalTab, setLegalModalTab] = useState<'terms' | 'privacy'>('terms');

    const openLegalModal = (tab: 'terms' | 'privacy') => {
        setLegalModalTab(tab);
        setLegalModalOpen(true);
    };

    return (
        <>
            <Head title="Register" />
            <Form
                action={store.url()}
                method="post"
                resetOnSuccess={['password', 'password_confirmation']}
                disableWhileProcessing
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-4 sm:gap-5">
                            {/* Full Name separated into First Name, Middle Initial, Last Name */}
                            <div className="grid grid-cols-12 gap-2.5 sm:gap-3">
                                <div className="col-span-8 sm:col-span-5 grid gap-1.5">
                                    <Label htmlFor="first_name" className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-gray-500">
                                        First Name <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="first_name"
                                        type="text"
                                        required
                                        autoFocus
                                        tabIndex={1}
                                        autoComplete="given-name"
                                        name="first_name"
                                        placeholder="e.g. Juan"
                                        className="h-11 sm:h-12 px-3.5 rounded-xl border-2 border-gray-200 focus:border-paw-blue bg-gray-50/70 focus:bg-white font-semibold text-sm"
                                    />
                                    <InputError message={errors.first_name} />
                                </div>

                                <div className="col-span-4 sm:col-span-2 grid gap-1.5">
                                    <Label htmlFor="middle_initial" className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-gray-500 whitespace-nowrap">
                                        M.I. <span className="text-[9px] text-gray-400 font-semibold normal-case">(Opt.)</span>
                                    </Label>
                                    <Input
                                        id="middle_initial"
                                        type="text"
                                        maxLength={5}
                                        tabIndex={2}
                                        autoComplete="additional-name"
                                        name="middle_initial"
                                        placeholder="M.I."
                                        className="h-11 sm:h-12 px-2 rounded-xl border-2 border-gray-200 focus:border-paw-blue bg-gray-50/70 focus:bg-white font-semibold text-sm uppercase text-center"
                                    />
                                    <InputError message={errors.middle_initial} />
                                </div>

                                <div className="col-span-12 sm:col-span-5 grid gap-1.5">
                                    <Label htmlFor="last_name" className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-gray-500">
                                        Last Name <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="last_name"
                                        type="text"
                                        required
                                        tabIndex={3}
                                        autoComplete="family-name"
                                        name="last_name"
                                        placeholder="e.g. Dela Cruz"
                                        className="h-11 sm:h-12 px-3.5 rounded-xl border-2 border-gray-200 focus:border-paw-blue bg-gray-50/70 focus:bg-white font-semibold text-sm"
                                    />
                                    <InputError message={errors.last_name} />
                                </div>
                            </div>
                            {errors.name && <InputError message={errors.name} />}

                            <div className="grid gap-1.5">
                                <Label htmlFor="email" className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-gray-500">
                                    Email address <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    tabIndex={4}
                                    autoComplete="email"
                                    name="email"
                                    placeholder="email@example.com"
                                    className="h-11 sm:h-12 px-3.5 rounded-xl border-2 border-gray-200 focus:border-paw-blue bg-gray-50/70 focus:bg-white font-semibold text-sm"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-1.5">
                                <Label htmlFor="password" className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-gray-500">
                                    Password <span className="text-red-500">*</span>
                                </Label>
                                <PasswordInput
                                    id="password"
                                    required
                                    tabIndex={5}
                                    autoComplete="new-password"
                                    name="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Create a strong password"
                                    className="h-11 sm:h-12 px-3.5 pr-11 rounded-xl border-2 border-gray-200 focus:border-paw-blue bg-gray-50/70 focus:bg-white font-semibold text-sm"
                                />
                                <PasswordStrengthIndicator password={password} />
                                <InputError message={errors.password} />
                            </div>

                            <div className="grid gap-1.5">
                                <Label htmlFor="password_confirmation" className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-gray-500">
                                    Confirm password <span className="text-red-500">*</span>
                                </Label>
                                <PasswordInput
                                    id="password_confirmation"
                                    required
                                    tabIndex={6}
                                    autoComplete="new-password"
                                    name="password_confirmation"
                                    placeholder="Confirm password"
                                    className="h-11 sm:h-12 px-3.5 pr-11 rounded-xl border-2 border-gray-200 focus:border-paw-blue bg-gray-50/70 focus:bg-white font-semibold text-sm"
                                />
                                <InputError
                                    message={errors.password_confirmation}
                                />
                            </div>

                            {/* Terms and Privacy Policy Agreement Checkbox */}
                            <div className="space-y-1 pt-1">
                                <div className="flex items-start space-x-3">
                                    <Checkbox
                                        id="terms"
                                        name="terms"
                                        value="1"
                                        required
                                        tabIndex={7}
                                        checked={termsAccepted}
                                        onCheckedChange={(checked) => setTermsAccepted(checked === true)}
                                        className="mt-0.5 border-gray-300 data-[state=checked]:bg-paw-orange data-[state=checked]:border-paw-orange"
                                    />
                                    <label
                                        htmlFor="terms"
                                        className="text-xs md:text-sm text-gray-600 dark:text-gray-300 font-medium leading-relaxed select-none cursor-pointer"
                                    >
                                        I have read and agree to the{' '}
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                openLegalModal('terms');
                                            }}
                                            className="text-paw-orange font-bold hover:underline cursor-pointer inline-flex items-center"
                                        >
                                            Terms and Conditions
                                        </button>{' '}
                                        and{' '}
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                openLegalModal('privacy');
                                            }}
                                            className="text-paw-orange font-bold hover:underline cursor-pointer inline-flex items-center"
                                        >
                                            Privacy Policy
                                        </button>
                                        .
                                    </label>
                                </div>
                                <InputError message={errors.terms} className="mt-1" />
                            </div>

                            <Button
                                type="submit"
                                tabIndex={8}
                                data-test="register-user-button"
                                disabled={processing}
                                className={`w-full h-12 md:h-14 rounded-xl md:rounded-[2rem] font-black text-sm md:text-base tracking-widest uppercase transition-all shadow-xl flex items-center justify-center gap-2 md:gap-3 cursor-pointer ${processing ? 'bg-gray-300 text-white cursor-not-allowed' : 'bg-paw-navy text-white hover:bg-paw-orange'}`}
                            >
                                {processing && <Spinner showProgress={false} />}
                                <span>{processing ? 'CREATING ACCOUNT...' : 'REGISTER NOW'}</span>
                                {!processing && <UserPlus size={18} className="md:w-5 md:h-5 shrink-0" />}
                            </Button>
                        </div>

                        <div className="text-center text-sm md:text-base text-gray-500 font-bold">
                            Already have an account?{' '}
                            <TextLink href={login()} tabIndex={9} className="text-paw-orange font-black hover:underline uppercase tracking-widest text-xs md:text-sm">
                                Log in
                            </TextLink>
                        </div>
                    </>
                )}
            </Form>

            {/* Legal Terms & Privacy Modal */}
            <LegalTermsModal
                open={legalModalOpen}
                onOpenChange={setLegalModalOpen}
                initialTab={legalModalTab}
                onAccept={() => setTermsAccepted(true)}
            />
        </>
    );
}

Register.layout = {
    title: (
        <>
            Every Hand <br />
            <span className="text-paw-yellow not-italic">
                Saves a Life.
            </span>
        </>
    ),
    description: 'Join thousands of Iligan residents in our mission to feed and protect stray animals. Choose your path below.',
    subTitle: 'Create Account',
};
