import { Head, Link, usePage } from '@inertiajs/react';
import ManageLayout from '@/layouts/manage/manage-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import PostForm, { PostFormSubmitHandler, PostResource } from '@/components/manage/post/post-form';
import type { BreadcrumbItem, SharedData } from '@/types';
import { useTranslator } from '@/hooks/use-translator';
import { useMemo } from 'react';

interface CategoryOption {
    id: number;
    name: string;
    name_en: string;
    slug: string;
}

interface TagOption {
    id: number;
    name: string;
    slug: string;
    description: string | null;
}

type RawTagOption = TagOption | TagOption[];

interface CreatePostProps {
    categories: CategoryOption[];
    statusOptions: Array<'draft' | 'published' | 'scheduled'>;
    availableTags: RawTagOption[];
}

export default function CreatePost({ categories, statusOptions, availableTags }: CreatePostProps) {
    const { auth } = usePage<SharedData>().props;
    const userRole = auth?.user?.role ?? 'user';
    const layoutRole: 'admin' | 'teacher' | 'user' =
        userRole === 'admin' ? 'admin' : userRole === 'teacher' ? 'teacher' : 'user';
    const { t } = useTranslator('manage');
    const normalizedAvailableTags = useMemo(
        () =>
            (availableTags ?? [])
                .map((tag) => Array.isArray(tag) ? tag[0] : tag)
                .filter((tag): tag is TagOption => Boolean(tag)),
        [availableTags]
    );

    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('layout.breadcrumbs.dashboard', '管理首頁'), href: '/manage/dashboard' },
        { title: t('layout.breadcrumbs.posts', '公告管理'), href: '/manage/posts' },
        { title: t('layout.breadcrumbs.posts_create', '新增公告'), href: '/manage/posts/create' },
    ];

    const pageTitle = t('posts.form.header.create.title', '建立公告');
    const pageDescription = t('posts.form.header.create.description', '撰寫公告內容並設定排程與附件。');
    const backToIndex = t('posts.form.header.back_to_index', '返回公告列表');

    const handleSubmit: PostFormSubmitHandler = (form) => {
        form.post('/manage/posts', {
            preserveScroll: true,
            forceFormData: true,
        });
    };

    const emptyPost: PostResource = {
        title: '',
        title_en: '',
        slug: '',
        category_id: undefined,
        excerpt: '',
        excerpt_en: '',
        content: '',
        content_en: '',
        status: 'draft',
        publish_at: null,
        tags: [],
        attachments: [],
    };

    return (
        <ManageLayout role={layoutRole} breadcrumbs={breadcrumbs}>
            <Head title={pageTitle} />

            <section className="mx-auto flex w-full max-w-5xl flex-col gap-6">
                <Card className="border border-slate-200 bg-white shadow-sm">
                    <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-2">
                            <h1 className="text-3xl font-semibold text-slate-900">{pageTitle}</h1>
                            <p className="text-sm text-slate-600">{pageDescription}</p>
                        </div>
                        <Button
                            asChild
                            variant="outline"
                            className="rounded-full"
                        >
                            <Link href="/manage/posts" aria-label={backToIndex} className="inline-flex items-center gap-2">
                                <ArrowLeft className="h-4 w-4" />
                                {backToIndex}
                            </Link>
                        </Button>
                    </CardContent>
                </Card>

                <PostForm
                    mode="create"
                    cancelUrl="/manage/posts"
                    categories={categories}
                    statusOptions={statusOptions}
                    post={emptyPost}
                    onSubmit={handleSubmit}
                    availableTags={normalizedAvailableTags}
                />
            </section>
        </ManageLayout>
    );
}
