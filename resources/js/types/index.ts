import type { Auth } from './auth';

export type * from './admin';
export type * from './auth';
export type * from './dashboard';
export type * from './navigation';
export type * from './ui';

export type SharedData = {
    name: string;
    auth: Auth;
    sidebarOpen: boolean;
    [key: string]: unknown;
};
