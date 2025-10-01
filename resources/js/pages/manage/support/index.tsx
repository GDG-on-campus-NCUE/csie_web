import AppLayout from '@/layouts/app-layout';
import ManagePage from '@/layouts/manage/manage-page';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useTranslator } from '@/hooks/use-translator';
import type { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import type { ReactElement } from 'react';
import { LifeBuoy } from 'lucide-react';

export default function ManageSupportIndex() {
    const { t } = useTranslator('manage');

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('layout.breadcrumbs.dashboard', '管理後台'),
            href: '/manage/user/dashboard',
        },
        {
            title: t('sidebar.user.support', '技術支援'),
            href: '/manage/support',
        },
    ];

    const pageTitle = t('sidebar.user.support', '技術支援');

    return (
        <>
            <Head title={pageTitle} />
            <ManagePage
                title={pageTitle}
                description={t('support.description', '提交需求或回報問題，我們將儘速回覆。')}
                breadcrumbs={breadcrumbs}
            >
                <section className="space-y-4 rounded-xl border border-neutral-200/80 bg-white/95 p-6 shadow-sm">
                    <Textarea className="min-h-[200px]" placeholder={t('support.placeholder', '請描述您遇到的狀況...')} />
                    <Button className="gap-2">
                        <LifeBuoy className="h-4 w-4" />
                        {t('support.submit', '送出支援請求')}
                    </Button>
                </section>
            </ManagePage>
        </>
    );
}

ManageSupportIndex.layout = (page: ReactElement) => <AppLayout>{page}</AppLayout>;
