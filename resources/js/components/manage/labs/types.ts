export interface LabTeacher {
    id: number;
    name: { 'zh-TW'?: string; en?: string } | string;
    title?: { 'zh-TW'?: string; en?: string } | string | null;
}

export interface LabListItem {
    id: number;
    code?: string | null;
    name: string;
    name_en?: string | null;
    email?: string | null;
    phone?: string | null;
    website_url?: string | null;
    description?: string | null;
    description_en?: string | null;
    tags: string[];
    visible: boolean;
    sort_order: number;
    updated_at?: string | null;
    cover_image_url?: string | null;
    teachers: LabTeacher[];
}

export interface LabFormData {
    code: string;
    name: string;
    name_en: string;
    email: string;
    phone: string;
    website_url: string;
    description: string;
    description_en: string;
    tags: string[];
    sort_order: number | null;
    visible: boolean;
    teacher_ids: number[];
    cover_image?: File | null;
}
