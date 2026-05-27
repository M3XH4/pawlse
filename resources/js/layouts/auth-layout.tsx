import AuthLayoutTemplate from '@/layouts/auth/auth-simple-layout';

export default function AuthLayout({
    title = '',
    description = '',
    subTitle = "",
    children,
}: {
    title?: string;
    description?: string;
    subTitle?: string;
    children: React.ReactNode;
}) {
    return (
        <AuthLayoutTemplate title={title} description={description} subTitle={subTitle}>
            {children}
        </AuthLayoutTemplate>
    );
}
