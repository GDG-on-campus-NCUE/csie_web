import type { LucideIcon } from 'lucide-react';
import {
    LayoutGrid,
    Megaphone,
    NotebookPen,
    Beaker,
    School,
    GraduationCap,
    Users,
    Mail,
    FileText,
    Settings,
    User as UserIcon,
    ShieldCheck,
    HelpCircle,
    Folder,
    LifeBuoy,
} from 'lucide-react';

import type { ManageRole } from '@/components/manage/manage-brand';
import type { PermissionKey } from '@/components/manage/utils/permission-utils';
import { MANAGE_PERMISSIONS } from '@/components/manage/utils/permission-utils';

/**
 * 管理後台主要導覽項目的定義
 */
interface ManageRouteDefinition {
    id: string;
    href: string;
    icon: LucideIcon;
    permission: PermissionKey;
    /**
     * 依角色對應的翻譯 key
     */
    labels: Partial<Record<ManageRole, string>> & { admin?: string };
    /**
     * 若不同角色需要不同圖示，於此覆寫
     */
    iconByRole?: Partial<Record<ManageRole, LucideIcon>>;
}

interface ManageFooterLinkDefinition {
    id: string;
    href: string;
    icon: LucideIcon;
    labels: Partial<Record<ManageRole, string>>;
    permission?: PermissionKey | null;
}

interface ResolvedRouteDefinition extends ManageRouteDefinition {
    labelKey: string;
    iconForRole: LucideIcon;
}

interface ResolvedFooterLinkDefinition extends ManageFooterLinkDefinition {
    labelKey: string;
}

const MAIN_ROUTE_DEFINITIONS: ManageRouteDefinition[] = [
    {
        id: 'dashboard',
        href: '/manage/dashboard',
        icon: LayoutGrid,
        permission: 'VIEW_DASHBOARD',
        labels: {
            admin: 'sidebar.admin.dashboard',
            teacher: 'sidebar.teacher.dashboard',
            user: 'sidebar.user.dashboard',
        },
    },
    {
        id: 'posts',
        href: '/manage/posts',
        icon: Megaphone,
        permission: 'MANAGE_POSTS',
        labels: {
            admin: 'sidebar.admin.posts',
            teacher: 'sidebar.teacher.posts',
        },
    },
    {
        id: 'tags',
        href: '/manage/tags',
        icon: NotebookPen,
        permission: 'MANAGE_TAGS',
        labels: {
            admin: 'sidebar.admin.tags',
        },
    },
    {
        id: 'labs',
        href: '/manage/labs',
        icon: Beaker,
        permission: 'MANAGE_LABS',
        labels: {
            admin: 'sidebar.admin.labs',
            teacher: 'sidebar.teacher.labs',
        },
    },
    {
        id: 'classrooms',
        href: '/manage/classrooms',
        icon: School,
        permission: 'MANAGE_CLASSROOMS',
        labels: {
            admin: 'sidebar.admin.classrooms',
        },
    },
    {
        id: 'academics',
        href: '/manage/academics',
        icon: GraduationCap,
        permission: 'MANAGE_ACADEMICS',
        labels: {
            admin: 'sidebar.admin.academics',
        },
    },
    {
        id: 'users',
        href: '/manage/users',
        icon: Users,
        permission: 'MANAGE_USERS',
        labels: {
            admin: 'sidebar.admin.users',
        },
    },
    {
        id: 'contact-messages',
        href: '/manage/contact-messages',
        icon: Mail,
        permission: 'MANAGE_CONTACT_MESSAGES',
        labels: {
            admin: 'sidebar.admin.messages',
        },
    },
    {
        id: 'attachments',
        href: '/manage/attachments',
        icon: FileText,
        permission: 'MANAGE_ATTACHMENTS',
        labels: {
            admin: 'sidebar.admin.attachments',
        },
    },
    {
        id: 'projects',
        href: '/manage/projects',
        icon: NotebookPen,
        permission: 'MANAGE_PROJECTS',
        labels: {
            teacher: 'sidebar.teacher.projects',
        },
    },
    {
        id: 'profile',
        href: '/manage/settings/profile',
        icon: Settings,
        permission: 'MANAGE_PROFILE',
        labels: {
            teacher: 'sidebar.teacher.profile',
            user: 'sidebar.user.profile',
        },
        iconByRole: {
            user: UserIcon,
        },
    },
    {
        id: 'password',
        href: '/manage/settings/password',
        icon: ShieldCheck,
        permission: 'MANAGE_PASSWORD',
        labels: {
            user: 'sidebar.user.security',
        },
    },
];

