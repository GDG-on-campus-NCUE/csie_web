import AppLayout from '@/layouts/app-layout';
import ManagePage from '@/layouts/manage/manage-page';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useTranslator } from '@/hooks/use-translator';
import type { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import type { ReactElement } from 'react';
import { UploadCloud } from 'lucide-react';

const mockAttachments = [
    { id: 1, title: '校務會議記錄.pdf', type: 'document', size: '2.3 MB' },
    { id: 2, title: '系館照片.jpg', type: 'image', size: '1.1 MB' },
    { id: 3, title: '外部資源連結', type: 'link', size: '-' },
];

export default function ManageAdminAttachmentsIndex() {
    const { t } = useTranslator('manage');

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('layout.breadcrumbs.dashboard', '管理後台'),
            href: '/manage/dashboard',
        },
        {
            title: t('sidebar.admin.attachments', '附件資源'),
            href: '/manage/admin/attachments',
        },
    ];

    const pageTitle = t('sidebar.admin.attachments', '附件資源');

    return (
        <>
            <Head title={pageTitle} />
            <ManagePage
                title={pageTitle}
                description={t('attachments.description', '管理公告使用的文件與媒體資源。')}
                breadcrumbs={breadcrumbs}
                toolbar={
                    <Button size="sm" className="gap-2">
                        <UploadCloud className="h-4 w-4" />
                        {t('attachments.upload', '上傳附件')}
                    </Button>
                }
            >
                <section className="rounded-xl border border-neutral-200/80 bg-white/95 shadow-sm">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-neutral-200/80">
                                <TableHead className="w-1/2 text-neutral-500">{t('attachments.table.title', '檔案名稱')}</TableHead>
                                <TableHead className="w-1/4 text-neutral-500">{t('attachments.table.type', '類型')}</TableHead>
                                <TableHead className="w-1/4 text-right text-neutral-500">{t('attachments.table.size', '大小')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {mockAttachments.map((attachment) => (
                                <TableRow key={attachment.id} className="border-neutral-200/60">
                                    <TableCell className="font-medium text-neutral-800">{attachment.title}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="capitalize">
                                            {t(`attachments.type.${attachment.type}`, attachment.type)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right text-neutral-500">{attachment.size}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </section>
            </ManagePage>
        </>
    );
}

ManageAdminAttachmentsIndex.layout = (page: ReactElement) => <AppLayout>{page}</AppLayout>;
