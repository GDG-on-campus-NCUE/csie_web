import { useMemo, useState } from 'react';

import AppLayout from '@/layouts/app-layout';
import ManagePage from '@/layouts/manage/manage-page';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useTranslator } from '@/hooks/use-translator';
import { cn } from '@/lib/shared/utils';
import type { ManageTeacherPostFilterOptions, ManageTeacherPostFilterState, ManageTeacherPostListItem, ManageTeacherPostListResponse } from '@/types/manage/teacher';
import type { BreadcrumbItem, SharedData } from '@/types/shared';
import { Head, Link, router, usePage } from '@inertiajs/react';
import type { ChangeEvent, FormEvent, ReactElement } from 'react';
import { CalendarRange, Copy, FilePlus2, Loader2, Megaphone, Users } from 'lucide-react';

type PageProps = SharedData & {
    posts: ManageTeacherPostListResponse;
    filters: ManageTeacherPostFilterState;
    filterOptions: ManageTeacherPostFilterOptions;
    statusSummary: Record<string, number>;
    abilities: {
        canCreate: boolean;
        canQuickPublish: boolean;
        canDuplicate: boolean;
    };
};

const statusTone: Record<string, string> = {
    draft: 'bg-neutral-100 text-neutral-600 border-neutral-200',
    scheduled: 'bg-amber-100 text-amber-600 border-amber-200',
    published: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    archived: 'bg-neutral-200 text-neutral-500 border-neutral-300',
};

const statusLabel: Record<string, string> = {
    draft: '草稿',
    scheduled: '排程',
    published: '已發佈',
    archived: '已封存',
};

const formatDateTime = (value: string | null | undefined, locale: string) => {
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

const formatDateRange = (start: string | null | undefined, end: string | null | undefined, locale: string) => {
    if (!start && !end) {
        return null;
    }

    const format = (value: string | null | undefined) => (value ? new Date(value).toLocaleDateString(locale, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }) : '—');

    return `${format(start)} ~ ${format(end)}`;
};

