export interface ManageUserSpace {
    id: number;
    name: string;
}

export interface ManageUserProfileSummary {
    avatar_url?: string | null;
    bio?: string | null;
}

export interface ManageUserActivityEntry {
    id: number;
    action: string;
    description: string | null;
    properties: Record<string, unknown> | null;
    created_at: string | null;
}

export interface ManageUser {
    id: number;
    name: string;
    email: string;
    role: string | null;
    role_label: string;
    status: string;
    status_label: string;
    locale: string | null;
    space_count: number;
    spaces: ManageUserSpace[];
    last_login_at: string | null;
    last_seen_at: string | null;
    email_verified_at: string | null;
    created_at: string | null;
    updated_at: string | null;
    profile?: ManageUserProfileSummary | null;
    recent_activities?: ManageUserActivityEntry[] | null;
}

export interface ManageUserFilterState {
    keyword: string;
    roles: string[];
    statuses: string[];
    space: number | null;
    sort: string;
    direction: 'asc' | 'desc';
    per_page: number;
}

export interface ManageUserFilterOptions {
    roles: Array<{ value: string; label: string }>;
    statuses: Array<{ value: string; label: string }>;
    spaces: Array<{ value: number; label: string }>;
    sorts: Array<{ value: string; label: string }>;
}

export interface ManageUserAbilities {
    canCreate: boolean;
    canUpdate: boolean;
    canDelete: boolean;
    canAssignRoles: boolean;
    canImpersonate: boolean;
    canSendPasswordReset: boolean;
}

export interface ManageUserListResponse {
    data: ManageUser[];
    meta: {
        current_page: number;
        from: number | null;
        last_page: number;
        path: string;
        per_page: number;
        to: number | null;
        total: number;
        links?: Array<{
            url: string | null;
            label: string;
            active: boolean;
        }>;
    };
}
