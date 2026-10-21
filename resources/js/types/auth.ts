export type User = {
    id: number;
    name: string;
    first_name?: string | null;
    middle_initial?: string | null;
    last_name?: string | null;
    email: string;
    role: 'user' | 'volunteer' | 'admin' | 'super-admin';
    avatar?: string;
    avatar_path?: string | null;
    phone?: string | null;
    location?: string | null;
    email_verified_at: string | null;
    sidebar_notification_style?: 'count' | 'dot' | 'none';
    two_factor_enabled?: boolean;
    roles?: string[];
    permissions?: string[];
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
};

export type Auth = {
    user: User | null;
};

export type TwoFactorSetupData = {
    svg: string;
    url: string;
};

export type TwoFactorSecretKey = {
    secretKey: string;
};
