import { Head, Link, usePage } from '@inertiajs/react';
import ManageLayout from '@/layouts/manage/manage-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, Eye, FileText, Link2, User } from 'lucide-react';
import type { BreadcrumbItem, SharedData } from '@/types';

interface AttachmentSummary {
    id: number;
    type: 'image' | 'document' | 'link';
    title: string | null;
    file_url: string | null;
    download_url: string | null;
    external_url: string | null;
    mime_type: string | null;
}

interface PostDetail {
    id: number;
    title: string;
    title_en?: string | null;
    slug: string;
    status: 'draft' | 'published' | 'scheduled';
    publish_at: string | null;
    category: { id: number; name: string; slug: string } | null;
    author: { id: number; name: string; email: string } | null;
    excerpt: string | null;
    excerpt_en?: string | null;
    content: string;
    content_en?: string | null;
    tags: string[];
    views: number;
    featured_image_url: string | null;
    attachments: AttachmentSummary[];
    created_at: string | null;
    updated_at: string | null;
}

interface ShowPostProps {
    post: PostDetail;
}

const statusBadgeMap: Record<'draft' | 'published' | 'scheduled', { label: string; variant: 'secondary' | 'outline' | 'default' }> = {
    draft: { label: '草稿', variant: 'secondary' },
    published: { label: '已發布', variant: 'default' },
    scheduled: { label: '排程中', variant: 'outline' },
};

const formatDateTime = (value: string | null) => {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleString('zh-TW', {
        dateStyle: 'medium',
        timeStyle: 'short',
    });
};

export default function ShowPost({ post }: ShowPostProps) {
    const { auth } = usePage<SharedData>().props;
    const userRole = auth?.user?.role ?? 'user';
    const layoutRole: 'admin' | 'teacher' | 'user' =
        userRole === 'admin' ? 'admin' : userRole === 'teacher' ? 'teacher' : 'user';

    const breadcrumbs: BreadcrumbItem[] = [
        { title: '管理首頁', href: '/manage/dashboard' },
        { title: '公告管理', href: '/manage/posts' },
        { title: post.title, href: `/manage/posts/${post.id}` },
    ];

    const statusInfo = statusBadgeMap[post.status];

    return (
        <ManageLayout role={layoutRole} breadcrumbs={breadcrumbs}>
            <Head title={`公告詳情 - ${post.title}`} />

            <section className="mx-auto flex w-full max-w-5xl flex-col gap-6">
                <Card className="border border-slate-200 bg-white shadow-sm">
                    <CardHeader className="flex flex-col gap-3 border-b border-slate-100 p-6 sm:flex-row sm:items-start sm:justify-between">
                        <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-3">
                                <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                                <span className="text-sm text-slate-500">Slug：{post.slug}</span>
                            </div>
                            <CardTitle className="text-3xl font-semibold text-slate-900">{post.title}</CardTitle>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                                <span className="inline-flex items-center gap-1">
                                    <Calendar className="h-4 w-4" /> 發布時間：{formatDateTime(post.publish_at)}
                                </span>
                                <span className="inline-flex items-center gap-1">
                                    <Eye className="h-4 w-4" /> 瀏覽數：{post.views}
                                </span>
                                {post.category && (
                                    <span className="inline-flex items-center gap-1">
                                        <FileText className="h-4 w-4" /> 分類：{post.category.name}
                                    </span>
                                )}
                                {post.author && (
                                    <span className="inline-flex items-center gap-1">
                                        <User className="h-4 w-4" /> 作者：{post.author.name}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <Button
                                asChild
                                variant="outline"
                                className="rounded-full border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                            >
                                <Link href="/manage/posts">
                                    <ArrowLeft className="mr-2 h-4 w-4" /> 返回列表
                                </Link>
                            </Button>
                            <Button
                                asChild
                                className="rounded-full bg-slate-900 text-white hover:bg-slate-800"
                            >
                                <Link href={`/manage/posts/${post.id}/edit`}>編輯公告</Link>
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6 p-6">
                        {post.featured_image_url && (
                            <div className="overflow-hidden rounded-2xl border border-slate-200">
                                <img
                                    src={post.featured_image_url}
                                    alt={post.title}
                                    className="h-auto w-full object-cover"
                                />
                            </div>
                        )}

                        {post.tags.length > 0 && (
                            <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
                                {post.tags.map((tag) => (
                                    <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        )}

                        {post.excerpt && (
                            <div className="rounded-2xl bg-slate-50 p-4 text-slate-600">{post.excerpt}</div>
                        )}

                        <article
                            className="prose max-w-none prose-headings:text-slate-900 prose-a:text-slate-900"
                            dangerouslySetInnerHTML={{ __html: post.content }}
                        />
                    </CardContent>
                </Card>

                {post.attachments.length > 0 && (
                    <Card className="border border-slate-200 bg-white shadow-sm">
                        <CardHeader className="border-b border-slate-100 p-6">
                            <CardTitle className="text-lg font-semibold text-slate-900">附件與連結</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 p-6">
                            {post.attachments.map((attachment) => {
                                const previewUrl = attachment.download_url ?? attachment.file_url;

                                return (
                                    <div
                                        key={attachment.id}
                                        className="flex flex-col gap-2 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between"
                                    >
                                        <div className="space-y-1">
                                            <span className="text-sm font-semibold text-slate-800">
                                                {attachment.title ?? '未命名附件'}
                                            </span>
                                            {previewUrl && (
                                                <a
                                                    className="inline-flex items-center gap-1 text-sm text-slate-700 underline-offset-4 hover:text-slate-900 hover:underline"
                                                    href={previewUrl}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    <FileText className="h-4 w-4" /> 檢視檔案
                                                </a>
                                            )}
                                        </div>
                                        {attachment.external_url && (
                                            <a
                                                className="inline-flex items-center gap-1 text-sm text-slate-700 underline-offset-4 hover:text-slate-900 hover:underline"
                                                href={attachment.external_url}
                                                target="_blank"
                                                rel="noreferrer"
                                            >
                                                <Link2 className="h-4 w-4" /> {attachment.external_url}
                                            </a>
                                        )}
                                    </div>
                                );
                            })}
                        </CardContent>
                    </Card>
                )}
            </section>
        </ManageLayout>
    );
}