const FOOTER_LINK_DEFINITIONS: ManageFooterLinkDefinition[] = [
    {
        id: 'settings',
        href: '/manage/settings/profile',
        icon: Settings,
        permission: 'MANAGE_PROFILE',
        labels: {
            admin: 'sidebar.footer.settings',
        },
    },
    {
        id: 'docs',
        href: 'https://laravel.com/docs',
        icon: HelpCircle,
        labels: {
            admin: 'sidebar.footer.docs',
        },
        permission: null,
    },
    {
        id: 'repo',
        href: 'https://github.com/Grasonyang/csie_web',
        icon: Folder,
        labels: {
            admin: 'sidebar.footer.repo',
        },
        permission: null,
    },
    {
        id: 'teacher-guide',
        href: 'https://github.com/Grasonyang/csie_web',
        icon: HelpCircle,
        labels: {
            teacher: 'sidebar.teacher.guide',
        },
        permission: null,
    },
    {
        id: 'user-support',
        href: 'mailto:csie@cc.ncue.edu.tw',
        icon: LifeBuoy,
        labels: {
            user: 'sidebar.user.support',
        },
        permission: null,
    },
];

const NAV_LABEL_KEYS: Record<ManageRole, string> = {
    admin: 'sidebar.admin.nav_label',
    teacher: 'sidebar.teacher.nav_label',
    user: 'sidebar.user.nav_label',
};

interface ManageRoutePermissionRule {
    prefix: string;
    permission: PermissionKey;
}

const ROUTE_PERMISSION_RULES: ManageRoutePermissionRule[] = [
    { prefix: '/manage/dashboard', permission: 'VIEW_DASHBOARD' },
    { prefix: '/manage/posts', permission: 'MANAGE_POSTS' },
    { prefix: '/manage/post-categories', permission: 'MANAGE_POSTS' },
    { prefix: '/manage/tags', permission: 'MANAGE_TAGS' },
    { prefix: '/manage/labs', permission: 'MANAGE_LABS' },
    { prefix: '/manage/classrooms', permission: 'MANAGE_CLASSROOMS' },
    { prefix: '/manage/academics', permission: 'MANAGE_ACADEMICS' },
    { prefix: '/manage/programs', permission: 'MANAGE_PROGRAMS' },
    { prefix: '/manage/projects', permission: 'MANAGE_PROJECTS' },
    { prefix: '/manage/publications', permission: 'MANAGE_PUBLICATIONS' },
    { prefix: '/manage/users', permission: 'MANAGE_USERS' },
    { prefix: '/manage/contact-messages', permission: 'MANAGE_CONTACT_MESSAGES' },
    { prefix: '/manage/attachments', permission: 'MANAGE_ATTACHMENTS' },
    { prefix: '/manage/settings/profile', permission: 'MANAGE_PROFILE' },
    { prefix: '/manage/settings/password', permission: 'MANAGE_PASSWORD' },
];

const byLongestPrefix = (a: ManageRoutePermissionRule, b: ManageRoutePermissionRule) =>
    b.prefix.length - a.prefix.length;

ROUTE_PERMISSION_RULES.sort(byLongestPrefix);

const roleHasPermission = (role: ManageRole, permission: PermissionKey | null | undefined): boolean => {
    if (!permission) {
        return true;
    }

    const allowedRoles = MANAGE_PERMISSIONS[permission];
    if (!allowedRoles) {
        return false;
    }

    return allowedRoles.includes(role);
};

const resolveRoutesForRole = (role: ManageRole): ResolvedRouteDefinition[] =>
    MAIN_ROUTE_DEFINITIONS.flatMap((route) => {
        const labelKey = route.labels[role];
        if (!labelKey) {
            return [];
        }

        if (!roleHasPermission(role, route.permission)) {
            return [];
        }

        const iconForRole = route.iconByRole?.[role] ?? route.icon;

        return [{
            ...route,
            labelKey,
            iconForRole,
        }];
    });

const resolveFooterLinksForRole = (role: ManageRole): ResolvedFooterLinkDefinition[] =>
    FOOTER_LINK_DEFINITIONS.flatMap((item) => {
        const labelKey = item.labels[role];

        if (!labelKey) {
            return [];
        }

        if (!roleHasPermission(role, item.permission ?? null)) {
            return [];
        }

        return [
            {
                ...item,
                labelKey,
            },
        ];
    });

export function getMainRoutesForRole(role: ManageRole) {
    return resolveRoutesForRole(role);
}

export function getFooterLinksForRole(role: ManageRole) {
    return resolveFooterLinksForRole(role);
}

export function getNavLabelKey(role: ManageRole): string {
    return NAV_LABEL_KEYS[role] ?? NAV_LABEL_KEYS.admin;
}

export function resolvePermissionByPath(pathname: string): PermissionKey | null {
    const normalizedPath = pathname.split('?')[0];

    const rule = ROUTE_PERMISSION_RULES.find(({ prefix }) => normalizedPath.startsWith(prefix));

    return rule?.permission ?? null;
}

