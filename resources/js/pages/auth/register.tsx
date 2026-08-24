import { Form, Head } from '@inertiajs/react';
import { UserPlus } from 'lucide-react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { login } from '@/routes';
import { store } from '@/routes/register';


export default function Register() {
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
                        <div className="grid gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="name"
                                    name="name"
                                    placeholder="Full name"
                                />
                                <InputError
                                    message={errors.name}
                                    className="mt-2"
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="email">Email address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    tabIndex={2}
                                    autoComplete="email"
                                    name="email"
                                    placeholder="email@example.com"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password">Password</Label>
                                <PasswordInput
                                    id="password"
                                    required
                                    tabIndex={3}
                                    autoComplete="new-password"
                                    name="password"
                                    placeholder="Password"
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password_confirmation">
                                    Confirm password
                                </Label>
                                <PasswordInput
                                    id="password_confirmation"
                                    required
                                    tabIndex={4}
                                    autoComplete="new-password"
                                    name="password_confirmation"
                                    placeholder="Confirm password"
                                />
                                <InputError
                                    message={errors.password_confirmation}
                                />
                            </div>

                            <Button
                                type="submit"
                                tabIndex={5}
                                data-test="register-user-button"
                                disabled={processing}
                                className={`w-full py-3 md:py-4 lg:py-6 rounded-xl md:rounded-[2rem] font-black text-sm md:text-base lg:text-lg tracking-widest uppercase transition-all shadow-xl flex items-center justify-center gap-2 md:gap-4 ${processing ? 'bg-gray-300 text-white cursor-not-allowed' : 'bg-paw-navy text-white hover:bg-paw-orange'}`}
                            >
                                {processing && <Spinner />}
                                {processing ? 'CREATING ACCOUNT...' : 'REGISTER NOW'}
                                {!processing && <UserPlus size={20} className="md:w-6 md:h-6" />}
                            </Button>
                        </div>

                        <div className="text-center text-sm md:text-base text-gray-500 font-bold">
                            Already have an account?{' '}
                            <TextLink href={login()} tabIndex={6} className="text-paw-orange font-black hover:underline uppercase tracking-widest text-xs md:text-sm">
                                Log in
                            </TextLink>
                        </div>
                    </>
                )}
            </Form>
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
