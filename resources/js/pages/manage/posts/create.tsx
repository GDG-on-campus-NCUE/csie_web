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

interface CreatePostProps {
    categories: CategoryOption[];
    statusOptions: Array<'draft' | 'published' | 'scheduled'>;
}

export default function CreatePost({ categories, statusOptions }: CreatePostProps) {
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
        { title: '新增公告', href: '/manage/posts/create' },
    ];

    const handleSubmit: PostFormSubmitHandler = (form) => {
        form.post('/manage/posts', {
            preserveScroll: true,
        });
    };

    const emptyPost: PostResource = {
        title: '',
        slug: '',
        category_id: undefined,
        excerpt: '',
        content: '',
        status: 'draft',
        publish_at: null,
        tags: [],
        attachments: [],
    };

    return (
        <ManageLayout role={layoutRole} breadcrumbs={breadcrumbs}>
            <Head title="新增公告" />

            <section className="mx-auto flex w-full max-w-5xl flex-col gap-6">
                <Card className="border-0 bg-white shadow-sm ring-1 ring-black/5">
                    <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-2">
                            <h1 className="text-3xl font-semibold text-[#151f54]">新增公告</h1>
                            <p className="text-sm text-slate-600">撰寫公告內容並設定排程與附件。</p>
                        </div>
                        <Button asChild variant="outline" className="rounded-full border-[#151f54]/30">
                            <Link href="/manage/posts">
                                <ArrowLeft className="mr-2 h-4 w-4" /> 返回列表
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
                />
            </section>
        </ManageLayout>
    );
}
