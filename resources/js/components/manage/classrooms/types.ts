export interface ClassroomStaff {
    id: number;
    name: { 'zh-TW'?: string; en?: string } | string;
    position?: { 'zh-TW'?: string; en?: string } | string | null;
}

export interface ClassroomListItem {
    id: number;
    code?: string | null;
    name: string;
    name_en?: string | null;
    location?: string | null;
    capacity?: number | null;
    equipment_summary?: string | null;
    description?: string | null;
    description_en?: string | null;
    tags: string[];
    visible: boolean;
    sort_order: number;
    updated_at?: string | null;
    staff: ClassroomStaff[];
}

export interface ClassroomFormData {
    code: string;
    name: string;
    name_en: string;
    location: string;
    capacity: number | null;
    equipment_summary: string;
    description: string;
    description_en: string;
    tags: string[];
    sort_order: number | null;
    visible: boolean;
    staff_ids: number[];
}
