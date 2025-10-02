import AppLayout from '@/layouts/app-layout';
import ManagePage from '@/layouts/manage/manage-page';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useTranslator } from '@/hooks/use-translator';
import { formatBytes } from '@/lib/shared/utils';
import type { ManagePostDetail } from '@/types/manage';
import type { BreadcrumbItem, SharedData } from '@/types/shared';
import { Head, Link, usePage } from '@inertiajs/react';
import type { ReactElement } from 'react';
import { ArrowLeft, CalendarDays, Clock, Download, Edit, ExternalLink, Eye, FileText, Paperclip, Tag as TagIcon, User as UserIcon } from 'lucide-react';

type ManageAdminPostsShowPageProps = SharedData & {
    post: ManagePostDetail;
    abilities: {
        canUpdate: boolean;
        canArchive: boolean;
        canRestore: boolean;
    };
};

const statusVariantMap: Record<string, 'default' | 'secondary' | 'outline'> = {
    draft: 'outline',
    scheduled: 'secondary',
    published: 'default',
    hidden: 'outline',
    archived: 'outline',
};

const visibilityToneMap: Record<string, string> = {
    public: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    internal: 'bg-amber-100 text-amber-700 border-amber-200',
    private: 'bg-rose-100 text-rose-700 border-rose-200',
};

