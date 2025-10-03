import ManagePage, { type ManagePageProps } from '@/layouts/manage/manage-page';
import ManageSidebar, { type ManageSidebarProps } from '@/layouts/manage/manage-siderbar';
import { useTranslator } from '@/hooks/use-translator';
import { buildSidebarNavGroups, type SidebarNavGroup } from '@/lib/manage/sidebar-nav-groups';
import type { SharedData, User, NavItem } from '@/types/shared';
import { Sidebar, SidebarInset, SidebarProvider, SidebarRail } from '@/components/ui/sidebar';
import { usePage } from '@inertiajs/react';
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
import {
    Children,
    cloneElement,
    isValidElement,
    type ReactElement,
    type ReactNode,
} from 'react';

interface ManageLayoutProps {
    children: ReactNode;
}

function resolvePrimaryRole(user: User | undefined): 'admin' | 'teacher' | 'user' {
    if (!user) {
        return 'admin';
    }



    if (user.primary_role) {
        return user.primary_role;
    }

    if (user.roles?.length) {
        return user.roles[0];
    }

    return 'admin';
}

function isManagePageElement(node: ReactNode): node is ReactElement<ManagePageProps> {
    if (!isValidElement(node)) {
        return false;
    }

    if (node.type === ManagePage) {
        return true;
    }

    if (node.type && (typeof node.type === 'function' || typeof node.type === 'object')) {
        const maybeDisplayName = (node.type as { displayName?: string | undefined }).displayName;
        return maybeDisplayName === ManagePage.displayName;
    }

    return false;
}

function extractManagePage(children: ReactNode): {
    page: ReactElement<ManagePageProps> | null;
    rest: ReactNode[];
} {
    let resolvedPage: ReactElement<ManagePageProps> | null = null;
    const rest: ReactNode[] = [];

    Children.toArray(children).forEach((child) => {
        if (!resolvedPage && isManagePageElement(child)) {
            resolvedPage = child;
            return;
        }

        rest.push(child);
    });

    return { page: resolvedPage, rest };
}

