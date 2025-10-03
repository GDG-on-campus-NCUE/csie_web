import ManageMain, { type ManageMainProps } from '@/layouts/manage/manage-main';
import LanguageSwitcher from '@/components/app/app-lang-switcher';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useTranslator } from '@/hooks/use-translator';
import { cn } from '@/lib/shared/utils';
import type { SharedData } from '@/types/shared';
import { Link, usePage } from '@inertiajs/react';
import { LogOut, User } from 'lucide-react';
import type { ReactNode } from 'react';

export interface ManagePageProps extends ManageMainProps {
    className?: string;
}

function ManagePage({
    title,
    description,
    breadcrumbs,
    actions,
    footer,
    className,
    children,
}: ManagePageProps) {
    const { t } = useTranslator('manage');
    const page = usePage<SharedData>();
    const user = page.props.auth?.user;

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
            <main className="flex-1 overflow-y-auto px-4 py-6 lg:px-8">
                <ManageMain
                    title={title}
                    description={description}
                    breadcrumbs={breadcrumbs}
                    actions={actions}
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
