import { type ManageRole } from '@/components/manage/manage-brand';
import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { type ReactNode } from 'react';

interface RoleGuardProps {
    /** 允許訪問的角色列表 */
    allowedRoles: ManageRole[];
    /** 子組件 */
    children: ReactNode;
    /** 當權限不足時顯示的內容，預設為 null（不顯示） */
    fallback?: ReactNode;
}

/**
 * 角色權限守衛組件
 * 根據使用者角色控制組件的顯示與隱藏
 *
 * @example
 * ```tsx
 * // 只有管理員可以看到的內容
 * <RoleGuard allowedRoles={['admin']}>
 *   <AdminOnlyComponent />
 * </RoleGuard>
 *
 * // 管理員和教師可以看到的內容
 * <RoleGuard allowedRoles={['admin', 'teacher']}>
 *   <TeacherAndAdminComponent />
 * </RoleGuard>
 *
 * // 帶有權限不足時的回退內容
 * <RoleGuard
 *   allowedRoles={['admin']}
 *   fallback={<div>您沒有權限查看此內容</div>}
 * >
 *   <AdminOnlyComponent />
 * </RoleGuard>
 * ```
 */
export default function RoleGuard({ allowedRoles, children, fallback = null }: RoleGuardProps) {
    const { auth } = usePage<SharedData>().props;
    const userRole = (auth?.user?.role ?? 'user') as ManageRole;

    // 檢查使用者角色是否在允許的角色列表中
    const hasPermission = allowedRoles.includes(userRole);

    return hasPermission ? <>{children}</> : <>{fallback}</>;
}

/**
 * Hook: 檢查使用者是否具有特定角色權限
 *
 * @param allowedRoles - 允許的角色列表
 * @returns 是否具有權限
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const canManageUsers = useRolePermission(['admin']);
 *   const canManagePosts = useRolePermission(['admin', 'teacher']);
 *
 *   return (
 *     <div>
 *       {canManageUsers && <UserManagementButton />}
 *       {canManagePosts && <PostManagementButton />}
 *     </div>
 *   );
 * }
 * ```
 */
export function useRolePermission(allowedRoles: ManageRole[]): boolean {
    const { auth } = usePage<SharedData>().props;
    const userRole = (auth?.user?.role ?? 'user') as ManageRole;

    return allowedRoles.includes(userRole);
}

/**
 * Hook: 獲取當前使用者角色
 *
 * @returns 當前使用者的角色
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const userRole = useCurrentRole();
 *
 *   return (
 *     <div>
 *       <h1>歡迎，{userRole === 'admin' ? '管理員' : userRole === 'teacher' ? '教師' : '使用者'}</h1>
 *     </div>
 *   );
 * }
 * ```
 */
export function useCurrentRole(): ManageRole {
    const { auth } = usePage<SharedData>().props;
    return (auth?.user?.role ?? 'user') as ManageRole;
}
