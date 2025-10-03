import AppLayout from '@/layouts/app-layout';
import ManagePage from '@/layouts/manage/manage-page';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useTranslator } from '@/hooks/use-translator';
import type { BreadcrumbItem, SharedData } from '@/types/shared';
import { Head, Link, router, usePage } from '@inertiajs/react';
import type { ReactElement } from 'react';
import { ArrowLeft, CalendarRange, Download, Edit3, Megaphone, Users } from 'lucide-react';

// 映射公告狀態對應的顯示文字
const statusLabel: Record<string, string> = {
    draft: '草稿',
    scheduled: '排程',
    published: '已發佈',
    archived: '已封存',
};

// 依狀態套用不同顏色樣式，讓教師快速分辨公告狀態
const statusTone: Record<string, string> = {
    draft: 'bg-neutral-100 text-neutral-600 border-neutral-200',
    scheduled: 'bg-amber-100 text-amber-600 border-amber-200',
    published: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    archived: 'bg-neutral-200 text-neutral-500 border-neutral-300',
};

type AttachmentItem = {
    id: number;
    title: string | null;
    filename?: string | null;
    url?: string | null;
    is_external?: boolean;
    size?: number | null;
};

type TimelineItem = {
    type: string;
    title: string;
    description: string;
    actor: string | null;
    timestamp: string;
};

type PostDetail = {
    id: number;
    title: string;
    summary: string | null;
    content: string;
    status: string;
    target_audience: string | null;
    course_start_at: string | null;
    course_end_at: string | null;
    published_at: string | null;
    category?: {
        id: number;
        name: string;
    } | null;
    tags?: Array<{
        id: number;
        name: string;
        slug?: string | null;
    }>;
    attachments?: AttachmentItem[];
    timeline?: TimelineItem[];
};

type PageProps = SharedData & {
    post: PostDetail;
    abilities: {
        canUpdate: boolean;
        canDelete: boolean;
    };
};

// 統一處理日期顯示，當值為空或無法解析時以破折號取代
const formatDate = (value: string | null | undefined, locale: string) => {
    if (!value) {
        return '—';
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return '—';
    }

    return date.toLocaleString(locale, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    });
};

