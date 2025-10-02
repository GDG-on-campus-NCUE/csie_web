import type { FilterOption, PaginatedResponse } from './common';

export interface ManageTag {
    id: number;
    context: string;
    context_label: string;
    name: string;
    name_en?: string | null;
    slug: string;
    description?: string | null;
    color?: string | null;
    is_active: boolean;
    usage_count: number;
    last_used_at?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
}

export type ManageTagListResponse = PaginatedResponse<ManageTag>;

export interface ManageTagFilterState {
    keyword: string | null;
    status: string | null;
    context: string | null;
    per_page?: number | null;
}

export interface ManageTagFilterOptions {
    contexts: FilterOption[];
    statuses: FilterOption[];
}

export interface ManageTagAbilities {
    canCreate: boolean;
    canUpdate: boolean;
    canDelete: boolean;
}
