import AppLayout from '@/layouts/app-layout';
import ManagePage from '@/layouts/manage/manage-page';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useTranslator } from '@/hooks/use-translator';
import type { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import type { ReactElement } from 'react';
import { Plus } from 'lucide-react';

const mockProjects = [
    { id: 1, title: '智慧醫療影像分析', sponsor: '科技部', duration: '2024-2025' },
    { id: 2, title: '邊緣運算物聯網平台', sponsor: '產學合作', duration: '2023-2024' },
];

export default function ManageTeacherProjectsIndex() {
    const { t } = useTranslator('manage');

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('layout.breadcrumbs.dashboard', '管理後台'),
            href: '/manage/teacher/dashboard',
        },
        {
            title: t('sidebar.teacher.projects', '研究計畫'),
            href: '/manage/teacher/projects',
        },
    ];

    const pageTitle = t('sidebar.teacher.projects', '研究計畫');

    return (
        <>
            <Head title={pageTitle} />
            <ManagePage
                title={pageTitle}
                description={t('teacher.projects.description', '整理研究計畫與合作專案進度。')}
                breadcrumbs={breadcrumbs}
                toolbar={
                    <Button size="sm" className="gap-2">
                        <Plus className="h-4 w-4" />
                        {t('teacher.projects.create', '新增計畫')}
                    </Button>
                }
            >
                <section className="rounded-xl border border-neutral-200/80 bg-white/95 shadow-sm">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-neutral-200/80">
                                <TableHead className="w-2/5 text-neutral-500">{t('teacher.projects.table.title', '計畫名稱')}</TableHead>
                                <TableHead className="w-2/5 text-neutral-500">{t('teacher.projects.table.sponsor', '補助單位')}</TableHead>
                                <TableHead className="w-1/5 text-right text-neutral-500">{t('teacher.projects.table.duration', '期間')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {mockProjects.map((project) => (
                                <TableRow key={project.id} className="border-neutral-200/60">
                                    <TableCell className="font-medium text-neutral-800">{project.title}</TableCell>
                                    <TableCell className="text-neutral-500">{project.sponsor}</TableCell>
                                    <TableCell className="text-right text-neutral-500">{project.duration}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </section>
            </ManagePage>
        </>
    );
}

ManageTeacherProjectsIndex.layout = (page: ReactElement) => <AppLayout>{page}</AppLayout>;
