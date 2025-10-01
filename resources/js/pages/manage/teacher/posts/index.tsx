import AppLayout from '@/layouts/app-layout';
import ManagePage from '@/layouts/manage/manage-page';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useTranslator } from '@/hooks/use-translator';
import type { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import type { ReactElement } from 'react';
import { FilePlus2 } from 'lucide-react';

const mockPosts = [
    { id: 1, title: '演算法期中考公告', status: 'published', updated_at: '2024-03-10' },
    { id: 2, title: '專題成果展報名', status: 'draft', updated_at: '2024-03-08' },
    { id: 3, title: '期末專題成果評分表', status: 'review', updated_at: '2024-03-05' },
];

const statusLabelMap: Record<string, string> = {
    draft: '草稿',
    review: '審核中',
    published: '已發佈',
};

export default function ManageTeacherPostsIndex() {
    const { t } = useTranslator('manage');

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('layout.breadcrumbs.dashboard', '管理後台'),
            href: '/manage/dashboard',
        },
        {
            title: t('sidebar.teacher.posts', '公告管理'),
            href: '/manage/teacher/posts',
        },
    ];

    const pageTitle = t('sidebar.teacher.posts', '公告管理');

    return (
        <>
            <Head title={pageTitle} />
            <ManagePage
                title={pageTitle}
                description={t('teacher.posts.description', '維護課程公告與重要訊息。')}
                breadcrumbs={breadcrumbs}
                toolbar={
                    <Button size="sm" className="gap-2">
                        <FilePlus2 className="h-4 w-4" />
                        {t('teacher.posts.create', '新增公告')}
                    </Button>
                }
            >
                <section className="rounded-xl border border-neutral-200/80 bg-white/95 shadow-sm">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-neutral-200/80">
                                <TableHead className="w-3/5 text-neutral-500">{t('teacher.posts.table.title', '標題')}</TableHead>
                                <TableHead className="w-1/5 text-neutral-500">{t('teacher.posts.table.status', '狀態')}</TableHead>
                                <TableHead className="w-1/5 text-right text-neutral-500">{t('teacher.posts.table.updated', '更新時間')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {mockPosts.map((post) => (
                                <TableRow key={post.id} className="border-neutral-200/60">
                                    <TableCell className="font-medium text-neutral-800">{post.title}</TableCell>
                                    <TableCell className="text-neutral-500">{statusLabelMap[post.status] ?? post.status}</TableCell>
                                    <TableCell className="text-right text-neutral-500">{post.updated_at}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </section>
            </ManagePage>
        </>
    );
}

ManageTeacherPostsIndex.layout = (page: ReactElement) => <AppLayout>{page}</AppLayout>;
