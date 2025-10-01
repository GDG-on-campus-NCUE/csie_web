import AppLayout from '@/layouts/app-layout';
import ManagePage from '@/layouts/manage/manage-page';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useTranslator } from '@/hooks/use-translator';
import type { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import type { ReactElement } from 'react';
import { FilePlus2, Megaphone } from 'lucide-react';

interface ManageAdminPostsIndexProps {
    posts: Array<{
        id: number;
        title: string;
        status: string;
        updated_at: string;
    }>;
}

const statusColorMap: Record<string, 'default' | 'secondary' | 'outline'> = {
    draft: 'outline',
    review: 'secondary',
    published: 'default',
};

export default function ManageAdminPostsIndex({ posts }: ManageAdminPostsIndexProps) {
    const { t } = useTranslator('manage');

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('layout.breadcrumbs.dashboard', '管理後台'),
            href: '/manage/admin/dashboard',
        },
        {
            title: t('sidebar.admin.posts', '公告訊息'),
            href: '/manage/admin/posts',
        },
    ];

    const pageTitle = t('sidebar.admin.posts', '公告訊息');

    return (
        <>
            <Head title={pageTitle} />
            <ManagePage
                title={pageTitle}
                description={t('posts.description', '集中管理公告的草稿、審核與發佈狀態。')}
                breadcrumbs={breadcrumbs}
                toolbar={
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="gap-2">
                            <Megaphone className="h-4 w-4" />
                            {t('sidebar.admin.posts', '公告列表')}
                        </Button>
                        <Button size="sm" className="gap-2">
                            <FilePlus2 className="h-4 w-4" />
                            {t('sidebar.admin.posts_create', '新增公告')}
                        </Button>
                    </div>
                }
            >
                <section className="rounded-xl border border-neutral-200/80 bg-white/95 shadow-sm">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-neutral-200/80">
                                <TableHead className="w-3/5 text-neutral-500">{t('posts.table.title', '標題')}</TableHead>
                                <TableHead className="w-1/5 text-neutral-500">{t('posts.table.status', '狀態')}</TableHead>
                                <TableHead className="w-1/5 text-right text-neutral-500">{t('posts.table.updated', '更新時間')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {posts.map((post) => (
                                <TableRow key={post.id} className="border-neutral-200/60">
                                    <TableCell className="font-medium text-neutral-800">{post.title}</TableCell>
                                    <TableCell>
                                        <Badge variant={statusColorMap[post.status] ?? 'secondary'} className="capitalize">
                                            {t(`posts.status.${post.status}`, post.status)}
                                        </Badge>
                                    </TableCell>
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

ManageAdminPostsIndex.layout = (page: ReactElement) => <AppLayout>{page}</AppLayout>;
