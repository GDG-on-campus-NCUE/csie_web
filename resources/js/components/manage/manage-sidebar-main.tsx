import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useTranslator } from '@/hooks/use-translator';
import type { NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
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

interface ManageSidebarMainProps {
    role: 'admin' | 'teacher' | 'user';
}

type TranslatorFn = (key: string, fallback?: string, replacements?: Record<string, string | number>) => string;

export default function ManageSidebarMain({ role }: ManageSidebarMainProps) {
    const { t } = useTranslator('manage');
    const page = usePage();
    const currentPath = page.url ?? '';

    const groups = buildGroups(role, t);

    return (
        <SidebarMenu>
            {groups.map((group) => (
                <SidebarGroup key={group.title} className="space-y-2">
                    <SidebarGroupLabel className="px-2 text-xs font-semibold uppercase tracking-wider text-white/60">
                        {group.title}
                    </SidebarGroupLabel>
                    <SidebarGroupContent className="space-y-1">
                        {group.items.map((item) => (
                            <SidebarMenuItem key={item.href}>
                                <SidebarMenuButton asChild isActive={currentPath.startsWith(item.href)}>
                                    <Link href={item.href} className="flex items-center gap-3">
                                        {item.icon && <item.icon className="h-4 w-4" />}
                                        <span>{item.title}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarGroupContent>
                </SidebarGroup>
            ))}
        </SidebarMenu>
    );
}

function buildGroups(role: 'admin' | 'teacher' | 'user', t: TranslatorFn): Array<{ title: string; items: NavItem[] }> {
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
        default:
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
