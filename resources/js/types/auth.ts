export type User = {
    id: number;
    name: string;
    email: string;
    role: 'user' | 'volunteer' | 'admin' | 'super-admin';
    avatar?: string;
    avatar_path?: string | null;
    phone?: string | null;
    location?: string | null;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
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