function ManageTeacherPostsShow() {
    const page = usePage<PageProps>();
    const { post, abilities } = page.props;
    const locale = page.props.locale ?? 'zh-TW';

    const { t } = useTranslator('manage');
    const { t: tTeacher } = useTranslator('manage.teacher.posts');

    // 建立麵包屑讓教師能從列表快速返回
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('layout.breadcrumbs.dashboard', '管理後台'),
            href: '/manage/dashboard',
        },
        {
            title: t('sidebar.teacher.posts', '公告管理'),
            href: '/manage/teacher/posts',
        },
        {
            title: post.title,
            href: `/manage/teacher/posts/${post.id}`,
        },
    ];

    // 快速發佈按鈕觸發的 POST 請求，使用 confirm 避免誤觸
    const handleQuickPublish = () => {
        if (!window.confirm(tTeacher('actions.quick_publish_confirm', '確定要立即發佈這則公告嗎？'))) {
            return;
        }

        router.post(`/manage/teacher/posts/${post.id}/quick-publish`, {}, {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title={post.title} />
            <ManagePage
                title={post.title}
                description={post.summary ?? tTeacher('show.description_fallback', '檢視公告細節、受眾與課程時程。')}
                breadcrumbs={breadcrumbs}
                toolbar={
                    <div className="flex flex-wrap items-center gap-2">
                        <Button size="sm" variant="ghost" asChild className="gap-2">
                            <Link href="/manage/teacher/posts">
                                <ArrowLeft className="h-4 w-4" />
                                {t('layout.back', '返回列表')}
                            </Link>
                        </Button>
                        {abilities.canUpdate ? (
                            <Button size="sm" variant="outline" className="gap-2" asChild>
                                <Link href={`/manage/teacher/posts/${post.id}/edit`}>
                                    <Edit3 className="h-4 w-4" />
                                    {tTeacher('actions.edit_post', '編輯公告')}
                                </Link>
                            </Button>
                        ) : null}
                        {abilities.canUpdate && post.status !== 'published' ? (
                            <Button size="sm" className="gap-2" onClick={handleQuickPublish}>
                                <Megaphone className="h-4 w-4" />
                                {tTeacher('actions.quick_publish', '快速發佈')}
                            </Button>
                        ) : null}
                    </div>
                }
            >
                <section className="rounded-2xl border border-neutral-200/80 bg-white/95 p-6 shadow-sm">
                    <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className={statusTone[post.status] ?? 'border-neutral-200 text-neutral-600'}>
                            {statusLabel[post.status] ?? post.status}
                        </Badge>
                        {post.category ? (
                            <Badge variant="secondary">{post.category.name}</Badge>
                        ) : null}
                        {post.tags?.map((tag) => (
                            <Badge key={tag.id} variant="outline" className="text-xs">
                                #{tag.name}
                            </Badge>
                        ))}
                    </div>
                    <div className="mt-4 space-y-3 text-sm text-neutral-600">
                        {post.target_audience ? (
                            <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-neutral-400" />
                                <span>{post.target_audience}</span>
                            </div>
                        ) : null}
                        <div className="flex items-center gap-2">
                            <CalendarRange className="h-4 w-4 text-neutral-400" />
                            <span>
                                {tTeacher('show.course_window', '課程期間：:start ~ :end', {
                                    start: formatDate(post.course_start_at, locale),
                                    end: formatDate(post.course_end_at, locale),
                                })}
                            </span>
                        </div>
                        <div>
                            <span className="font-medium text-neutral-700">{tTeacher('show.published_at', '發佈時間')}：</span>
                            <span>{formatDate(post.published_at, locale)}</span>
                        </div>
                    </div>
                    <article className="prose prose-sm mt-6 max-w-none text-neutral-700">
                        {/* 依內容換行組成段落，保留教師輸入的文字格式 */}
                        {post.content.split('\n').map((paragraph, index) => (
                            <p key={index}>{paragraph}</p>
                        ))}
                    </article>
                </section>

                {post.attachments && post.attachments.length > 0 ? (
                    <section className="rounded-2xl border border-neutral-200/80 bg-white/95 p-6 shadow-sm">
                        <h2 className="text-sm font-semibold text-neutral-700">{tTeacher('show.attachments_title', '附件')}</h2>
                        <Table className="mt-3">
                            <TableHeader>
                                <TableRow className="bg-neutral-50/80">
                                    <TableHead className="text-neutral-500">{tTeacher('show.attachments_name', '檔案名稱')}</TableHead>
                                    <TableHead className="text-neutral-500">{tTeacher('show.attachments_size', '大小')}</TableHead>
                                    <TableHead className="text-right text-neutral-500">{tTeacher('show.attachments_action', '操作')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {post.attachments.map((attachment) => (
                                    <TableRow key={attachment.id} className="border-neutral-200/70">
                                        <TableCell>
                                            <span className="text-sm text-neutral-700">{attachment.title ?? attachment.filename ?? tTeacher('show.attachments_untitled', '未命名附件')}</span>
                                        </TableCell>
                                        <TableCell className="text-sm text-neutral-500">{attachment.size ? `${(attachment.size / 1024).toFixed(1)} KB` : '—'}</TableCell>
                                        <TableCell className="text-right">
                                            {attachment.url ? (
                                                <Button variant="outline" size="sm" className="gap-1" asChild>
                                                    <a href={attachment.url} target="_blank" rel="noopener noreferrer">
                                                        <Download className="h-4 w-4" />
                                                        {tTeacher('show.attachments_download', '下載')}
                                                    </a>
                                                </Button>
                                            ) : null}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </section>
                ) : null}

                {post.timeline && post.timeline.length > 0 ? (
                    <section className="rounded-2xl border border-neutral-200/80 bg-white/95 p-6 shadow-sm">
                        <h2 className="text-sm font-semibold text-neutral-700">{tTeacher('show.timeline_title', '最新活動')}</h2>
                        <ul className="mt-3 space-y-3">
                            {post.timeline.map((item) => (
                                <li key={item.timestamp} className="rounded-xl border border-neutral-200/70 bg-neutral-50/60 px-4 py-3">
                                    <div className="flex items-center justify-between text-xs text-neutral-500">
                                        <span>{formatDate(item.timestamp, locale)}</span>
                                        <span>{item.actor ?? tTeacher('show.timeline_system', '系統')}</span>
                                    </div>
                                    <p className="mt-1 text-sm font-medium text-neutral-700">{item.title}</p>
                                    <p className="text-sm text-neutral-600">{item.description}</p>
                                </li>
                            ))}
                        </ul>
                    </section>
                ) : null}
            </ManagePage>
        </>
    );
}

ManageTeacherPostsShow.layout = (page: ReactElement) => <AppLayout>{page}</AppLayout>;

export default ManageTeacherPostsShow;
