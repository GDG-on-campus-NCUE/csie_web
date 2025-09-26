// TypeScript interfaces for Staff Management

export interface LocalizedContent {
    'zh-TW': string;
    en?: string;
}

export interface Staff {
    id: number;
    name: string;
    name_en: string;
    position: string;
    position_en: string;
    email?: string;
    phone?: string;
    photo_url?: string;
    bio?: string;
    bio_en?: string;
    visible: boolean;
    sort_order: number;
    created_at?: string;
    updated_at?: string;
    deleted_at?: string;
}

export interface Teacher {
    id: number;
    name: LocalizedContent;
    title: LocalizedContent;
    email: string;
    phone?: string;
    office?: string;
    bio?: LocalizedContent;
    specialties?: LocalizedContent[];
    education?: LocalizedContent[];
    avatar?: string;
    website?: string;
    lab_id?: number;
    visible: boolean;
    sort_order: number;
    lab?: Lab;
    created_at?: string;
    updated_at?: string;
}

export interface User {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'teacher' | 'user';
}

export interface Lab {
    id: number;
    name: LocalizedContent;
    description?: LocalizedContent;
}

export interface StaffManagementState {
    currentTab: 'staff' | 'teachers';
    staffList: Staff[];
    teacherList: Teacher[];
    loading: boolean;
    filters: {
        search: string;
        visible: boolean | null;
        perPage: number;
    };
    pagination: PaginationMeta;
}

export interface StaffFormState {
    data: Partial<Staff>;
    errors: Record<string, string>;
    processing: boolean;
}

export interface TeacherFormState {
    data: Partial<Teacher>;
    errors: Record<string, string>;
    processing: boolean;
    availableLabs: Lab[];
}

export interface PaginationMeta {
    current_page: number;
    from: number;
    last_page: number;
    per_page: number;
    to: number;
    total: number;
}

// Form data types for API requests
export interface StaffFormData {
    name: LocalizedContent;
    position: LocalizedContent;
    email: string;
    phone?: string;
    office?: string;
    bio?: LocalizedContent;
    avatar?: File;
    visible: boolean;
    sort_order: number;
}

export interface TeacherFormData {
    name: LocalizedContent;
    title: LocalizedContent;
    email: string;
    phone?: string;
    office?: string;
    bio?: LocalizedContent;
    specialties?: LocalizedContent[];
    education?: LocalizedContent[];
    avatar?: File;
    website?: string;
    lab_id?: number;
    visible: boolean;
    sort_order: number;
}

// Inertia page props types
export interface StaffIndexProps {
    initialTab: 'staff' | 'teachers';
    staff: {
        data: Staff[];
        meta: PaginationMeta;
    };
    teachers: {
        data: Teacher[];
        meta: PaginationMeta;
    };
    filters: {
        search: string;
        visible: boolean | null;
        per_page: number;
    };
    translations: {
        manage: Record<string, string>;
    };
}

export interface StaffCreateProps {
    translations: {
        manage: Record<string, string>;
    };
}

export interface StaffEditProps {
    staff: Staff;
    translations: {
        manage: Record<string, string>;
    };
}

export interface TeacherCreateProps {
    translations: {
        manage: Record<string, string>;
    };
}

export interface TeacherEditProps {
    teacher: Teacher;
    translations: {
        manage: Record<string, string>;
    };
}

export interface TeacherShowProps {
    teacher: Teacher & {
        lab?: Lab;
        publications?: any[];
        projects?: any[];
    };
    translations: {
        manage: Record<string, string>;
    };
}
