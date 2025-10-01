import ManagePage, { type ManagePageProps } from '@/layouts/manage/manage-page';
import ManageSidebar, { type ManageSidebarProps } from '@/layouts/manage/manage-siderbar';
import { useTranslator } from '@/hooks/use-translator';
import type { SharedData, User } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sidebar, SidebarInset, SidebarProvider, SidebarRail } from '@/components/ui/sidebar';
import { usePage } from '@inertiajs/react';
import { isValidElement, cloneElement, type ReactElement, type ReactNode } from 'react';
import { LifeBuoy, ShieldCheck } from 'lucide-react';

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
        currentLocale,
        locales,
    };

    const dashboardHref =
        role === 'teacher' ? '/manage/teacher/dashboard' : role === 'user' ? '/manage/user/dashboard' : '/manage/admin/dashboard';
    const dashboardTitleKey =
        role === 'teacher'
            ? 'layout.breadcrumbs.teacher_dashboard'
            : role === 'user'
              ? 'layout.breadcrumbs.user_dashboard'
              : 'layout.breadcrumbs.admin_dashboard';

    const defaultPageProps: ManagePageProps = {
        title: t(dashboardTitleKey, '系統總覽'),
        description: t('access.denied_description', '歡迎回到管理後台。'),
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

    const defaultToolbar = (
        <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs font-medium tracking-wide">
                {t(`sidebar.${role}.nav_label`, role === 'teacher' ? '教學' : role === 'user' ? '會員' : '管理')}
            </Badge>
            <Button variant="ghost" size="sm" className="gap-2 text-neutral-600 hover:text-neutral-900">
                <ShieldCheck className="h-4 w-4" />
                {t('settings.title', '帳號設定')}
            </Button>
            <Button variant="ghost" size="sm" className="gap-2 text-neutral-600 hover:text-neutral-900">
                <LifeBuoy className="h-4 w-4" />
                {t('sidebar.footer.docs', '使用說明')}
            </Button>
        </div>
    );

    let content: ReactNode;

    if (isValidElement(children) && (children.type === ManagePage || (children.type as any)?.displayName === ManagePage.displayName)) {
        const child = children as ReactElement<ManagePageProps>;
        content = cloneElement(child, {
            title: child.props.title ?? defaultPageProps.title,
            description: child.props.description ?? defaultPageProps.description,
            breadcrumbs: child.props.breadcrumbs ?? defaultPageProps.breadcrumbs,
            toolbar: child.props.toolbar ?? defaultToolbar,
        });
    } else {
        content = (
            <ManagePage
                title={defaultPageProps.title}
                description={defaultPageProps.description}
                breadcrumbs={defaultPageProps.breadcrumbs}
                toolbar={defaultToolbar}
            >
                {children}
            </ManagePage>
        );
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