export default function ManageTeacherPostsIndex() {
    const page = usePage<PageProps>();
    const { posts, filters, filterOptions, abilities } = page.props;
    const locale = page.props.locale ?? 'zh-TW';
    const authUserId = page.props.auth?.user?.id ?? null;
    const { t } = useTranslator('manage');
    const { t: tTeacher } = useTranslator('manage.teacher.posts');

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('layout.breadcrumbs.dashboard', '管理後台'),
            href: '/manage/dashboard',
        },
        {
            title: t('sidebar.teacher.posts', '公告管理'),
            href: '/manage/teacher/posts',
        },
    ];

    const [filterForm, setFilterForm] = useState(() => ({
        keyword: filters.keyword ?? '',
        status: filters.status ?? '',
        tag: filters.tag ?? '',
        per_page: String(filters.per_page ?? 10),
    }));

    const paginationLinks = posts.links ?? { first: null, last: null, prev: null, next: null };

    const handleInputChange = (field: keyof typeof filterForm) => (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const value = event.target.value;
        setFilterForm((prev) => ({ ...prev, [field]: value }));

        if (field !== 'keyword') {
            applyFilters({ [field]: value });
        }
    };

    const applyFilters = (overrides: Partial<typeof filterForm> & { page?: number } = {}) => {
        const payload = {
            keyword: overrides.keyword ?? (filterForm.keyword || null),
            status: overrides.status ?? (filterForm.status || null),
            tag: overrides.tag ?? (filterForm.tag || null),
            category: filters.category ?? null,
            per_page: Number(overrides.per_page ?? filterForm.per_page ?? 10),
            page: overrides.page ?? undefined,
        };

        router.get('/manage/teacher/posts', payload, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        applyFilters();
    };

    const resetFilters = () => {
        setFilterForm({ keyword: '', status: '', tag: '', per_page: '10' });
        router.get('/manage/teacher/posts', {
            keyword: null,
            status: null,
            tag: null,
            category: null,
            per_page: 10,
        }, {
            preserveScroll: true,
        });
    };

    const handleQuickPublish = (post: ManageTeacherPostListItem) => {
        if (!window.confirm(tTeacher('actions.quick_publish_confirm', '確定要立即發佈這則公告嗎？'))) {
            return;
        }

        router.post(`/manage/teacher/posts/${post.id}/quick-publish`, {}, {
            preserveScroll: true,
        });
    };

    const handleDuplicate = (post: ManageTeacherPostListItem) => {
        router.post(`/manage/teacher/posts/${post.id}/duplicate`, {}, {
            preserveScroll: true,
        });
    };

    const pageTitle = t('sidebar.teacher.posts', '公告管理');
    const hasPosts = posts.data.length > 0;

    const summaryCards = useMemo(() => filterOptions.statuses.map((option) => ({
        value: option.value,
        label: option.label,
        count: option.count ?? 0,
    })), [filterOptions.statuses]);

    return (
        <>
            <Head title={pageTitle} />
            <ManagePage
                title={pageTitle}
                description={tTeacher('page.description', '集中瀏覽與管理課程公告、快速掌握狀態與發佈時程。')}
                breadcrumbs={breadcrumbs}
                toolbar={
                    abilities.canCreate ? (
                        <Button size="sm" className="gap-2" asChild>
                            <Link href="/manage/teacher/posts/create">
                                <FilePlus2 className="h-4 w-4" />
                                {tTeacher('actions.create', '新增公告')}
                            </Link>
                        </Button>
                    ) : null
                }
            >
                <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    {summaryCards.map((card) => (
                        <div key={card.value} className="rounded-2xl border border-neutral-200/80 bg-white/95 px-4 py-3 shadow-sm">
                            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{card.label}</p>
                            <p className="text-2xl font-semibold text-neutral-900">{card.count}</p>
                        </div>
                    ))}
                </section>

                <section className="rounded-2xl border border-neutral-200/80 bg-white/95 p-4 shadow-sm">
                    <form className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between" onSubmit={handleSubmit}>
                        <div className="flex flex-1 flex-wrap items-center gap-2">
                            <Input
                                type="search"
                                value={filterForm.keyword}
                                onChange={handleInputChange('keyword')}
                                placeholder={tTeacher('filters.keyword_placeholder', '搜尋標題或課程名稱')}
                                className="w-full sm:w-64"
                            />
                            <Select value={filterForm.status} onChange={handleInputChange('status')} className="w-full sm:w-44">
                                <option value="">{tTeacher('filters.status_all', '全部狀態')}</option>
                                {filterOptions.statuses.map((status) => (
                                    <option key={String(status.value)} value={String(status.value)}>
                                        {status.label}
                                    </option>
                                ))}
                            </Select>
                            <Select value={filterForm.tag} onChange={handleInputChange('tag')} className="w-full sm:w-44">
                                <option value="">{tTeacher('filters.tag_all', '全部標籤')}</option>
                                {filterOptions.tags.map((tag) => (
                                    <option key={String(tag.value)} value={String(tag.value)}>
                                        {tag.label}
                                    </option>
                                ))}
                            </Select>
                            <Select value={filterForm.per_page} onChange={handleInputChange('per_page')} className="w-full sm:w-32">
                                {[10, 20, 50].map((option) => (
                                    <option key={option} value={String(option)}>
                                        {tTeacher('filters.per_page_option', ':count 筆/頁', { count: option })}
                                    </option>
                                ))}
                            </Select>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button type="submit" size="sm" className="gap-1">
                                <Megaphone className="h-4 w-4" />
                                {tTeacher('filters.apply', '套用篩選')}
                            </Button>
                            <Button type="button" size="sm" variant="ghost" onClick={resetFilters}>
                                {tTeacher('filters.reset', '重設')}
                            </Button>
                        </div>
                    </form>

                    <div className="mt-4 overflow-hidden rounded-2xl border border-neutral-200/70">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-neutral-50/80">
                                    <TableHead className="w-[40%] text-neutral-500">{tTeacher('table.title', '公告 / 課程')}</TableHead>
                                    <TableHead className="w-[15%] text-neutral-500">{tTeacher('table.status', '狀態')}</TableHead>
                                    <TableHead className="w-[20%] text-neutral-500">{tTeacher('table.category', '課程分類')}</TableHead>
                                    <TableHead className="w-[25%] text-right text-neutral-500">{tTeacher('table.updated', '更新時間 / 操作')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {!hasPosts ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="py-16 text-center text-sm text-neutral-500">
                                            {tTeacher('table.empty', '目前尚無公告，點擊右上角即可新增。')}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    posts.data.map((post) => {
                                        const dateRange = formatDateRange(post.course_start_at, post.course_end_at, locale);
                                        const canQuickPublish = abilities.canQuickPublish && post.status !== 'published' && post.author?.id === authUserId;

                                        return (
                                            <TableRow key={post.id} className="border-neutral-200/60">
                                                <TableCell className="space-y-2">
                                                    <div className="flex flex-col gap-1">
                                                        <Link
                                                            href={`/manage/teacher/posts/${post.id}/edit`}
                                                            className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                                                        >
                                                            {post.title}
                                                        </Link>
                                                        {post.target_audience ? (
                                                            <div className="flex items-center gap-1 text-xs text-neutral-500">
                                                                <Users className="h-3.5 w-3.5" />
                                                                <span>{post.target_audience}</span>
                                                            </div>
                                                        ) : null}
                                                        {dateRange ? (
                                                            <div className="flex items-center gap-1 text-xs text-neutral-500">
                                                                <CalendarRange className="h-3.5 w-3.5" />
                                                                <span>{dateRange}</span>
                                                            </div>
                                                        ) : null}
                                                        {post.tags?.length ? (
                                                            <div className="flex flex-wrap gap-1 text-[11px] text-neutral-500">
                                                                {post.tags.map((tag) => (
                                                                    <span key={tag.id} className="rounded-full bg-neutral-100 px-2 py-0.5">
                                                                        #{tag.name}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        ) : null}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <span className={cn('inline-flex items-center rounded-full border px-2 py-1 text-xs font-medium', statusTone[post.status] ?? 'border-neutral-200 text-neutral-600')}>
                                                        {statusLabel[post.status] ?? post.status}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="text-sm text-neutral-700">{post.category?.name ?? tTeacher('table.no_category', '未分類')}</span>
                                                </TableCell>
                                                <TableCell className="space-y-2 text-right text-xs text-neutral-500">
                                                    <div>{formatDateTime(post.updated_at ?? post.created_at, locale)}</div>
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            type="button"
                                                            size="xs"
                                                            variant="outline"
                                                            className="gap-1"
                                                            onClick={() => handleDuplicate(post)}
                                                            disabled={!abilities.canDuplicate}
                                                        >
                                                            <Copy className="h-3 w-3" />
                                                            {tTeacher('actions.duplicate', '複製')}
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            size="xs"
                                                            className="gap-1"
                                                            onClick={() => handleQuickPublish(post)}
                                                            disabled={!canQuickPublish}
                                                        >
                                                            {canQuickPublish ? <Megaphone className="h-3.5 w-3.5" /> : <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                                                            {tTeacher('actions.quick_publish', '快速發佈')}
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="mt-4 flex flex-col gap-3 text-sm text-neutral-500 md:flex-row md:items-center md:justify-between">
                        <span>
                            {tTeacher('table.pagination_summary', '顯示 :from-:to，共 :total 筆', {
                                from: posts.meta.from ?? 0,
                                to: posts.meta.to ?? 0,
                                total: posts.meta.total ?? 0,
                            })}
                        </span>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" disabled={!paginationLinks.prev} asChild>
                                <Link href={paginationLinks.prev ?? '#'} preserveScroll preserveState>
                                    {tTeacher('pagination.prev', '上一頁')}
                                </Link>
                            </Button>
                            <Button variant="outline" size="sm" disabled={!paginationLinks.next} asChild>
                                <Link href={paginationLinks.next ?? '#'} preserveScroll preserveState>
                                    {tTeacher('pagination.next', '下一頁')}
                                </Link>
                            </Button>
                        </div>
                    </div>
                </section>
            </ManagePage>
        </>
    );
}

ManageTeacherPostsIndex.layout = (page: ReactElement) => <AppLayout>{page}</AppLayout>;
