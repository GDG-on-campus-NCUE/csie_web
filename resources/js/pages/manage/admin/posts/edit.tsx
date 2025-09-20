import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import ManageLayout from '@/layouts/manage/manage-layout';
import type { SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import PostForm, { type ExistingAttachment, type PostCategory, type PostFormValues, type StatusOption } from './components/post-form';

interface AdminPost {
    id: number;
    category_id: number;
    status: 'draft' | 'published' | 'archived';
    publish_at: string | null;
    pinned: boolean;
    title: string;
    title_en: string;
    content: string;
    content_en: string;
    source_type?: 'manual' | 'link';
    source_url?: string | null;
    attachments?: ExistingAttachment[];
}

interface EditPostProps {
    post: AdminPost;
    categories: PostCategory[];
}

const formatPublishAt = (value: string | null): string => {
    if (!value) {
        return '';
    }

    const parsed = new Date(value);

    if (Number.isNaN(parsed.getTime())) {
        return value.slice(0, 16);
    }

    const offset = parsed.getTimezoneOffset() * 60000;
    return new Date(parsed.getTime() - offset).toISOString().slice(0, 16);
};

export default function EditPost({ post, categories }: EditPostProps) {
    const { locale } = usePage<SharedData>().props;
    const isZh = locale?.toLowerCase() === 'zh-tw';

    const postsIndexUrl = '/manage/admin/posts';
    const breadcrumbs = [
        { title: isZh ? '管理首頁' : 'Management', href: '/manage/dashboard' },
        { title: isZh ? '公告管理' : 'Announcements', href: postsIndexUrl },
        { title: isZh ? '編輯公告' : 'Edit', href: `/manage/admin/posts/${post.id}/edit` },
    ];

    const initialValues: PostFormValues = {
        title: {
            'zh-TW': post.title ?? '',
            en: post.title_en ?? '',
        },
        content: {
            'zh-TW': post.content ?? '',
            en: post.content_en ?? '',
        },
        category_id: String(post.category_id ?? ''),
        status: post.status ?? 'draft',
        pinned: Boolean(post.pinned),
        publish_at: formatPublishAt(post.publish_at),
        source_type: (post.source_type ?? 'manual') as 'manual' | 'link',
        source_url: post.source_url ?? '',
        attachments_files: [],
        attachments_links: [],
        attachments_remove: [],
    };

    const statusOptions: StatusOption[] = [
        { value: 'draft', labelZh: '草稿', labelEn: 'Draft' },
        { value: 'published', labelZh: '發布', labelEn: 'Publish' },
        { value: 'archived', labelZh: '封存', labelEn: 'Archive' },
    ];

    const handleSubmit = (form: any) => {
        form.put(`${postsIndexUrl}/${post.id}`, {
            onError: (formErrors: any) => {
                // 繫結表單錯誤以便開發時追蹤
                console.error('Form errors:', formErrors);
            },
        });
    };

    return (
        <ManageLayout role="admin" breadcrumbs={breadcrumbs}>
            <Head title={isZh ? '編輯公告' : 'Edit bulletin'} />

            <section className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-0">
                <Card className="border-0 bg-white shadow-sm ring-1 ring-black/5">
                    <CardContent className="flex flex-col gap-4 px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-2">
                            <h1 className="text-3xl font-semibold text-[#151f54]">
                                {isZh ? '編輯公告' : 'Edit bulletin'}
                            </h1>
                            <p className="text-sm text-slate-600">
                                {isZh ? '調整公告內容與附件設定。' : 'Update bulletin details and attachments.'}
                            </p>
                        </div>
                        <Button asChild variant="outline" className="rounded-full border-[#151f54]/30">
                            <Link href={postsIndexUrl}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                {isZh ? '返回列表' : 'Back to list'}
                            </Link>
                        </Button>
                    </CardContent>
                </Card>

                <PostForm
                    categories={categories}
                    cancelUrl={postsIndexUrl}
                    mode="edit"
                    initialValues={initialValues}
                    statusOptions={statusOptions}
                    existingAttachments={post.attachments ?? []}
                    onSubmit={handleSubmit}
                />
            </section>
        </ManageLayout>
    );
}
