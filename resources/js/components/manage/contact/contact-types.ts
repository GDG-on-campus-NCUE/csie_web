import type { PaginationLink } from '@/components/manage/post/post-types';

/**
 * 聯絡訊息狀態列舉，對應資料表中的 status 欄位
 */
export type ContactMessageStatus = 'new' | 'in_progress' | 'resolved' | 'spam';

/**
 * 聯絡訊息資料介面
 */
export interface ContactMessageItem {
    id: number;
    locale: string | null;
    name: string;
    email: string;
    subject: string | null;
    message: string;
    file_url: string | null;
    status: ContactMessageStatus;
    processed_by: number | null;
    processed_at: string | null;
    created_at: string;
    updated_at: string;
    processor?: {
        id: number;
        name: string;
        email?: string | null;
    } | null;
}

/**
 * 篩選狀態，封裝搜尋關鍵字、狀態與每頁筆數
 */
export interface ContactFilterState {
    search: string;
    status: string;
    per_page: string;
}

/**
 * 分頁中 meta 資料定義
 */
export interface ContactPaginationMeta {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
}

/**
 * Toast 用的閃存訊息
 */
export interface ContactFlashMessages {
    success?: string;
    error?: string;
    info?: string;
}

/**
 * 狀態下拉選項定義
 */
export interface ContactStatusOption {
    value: ContactMessageStatus | '';
    label: string;
}

/**
 * 狀態顯示用文字，區分中英文預設字詞
 */
export const contactStatusLabels: Record<ContactMessageStatus, { zh: string; en: string }> = {
    new: { zh: '未處理', en: 'New' },
    in_progress: { zh: '處理中', en: 'In progress' },
    resolved: { zh: '已完成', en: 'Resolved' },
    spam: { zh: '垃圾訊息', en: 'Spam' },
};

/**
 * Badge 樣式對照，提供更明顯的狀態顏色
 */
export const contactStatusBadgeVariant: Record<ContactMessageStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    new: 'secondary',
    in_progress: 'default',
    resolved: 'outline',
    spam: 'destructive',
};

export type ContactPaginationLink = PaginationLink;
