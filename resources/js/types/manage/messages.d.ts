import type { PaginatedResponse, FilterOption } from './common';

export interface ManageMessageListItem {
    id: number;
    locale: string | null;
    name: string;
    email: string;
    phone?: string | null;
    subject: string | null;
    message: string;
    status: string;
    file_url?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
    processed_at?: string | null;
    processor?: {
        id: number;
        name: string;
    } | null;
}

export interface ManageMessageFilterState {
    keyword: string | null;
    status: string | null;
    from: string | null;
    to: string | null;
    per_page: number | null;
}

export interface ManageMessageFilterOptions {
    statuses: FilterOption[];
}

export type ManageMessageListResponse = PaginatedResponse<ManageMessageListItem>;
