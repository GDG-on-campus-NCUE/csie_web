import { InertiaLinkProps } from '@inertiajs/react';
import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

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

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    sidebarOpen: boolean;
    locale?: string;
    locales?: string[];
    i18n?: Record<string, any>;
    adminDashboard?: AdminDashboardData | null;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'teacher' | 'user';
    status?: 'active' | 'suspended';
    locale?: string | null;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
}
