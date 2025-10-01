import ManageMain, { type ManageMainProps } from '@/layouts/manage/manage-main';
import ManageMainHeaderNavbar from '@/components/manage/manage-main-header-navbar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useTranslator } from '@/hooks/use-translator';
import { cn } from '@/lib/shared/utils';
import { RefreshCcw, CalendarCheck } from 'lucide-react';
import type { ReactNode } from 'react';

export interface ManagePageProps extends ManageMainProps {
    toolbar?: ReactNode;
    className?: string;
}

function ManagePage({
    title,
    description,
    breadcrumbs,
    actions,
    footer,
    toolbar,
    className,
    children,
}: ManagePageProps) {
    const { t } = useTranslator('manage');
    const resolvedToolbar = toolbar ?? (
        <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" className="hidden sm:inline-flex">
                <RefreshCcw className="mr-2 h-3.5 w-3.5" />
                {t('layout.refresh', '重新整理')}
            </Button>
            <div className="flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs text-neutral-600">
                <CalendarCheck className="h-3.5 w-3.5" />
                {t('layout.brand.admin.secondary', '管理主控台')}
            </div>
        </div>
    );
    const resolvedActions = actions ?? <ManageMainHeaderNavbar />;

    return (
        <div className={cn('flex min-h-full flex-1 flex-col', className)}>
            <header className="flex flex-col gap-3 border-b border-neutral-200 bg-white/95 px-4 py-3 shadow-sm backdrop-blur-sm lg:flex-row lg:items-center lg:justify-between lg:px-8">
                <div className="flex items-center gap-3 text-neutral-500">
                    <SidebarTrigger className="text-neutral-500" />
                    <Badge variant="outline" className="hidden rounded-full border-neutral-200 px-3 py-1 text-xs font-medium tracking-wide text-neutral-600 sm:inline-flex">
                        {t('sidebar.admin.nav_label', '管理區')}
                    </Badge>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-sm text-neutral-600">{resolvedToolbar}</div>
            </header>
            <main className="flex-1 overflow-y-auto px-4 py-6 lg:px-8">
                <ManageMain
                    title={title}
                    description={description}
                    breadcrumbs={breadcrumbs}
                    actions={resolvedActions}
                    footer={footer}
                >
                    {children}
                </ManageMain>
            </main>
        </div>
    );
}

ManagePage.displayName = 'ManagePage';

export default ManagePage;
