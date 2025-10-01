export interface User {
    id: number;
    name: string;
    email: string;
    roles: Array<'admin' | 'teacher' | 'user'>;
    primary_role?: 'admin' | 'teacher' | 'user' | null;
    status?: 'active' | 'inactive' | 'suspended';
    locale?: string | null;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
}

export interface Auth {
    user: User;
}
