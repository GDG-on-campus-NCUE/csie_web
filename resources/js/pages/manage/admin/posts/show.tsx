import AppLayout from '@/layouts/app-layout';
import ManagePage from '@/layouts/manage/manage-page';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslator } from '@/hooks/use-translator';
import type { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import type { ReactElement } from 'react';
import { ArrowLeft, Edit } from 'lucide-react';

interface ManageAdminPostsShowProps {
    post: {
        id: number;
        title: string;
        status: string;
        content: string;
        updated_at: string;
        author: string;
    };
}

export default function ManageAdminPostsShow({ post }: ManageAdminPostsShowProps) {
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
            title: t('posts.show', '公告詳情'),
            href: `/manage/admin/posts/${post.id}`,
        },
    ];

    const pageTitle = `${t('posts.show', '公告詳情')} - ${post.title}`;

    return (
        <>
            <Head title={pageTitle} />
            <ManagePage
                title={pageTitle}
                description={t('posts.show_description', '檢視公告內容與歷史資訊。')}
                breadcrumbs={breadcrumbs}
                toolbar={
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" className="gap-2" href="/manage/admin/posts" asChild>
                            <a>
                                <ArrowLeft className="h-4 w-4" />
                                {t('layout.back', '返回列表')}
                            </a>
                        </Button>
                        <Button size="sm" className="gap-2" href={`/manage/admin/posts/${post.id}/edit`} asChild>
                            <a>
                                <Edit className="h-4 w-4" />
                                {t('posts.edit', '編輯公告')}
                            </a>
                        </Button>
                    </div>
                }
            >
                <Card className="border border-neutral-200/80 bg-white/95 shadow-sm">
                    <CardHeader className="space-y-2">
                        <Badge variant="secondary" className="w-fit capitalize">
                            {t(`posts.status.${post.status}`, post.status)}
                        </Badge>
                        <CardTitle className="text-xl text-neutral-900">{post.title}</CardTitle>
                        <p className="text-sm text-neutral-500">
                            {t('posts.meta.updated_at', '最後更新時間')}: {post.updated_at} · {t('posts.meta.author', '建立者')}: {post.author}
                        </p>
                    </CardHeader>
                    <CardContent className="space-y-4 text-neutral-700">
                        <p>{post.content}</p>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-3">
                        <Button variant="outline">{t('posts.actions.archive', '封存公告')}</Button>
                        <Button>{t('posts.actions.publish', '再次發佈')}</Button>
                    </CardFooter>
                </Card>
            </ManagePage>
        </>
    );
}

ManageAdminPostsShow.layout = (page: ReactElement) => <AppLayout>{page}</AppLayout>;
