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
    filename: string | null;
    download_url: string | null;
    external_url: string | null;
    mime_type: string | null;
    size: number | null;
}

interface PostDetail {
    id: number;
    title: string;
    slug: string;
    status: 'draft' | 'published' | 'scheduled';
    publish_at: string | null;
    category: { id: number; name: string; slug: string } | null;
    author: { id: number; name: string; email: string } | null;
    excerpt: string | null;
    content: string;
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

const formatAttachmentSize = (bytes: number | null) => {
    if (!bytes || bytes <= 0) return '';
    const units = ['B', 'KB', 'MB', 'GB'];
    let value = bytes;
    let index = 0;
    while (value >= 1024 && index < units.length - 1) {
        value /= 1024;
        index += 1;
    }
    return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[index]}`;
};

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
                <Card className="border-0 bg-white shadow-sm ring-1 ring-black/5">
                    <CardHeader className="flex flex-col gap-3 border-b border-slate-100 p-6 sm:flex-row sm:items-start sm:justify-between">
                        <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-3">
                                <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                                <span className="text-sm text-slate-500">Slug：{post.slug}</span>
                            </div>
                            <CardTitle className="text-3xl font-semibold text-[#151f54]">{post.title}</CardTitle>
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
                            <Button asChild variant="outline" className="rounded-full border-[#151f54]/30">
                                <Link href="/manage/posts">
                                    <ArrowLeft className="mr-2 h-4 w-4" /> 返回列表
                                </Link>
                            </Button>
                            <Button asChild className="rounded-full bg-[#151f54] text-white hover:bg-[#1f2a6d]">
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
                                    <span key={tag} className="rounded-full bg-[#151f54]/10 px-3 py-1 text-[#151f54]">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        )}

                        {post.excerpt && (
                            <div className="rounded-2xl bg-[#f5f7ff] p-4 text-slate-600">{post.excerpt}</div>
                        )}

                        <article className="prose max-w-none prose-headings:text-[#151f54] prose-a:text-[#151f54]" dangerouslySetInnerHTML={{ __html: post.content }} />
                    </CardContent>
                </Card>

                {post.attachments.length > 0 && (
                    <Card className="border-0 bg-white shadow-sm ring-1 ring-black/5">
                        <CardHeader className="border-b border-slate-100 p-6">
                            <CardTitle className="text-lg font-semibold text-[#151f54]">附件與連結</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 p-6">
                            {post.attachments.map((attachment) => {
                                const displayName = attachment.title ?? attachment.filename ?? `#${attachment.id}`;
                                const sizeLabel = formatAttachmentSize(attachment.size);
                                return (
                                    <div
                                        key={attachment.id}
                                        className="flex flex-col gap-2 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between"
                                    >
                                        <div className="space-y-1">
                                            <span className="text-sm font-semibold text-[#151f54]">
                                                {displayName}
                                            </span>
                                            {(attachment.mime_type || sizeLabel) && (
                                                <span className="text-xs text-slate-500">
                                                    {attachment.mime_type ?? '—'}
                                                    {sizeLabel ? ` · ${sizeLabel}` : ''}
                                                </span>
                                            )}
                                            {attachment.download_url && (
                                                <a
                                                    className="inline-flex items-center gap-1 text-sm text-[#151f54] underline-offset-4 hover:underline"
                                                    href={attachment.download_url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    <FileText className="h-4 w-4" /> 檢視檔案
                                                </a>
                                            )}
                                            {attachment.external_url && (
                                                <a
                                                    className="inline-flex items-center gap-1 text-sm text-[#151f54] underline-offset-4 hover:underline"
                                                    href={attachment.external_url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    <Link2 className="h-4 w-4" /> {attachment.external_url}
                                                </a>
                                            )}
                                        </div>
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
