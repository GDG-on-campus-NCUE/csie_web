import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import ManageLayout from '@/layouts/manage/manage-layout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import PostForm, { type PostCategory, type PostFormValues } from './components/post-form';
import { useTranslator } from '@/hooks/use-translator';

interface CreatePostProps {
    categories: PostCategory[];
}

export default function CreatePost({ categories }: CreatePostProps) {
    const { t, isZh } = useTranslator('manage');

    const postsIndexUrl = '/manage/admin/posts';
    const breadcrumbs = [
        { title: t('layout.breadcrumbs.dashboard', isZh ? '管理首頁' : 'Management'), href: '/manage/dashboard' },
        { title: t('layout.breadcrumbs.posts', isZh ? '公告管理' : 'Announcements'), href: postsIndexUrl },
        { title: t('layout.breadcrumbs.posts_create', isZh ? '新增公告' : 'Create bulletin'), href: '/manage/admin/posts/create' },
    ];

    const initialValues: PostFormValues = {
        title: {
            'zh-TW': '',
            en: '',
        },
        content: {
            'zh-TW': '',
            en: '',
        },
        category_id: '',
        status: 'draft',
        pinned: false,
        publish_at: '',
        source_type: 'manual',
        source_url: '',
        attachments_files: [],
        attachments_links: [],
        attachments_remove: [],
    };

    const handleSubmit = (form: any) => {
        form.post(postsIndexUrl, {
            onError: (formErrors: any) => {
                // 繫結表單錯誤以便開發時追蹤
                console.error('Form errors:', formErrors);
            },
        });
    };

    return (
        <ManageLayout role="admin" breadcrumbs={breadcrumbs}>
            <Head title={t('posts.form.header.create.title', isZh ? '建立公告' : 'Create bulletin')} />

            <section className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-0">
                <Card className="border-0 bg-white shadow-sm ring-1 ring-black/5">
                    <CardContent className="flex flex-col gap-4 px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-2">
                            <h1 className="text-3xl font-semibold text-[#151f54]">
                                {t('posts.form.header.create.title', isZh ? '建立公告' : 'Create bulletin')}
                            </h1>
                            <p className="text-sm text-slate-600">
                                {t(
                                    'posts.form.header.create.description',
                                    isZh ? '撰寫新公告並管理附件內容。' : 'Compose a new bulletin and manage attachments.'
                                )}
                            </p>
                        </div>
                        <Button asChild variant="outline" className="rounded-full border-[#151f54]/30">
                            <Link href={postsIndexUrl}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                {t('posts.form.header.back_to_index', isZh ? '返回公告列表' : 'Back to announcements')}
                            </Link>
                        </Button>
                    </CardContent>
                </Card>

                <PostForm
                    categories={categories}
                    cancelUrl={postsIndexUrl}
                    mode="create"
                    initialValues={initialValues}
                    onSubmit={handleSubmit}
                />
            </section>
        </ManageLayout>
    );
}
