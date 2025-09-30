import { useMemo } from 'react';

import type { ManageRole } from '@/components/manage/manage-brand';
import { useTranslator } from '@/hooks/use-translator';
import type { NavItem } from '@/types';

import {
    getFooterLinksForRole,
    getMainRoutesForRole,
    getNavLabelKey,
} from '@/components/manage/routes/manage-route-config';

interface UseManageNavigationResult {
    mainNavItems: NavItem[];
    footerNavItems: NavItem[];
    navLabel: string;
}

/**
 * 根據目前角色動態產生側邊導覽使用的選單資料
 */
export function useManageNavigation(role: ManageRole): UseManageNavigationResult {
    const { t } = useTranslator('manage');

    const mainNavItems = useMemo<NavItem[]>(
        () =>
            getMainRoutesForRole(role).map((route) => ({
                title: t(route.labelKey),
                href: route.href,
                icon: route.iconForRole,
            })),
        [role, t],
    );

    const footerNavItems = useMemo<NavItem[]>(
        () =>
            getFooterLinksForRole(role).map((item) => ({
                title: t(item.labelKey),
                href: item.href,
                icon: item.icon,
            })),
        [role, t],
    );

    const navLabel = useMemo(() => t(getNavLabelKey(role)), [role, t]);

    return { mainNavItems, footerNavItems, navLabel };
}

