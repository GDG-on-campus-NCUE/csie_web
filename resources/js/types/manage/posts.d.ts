import type { PaginatedResponse } from './common';

export interface ManagePostListItem {
    id: number;
    slug: string;
    title: string;
    title_en: string;
    excerpt?: string | null;
    status: string;
    visibility: string;
    pinned: boolean;
    published_at?: string | null;
    updated_at?: string | null;
    created_at?: string | null;
    category?: {
        id: number;
        name: string;
    } | null;
    space?: {
        id: number;
        name: string;
    } | null;
    author?: {
        id: number;
        name: string;
    } | null;
    attachments_count?: number;
    views: number;
    tags?: Array<{
        id: number;
        name: string;
    }>;
}

export interface ManagePostFilterState {
    keyword: string | null;
    status: string | null;
    category: number | null;
    tag: string | null;
    publisher: number | null;
    published_from: string | null;
    published_to: string | null;
    per_page: number | null;
}

export interface ManagePostFilterOption {
    value: string | number;
    label: string;
    count?: number;
    id?: number;
}

export interface ManagePostFilterOptions {
    statuses: ManagePostFilterOption[];
    categories: ManagePostFilterOption[];
    tags: ManagePostFilterOption[];
}

export type ManagePostListResponse = PaginatedResponse<ManagePostListItem>;

export interface ManagePostAttachment {
    id: number;
    title: string;
    filename: string | null;
    type: string;
    url: string | null;
    is_external: boolean;
    size: number | null;
    uploader?: {
        id: number;
        name: string;
    } | null;
    uploaded_at?: string | null;
}

export interface ManagePostTimelineEntry {
    type: string;
    title: string;
    description: string;
    actor: string | null;
    timestamp: string;
}

export interface ManagePostDetail {
    id: number;
    slug: string;
    title: string;
    title_en?: string | null;
    summary?: string | null;
    summary_en?: string | null;
    content: string;
    content_en?: string | null;
    status: string;
    visibility: string;
    source_type: string;
    pinned: boolean;
    published_at?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
    views: number;
    category?: {
        id: number;
        name: string;
    } | null;
    space?: {
        id: number;
        name: string;
    } | null;
    author?: {
        id: number;
        name: string;
    } | null;
    updater?: {
        id: number;
        name: string;
    } | null;
    tags?: Array<{
        id: number;
        name: string;
        slug?: string | null;
        color?: string | null;
        is_active?: boolean;
    }>;
    attachments?: ManagePostAttachment[];
    timeline?: ManagePostTimelineEntry[];
}
