import type { PaginatedResponse, ManageActivityLogItem } from './common';

// ==================== Lab 實驗室相關類型 ====================

export interface ManageLabMember {
    id: number;
    name: string;
    email: string;
    role: string;
    pivot_role: string | null;
    joined_at: string | null;
}

export interface ManageLabPrincipalInvestigator {
    id: number;
    name: string;
    email: string;
    role: string;
}

export interface ManageLabTag {
    id: number | null;
    name: string;
    name_en: string | null;
}

export interface ManageLabListItem {
    id: number;
    name: string;
    name_en: string | null;
    field: string | null;
    code: string;
    location: string | null;
    capacity: number | null;
    description: string | null;
    description_en: string | null;
    equipment_summary: string | null;
    website_url: string | null;
    contact_email: string | null;
    contact_phone: string | null;
    cover_image_url: string | null;
    visible: boolean;
    sort_order: number;
    principal_investigator_id: number | null;
    principal_investigator?: ManageLabPrincipalInvestigator | null;
    members_count?: number;
    tags?: ManageLabTag[];
    created_at: string | null;
    updated_at: string | null;
    deleted_at: string | null;
}

export interface ManageLabDetail extends ManageLabListItem {
    members?: ManageLabMember[];
    recent_activities?: ManageActivityLogItem[];
}

export interface ManageLabFilterState {
    keyword: string | null;
    field: string | null;
    visible: boolean | null;
    tag: string | null;
    principal_investigator: number | null;
    per_page: number;
}

export interface ManageLabFilterOption {
    value: string | number | boolean;
    label: string;
    count?: number;
}

export interface ManageLabFilterOptions {
    fields: ManageLabFilterOption[];
    tags: ManageLabFilterOption[];
    visibilities: ManageLabFilterOption[];
    principal_investigators: ManageLabFilterOption[];
}

export interface ManageLabFormData {
    name: string;
    name_en?: string | null;
    field?: string | null;
    code?: string;
    location?: string | null;
    capacity?: number | null;
    description?: string | null;
    description_en?: string | null;
    equipment_summary?: string | null;
    website_url?: string | null;
    contact_email?: string | null;
    contact_phone?: string | null;
    cover_image_url?: string | null;
    visible?: boolean;
    sort_order?: number;
    principal_investigator_id?: number | null;
    tag_ids?: number[];
}

export interface ManageLabMemberFormData {
    user_id: number;
    role?: string | null;
}

export interface ManageLabAbilities {
    canCreate: boolean;
    canUpdate: boolean;
    canDelete: boolean;
    canManageMembers: boolean;
    canViewAll: boolean;
}

export type ManageLabListResponse = PaginatedResponse<ManageLabListItem>;

// ==================== Project 研究計畫相關類型 ====================

export interface ManageProjectTag {
    id: number | null;
    name: string;
    name_en: string | null;
}

export interface ManageProjectSpace {
    id: number;
    name: string;
}

export interface ManageProjectListItem {
    id: number;
    title: string;
    title_en: string | null;
    sponsor: string;
    funding_source: string; // 別名
    principal_investigator: string;
    start_date: string | null;
    end_date: string | null;
    start_at: string | null; // 別名
    end_at: string | null; // 別名
    duration: string;
    total_budget: number | null;
    amount: number | null; // 別名
    formatted_budget: string;
    summary: string | null;
    status: 'planning' | 'upcoming' | 'ongoing' | 'completed';
    tags?: ManageProjectTag[];
    space?: ManageProjectSpace | null;
    space_id: number | null;
    created_at: string | null;
    updated_at: string | null;
}

export interface ManageProjectDetail extends ManageProjectListItem {
    attachments?: ManageProjectAttachment[];
    recent_activities?: ManageActivityLogItem[];
}

export interface ManageProjectAttachment {
    id: number;
    filename: string;
    file_path: string;
    file_size: number;
    mime_type: string;
    created_at: string | null;
}

export interface ManageProjectFilterState {
    search: string | null;
    status: 'planning' | 'upcoming' | 'ongoing' | 'completed' | null;
    tag: string | null;
    sponsor: string | null;
    year: number | null;
    per_page: number;
}

export interface ManageProjectFilterOption {
    value: string | number;
    label: string;
    count?: number;
}

export interface ManageProjectFilterOptions {
    sponsors: string[];
    years: number[];
    statuses: ManageProjectFilterOption[];
}

export interface ManageProjectFormData {
    title: string;
    title_en?: string | null;
    sponsor: string;
    funding_source?: string; // 別名
    principal_investigator: string;
    start_date: string;
    end_date?: string | null;
    start_at?: string; // 別名
    end_at?: string | null; // 別名
    total_budget?: number | null;
    amount?: number | null; // 別名
    summary?: string | null;
    tags?: string[];
    space_id?: number | null;
    attachments?: number[];
}

export interface ManageProjectAbilities {
    canCreate: boolean;
    canUpdate: boolean;
    canDelete: boolean;
}

export type ManageProjectListResponse = PaginatedResponse<ManageProjectListItem>;

// ==================== Post 文章相關類型 ====================

export interface ManageTeacherPostTag {
    id: number;
    name: string;
    slug: string;
}

export interface ManageTeacherPostCategory {
    id: number;
    name: string;
    name_en: string | null;
    slug: string;
}

export interface ManageTeacherPostAuthor {
    id: number;
    name: string;
    email?: string;
}

export interface ManageTeacherPostListItem {
    id: number;
    title: string;
    slug: string;
    status: 'draft' | 'scheduled' | 'published' | 'archived';
    published_at: string | null;
    views_count: number;
    category: ManageTeacherPostCategory | null;
    tags: ManageTeacherPostTag[];
    author?: ManageTeacherPostAuthor | null;
    target_audience?: string | null;
    course_start_at?: string | null;
    course_end_at?: string | null;
    created_at: string | null;
    updated_at: string | null;
}

export interface ManageTeacherPostFilterState {
    keyword?: string | null;
    search?: string | null;
    status: 'draft' | 'scheduled' | 'published' | 'archived' | null;
    category: number | null;
    tag: number | null;
    date_from: string | null;
    date_to: string | null;
    per_page: number;
}

export interface ManageTeacherPostFilterOption {
    value: string | number;
    label: string;
    count?: number;
}

export interface ManageTeacherPostFilterOptions {
    statuses: ManageTeacherPostFilterOption[];
    categories: ManageTeacherPostFilterOption[];
    tags: ManageTeacherPostFilterOption[];
}

export type ManageTeacherPostListResponse = PaginatedResponse<ManageTeacherPostListItem>;
