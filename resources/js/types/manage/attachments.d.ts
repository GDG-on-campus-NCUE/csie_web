import type { PaginatedResponse, FilterOption } from './common';

export interface ManageAttachmentListItem {
    id: number;
    title: string | null;
    filename: string | null;
    type: string;
    size: number | null;
    visibility: string;
    description?: string | null;
    tags?: string[];
    space?: {
        id: number;
        name: string;
    } | null;
    disk?: string | null;
    disk_path?: string | null;
    file_url?: string | null;
    external_url?: string | null;
    download_url?: string | null;
    uploaded_at?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
    uploader?: {
        id: number;
        name: string;
        email?: string | null;
    } | null;
    attachable?: {
        type: string;
        id: number;
        title?: string | null;
        status?: string | null;
        space?: {
            id: number;
            name: string;
        } | null;
    } | null;
}

export interface ManageAttachmentFilterState {
    keyword: string | null;
    type: string | null;
    visibility: string | null;
    space: number | null;
    tag: string | null;
    from: string | null;
    to: string | null;
    per_page: number | null;
    sort: string | null;
    direction: 'asc' | 'desc' | null;
    view: 'list' | 'grid';
}

export interface ManageAttachmentFilterOptions {
    types: FilterOption[];
    visibilities: FilterOption[];
    spaces: FilterOption[];
    tags: FilterOption[];
}

export type ManageAttachmentListResponse = PaginatedResponse<ManageAttachmentListItem>;
