// 專門集中管理公告管理頁面會共用的型別定義，避免各檔案重複宣告。
export type PostStatus = 'draft' | 'published' | 'scheduled';

export interface CategoryOption {
    id: number;
    name: string;
    name_en: string;
    slug: string;
}

export interface AuthorOption {
    id: number;
    name: string;
}

export interface PostItem {
    id: number;
    title: string;
    slug: string;
    status: PostStatus;
    publish_at: string | null;
    category: CategoryOption | null;
    author: { id: number; name: string; email: string } | null;
    views: number;
    attachments_count: number;
    created_at: string | null;
    updated_at: string | null;
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

export type FilterState = {
    search: string;
    category: string;
    status: string;
    author: string;
    date_from: string;
    date_to: string;
    per_page: string;
};

export interface PostFlashMessages {
    success?: string;
    error?: string;
    info?: string;
    importErrors?: string[];
}

export type TranslatorFunction = (
    key: string,
    fallbackText?: string,
    replacements?: Record<string, string | number>,
) => string;

export const statusVariantMap: Record<PostStatus, 'secondary' | 'outline' | 'default'> = {
    draft: 'secondary',
    published: 'default',
    scheduled: 'outline',
};

export const statusFallbackLabels: Record<PostStatus, { zh: string; en: string }> = {
    draft: { zh: '草稿', en: 'Draft' },
    published: { zh: '已發布', en: 'Published' },
    scheduled: { zh: '排程中', en: 'Scheduled' },
};
