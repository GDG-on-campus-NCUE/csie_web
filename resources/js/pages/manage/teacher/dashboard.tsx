import AppLayout from '@/layouts/app-layout';
import ManagePage from '@/layouts/manage/manage-page';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslator } from '@/hooks/use-translator';
import type { BreadcrumbItem } from '@/types/shared';
import { Head } from '@inertiajs/react';
import type { ReactElement } from 'react';
import { CalendarCheck, Megaphone, NotebookPen } from 'lucide-react';

const teacherHighlights = [
    { icon: Megaphone, title: '近期公告', translationKey: 'recent_posts', description: '掌握系上最新公告與發佈排程。' },
    { icon: NotebookPen, title: '課程管理', translationKey: 'course_management', description: '快速連結至課程與實驗室維護。' },
    { icon: CalendarCheck, title: '教學行程', translationKey: 'schedule', description: '檢視與安排本週教學行程。' },
];

export default function ManageTeacherDashboard() {
    const { t } = useTranslator('manage');

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('layout.breadcrumbs.dashboard', '管理後台'),
            href: '/manage/dashboard',
        },
        {
            title: t('sidebar.teacher.dashboard', '教學首頁'),
            href: '/manage/dashboard',
        },
    ];

    const pageTitle = t('sidebar.teacher.dashboard', '教學首頁');

    return (
        <>
            <Head title={pageTitle} />
            <ManagePage
                title={pageTitle}
                description={t('teacher.dashboard.description', '整合教學管理所需資訊與操作入口。')}
                breadcrumbs={breadcrumbs}
            >
                <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {teacherHighlights.map((item) => (
                        <Card key={item.title} className="border border-neutral-200/80 bg-white/95 shadow-sm">
                            <CardHeader className="flex items-center gap-3">
                                <item.icon className="h-6 w-6 text-neutral-500" />
                                <CardTitle className="text-base font-semibold text-neutral-800">
                                    {t(`teacher.dashboard.cards.${item.translationKey}`, item.title)}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm text-neutral-500">{item.description}</CardContent>
                        </Card>
                    ))}
                </section>
            </ManagePage>
        </>
    );
}

ManageTeacherDashboard.layout = (page: ReactElement) => <AppLayout>{page}</AppLayout>;
