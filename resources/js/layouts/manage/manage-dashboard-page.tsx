import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import ManagePage from '@/layouts/manage/manage-page';
import { useTranslator } from '@/hooks/use-translator';
import type { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Activity, CalendarClock, FileText, Megaphone, Users } from 'lucide-react';
import type { ReactElement } from 'react';

const stats = [
    {
        icon: Megaphone,
        labelKey: 'sidebar.admin.posts',
        fallbackLabel: '公告總數',
        value: '24',
        trend: '+3',
    },
    {
        icon: Users,
        labelKey: 'sidebar.admin.users',
        fallbackLabel: '活躍使用者',
        value: '1,280',
        trend: '+12%',
    },
    {
        icon: FileText,
        labelKey: 'sidebar.admin.attachments',
        fallbackLabel: '附件總量',
        value: '542',
        trend: '+18',
    },
];

const activities = [
    {
        title: 'CSIE 新進師資公告',
        status: '已發佈',
        time: '2024/03/18',
    },
    {
        title: '期中考試教室調整',
        status: '審核中',
        time: '2024/03/17',
    },
    {
        title: '學生競賽獲獎名單',
        status: '草稿',
        time: '2024/03/16',
    },
];

export default function ManageDashboardPage(): ReactElement {
    const { t } = useTranslator('manage');

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('layout.breadcrumbs.dashboard', '管理後台'),
            href: '/manage/admin/dashboard',
        },
        {
            title: t('layout.breadcrumbs.admin_dashboard', '系統總覽'),
            href: '/manage/admin/dashboard',
        },
    ];

    const pageTitle = t('layout.breadcrumbs.admin_dashboard', '系統總覽');
    const pageDescription = t('settings.description', '管理個人資訊、安全性設定與介面外觀。');

    return (
        <>
            <Head title={pageTitle} />
            <ManagePage title={pageTitle} description={pageDescription} breadcrumbs={breadcrumbs}>
                <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {stats.map((item) => (
                        <Card key={item.labelKey} className="overflow-hidden border border-neutral-200/80">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-neutral-500">
                                    {t(item.labelKey, item.fallbackLabel)}
                                </CardTitle>
                                <item.icon className="h-4 w-4 text-neutral-400" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-semibold text-neutral-900">{item.value}</div>
                                <p className="text-xs text-emerald-600">{item.trend}</p>
                            </CardContent>
                        </Card>
                    ))}
                    <Card className="border border-neutral-200/80">
                        <CardHeader className="space-y-1">
                            <Badge variant="outline" className="w-fit gap-2 text-xs text-neutral-500">
                                <Activity className="h-3.5 w-3.5" />
                                {t('sidebar.admin.messages', '最新訊息')}
                            </Badge>
                            <CardTitle className="text-base font-semibold text-neutral-900">
                                {t('layout.brand.admin.secondary', '管理主控台')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm text-neutral-600">
                            <p>{t('access.denied_description', '掌握系統最新狀態與公告動態。')}</p>
                            <Button size="sm" className="w-full gap-2">
                                <CalendarClock className="h-4 w-4" />
                                {t('access.back_to_dashboard', '今日行程')}
                            </Button>
                        </CardContent>
                    </Card>
                </section>

                <section className="rounded-xl border border-neutral-200/80 bg-white/95 shadow-sm">
                    <div className="flex items-center justify-between gap-4 border-b border-neutral-200 px-4 py-3">
                        <h2 className="text-base font-semibold text-neutral-800">
                            {t('sidebar.admin.posts', '最新公告')}
                        </h2>
                        <Button variant="outline" size="sm" className="gap-2">
                            <Megaphone className="h-4 w-4" />
                            {t('sidebar.admin.posts_create', '新增公告')}
                        </Button>
                    </div>
                    <Table>
                        <TableHeader>
                            <TableRow className="border-neutral-200/80">
                                <TableHead className="w-1/2 text-neutral-500">{t('sidebar.admin.posts', '標題')}</TableHead>
                                <TableHead className="w-1/4 text-neutral-500">{t('sidebar.admin.tags', '狀態')}</TableHead>
                                <TableHead className="w-1/4 text-right text-neutral-500">{t('sidebar.admin.attachments', '更新時間')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {activities.map((activity) => (
                                <TableRow key={activity.title} className="border-neutral-200/60">
                                    <TableCell className="font-medium text-neutral-800">{activity.title}</TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className="capitalize">
                                            {activity.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right text-neutral-500">{activity.time}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </section>
            </ManagePage>
        </>
    );
}
