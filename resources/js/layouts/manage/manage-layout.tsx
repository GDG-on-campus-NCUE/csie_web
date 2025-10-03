import ManagePage, { type ManagePageProps } from '@/layouts/manage/manage-page';
import ManageSidebar, { type ManageSidebarProps } from '@/layouts/manage/manage-siderbar';
import { useTranslator } from '@/hooks/use-translator';
import type { SharedData, User } from '@/types/shared';
import { Sidebar, SidebarInset, SidebarProvider, SidebarRail } from '@/components/ui/sidebar';
import { usePage } from '@inertiajs/react';
import { cloneElement, isValidElement, type ReactElement, type ReactNode } from 'react';

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

export default function ManageLayout({ children }: ManageLayoutProps) {
    const page = usePage<SharedData>();
    const { t } = useTranslator('manage');
    const user = page.props.auth?.user;
    const role = resolvePrimaryRole(user);
    const locales = page.props.locales ?? ['zh-TW', 'en'];
    const currentLocale = page.props.locale ?? locales[0] ?? 'zh-TW';

    const brandCopy: ManageSidebarProps['brand'] = {
        primary: t(`layout.brand.${role}.primary`, role === 'teacher' ? 'CSIE Teacher' : role === 'user' ? 'CSIE Member' : 'CSIE Admin'),
        secondary: t(
            `layout.brand.${role}.secondary`,
            role === 'teacher' ? '教學主控台' : role === 'user' ? '會員專區' : '管理主控台'
        ),
    };

    const sidebarProps: ManageSidebarProps = {
        brand: brandCopy,
        role,
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

    let content: ReactNode = children;

    if (isManagePageElement(children)) {
        const child = children;
        content = cloneElement(child, {
            title: child.props.title ?? defaultPageProps.title,
            description: child.props.description ?? defaultPageProps.description,
            breadcrumbs: child.props.breadcrumbs ?? defaultPageProps.breadcrumbs,
        });
    }

    return (
        <SidebarProvider defaultOpen>
            <Sidebar>
                <ManageSidebar {...sidebarProps} />
            </Sidebar>
            <SidebarInset className="bg-neutral-50 text-neutral-900">{content}</SidebarInset>
            <SidebarRail />
        </SidebarProvider>
    );
}
