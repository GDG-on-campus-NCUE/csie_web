import AppLayout from '@/layouts/app-layout';
import ManagePage from '@/layouts/manage/manage-page';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useTranslator } from '@/hooks/use-translator';
import type { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import type { ReactElement } from 'react';
import { ArrowLeft, Save } from 'lucide-react';

interface ManageAdminPostsEditProps {
    post: {
        id: number;
        title: string;
        status: string;
        content: string;
        updated_at: string;
        author: string;
    };
}

export default function ManageAdminPostsEdit({ post }: ManageAdminPostsEditProps) {
    const { t } = useTranslator('manage');

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('layout.breadcrumbs.dashboard', '管理後台'),
            href: '/manage/dashboard',
        },
        {
            title: t('sidebar.admin.posts', '公告訊息'),
            href: '/manage/admin/posts',
        },
        {
            title: t('posts.edit', '編輯公告'),
            href: `/manage/admin/posts/${post.id}/edit`,
        },
    ];

    const pageTitle = t('posts.edit', '編輯公告');

    return (
        <>
            <Head title={pageTitle} />
            <ManagePage
                title={`${pageTitle} - ${post.title}`}
                description={t('posts.edit_description', '調整公告內容與狀態設定。')}
                breadcrumbs={breadcrumbs}
                toolbar={
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" className="gap-2" href="/manage/admin/posts" asChild>
                            <a>
                                <ArrowLeft className="h-4 w-4" />
                                {t('layout.back', '返回列表')}
                            </a>
                        </Button>
                        <Button size="sm" className="gap-2">
                            <Save className="h-4 w-4" />
                            {t('posts.update', '儲存變更')}
                        </Button>
                    </div>
                }
            >
                <div className="space-y-6">
                    <section className="rounded-xl border border-neutral-200/80 bg-white/95 p-6 shadow-sm">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="title">{t('posts.form.title', '公告標題')}</Label>
                                <Input id="title" defaultValue={post.title} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="status">{t('posts.form.status', '公告狀態')}</Label>
                                <Select id="status" defaultValue={post.status}>
                                    <option value="draft">{t('posts.status.draft', '草稿')}</option>
                                    <option value="review">{t('posts.status.review', '審核中')}</option>
                                    <option value="published">{t('posts.status.published', '已發佈')}</option>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="content">{t('posts.form.content', '公告內容')}</Label>
                            <Textarea id="content" className="min-h-[240px]" defaultValue={post.content} />
                        </div>
                    </section>
                    <div className="flex justify-end gap-3">
                        <Button variant="outline">{t('posts.save_draft', '儲存草稿')}</Button>
                        <Button>{t('posts.update', '儲存變更')}</Button>
                    </div>
                </div>
            </ManagePage>
        </>
    );
}

ManageAdminPostsEdit.layout = (page: ReactElement) => <AppLayout>{page}</AppLayout>;