export default function ManageLayout({ children }: ManageLayoutProps) {
    const page = usePage<SharedData>();
    const { t } = useTranslator('manage');
    const user = page.props.auth?.user;
    const role = resolvePrimaryRole(user);
    // 簡化方案：直接為每個角色建立導航項目，不依賴複雜的權限檢查
    const getQuickNavItems = (role: string): NavItem[] => {
        switch (role) {
            case 'admin':
                return [
                    { title: t('sidebar.admin.dashboard', '儀表板'), href: '/manage/dashboard', icon: LayoutDashboard },
                    { title: t('sidebar.admin.posts', '公告管理'), href: '/manage/admin/posts', icon: Megaphone },
                    { title: t('sidebar.admin.tags', '標籤管理'), href: '/manage/admin/tags', icon: Tag },
                    { title: t('sidebar.admin.users', '使用者管理'), href: '/manage/admin/users', icon: Users },
                    { title: t('sidebar.admin.attachments', '附件管理'), href: '/manage/admin/attachments', icon: FolderKanban },
                    { title: t('sidebar.admin.messages', '聯絡訊息'), href: '/manage/admin/messages', icon: MessageSquare },
                ];
            case 'teacher':
                return [
                    { title: t('sidebar.teacher.dashboard', '教學首頁'), href: '/manage/teacher/dashboard', icon: LayoutDashboard },
                    { title: t('sidebar.teacher.posts', '公告管理'), href: '/manage/teacher/posts', icon: Megaphone },
                    { title: t('sidebar.teacher.labs', '實驗室'), href: '/manage/teacher/labs', icon: FolderKanban },
                    { title: t('sidebar.teacher.projects', '研究計畫'), href: '/manage/teacher/projects', icon: GaugeCircle },
                    { title: t('sidebar.teacher.profile', '個人設定'), href: '/manage/settings/profile', icon: Settings },
                ];
            case 'user':
                return [
                    { title: t('sidebar.user.dashboard', '會員首頁'), href: '/manage/user/dashboard', icon: LayoutDashboard },
                    { title: t('sidebar.user.profile', '個人檔案'), href: '/manage/settings/profile', icon: Users },
                    { title: t('sidebar.user.appearance', '外觀設定'), href: '/manage/settings/appearance', icon: GaugeCircle },
                    { title: t('sidebar.user.security', '安全設定'), href: '/manage/settings/password', icon: ShieldCheck },
                    { title: t('sidebar.user.support', '技術支援'), href: '/manage/support', icon: MessageSquare },
                ];
            default:
                return [];
        }
    };

    const brandCopy: ManageSidebarProps['brand'] = {
        primary: t(`layout.brand.${role}.primary`, role === 'teacher' ? 'CSIE Teacher' : role === 'user' ? 'CSIE Member' : 'CSIE Admin'),
        secondary: t(
            `layout.brand.${role}.secondary`,
            role === 'teacher' ? '教學主控台' : role === 'user' ? '會員專區' : '管理主控台'
        ),
    };

    const dashboardHref = '/manage/dashboard';
    const dashboardTitleKey =
        role === 'teacher'
            ? 'layout.breadcrumbs.teacher_dashboard'
            : role === 'user'
              ? 'layout.breadcrumbs.user_dashboard'
              : 'layout.breadcrumbs.admin_dashboard';

    const defaultPageProps: Omit<ManagePageProps, 'children'> = {
        title: t(dashboardTitleKey, '系統總覽'),
        description: t('layout.welcome_message', '歡迎回到管理後台，快速查看系統狀態與最新活動。'),
        breadcrumbs: [
            {
                title: t('layout.breadcrumbs.dashboard', '管理後台'),
                href: dashboardHref,
            },
            {
                title: t(dashboardTitleKey, '系統總覽'),
                href: dashboardHref,
            },
        ],
    };

    // 直接獲取快速導航項目
    const quickNavItems = getQuickNavItems(role);

    // 為側邊欄使用簡化的權限（暫時都設為 true）
    const sidebarAbilities = {
        'manage.posts.view': true,
        'manage.tags.view': true,
        'manage.users.view': true,
        'manage.attachments.view': true,
        'manage.messages.view': true,
    };
    const navGroups: SidebarNavGroup[] = buildSidebarNavGroups(role, t, sidebarAbilities);
    const currentPath = page.url ?? '/manage';

    // 調試輸出
    console.log('=== 新架構調試 ===');
    console.log('Role:', role);
    console.log('QuickNavItems:', quickNavItems);
    console.log('QuickNavItems Length:', quickNavItems.length);



    const { page: providedManagePage, rest } = extractManagePage(children);

    const mergedManagePage: ReactNode = providedManagePage
        ? cloneElement(providedManagePage, {
              title: providedManagePage.props.title ?? defaultPageProps.title,
              description: providedManagePage.props.description ?? defaultPageProps.description,
              breadcrumbs: providedManagePage.props.breadcrumbs ?? defaultPageProps.breadcrumbs,
              quickNavItems: providedManagePage.props.quickNavItems ?? quickNavItems,
              currentPath: providedManagePage.props.currentPath ?? currentPath,
          })
        : (
              <ManagePage
                  title={defaultPageProps.title}
                  description={defaultPageProps.description}
                  breadcrumbs={defaultPageProps.breadcrumbs}
                  quickNavItems={quickNavItems}
                  currentPath={currentPath}
              >
                  {children}
              </ManagePage>
          );

    const leadingSiblings = providedManagePage ? rest : [];

    const sidebarProps: ManageSidebarProps = {
        brand: brandCopy,
        groups: navGroups,
        currentPath,
    };

    return (
        <SidebarProvider defaultOpen>
            <Sidebar>
                <ManageSidebar {...sidebarProps} />
            </Sidebar>
            <SidebarInset className="bg-neutral-50 text-neutral-900">
                {leadingSiblings}
                {mergedManagePage}
            </SidebarInset>
            <SidebarRail />
        </SidebarProvider>
    );
}
