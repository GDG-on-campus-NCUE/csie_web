import type { NavItem } from '@/types/shared';
import {
    FolderKanban,
    GaugeCircle,
    LayoutDashboard,
    Megaphone,
    MessageSquare,
    Settings,
    ShieldCheck,
    Tag,
    Users,
} from 'lucide-react';

type TranslatorFn = (key: string, fallback?: string, replacements?: Record<string, string | number>) => string;

interface NavGroup {
    title: string;
    items: NavItem[];
}

/**
 * 根據使用者角色建立側邊欄導航群組
 * @param role 使用者角色
 * @param t 翻譯函數
 * @returns 導航群組陣列
 */
export function buildSidebarNavGroups(role: 'admin' | 'teacher' | 'user', t: TranslatorFn): NavGroup[] {
    switch (role) {
        case 'teacher':
            return [
                {
                    title: t('sidebar.teacher.nav_label', '教學'),
                    items: [
                        {
                            title: t('sidebar.teacher.dashboard', '教學首頁'),
                            href: '/manage/teacher/dashboard',
                            icon: LayoutDashboard,
                        },
                        {
                            title: t('sidebar.teacher.posts', '公告管理'),
                            href: '/manage/teacher/posts',
                            icon: Megaphone,
                        },
                        {
                            title: t('sidebar.teacher.labs', '實驗室'),
                            href: '/manage/teacher/labs',
                            icon: FolderKanban,
                        },
                        {
                            title: t('sidebar.teacher.projects', '研究計畫'),
                            href: '/manage/teacher/projects',
                            icon: GaugeCircle,
                        },
                        {
                            title: t('sidebar.teacher.profile', '個人設定'),
                            href: '/manage/settings/profile',
                            icon: Settings,
                        },
                    ],
                },
            ];
        case 'user':
            return [
                {
                    title: t('sidebar.user.nav_label', '會員專區'),
                    items: [
                        {
                            title: t('sidebar.user.dashboard', '會員首頁'),
                            href: '/manage/user/dashboard',
                            icon: LayoutDashboard,
                        },
                        {
                            title: t('sidebar.user.profile', '個人檔案'),
                            href: '/manage/settings/profile',
                            icon: Users,
                        },
                        {
                            title: t('sidebar.user.appearance', '外觀設定'),
                            href: '/manage/settings/appearance',
                            icon: GaugeCircle,
                        },
                        {
                            title: t('sidebar.user.security', '安全設定'),
                            href: '/manage/settings/password',
                            icon: ShieldCheck,
                        },
                        {
                            title: t('sidebar.user.support', '技術支援'),
                            href: '/manage/support',
                            icon: MessageSquare,
                        },
                    ],
                },
            ];
        default: // admin
            return [
                {
                    title: t('sidebar.admin.nav_label', '行政管理'),
                    items: [
                        {
                            title: t('sidebar.admin.dashboard', '儀表板'),
                            href: '/manage/dashboard',
                            icon: LayoutDashboard,
                        },
                        {
                            title: t('sidebar.admin.posts', '公告訊息'),
                            href: '/manage/admin/posts',
                            icon: Megaphone,
                        },
                        {
                            title: t('sidebar.admin.tags', '標籤管理'),
                            href: '/manage/admin/tags',
                            icon: Tag,
                        },
                        {
                            title: t('sidebar.admin.users', '使用者'),
                            href: '/manage/admin/users',
                            icon: Users,
                        },
                        {
                            title: t('sidebar.admin.attachments', '附件資源'),
                            href: '/manage/admin/attachments',
                            icon: FolderKanban,
                        },
                        {
                            title: t('sidebar.admin.messages', '聯絡表單'),
                            href: '/manage/admin/messages',
                            icon: MessageSquare,
                        },
                    ],
                },
            ];
    }
}