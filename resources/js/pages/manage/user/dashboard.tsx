import AppLayout from '@/layouts/app-layout';
import ManagePage from '@/layouts/manage/manage-page';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslator } from '@/hooks/use-translator';
import type { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import type { ReactElement } from 'react';
import { BookmarkCheck, Lock, Palette } from 'lucide-react';

const userShortcuts = [
    { icon: BookmarkCheck, title: '已儲存內容', translationKey: 'saved_items', description: '快速回顧收藏的公告與活動。' },
    { icon: Palette, title: '個人化設定', translationKey: 'personalize', description: '調整偏好的語系與外觀主題。' },
    { icon: Lock, title: '安全中心', translationKey: 'security', description: '檢視登入活動與安全建議。' },
];

export default function ManageUserDashboard() {
    const { t } = useTranslator('manage');

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('layout.breadcrumbs.dashboard', '管理後台'),
            href: '/manage/user/dashboard',
        },
        {
            title: t('sidebar.user.dashboard', '會員首頁'),
            href: '/manage/user/dashboard',
        },
    ];

    const pageTitle = t('sidebar.user.dashboard', '會員首頁');

    return (
        <>
            <Head title={pageTitle} />
            <ManagePage
                title={pageTitle}
                description={t('user.dashboard.description', '統整個人帳號的設定與重要資訊。')}
                breadcrumbs={breadcrumbs}
            >
                <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {userShortcuts.map((item) => (
                        <Card key={item.title} className="border border-neutral-200/80 bg-white/95 shadow-sm">
                            <CardHeader className="flex items-center gap-3">
                                <item.icon className="h-6 w-6 text-neutral-500" />
                                <CardTitle className="text-base font-semibold text-neutral-800">
                                    {t(`user.dashboard.cards.${item.translationKey}`, item.title)}
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

ManageUserDashboard.layout = (page: ReactElement) => <AppLayout>{page}</AppLayout>;
