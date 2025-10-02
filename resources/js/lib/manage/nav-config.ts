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

import type { NavItem } from '@/types/shared';

export type ManageRole = 'admin' | 'teacher' | 'user';

export interface NavConfigItem extends Pick<NavItem, 'icon' | 'href'> {
    key: string;
    fallback: string;
    ability?: string;
}

export interface NavConfigGroup {
    key: string;
    fallback: string;
    items: NavConfigItem[];
}

export const NAV_CONFIG: Record<ManageRole, NavConfigGroup[]> = {
    admin: [
        {
            key: 'sidebar.admin.nav_label',
            fallback: '行政管理',
            items: [
                {
                    key: 'sidebar.admin.dashboard',
                    fallback: '儀表板',
                    href: '/manage/dashboard',
                    icon: LayoutDashboard,
                },
                {
                    key: 'sidebar.admin.posts',
                    fallback: '公告訊息',
                    href: '/manage/admin/posts',
                    icon: Megaphone,
                    ability: 'manage.posts.view',
                },
                {
                    key: 'sidebar.admin.tags',
                    fallback: '標籤管理',
                    href: '/manage/admin/tags',
                    icon: Tag,
                    ability: 'manage.tags.view',
                },
                {
                    key: 'sidebar.admin.users',
                    fallback: '使用者',
                    href: '/manage/admin/users',
                    icon: Users,
                    ability: 'manage.users.view',
                },
                {
                    key: 'sidebar.admin.attachments',
                    fallback: '附件資源',
                    href: '/manage/admin/attachments',
                    icon: FolderKanban,
                    ability: 'manage.attachments.view',
                },
                {
                    key: 'sidebar.admin.messages',
                    fallback: '聯絡表單',
                    href: '/manage/admin/messages',
                    icon: MessageSquare,
                    ability: 'manage.messages.view',
                },
            ],
        },
    ],
    teacher: [
        {
            key: 'sidebar.teacher.nav_label',
            fallback: '教學',
            items: [
                {
                    key: 'sidebar.teacher.dashboard',
                    fallback: '教學首頁',
                    href: '/manage/teacher/dashboard',
                    icon: LayoutDashboard,
                },
                {
                    key: 'sidebar.teacher.posts',
                    fallback: '公告管理',
                    href: '/manage/teacher/posts',
                    icon: Megaphone,
                },
                {
                    key: 'sidebar.teacher.labs',
                    fallback: '實驗室',
                    href: '/manage/teacher/labs',
                    icon: FolderKanban,
                },
                {
                    key: 'sidebar.teacher.projects',
                    fallback: '研究計畫',
                    href: '/manage/teacher/projects',
                    icon: GaugeCircle,
                },
                {
                    key: 'sidebar.teacher.profile',
                    fallback: '個人設定',
                    href: '/manage/settings/profile',
                    icon: Settings,
                },
            ],
        },
    ],
    user: [
        {
            key: 'sidebar.user.nav_label',
            fallback: '會員專區',
            items: [
                {
                    key: 'sidebar.user.dashboard',
                    fallback: '會員首頁',
                    href: '/manage/user/dashboard',
                    icon: LayoutDashboard,
                },
                {
                    key: 'sidebar.user.profile',
                    fallback: '個人檔案',
                    href: '/manage/settings/profile',
                    icon: Users,
                },
                {
                    key: 'sidebar.user.appearance',
                    fallback: '外觀設定',
                    href: '/manage/settings/appearance',
                    icon: GaugeCircle,
                },
                {
                    key: 'sidebar.user.security',
                    fallback: '安全設定',
                    href: '/manage/settings/password',
                    icon: ShieldCheck,
                },
                {
                    key: 'sidebar.user.support',
                    fallback: '技術支援',
                    href: '/manage/support',
                    icon: MessageSquare,
                },
            ],
        },
    ],
};
