import AppLayout from '@/layouts/app-layout';
import ManagePage from '@/layouts/manage/manage-page';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useTranslator } from '@/hooks/use-translator';
import type { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import type { ReactElement } from 'react';
import { ArrowLeft } from 'lucide-react';

export default function ManageAdminPostsCreate() {
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
        {
            title: t('posts.create', '新增公告'),
            href: '/manage/admin/posts/create',
        },
    ];

    const pageTitle = t('posts.create', '新增公告');

    return (
        <>
            <Head title={pageTitle} />
            <ManagePage
                title={pageTitle}
                description={t('posts.create_description', '建立新的公告內容，並設定發佈資訊。')}
                breadcrumbs={breadcrumbs}
                toolbar={
                    <Button variant="ghost" size="sm" className="gap-2" href="/manage/admin/posts" asChild>
                        <a>
                            <ArrowLeft className="h-4 w-4" />
                            {t('layout.back', '返回列表')}
                        </a>
                    </Button>
                }
            >
                <div className="space-y-6">
                    <section className="rounded-xl border border-neutral-200/80 bg-white/95 p-6 shadow-sm">
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="title">{t('posts.form.title', '公告標題')}</Label>
                                <Input id="title" placeholder={t('posts.form.title_placeholder', '輸入公告標題')} />
                            </div>
                            <div>
                                <Label htmlFor="content">{t('posts.form.content', '公告內容')}</Label>
                                <Textarea
                                    id="content"
                                    className="min-h-[200px]"
                                    placeholder={t('posts.form.content_placeholder', '撰寫公告主要內容...')}
                                />
                            </div>
                        </div>
                    </section>
                    <div className="flex justify-end gap-3">
                        <Button variant="outline">{t('posts.save_draft', '儲存草稿')}</Button>
                        <Button>{t('posts.publish', '發佈公告')}</Button>
                    </div>
                </div>
            </ManagePage>
        </>
    );
}

ManageAdminPostsCreate.layout = (page: ReactElement) => <AppLayout>{page}</AppLayout>;
