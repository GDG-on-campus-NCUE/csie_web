// TypeScript interfaces for Staff & Teacher Management

export interface LocalizedContent {
    'zh-TW'?: string;
    en?: string;
}

export type EmploymentStatus = 'active' | 'inactive' | 'retired' | 'left';

export interface StaffUser {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'teacher' | 'user';
}

export interface Lab {
    id: number;
    code?: string | null;
    name: LocalizedContent;
    description?: LocalizedContent;
}

export interface Staff {
    id: number;
    name: LocalizedContent;
    position: LocalizedContent;
    email?: string | null;
    phone?: string | null;
    office?: string | null;
    bio?: LocalizedContent | null;
    avatar_url?: string | null;
    visible: boolean;
    sort_order: number;
    employment_status: EmploymentStatus;
    employment_started_at?: string | null;
    employment_ended_at?: string | null;
    deleted_at?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
    user?: StaffUser | null;
}

export interface Teacher {
    id: number;
    name: LocalizedContent;
    title: LocalizedContent;
    email: string;
    phone?: string | null;
    office?: string | null;
    job_title?: string | null;
    bio?: LocalizedContent | null;
    expertise?: Record<'zh-TW' | 'en', string[]> | null;
    education?: Record<'zh-TW' | 'en', string[]> | null;
    specialties?: LocalizedContent[]; // 為了相容舊表單資料保留
    avatar_url?: string | null;
    website?: string | null;
    lab_id?: number | null;
    visible: boolean;
    sort_order: number;
    employment_status: EmploymentStatus;
    employment_started_at?: string | null;
    employment_ended_at?: string | null;
    deleted_at?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
    user?: StaffUser | null;
    labs?: Array<{ id: number; code?: string | null; name: LocalizedContent }>;
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
    from: number;
    to: number;
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
        active: Staff[];
        trashed: Staff[];
    };
    teachers: {
        data: Teacher[];
        trashed: Teacher[];
        meta: PaginationMeta;
        links: PaginationLink[];
    };
    filters: {
        search?: string;
        status?: string;
        visible?: string;
        per_page?: number;
    };
    perPageOptions: number[];
    employmentStatusOptions: Array<{ value: string; label: string }>;
    visibilityOptions: Array<{ value: string; label: string }>;
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
