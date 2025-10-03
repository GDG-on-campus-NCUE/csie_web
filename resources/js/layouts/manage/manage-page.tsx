import ManageMain, { type ManageMainProps } from '@/layouts/manage/manage-main';
import ManageQuickNav from '@/components/manage/manage-quick-nav';
import LanguageSwitcher from '@/components/app/app-lang-switcher';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useTranslator } from '@/hooks/use-translator';
import { useManageLayoutContext } from '@/layouts/manage/manage-layout-context';
import { cn } from '@/lib/shared/utils';
import type { NavItem, SharedData } from '@/types/shared';
import { Link, usePage } from '@inertiajs/react';
import { LogOut, User } from 'lucide-react';
import type { ReactNode } from 'react';

export interface ManagePageProps extends ManageMainProps {
    className?: string;
    quickNavItems?: NavItem[];
    quickNavLabel?: string;
    currentPath?: string;
}

function ManagePage({
    title,
    description,
    breadcrumbs,
    actions,
    toolbar,
    footer,
    className,
    quickNavItems,
    quickNavLabel,
    currentPath,
    children,
}: ManagePageProps) {
    const { t } = useTranslator('manage');
    const page = usePage<SharedData>();
    const user = page.props.auth?.user;
    const layoutContext = useManageLayoutContext();
    const resolvedQuickNavItems = quickNavItems ?? layoutContext?.quickNavItems;
    const navItems = resolvedQuickNavItems ?? [];
    const resolvedPath = currentPath ?? layoutContext?.currentPath ?? page.url ?? '';
    const resolvedQuickNavLabel = quickNavLabel ?? layoutContext?.quickNavLabel ?? t('layout.quick_nav', '管理快速路徑');
    const resolvedTitle = title ?? layoutContext?.defaultTitle;
    const resolvedDescription = description ?? layoutContext?.defaultDescription;
    const resolvedBreadcrumbs = breadcrumbs ?? layoutContext?.defaultBreadcrumbs;

    return (
        <div className={cn('flex min-h-full flex-1 flex-col', className)}>
            <header className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-neutral-200/50 bg-white/95 px-4 py-2.5 shadow-sm backdrop-blur-md lg:px-8">
                <div className="flex items-center gap-3">
                    <SidebarTrigger className="text-neutral-600" />
                </div>
                <div className="flex items-center gap-2">
                    <LanguageSwitcher variant="default" />
                    {user && (
                        <div className="hidden items-center gap-2 rounded-lg bg-neutral-50 px-3 py-1.5 md:flex">
                            <User className="h-3.5 w-3.5 text-neutral-500" />
                            <span className="text-sm text-neutral-700">{user.name}</span>
                        </div>
                    )}
                    <Button
                        variant="ghost"
                        size="sm"
                        className="gap-2 text-neutral-600 hover:text-neutral-900"
                        asChild
                    >
                        <Link href="/logout" method="post" as="button">
                            <LogOut className="h-4 w-4" />
                            <span className="hidden md:inline">{t('sidebar.footer.logout', '登出')}</span>
                        </Link>
                    </Button>
                </div>
            </header>
            <main className="flex-1 overflow-y-auto">
                <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 lg:px-8">
                    {navItems.length > 0 ? (
                        <ManageQuickNav
                            items={navItems}
                            currentPath={resolvedPath}
                            label={resolvedQuickNavLabel}
                        />
                    ) : null}
                    <ManageMain
                        title={resolvedTitle}
                        description={resolvedDescription}
                        breadcrumbs={resolvedBreadcrumbs}
                        actions={actions}
                        toolbar={toolbar}
                        footer={footer}
                    >
                        {children}
                    </ManageMain>
                </div>
            </main>
        </div>
    );
}

ManagePage.displayName = 'ManagePage';

export default ManagePage;
