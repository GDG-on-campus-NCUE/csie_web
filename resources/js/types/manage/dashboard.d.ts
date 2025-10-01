export interface AdminDashboardMetrics {
    totalPosts: number;
    publishedPosts: number;
    draftPosts: number;
    archivedPosts: number;
    pinnedPosts: number;
    totalUsers: number;
}

export interface AdminDashboardAttachmentsSummary {
    total: number;
    images: number;
    documents: number;
    links: number;
    trashed: number;
    totalSize: number;
}

export interface AdminDashboardContactSummary {
    new: number;
    in_progress: number;
    resolved: number;
    spam: number;
}

export interface AdminDashboardPostSummary {
    id: number;
    title: string;
    title_en: string;
    status: 'draft' | 'published' | 'archived';
    publish_at: string | null;
    attachments_count: number;
    pinned: boolean;
    category?: {
        id: number;
        name: string;
        name_en: string;
    } | null;
}

export interface AdminDashboardAttachmentSummary {
    id: number;
    title: string | null;
    type: 'image' | 'document' | 'link';
    size: number | null;
    created_at: string;
    attachable?: {
        type: string | null;
        id: number | null;
        label: string | null;
    } | null;
}

export interface AdminDashboardData {
    metrics: AdminDashboardMetrics;
    attachments: AdminDashboardAttachmentsSummary;
    contactMessages: AdminDashboardContactSummary;
    recentPosts: AdminDashboardPostSummary[];
    recentAttachments: AdminDashboardAttachmentSummary[];
    generatedAt: string;
}
