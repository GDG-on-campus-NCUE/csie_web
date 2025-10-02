import type { LucideIcon } from 'lucide-react';

export interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

export interface PaginationMeta {
    current_page: number;
    from: number | null;
    last_page: number;
    path: string;
    per_page: number;
    to: number | null;
    total: number;
    links?: PaginationLink[];
}

export interface PaginationLinks {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
}

export interface PaginatedResponse<T> {
    data: T[];
    meta: PaginationMeta;
    links?: PaginationLinks;
}

export interface FilterOption {
    value: string | number;
    label: string;
    count?: number;
    icon?: LucideIcon | string | null;
    hint?: string;
    disabled?: boolean;
}

export interface TagOption extends Omit<FilterOption, 'value'> {
    id: number;
    value: number;
    slug?: string | null;
    color?: string | null;
    usage_count?: number;
    created_at?: string | null;
    updated_at?: string | null;
}

export type ManageAbilityMap = Record<string, boolean>;

export interface SpaceOption {
    id: number;
    name: string;
    slug: string;
    description?: string | null;
    icon?: string | null;
}
