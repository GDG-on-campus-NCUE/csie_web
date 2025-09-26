import type { TagResource } from './tag-form';

/**
 * 標籤列表項目的結構定義，延伸表單使用的 TagResource 以避免重複型別宣告。
 */
export interface TagListItem extends TagResource {
    id: number;
    context_label: string;
    created_at?: string | null;
    updated_at?: string | null;
}

/**
 * 顯示用的標籤詳細資料結構，與列表項目相同但語意上區隔用途。
 */
export type TagDetail = TagListItem;

/**
 * 後端透過 Flash 帶入的訊息結構，提供頁面呈現 Toast 時使用。
 */
export interface TagFlashMessages {
    success?: string;
    error?: string;
    info?: string;
}
