// 集中管理使用者管理頁面會共用的型別，避免重複宣告造成維護負擔。
export type UserRole = 'admin' | 'teacher' | 'user';

export type UserStatus = 'active' | 'suspended';

export interface UserRow {
    id: number;
    name: string;
    email: string;
    role: UserRole;
    status: UserStatus;
    avatar?: string | null;
    email_verified_at?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
    deleted_at?: string | null;
}

export interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

export interface PaginationMeta {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from?: number | null;
    to?: number | null;
    links?: PaginationLink[];
}

export interface UserFilterState {
    q: string;
    role: string;
    status: string;
    created_from: string;
    created_to: string;
    sort: string;
    per_page: string;
}

export interface UserFlashMessages {
    success?: string;
    error?: string;
    info?: string;
}

export type TranslatorFunction = (
    key: string,
    fallbackText?: string,
    replacements?: Record<string, string | number>,
) => string;

export interface OptionItem {
    value: string;
    label: string;
}

export interface UserFormPayload {
    id?: number;
    name: string;
    email: string;
    role: UserRole;
    status: UserStatus;
    email_verified_at?: string | null;
}

export interface UsersResponsePayload {
    data: UserRow[];
    links: PaginationLink[];
    meta: PaginationMeta;
}
