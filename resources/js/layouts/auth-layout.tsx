import type { ReactNode } from 'react';
import AuthLayoutTemplate from '@/layouts/auth/auth-simple-layout';

export default function AuthLayout({
    title = '',
    description = '',
    subTitle = '',
    children,
}: {
    title?: ReactNode;
    description?: string;
    subTitle?: ReactNode;
    children: ReactNode;
}) {
    return (
        <AuthLayoutTemplate title={title} description={description} subTitle={subTitle}>
            {children}
        </AuthLayoutTemplate>
    );
}
