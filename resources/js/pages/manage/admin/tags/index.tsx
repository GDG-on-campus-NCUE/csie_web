import AppLayout from '@/layouts/app-layout';
import ManagePage from '@/layouts/manage/manage-page';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useTranslator } from '@/hooks/use-translator';
import type { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import type { ReactElement } from 'react';
import { Plus } from 'lucide-react';

const mockTags = [
    { id: 1, name: '招生資訊', color: 'bg-emerald-100 text-emerald-700' },
    { id: 2, name: '學術公告', color: 'bg-indigo-100 text-indigo-700' },
    { id: 3, name: '競賽活動', color: 'bg-amber-100 text-amber-700' },
];

export default function ManageAdminTagsIndex() {
    const { t } = useTranslator('manage');

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('layout.breadcrumbs.dashboard', '管理後台'),
            href: '/manage/admin/dashboard',
        },
        {
            title: t('sidebar.admin.tags', '標籤管理'),
            href: '/manage/admin/tags',
        },
    ];

    const pageTitle = t('sidebar.admin.tags', '標籤管理');

    return (
        <>
            <Head title={pageTitle} />
            <ManagePage
                title={pageTitle}
                description={t('tags.description', '設定公告分類標籤，讓使用者快速找到相關資訊。')}
                breadcrumbs={breadcrumbs}
                toolbar={
                    <Button size="sm" className="gap-2">
                        <Plus className="h-4 w-4" />
                        {t('tags.create', '新增標籤')}
                    </Button>
                }
            >
                <section className="rounded-xl border border-neutral-200/80 bg-white/95 shadow-sm">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-neutral-200/80">
                                <TableHead className="w-2/3 text-neutral-500">{t('tags.table.name', '標籤名稱')}</TableHead>
                                <TableHead className="w-1/3 text-right text-neutral-500">{t('tags.table.articles', '使用次數')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {mockTags.map((tag) => (
                                <TableRow key={tag.id} className="border-neutral-200/60">
                                    <TableCell className="font-medium text-neutral-800">
                                        <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${tag.color}`}>
                                            ● {tag.name}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right text-neutral-500">{Math.floor(Math.random() * 50)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </section>
            </ManagePage>
        </>
    );
}

ManageAdminTagsIndex.layout = (page: ReactElement) => <AppLayout>{page}</AppLayout>;
