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

// ==================== Project 專案相關類型 ====================

export interface ManageProjectListItem {
    id: number;
    title: string;
    title_en: string | null;
    description: string | null;
    status: string;
    created_at: string | null;
    updated_at: string | null;
}

export interface ManageProjectFilterState {
    keyword: string | null;
    status: string | null;
    per_page: number;
}

export type ManageProjectListResponse = PaginatedResponse<ManageProjectListItem>;
