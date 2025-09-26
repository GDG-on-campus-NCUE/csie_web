// 附件管理頁面共用的型別定義，統一管理以方便日後維護。
export type AttachmentType = 'image' | 'document' | 'link';
export type AttachmentVisibility = 'public' | 'private';

export interface AttachmentItem {
    id: number;
    type: AttachmentType;
    title: string | null;
    filename: string | null;
    file_url: string | null;
    external_url: string | null;
    download_url: string | null;
    mime_type: string | null;
    size: number | null;
    visibility: AttachmentVisibility | null;
    attached_to_type: string | null;
    attached_to_id: number | null;
    uploaded_by: number | null;
    uploader: { id: number; name: string; email: string } | null;
    created_at: string | null;
    updated_at: string | null;
    deleted_at: string | null;
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
    from: number | null;
    to: number | null;
}

export type AttachmentFilterState = {
    search: string;
    type: string;
    attached_to_type: string;
    attached_to_id: string;
    visibility: string;
    trashed: string;
    per_page: string;
    sort: string;
};

export interface AttachmentFlashMessages {
    success?: string;
    error?: string;
    info?: string;
}

export type TranslatorFunction = (
    key: string,
    fallbackText?: string,
    replacements?: Record<string, string | number>,
) => string;

export interface SortOption {
    value: string;
    label: string;
}