function formatDateTime(value: string | null | undefined, locale: string) {
    if (!value) {
        return '—';
    }

    return new Date(value).toLocaleString(locale, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export default function ManageAdminPostsShow() {
    const page = usePage<ManageAdminPostsShowPageProps>();
    const { post, abilities } = page.props;
    const { t } = useTranslator('manage');
    const { t: tPosts } = useTranslator('manage.posts');
    const locale = page.props.locale ?? 'zh-TW';

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
            title: tPosts('show.breadcrumb', '公告詳情'),
            href: `/manage/admin/posts/${post.id}`,
        },
    ];

    const pageTitle = `${post.title}｜${t('sidebar.admin.posts', '公告訊息')}`;

    return (
        <>
            <Head title={pageTitle} />
            <ManagePage
                title={post.title}
                description={post.summary ?? tPosts('show.description', '檢視公告內容、附件與歷程記錄。')}
                breadcrumbs={breadcrumbs}
                toolbar={
                    <div className="flex flex-wrap items-center gap-2">
                        <Button variant="ghost" size="sm" className="gap-2" asChild>
                            <Link href="/manage/admin/posts">
                                <ArrowLeft className="h-4 w-4" />
                                {t('layout.back', '返回列表')}
                            </Link>
                        </Button>
                        {abilities.canUpdate ? (
                            <Button size="sm" className="gap-2" asChild>
                                <Link href={`/manage/admin/posts/${post.id}/edit`}>
                                    <Edit className="h-4 w-4" />
                                    {tPosts('show.edit', '編輯公告')}
                                </Link>
                            </Button>
                        ) : null}
                    </div>
                }
            >
                <section className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
                    <Card className="border border-neutral-200/80">
                        <CardHeader className="space-y-4">
                            <div className="flex flex-wrap items-center gap-2">
                                <Badge variant={statusVariantMap[post.status] ?? 'outline'} className="capitalize">
                                    {tPosts(`status.${post.status}`, post.status)}
                                </Badge>
                                <span
                                    className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium uppercase ${visibilityToneMap[post.visibility] ?? 'border-neutral-200 text-neutral-500'}`}
                                >
                                    {tPosts(`visibility.${post.visibility}`, post.visibility)}
                                </span>
                                {post.pinned ? (
                                    <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                                        {tPosts('show.pinned', '置頂')}
                                    </Badge>
                                ) : null}
                            </div>
                            <CardTitle className="text-2xl font-semibold text-neutral-900">{post.title}</CardTitle>
                            {post.summary ? (
                                <CardDescription className="text-sm text-neutral-600">
                                    {post.summary}
                                </CardDescription>
                            ) : null}
                            <dl className="grid gap-2 text-sm text-neutral-500 sm:grid-cols-2">
                                <div className="flex items-center gap-2">
                                    <CalendarDays className="h-4 w-4 text-neutral-400" />
                                    <div>
                                        <dt className="text-xs uppercase tracking-wide text-neutral-400">{tPosts('show.published_at', '發布時間')}</dt>
                                        <dd className="font-medium text-neutral-700">{formatDateTime(post.published_at ?? post.created_at, locale)}</dd>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-neutral-400" />
                                    <div>
                                        <dt className="text-xs uppercase tracking-wide text-neutral-400">{tPosts('show.updated_at', '最後更新')}</dt>
                                        <dd className="font-medium text-neutral-700">{formatDateTime(post.updated_at, locale)}</dd>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <UserIcon className="h-4 w-4 text-neutral-400" />
                                    <div>
                                        <dt className="text-xs uppercase tracking-wide text-neutral-400">{tPosts('show.author', '建立者')}</dt>
                                        <dd className="font-medium text-neutral-700">{post.author?.name ?? tPosts('show.system', '系統')}</dd>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Eye className="h-4 w-4 text-neutral-400" />
                                    <div>
                                        <dt className="text-xs uppercase tracking-wide text-neutral-400">{tPosts('show.views', '瀏覽數')}</dt>
                                        <dd className="font-medium text-neutral-700">{post.views}</dd>
                                    </div>
                                </div>
                            </dl>
                            <Separator className="bg-neutral-100" />
                            <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500">
                                {post.category ? (
                                    <Badge variant="outline" className="gap-1 text-neutral-600">
                                        <FileText className="h-3 w-3" />
                                        {post.category.name}
                                    </Badge>
                                ) : null}
                                {post.space ? (
                                    <Badge variant="outline" className="gap-1 text-neutral-600">
                                        <Paperclip className="h-3 w-3" />
                                        {post.space.name}
                                    </Badge>
                                ) : null}
                                {post.tags?.length ? (
                                    <div className="flex flex-wrap items-center gap-1">
                                        <TagIcon className="h-3 w-3 text-neutral-400" />
                                        {post.tags.map((tag) => (
                                            <span
                                                key={tag.id}
                                                className="inline-flex items-center rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] text-neutral-600"
                                            >
                                                {tag.name}
                                            </span>
                                        ))}
                                    </div>
                                ) : null}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <article className="prose prose-neutral max-w-none text-neutral-700" dangerouslySetInnerHTML={{ __html: post.content }} />
                        </CardContent>
                    </Card>

                    <div className="flex flex-col gap-4">
                        <Card className="border border-neutral-200/80">
                            <CardHeader>
                                <CardTitle className="text-base font-semibold text-neutral-800 flex items-center gap-2">
                                    <Paperclip className="h-4 w-4 text-neutral-500" />
                                    {tPosts('show.attachments', '附件')}
                                </CardTitle>
                                <CardDescription className="text-sm text-neutral-500">
                                    {tPosts('show.attachments_description', '下載公告相關檔案與連結。')}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {post.attachments?.length ? (
                                    <ul className="space-y-3">
                                        {post.attachments.map((attachment) => (
                                            <li key={attachment.id} className="rounded-lg border border-neutral-200/80 px-3 py-2">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div>
                                                        <p className="text-sm font-medium text-neutral-800">{attachment.title}</p>
                                                        <p className="text-xs text-neutral-500">
                                                            {attachment.filename ?? '—'} · {formatBytes(attachment.size ?? 0)}
                                                        </p>
                                                        {attachment.uploader ? (
                                                            <p className="text-xs text-neutral-400">
                                                                {tPosts('show.uploaded_by', '上傳者')}: {attachment.uploader.name}
                                                            </p>
                                                        ) : null}
                                                    </div>
                                                    {attachment.url ? (
                                                        <Button variant="outline" size="sm" className="gap-1" asChild>
                                                            <Link href={attachment.url} target={attachment.is_external ? '_blank' : undefined} rel={attachment.is_external ? 'noopener noreferrer' : undefined}>
                                                                {attachment.is_external ? <ExternalLink className="h-4 w-4" /> : <Download className="h-4 w-4" />}
                                                                {attachment.is_external ? tPosts('show.open_link', '開啟連結') : tPosts('show.download', '下載')}
                                                            </Link>
                                                        </Button>
                                                    ) : null}
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="rounded-lg border border-dashed border-neutral-200/80 px-4 py-6 text-center text-sm text-neutral-500">
                                        {tPosts('show.no_attachments', '目前沒有附件。')}
                                    </p>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="border border-neutral-200/80">
                            <CardHeader>
                                <CardTitle className="text-base font-semibold text-neutral-800 flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-neutral-500" />
                                    {tPosts('show.timeline', '更新歷程')}
                                </CardTitle>
                                <CardDescription className="text-sm text-neutral-500">
                                    {tPosts('show.timeline_description', '追蹤公告的主要更新與上傳活動。')}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {post.timeline?.length ? (
                                    <ol className="space-y-4">
                                        {post.timeline.map((event, index) => (
                                            <li key={`${event.type}-${index}`} className="relative pl-6">
                                                <span className="absolute left-0 top-1.5 h-2 w-2 rounded-full bg-primary-500" aria-hidden />
                                                <div className="text-xs uppercase tracking-wide text-neutral-400">
                                                    {formatDateTime(event.timestamp, locale)}
                                                </div>
                                                <p className="text-sm font-semibold text-neutral-800">{event.title}</p>
                                                <p className="text-sm text-neutral-500">{event.description}</p>
                                                {event.actor ? (
                                                    <p className="text-xs text-neutral-400">
                                                        {tPosts('show.timeline_actor', '執行者')}: {event.actor}
                                                    </p>
                                                ) : null}
                                            </li>
                                        ))}
                                    </ol>
                                ) : (
                                    <p className="rounded-lg border border-dashed border-neutral-200/80 px-4 py-6 text-center text-sm text-neutral-500">
                                        {tPosts('show.timeline_empty', '尚未有歷程記錄。')}
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </section>
            </ManagePage>
        </>
    );
}

ManageAdminPostsShow.layout = (page: ReactElement) => <AppLayout>{page}</AppLayout>;
