import { NAV_CONFIG, type ManageRole } from '@/lib/manage/nav-config';
import type { ManageAbilityMap } from '@/types/manage';
import type { NavItem } from '@/types/shared';

type TranslatorFn = (key: string, fallback?: string, replacements?: Record<string, string | number>) => string;

interface NavGroup {
    title: string;
    items: NavItem[];
}

function canDisplay(ability: string | undefined, abilities?: ManageAbilityMap): boolean {
    if (!ability) {
        return true;
    }

    if (!abilities) {
        return true;
    }

    return abilities[ability] ?? false;
}

/**
 * 根據使用者角色建立側邊欄導航群組
 * @param role 使用者角色
 * @param t 翻譯函數
 * @param abilities 權限映射
 * @returns 導航群組陣列
 */
export function buildSidebarNavGroups(role: ManageRole, t: TranslatorFn, abilities?: ManageAbilityMap): NavGroup[] {
    const groups = NAV_CONFIG[role] ?? [];

    return groups
        .map((group) => {
            const items = group.items
                .filter((item) => canDisplay(item.ability, abilities))
                .map<NavItem>((item) => ({
                    title: t(item.key, item.fallback),
                    href: item.href,
                    icon: item.icon,
                }));

            if (!items.length) {
                return null;
            }

            return {
                title: t(group.key, group.fallback),
                items,
            } satisfies NavGroup;
        })
        .filter((group): group is NavGroup => Boolean(group));
}
