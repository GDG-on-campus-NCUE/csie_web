import { type ManageRole } from '@/components/manage/manage-brand';
import { useCurrentRole, useRolePermission } from '@/components/manage/guards/role-guard';
import { useTranslator } from '@/hooks/use-translator';
import { type ReactNode } from 'react';

export const MANAGE_PERMISSIONS = {
    MANAGE_USERS: ['admin'] as ManageRole[],
    MANAGE_SETTINGS: ['admin'] as ManageRole[],
    MANAGE_ATTACHMENTS: ['admin'] as ManageRole[],
    MANAGE_CONTACT_MESSAGES: ['admin'] as ManageRole[],

    MANAGE_POSTS: ['admin', 'teacher'] as ManageRole[],
    MANAGE_TAGS: ['admin'] as ManageRole[],

    MANAGE_LABS: ['admin', 'teacher'] as ManageRole[],
    MANAGE_CLASSROOMS: ['admin'] as ManageRole[],
    MANAGE_ACADEMICS: ['admin'] as ManageRole[],
    MANAGE_PROGRAMS: ['admin'] as ManageRole[],
    MANAGE_PROJECTS: ['admin', 'teacher'] as ManageRole[],
    MANAGE_PUBLICATIONS: ['admin'] as ManageRole[],

    MANAGE_PROFILE: ['admin', 'teacher', 'user'] as ManageRole[],
    MANAGE_PASSWORD: ['admin', 'teacher', 'user'] as ManageRole[],

    VIEW_DASHBOARD: ['admin', 'teacher', 'user'] as ManageRole[],
} as const;

export type PermissionKey = keyof typeof MANAGE_PERMISSIONS;

interface PermissionGuardProps {
    permission: PermissionKey;
    children: ReactNode;
    fallback?: ReactNode;
}

export function PermissionGuard({ permission, children, fallback = null }: PermissionGuardProps) {
    const allowedRoles = MANAGE_PERMISSIONS[permission];
    const hasPermission = useRolePermission(allowedRoles);

    return hasPermission ? <>{children}</> : <>{fallback}</>;
}

export function usePermission(permission: PermissionKey): boolean {
    const allowedRoles = MANAGE_PERMISSIONS[permission];
    return useRolePermission(allowedRoles);
}

export function useRoleInfo() {
    const role = useCurrentRole();
    const { t } = useTranslator('manage');

    return {
        role,
        displayName: {
            admin: t('layout.brand.admin.primary'),
            teacher: t('layout.brand.teacher.primary'),
            user: t('layout.brand.user.primary'),
        }[role],
        description: {
            admin: t('layout.brand.admin.secondary'),
            teacher: t('layout.brand.teacher.secondary'),
            user: t('layout.brand.user.secondary'),
        }[role],
    };
}

export function isManageRole(role: string): boolean {
    return ['admin', 'teacher'].includes(role);
}

export function isAdminRole(role: string): boolean {
    return role === 'admin';
}

export function isTeacherRole(role: string): boolean {
    return role === 'teacher';
}
