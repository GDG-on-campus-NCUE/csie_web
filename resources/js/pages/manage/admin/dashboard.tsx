import AppLayout from '@/layouts/app-layout';
import ManagePage from '@/layouts/manage/manage-page';
import { useTranslator } from '@/hooks/use-translator';
import type { BreadcrumbItem, SharedData } from '@/types/shared';
import type { AdminDashboardData, ManageAbilityMap } from '@/types/manage';
import { Head, usePage } from '@inertiajs/react';
import { Inbox } from 'lucide-react';
import type { ReactElement } from 'react';
import { OverviewCards } from '@/features/manage/admin/dashboard/components/overview-cards';
import { RecentActivities } from '@/features/manage/admin/dashboard/components/recent-activities';
import { TodoHighlightGrid } from '@/features/manage/admin/dashboard/components/todo-highlight-grid';
import { QuickActionsPanel } from '@/features/manage/admin/dashboard/components/quick-actions-panel';
import { DashboardContentLayout } from '@/features/manage/admin/dashboard/dashboard-content-layout';
import type { TranslatorFn } from '@/features/manage/admin/dashboard/types';

type AdminDashboardPageProps = SharedData & {
    dashboard?: AdminDashboardData | null;
    abilities?: ManageAbilityMap;
};

export default function ManageAdminDashboard() {
    const page = usePage<AdminDashboardPageProps>();
    const dashboard = page.props.dashboard ?? null;
    const abilities: ManageAbilityMap = page.props.abilities ?? {};
    const locale = page.props.locale ?? 'zh-TW';

    const { t } = useTranslator('manage.dashboard');
    const { t: tManage } = useTranslator('manage');
    const { t: tMessages } = useTranslator('manage.messages');

    const translateDashboard = t as TranslatorFn;
    const translateManage = tManage as TranslatorFn;
    const translateMessages = tMessages as TranslatorFn;

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: tManage('layout.breadcrumbs.dashboard', '管理後台'),
            href: '/manage/dashboard',
        },
        {
            title: tManage('layout.breadcrumbs.admin_dashboard', '系統總覽'),
            href: '/manage/dashboard',
        },
    ];

    const pageTitle = t('admin.title', '系統總覽');
    const pageDescription = t('admin.description', '即時掌握公告、附件與聯絡訊息狀態，協助團隊快速行動。');

    return (
        <ManagePage title={pageTitle} description={pageDescription} breadcrumbs={breadcrumbs}>
            <Head title={pageTitle} />
            {!dashboard ? (
                <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-neutral-200 bg-neutral-50/70 p-10 text-center">
                    <Inbox className="h-10 w-10 text-neutral-400" />
                    <div className="space-y-1">
                        <h2 className="text-lg font-semibold text-neutral-800">{t('admin.empty.title', 'Dashboard data unavailable')}</h2>
                        <p className="text-sm text-neutral-500">{t('admin.empty.description', 'Ensure backend metrics are configured.')}</p>
                    </div>
                </div>
            ) : (
                <DashboardContentLayout
                    overview={<OverviewCards metrics={dashboard.metrics} locale={locale} t={translateDashboard} />}
                    highlights={<TodoHighlightGrid todos={dashboard.personalTodos} locale={locale} t={translateDashboard} />}
                    activity={(
                        <RecentActivities
                            activities={dashboard.activities}
                            locale={locale}
                            t={translateDashboard}
                            tManage={translateManage}
                            tMessages={translateMessages}
                        />
                    )}
                    quickActions={(
                        <QuickActionsPanel
                            quickLinks={dashboard.quickLinks}
                            todos={dashboard.personalTodos}
                            abilities={abilities}
                            locale={locale}
                            t={translateDashboard}
                        />
                    )}
                />
            )}
        </ManagePage>
    );
}

ManageAdminDashboard.layout = (page: ReactElement) => <AppLayout>{page}</AppLayout>;
