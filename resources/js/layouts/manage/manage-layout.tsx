import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import ManageSidebar from '@/components/manage/sidebar/manage-sidebar';
import AdminFooter from '@/components/admin-footer';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { type PropsWithChildren, type ReactNode, useCallback, useMemo } from 'react';
import { usePage } from '@inertiajs/react';
import { type BreadcrumbItem, type SharedData } from '@/types';
import ManageHeader from '@/components/manage/manage-header';
import { type ManageRole } from '@/components/manage/manage-brand';
import { deriveManageRole } from '@/components/manage/utils/role-helpers';
import ManageUnauthorized from '@/components/manage/manage-unauthorized';
import {
    MANAGE_PERMISSIONS,
    type PermissionKey,
} from '@/components/manage/utils/permission-utils';
import { resolvePermissionByPath } from '@/components/manage/routes/manage-route-config';

interface ManageLayoutProps {
    role?: ManageRole;
    breadcrumbs?: BreadcrumbItem[];
    /**
     * 指定頁面所需權限，若未提供則會依據路徑自動判斷
     */
    permission?: PermissionKey | PermissionKey[];
    /**
     * 沒有權限時的自訂畫面
     */
    fallback?: ReactNode;
}

/**
 * 統一的管理後台佈局組件
 * 支援三種角色（admin、teacher、user）的權限控制
 * 自動根據使用者角色調整側邊欄內容和頁面權限
 */
export default function ManageLayout({
    children,
    breadcrumbs = [],
    role: roleOverride,
    permission,
    fallback,
}: PropsWithChildren<ManageLayoutProps>) {
    const page = usePage<SharedData>();
    const { auth } = page.props;
    const currentUrl = page.url ?? '';

    const role = deriveManageRole(auth?.user ?? null, roleOverride ?? null);

    const rolePool = useMemo(() => {
        const roles = new Set<ManageRole>([role]);

        if (Array.isArray(auth?.user?.roles)) {
            for (const candidate of auth.user.roles) {
                if (candidate === 'admin' || candidate === 'teacher' || candidate === 'user') {
                    roles.add(candidate);
                }
            }
        }

        return Array.from(roles);
    }, [auth?.user?.roles, role]);

    const inferredPermission = useMemo(() => resolvePermissionByPath(currentUrl), [currentUrl]);

    const requiredPermissions = useMemo(() => {
        if (permission) {
            return Array.isArray(permission) ? permission : [permission];
        }

        return inferredPermission ? [inferredPermission] : [];
    }, [permission, inferredPermission]);

    const hasPermission = useCallback(
        (permissionKey: PermissionKey) => {
            const allowedRoles = MANAGE_PERMISSIONS[permissionKey];

            if (!allowedRoles) {
                return false;
            }

            return rolePool.some((candidate) => allowedRoles.includes(candidate));
        },
        [rolePool],
    );

    const canAccess = useMemo(() => {
        if (requiredPermissions.length === 0) {
            return true;
        }

        return requiredPermissions.some((permissionKey) => hasPermission(permissionKey));
    }, [hasPermission, requiredPermissions]);

    const shouldGuard = requiredPermissions.length > 0;
    const unauthorizedView = fallback ?? <ManageUnauthorized role={role} />;

    return (
        <AppShell variant="sidebar">
            {/* 使用統一的管理側邊欄組件，根據角色自動調整內容 */}
            <ManageSidebar role={role} />

            <AppContent
                variant="sidebar"
                className="relative overflow-x-hidden bg-[#f5f7fb] text-neutral-900"
            >
                <div className="flex min-h-svh flex-col">
                    {/* 管理頁面標題欄 */}
                    <ManageHeader role={role} />

                    {/* 主要內容區域 */}
                    <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
                        <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
                            {/* 麵包屑導航 */}
                            {breadcrumbs.length > 0 && (
                                <div className="-mb-2">
                                    <div className="text-neutral-600">
                                        <Breadcrumbs breadcrumbs={breadcrumbs} />
                                    </div>
                                </div>
                            )}
                            {shouldGuard && !canAccess ? unauthorizedView : children}
                        </div>
                    </main>

                    {/* 頁腳 */}
                    <footer className="mx-4 mb-6 mt-auto flex items-center justify-center gap-3 rounded-2xl bg-white px-4 py-4 text-xs text-neutral-600 shadow-sm ring-1 ring-black/5 sm:mx-6 md:mx-8">
                        <AdminFooter />
                    </footer>
                </div>
            </AppContent>
        </AppShell>
    );
}
