import AppLayout from '@/layouts/app-layout';
import ManagePage from '@/layouts/manage/manage-page';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useTranslator } from '@/hooks/use-translator';
import type { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import type { ReactElement } from 'react';
import { MailPlus } from 'lucide-react';

const mockMessages = [
    { id: 1, subject: '系統權限問題', status: 'open', created_at: '2024-03-15' },
    { id: 2, subject: '網站內容勘誤', status: 'in_progress', created_at: '2024-03-14' },
    { id: 3, subject: '合作洽談', status: 'resolved', created_at: '2024-03-13' },
];

const statusLabelMap: Record<string, string> = {
    open: '待處理',
    in_progress: '處理中',
    resolved: '已完成',
};

const statusVariantMap: Record<string, 'default' | 'secondary' | 'outline'> = {
    open: 'default',
    in_progress: 'secondary',
    resolved: 'outline',
};

export default function ManageAdminMessagesIndex() {
    const { t } = useTranslator('manage');

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('layout.breadcrumbs.dashboard', '管理後台'),
            href: '/manage/admin/dashboard',
        },
        {
            title: t('sidebar.admin.messages', '聯絡表單'),
            href: '/manage/admin/messages',
        },
    ];

    const pageTitle = t('sidebar.admin.messages', '聯絡表單');

    return (
        <>
            <Head title={pageTitle} />
            <ManagePage
                title={pageTitle}
                description={t('messages.description', '追蹤與回覆訪客的聯絡資訊。')}
                breadcrumbs={breadcrumbs}
                toolbar={
                    <Button size="sm" className="gap-2">
                        <MailPlus className="h-4 w-4" />
                        {t('messages.export', '匯出紀錄')}
                    </Button>
                }
            >
                <section className="rounded-xl border border-neutral-200/80 bg-white/95 shadow-sm">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-neutral-200/80">
                                <TableHead className="w-2/5 text-neutral-500">{t('messages.table.subject', '主旨')}</TableHead>
                                <TableHead className="w-1/5 text-neutral-500">{t('messages.table.status', '狀態')}</TableHead>
                                <TableHead className="w-2/5 text-right text-neutral-500">{t('messages.table.created', '建立時間')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {mockMessages.map((message) => (
                                <TableRow key={message.id} className="border-neutral-200/60">
                                    <TableCell className="font-medium text-neutral-800">{message.subject}</TableCell>
                                    <TableCell>
                                        <Badge variant={statusVariantMap[message.status] ?? 'secondary'}>
                                            {statusLabelMap[message.status] ?? message.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right text-neutral-500">{message.created_at}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </section>
            </ManagePage>
        </>
    );
}

ManageAdminMessagesIndex.layout = (page: ReactElement) => <AppLayout>{page}</AppLayout>;
