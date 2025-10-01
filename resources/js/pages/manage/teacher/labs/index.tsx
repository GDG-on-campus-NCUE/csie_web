import AppLayout from '@/layouts/app-layout';
import ManagePage from '@/layouts/manage/manage-page';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTranslator } from '@/hooks/use-translator';
import type { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import type { ReactElement } from 'react';
import { Plus } from 'lucide-react';

const mockLabs = [
    { id: 1, name: 'AI 與機器學習實驗室', lead: '李教授', students: 12 },
    { id: 2, name: '網路系統研究室', lead: '張教授', students: 9 },
];

export default function ManageTeacherLabsIndex() {
    const { t } = useTranslator('manage');

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('layout.breadcrumbs.dashboard', '管理後台'),
            href: '/manage/teacher/dashboard',
        },
        {
            title: t('sidebar.teacher.labs', '實驗室'),
            href: '/manage/teacher/labs',
        },
    ];

    const pageTitle = t('sidebar.teacher.labs', '實驗室');

    return (
        <>
            <Head title={pageTitle} />
            <ManagePage
                title={pageTitle}
                description={t('teacher.labs.description', '管理實驗室資訊與成員分工。')}
                breadcrumbs={breadcrumbs}
                toolbar={
                    <Button size="sm" className="gap-2">
                        <Plus className="h-4 w-4" />
                        {t('teacher.labs.create', '新增實驗室')}
                    </Button>
                }
            >
                <section className="grid gap-4 md:grid-cols-2">
                    {mockLabs.map((lab) => (
                        <Card key={lab.id} className="border border-neutral-200/80 bg-white/95 shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-lg font-semibold text-neutral-900">{lab.name}</CardTitle>
                                <CardDescription className="text-neutral-500">
                                    {t('teacher.labs.lead', '主持老師')}: {lab.lead}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="text-sm text-neutral-600">
                                {t('teacher.labs.members', '目前學生人數')}: {lab.students}
                            </CardContent>
                        </Card>
                    ))}
                </section>
            </ManagePage>
        </>
    );
}

ManageTeacherLabsIndex.layout = (page: ReactElement) => <AppLayout>{page}</AppLayout>;
