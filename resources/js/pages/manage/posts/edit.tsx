import { Head, Link, usePage } from '@inertiajs/react';
import ManageLayout from '@/layouts/manage/manage-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import PostForm, { PostFormSubmitHandler, PostResource } from './components/post-form';
import type { BreadcrumbItem, SharedData } from '@/types';

interface CategoryOption {
    id: number;
    name: string;
    name_en: string;
    slug: string;
}

interface EditPostProps {
    post: PostResource & { id: number };
    categories: CategoryOption[];
    statusOptions: Array<'draft' | 'published' | 'scheduled'>;
}

export default function EditPost({ post, categories, statusOptions }: EditPostProps) {
    const { auth } = usePage<SharedData>().props;
    const userRole = auth?.user?.role ?? 'user';
    const layoutRole: 'admin' | 'manager' | 'teacher' | 'user' =
        userRole === 'admin'
            ? 'admin'
            : userRole === 'manager'
              ? 'manager'
              : userRole === 'teacher'
                ? 'teacher'
                : 'user';

    const breadcrumbs: BreadcrumbItem[] = [
        { title: '管理首頁', href: '/manage/dashboard' },
        { title: '公告管理', href: '/manage/posts' },
        { title: post.title ?? '編輯公告', href: `/manage/posts/${post.id}/edit` },
    ];

    const handleSubmit: PostFormSubmitHandler = (form) => {
        form.put(`/manage/posts/${post.id}`, {
            preserveScroll: true,
        });
    };

    return (
        <ManageLayout role={layoutRole} breadcrumbs={breadcrumbs}>
            <Head title={`編輯公告 - ${post.title ?? ''}`} />

            <section className="mx-auto flex w-full max-w-5xl flex-col gap-6">
                <Card className="border-0 bg-white shadow-sm ring-1 ring-black/5">
                    <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-2">
                            <h1 className="text-3xl font-semibold text-[#151f54]">編輯公告</h1>
                            <p className="text-sm text-slate-600">更新公告內容、附件與排程設定。</p>
                        </div>
                        <Button asChild variant="outline" className="rounded-full border-[#151f54]/30">
                            <Link href={`/manage/posts/${post.id}`}>
                                <ArrowLeft className="mr-2 h-4 w-4" /> 返回詳情
                            </Link>
                        </Button>
                    </CardContent>
                </Card>

                <PostForm
                    mode="edit"
                    cancelUrl="/manage/posts"
                    categories={categories}
                    statusOptions={statusOptions}
                    post={post}
                    onSubmit={handleSubmit}
                />
            </section>
        </ManageLayout>
    );
}
