import { type ManageRole } from '@/components/manage/manage-brand';
import { useCurrentRole, useRolePermission } from '@/components/manage/guards/role-guard';
import { useTranslator } from '@/hooks/use-translator';
import { type ReactNode } from 'react';

/**
 * 管理權限配置
 * 定義不同功能對應的角色權限
 */
export const MANAGE_PERMISSIONS = {
    // 系統管理
    MANAGE_USERS: ['admin'] as ManageRole[],
    MANAGE_STAFF: ['admin'] as ManageRole[],
    MANAGE_SETTINGS: ['admin'] as ManageRole[],
    MANAGE_ATTACHMENTS: ['admin'] as ManageRole[],
    MANAGE_CONTACT_MESSAGES: ['admin'] as ManageRole[],

    // 內容管理
    MANAGE_POSTS: ['admin', 'teacher'] as ManageRole[],
    MANAGE_TAGS: ['admin'] as ManageRole[],

    // 學術管理
    MANAGE_LABS: ['admin', 'teacher'] as ManageRole[],
    MANAGE_CLASSROOMS: ['admin'] as ManageRole[],
    MANAGE_ACADEMICS: ['admin', 'teacher'] as ManageRole[],
    MANAGE_PROGRAMS: ['admin'] as ManageRole[],
    MANAGE_PROJECTS: ['admin'] as ManageRole[],
    MANAGE_PUBLICATIONS: ['admin'] as ManageRole[],

    // 個人設定
    MANAGE_PROFILE: ['admin', 'teacher', 'user'] as ManageRole[],
    MANAGE_PASSWORD: ['admin', 'teacher', 'user'] as ManageRole[],

    // 檢視權限
    VIEW_DASHBOARD: ['admin', 'teacher', 'user'] as ManageRole[],
} as const;

export type PermissionKey = keyof typeof MANAGE_PERMISSIONS;

interface PermissionGuardProps {
    /** 需要的權限鍵值 */
    permission: PermissionKey;
    /** 子組件 */
    children: ReactNode;
    /** 當權限不足時顯示的內容 */
    fallback?: ReactNode;
}

/**
 * 權限守衛組件
 * 根據預定義的權限配置控制組件的顯示
 *
 * @example
 * ```tsx
 * <PermissionGuard permission="MANAGE_USERS">
 *   <UserManagementComponent />
 * </PermissionGuard>
 * ```
 */
export function PermissionGuard({ permission, children, fallback = null }: PermissionGuardProps) {
    const allowedRoles = MANAGE_PERMISSIONS[permission];
    const hasPermission = useRolePermission(allowedRoles);

    return hasPermission ? <>{children}</> : <>{fallback}</>;
}

/**
 * Hook: 檢查是否具有特定功能權限
 */
export function usePermission(permission: PermissionKey): boolean {
    const allowedRoles = MANAGE_PERMISSIONS[permission];
    return useRolePermission(allowedRoles);
}

/**
 * Hook: 獲取角色相關的顯示資訊
 */
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

/**
 * 工具函數：檢查角色是否有管理權限
 */
export function isManageRole(role: string): boolean {
    return ['admin', 'teacher'].includes(role);
}

/**
 * 工具函數：檢查角色是否為管理員
 */
export function isAdminRole(role: string): boolean {
    return role === 'admin';
}

/**
 * 工具函數：檢查角色是否為教師
 */
export function isTeacherRole(role: string): boolean {
    return role === 'teacher';
}
