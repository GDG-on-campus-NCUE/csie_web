import AppLayout from '@/layouts/app-layout';
import ManagePage from '@/layouts/manage/manage-page';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useTranslator } from '@/hooks/use-translator';
import { cn } from '@/lib/shared/utils';
import type { ManagePostFilterOptions, ManagePostFilterState, ManagePostListResponse } from '@/types/manage';
import type { BreadcrumbItem, SharedData } from '@/types/shared';
import { Head, Link, router, usePage } from '@inertiajs/react';
import type { ChangeEvent, FormEvent, ReactElement } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { Archive, CheckSquare, FilePlus2, Filter, Megaphone, MegaphoneOff, Tag as TagIcon, Trash2, Users } from 'lucide-react';

type ManageAdminPostsPageProps = SharedData & {
    posts: ManagePostListResponse;
    filters: ManagePostFilterState;
    filterOptions: ManagePostFilterOptions;
    statusSummary: Record<string, number>;
    abilities: {
        canCreate: boolean;
        canBulkUpdate: boolean;
    };
};

type FilterFormState = {
    keyword: string;
    status: string;
    tag: string;
    per_page: string;
};

type FilterOverrides = Partial<FilterFormState> &
    Partial<Pick<ManagePostFilterState, 'category' | 'publisher' | 'published_from' | 'published_to'>> & {
        page?: number;
    };

const PER_PAGE_OPTIONS = ['10', '20', '50', '100'] as const;

const statusVariantMap: Record<string, 'outline' | 'secondary' | 'default'> = {
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

const formatDateTime = (value: string | null | undefined, locale: string) => {
    if (!value) {
        return '';
    }

    return new Date(value).toLocaleString(locale, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    });
};

const truncate = (value: string | null | undefined, length = 120) => {
    if (!value) {
        return '';
    }

    if (value.length <= length) {
        return value;
    }

    return `${value.slice(0, length)}…`;
};

export default function ManageAdminPostsIndex() {
    const page = usePage<ManageAdminPostsPageProps>();
    const { posts, filterOptions, statusSummary, abilities, filters } = page.props;
    const locale = page.props.locale ?? 'zh-TW';
    const paginationLinks = posts.links ?? { first: null, last: null, prev: null, next: null };

    const { t } = useTranslator('manage');
    const { t: tPosts } = useTranslator('manage.posts');
    const statusOptions = filterOptions.statuses ?? [];
    const tagOptions = filterOptions.tags ?? [];
    const perPageOptions = PER_PAGE_OPTIONS;

    // 依照目前的篩選狀態建立預設表單，確保瀏覽器返回或重新整理後仍保留條件。
    const defaultFilterForm = useMemo<FilterFormState>(() => ({
        keyword: filters.keyword ?? '',
        status: filters.status ?? '',
        tag: filters.tag ?? '',
        per_page: filters.per_page ? String(filters.per_page) : perPageOptions[0],
    }), [filters.keyword, filters.status, filters.tag, filters.per_page, perPageOptions]);

    const [filterForm, setFilterForm] = useState<FilterFormState>(defaultFilterForm);
    const [lastAppliedKeyword, setLastAppliedKeyword] = useState(defaultFilterForm.keyword);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [pageInput, setPageInput] = useState(() => String(posts.meta.current_page ?? 1));

    useEffect(() => {
        setFilterForm(defaultFilterForm);
        setLastAppliedKeyword(defaultFilterForm.keyword);
        setPageInput(String(posts.meta.current_page ?? 1));
    }, [defaultFilterForm, posts.meta.current_page]);

    const dataSignature = useMemo(() => posts.data.map((item) => item.id).join('-'), [posts.data]);

    useEffect(() => {
        setSelectedIds([]);
    }, [dataSignature]);

    const updateFilterForm = (field: keyof FilterFormState, value: string) => {
        setFilterForm((prev) => ({ ...prev, [field]: value }));
    };

    const buildFilterPayload = (
        overrides: FilterOverrides = {},
        options: { resetExtras?: boolean } = {}
    ) => {
        const nextState = { ...filterForm, ...overrides };
        const perPageValue = overrides.per_page ?? filterForm.per_page;
        const { resetExtras = false } = options;

        const payload: Record<string, string | number | null> = {
            keyword: nextState.keyword || null,
            status: nextState.status || null,
            tag: nextState.tag || null,
            per_page: perPageValue ? Number(perPageValue) : null,
            category: resetExtras ? null : filters.category,
            publisher: resetExtras ? null : filters.publisher,
            published_from: resetExtras ? null : filters.published_from,
            published_to: resetExtras ? null : filters.published_to,
        };

        if (overrides.page !== undefined) {
            payload.page = Number(overrides.page) || 1;
        }

        return payload;
    };

    const applyFilters = (
        overrides: FilterOverrides = {},
        options: { resetExtras?: boolean } = {}
    ) => {
        const payload = buildFilterPayload(overrides, options);

        router.get('/manage/admin/posts', payload, {
            preserveState: true,
            preserveScroll: true,
            replace: overrides.page === undefined,
        });
    };

    useEffect(() => {
        if (filterForm.keyword === lastAppliedKeyword) {
            return;
        }

        const handler = window.setTimeout(() => {
            const payload: Record<string, string | number | null> = {
                keyword: filterForm.keyword || null,
                status: filterForm.status || null,
                tag: filterForm.tag || null,
                per_page: filterForm.per_page ? Number(filterForm.per_page) : null,
                category: filters.category,
                publisher: filters.publisher,
                published_from: filters.published_from,
                published_to: filters.published_to,
            };

            router.get('/manage/admin/posts', payload, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
            setLastAppliedKeyword(filterForm.keyword);
        }, 400);

        return () => window.clearTimeout(handler);
    }, [
        filterForm.keyword,
        filterForm.status,
        filterForm.tag,
        filterForm.per_page,
        filters.category,
        filters.publisher,
        filters.published_from,
        filters.published_to,
        lastAppliedKeyword,
    ]);

    const handleFilterSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        applyFilters();
        setLastAppliedKeyword(filterForm.keyword);
    };

    const handleStatusChange = (event: ChangeEvent<HTMLSelectElement>) => {
        const value = event.target.value;
        updateFilterForm('status', value);
        applyFilters({ status: value });
    };

    const handleTagChange = (event: ChangeEvent<HTMLSelectElement>) => {
        const value = event.target.value;
        updateFilterForm('tag', value);
        applyFilters({ tag: value });
    };

    const handlePerPageChange = (event: ChangeEvent<HTMLSelectElement>) => {
        const value = event.target.value;
        updateFilterForm('per_page', value);
        applyFilters({ per_page: value });
    };

    const handleKeywordChange = (event: ChangeEvent<HTMLInputElement>) => {
        updateFilterForm('keyword', event.target.value);
    };

    const handleClearFilters = () => {
        const resetState: FilterFormState = {
            keyword: '',
            status: '',
            tag: '',
            per_page: perPageOptions[0],
        };
        setFilterForm(resetState);
        applyFilters(resetState, { resetExtras: true });
        setLastAppliedKeyword('');
    };

    // 控制表格勾選狀態，提供批次操作使用。
    const toggleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedIds(posts.data.map((item) => item.id));
        } else {
            setSelectedIds([]);
        }
    };

    const toggleSelect = (postId: number, checked: boolean) => {
        setSelectedIds((prev) => {
            if (checked) {
                return prev.includes(postId) ? prev : [...prev, postId];
            }

            return prev.filter((id) => id !== postId);
        });
    };

    const headerCheckboxState: boolean | 'indeterminate' = selectedIds.length === 0
        ? false
        : selectedIds.length === posts.data.length
            ? true
            : 'indeterminate';

    const bulkDisabled = selectedIds.length === 0;

    const handleBulkAction = (action: 'publish' | 'unpublish' | 'archive' | 'delete') => {
        if (selectedIds.length === 0) {
            return;
        }

        const confirmMessage = (() => {
            switch (action) {
                case 'publish':
                    return tPosts('bulk.confirm_publish', '確定要批次發佈選取的公告嗎？');
                case 'unpublish':
                    return tPosts('bulk.confirm_unpublish', '確定要批次下架選取的公告嗎？');
                case 'archive':
                    return tPosts('bulk.confirm_archive', '確定要封存這些公告嗎？封存後僅管理員可見。');
                case 'delete':
                    return tPosts('bulk.confirm_delete', '刪除後將無法復原，確定要刪除選取的公告嗎？');
                default:
                    return '';
            }
        })();

        if (!window.confirm(confirmMessage)) {
            return;
        }

        router.post(
            '/manage/admin/posts/bulk',
            {
                action,
                ids: selectedIds,
            },
            {
                preserveScroll: true,
                onSuccess: () => setSelectedIds([]),
            }
        );
    };

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('layout.breadcrumbs.dashboard', '管理後台'),
            href: '/manage/dashboard',
        },
        {
            title: t('sidebar.admin.posts', '公告訊息'),
            href: '/manage/admin/posts',
        },
    ];

    const pageTitle = t('sidebar.admin.posts', '公告訊息');
    const hasPosts = posts.data.length > 0;

    const toolbar = (
        <div className="flex w-full flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <form className="flex flex-wrap items-center gap-2" onSubmit={handleFilterSubmit}>
                <div className="flex items-center gap-2">
                    <Input
                        type="search"
                        value={filterForm.keyword}
                        onChange={handleKeywordChange}
                        placeholder={tPosts('filters.keyword_placeholder', '搜尋標題或關鍵字')}
                        className="w-56"
                        aria-label={tPosts('filters.keyword_label', '搜尋公告')}
                    />
                    <Button type="submit" size="sm" className="gap-1">
                        <Filter className="h-4 w-4" />
                        {tPosts('filters.apply', '套用')}
                    </Button>
                </div>
                <Select
                    value={filterForm.status}
                    onChange={handleStatusChange}
                    aria-label={tPosts('filters.status_label', '狀態篩選')}
                    className="w-40"
                >
                    <option value="">{tPosts('filters.status_all', '全部狀態')}</option>
                    {statusOptions.map((status) => (
                        <option key={status.value} value={String(status.value)}>
                            {status.label}
                        </option>
                    ))}
                </Select>
                <Select
                    value={filterForm.tag}
                    onChange={handleTagChange}
                    aria-label={tPosts('filters.tag_label', '標籤篩選')}
                    className="w-44"
                >
                    <option value="">{tPosts('filters.tag_all', '全部標籤')}</option>
                    {tagOptions.map((tag) => {
                        const optionValue = tag.value ?? tag.id ?? tag.label;

                        return (
                            <option key={String(optionValue)} value={String(optionValue)}>
                                {tag.label}
                            </option>
                        );
                    })}
                </Select>
                <Select
                    value={filterForm.per_page}
                    onChange={handlePerPageChange}
                    aria-label={tPosts('filters.per_page_label', '每頁筆數')}
                    className="w-28"
                >
                    {perPageOptions.map((option) => (
                        <option key={option} value={option}>
                            {tPosts('filters.per_page_option', ':count 筆/頁', { count: Number(option) })}
                        </option>
                    ))}
                </Select>
                <Button type="button" size="sm" variant="ghost" className="text-neutral-500" onClick={handleClearFilters}>
                    {tPosts('filters.reset', '重設')}
                </Button>
            </form>

            <div className="flex flex-wrap items-center gap-2">
                {selectedIds.length > 0 ? (
                    <span className="flex items-center gap-1 text-xs text-neutral-500">
                        <CheckSquare className="h-3.5 w-3.5 text-blue-500" />
                        {tPosts('bulk.selected', '已選擇 :count 筆', { count: selectedIds.length })}
                    </span>
                ) : null}
                {abilities.canBulkUpdate ? (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="gap-1" disabled={bulkDisabled}>
                                <Filter className="h-4 w-4" />
                                {tPosts('bulk.menu', '批次操作')}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem
                                onSelect={() => handleBulkAction('publish')}
                                className="gap-2"
                            >
                                <Megaphone className="h-4 w-4 text-emerald-600" />
                                {tPosts('bulk.publish', '批次發佈')}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onSelect={() => handleBulkAction('unpublish')}
                                className="gap-2"
                            >
                                <MegaphoneOff className="h-4 w-4 text-amber-600" />
                                {tPosts('bulk.unpublish', '批次下架')}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onSelect={() => handleBulkAction('archive')}
                                className="gap-2"
                            >
                                <Archive className="h-4 w-4 text-neutral-600" />
                                {tPosts('bulk.archive', '批次封存')}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onSelect={() => handleBulkAction('delete')}
                                className="gap-2"
                            >
                                <Trash2 className="h-4 w-4 text-red-600" />
                                {tPosts('bulk.delete', '批次刪除')}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                ) : null}
                {abilities.canCreate ? (
                    <Button size="sm" className="gap-2" asChild>
                        <Link href="/manage/admin/posts/create">
                            <FilePlus2 className="h-4 w-4" />
                            {t('sidebar.admin.posts_create', '新增公告')}
                        </Link>
                    </Button>
                ) : null}
            </div>
        </div>
    );

    return (
        <>
            <Head title={pageTitle} />
            <ManagePage
                title={pageTitle}
                description={t('posts.description', '集中管理公告的草稿、審核與發佈狀態。')}
                breadcrumbs={breadcrumbs}
                toolbar={toolbar}
            >
                <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    {statusOptions.map((status) => (
                        <Card key={status.value} className="border border-neutral-200/80">
                            <CardContent className="flex flex-col gap-1 px-4 py-3">
                                <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                                    {tPosts(`status.${status.value}`, status.label)}
                                </span>
                                <span className="text-2xl font-semibold text-neutral-900">
                                    {status.count ?? statusSummary[status.value] ?? 0}
                                </span>
                            </CardContent>
                        </Card>
                    ))}
                </section>

                <section className="rounded-xl border border-neutral-200/80 bg-white/95 shadow-sm">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-neutral-200/80">
                                <TableHead className="w-12 text-neutral-400">
                                    <Checkbox
                                        checked={headerCheckboxState}
                                        onCheckedChange={(checked) => toggleSelectAll(checked === true)}
                                        aria-label={tPosts('table.select_all', '全選公告')}
                                    />
                                </TableHead>
                                <TableHead className="w-[38%] text-neutral-500">{tPosts('table.title', '標題與摘要')}</TableHead>
                                <TableHead className="w-[20%] text-neutral-500">{tPosts('table.status', '狀態')}</TableHead>
                                <TableHead className="w-[20%] text-neutral-500">{tPosts('table.meta', '分類 / 空間')}</TableHead>
                                <TableHead className="w-[22%] text-right text-neutral-500">{tPosts('table.timestamps', '時間 / 負責人')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {!hasPosts ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="py-16 text-center text-sm text-neutral-500">
                                        {tPosts('empty', '目前沒有符合條件的公告。')}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                posts.data.map((post) => {
                                    const isSelected = selectedIds.includes(post.id);

                                    return (
                                        <TableRow key={post.id} className={cn('border-neutral-200/60 transition-colors duration-150', isSelected && 'bg-blue-50/50')}>
                                            <TableCell className="align-top">
                                                <Checkbox
                                                    checked={isSelected}
                                                    onCheckedChange={(checked) => toggleSelect(post.id, checked === true)}
                                                    aria-label={tPosts('table.select_post', '選取公告')}
                                                />
                                            </TableCell>
                                            <TableCell className="space-y-2">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="flex flex-col gap-1">
                                                        <Link
                                                            href={`/manage/admin/posts/${post.id}/edit`}
                                                            className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                                                        >
                                                            {post.title}
                                                        </Link>
                                                        <p className="text-xs text-neutral-500">
                                                            {truncate(post.excerpt ?? '', 140)}
                                                        </p>
                                                    </div>
                                                    {post.attachments_count ? (
                                                        <Badge variant="outline" className="text-[11px] text-neutral-500">
                                                            <Megaphone className="mr-1 h-3 w-3" />
                                                            {post.attachments_count}
                                                        </Badge>
                                                    ) : null}
                                                </div>
                                                {post.tags?.length ? (
                                                    <div className="flex flex-wrap items-center gap-1 text-[11px] text-neutral-500">
                                                        <TagIcon className="mr-1 h-3 w-3" />
                                                        {post.tags.map((tag) => (
                                                            <span key={tag.id} className="rounded-full bg-neutral-100 px-2 py-0.5">
                                                                {tag.name}
                                                            </span>
                                                        ))}
                                                    </div>
                                                ) : null}
                                            </TableCell>
                                            <TableCell className="space-y-2">
                                                <Badge variant={statusVariantMap[post.status] ?? 'outline'} className="capitalize">
                                                    {tPosts(`status.${post.status}`, post.status)}
                                                </Badge>
                                                <span
                                                    className={cn(
                                                        'inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium uppercase',
                                                        visibilityToneMap[post.visibility] ?? 'border-neutral-200 text-neutral-500'
                                                    )}
                                                >
                                                    {tPosts(`visibility.${post.visibility}`, post.visibility)}
                                                </span>
                                                {post.pinned ? (
                                                    <span className="block text-[11px] font-semibold text-amber-600">
                                                        {tPosts('badges.pinned', '已置頂')}
                                                    </span>
                                                ) : null}
                                            </TableCell>
                                            <TableCell className="space-y-1 text-sm text-neutral-600">
                                                <div>
                                                    <span className="font-medium text-neutral-800">
                                                        {post.category?.name ?? tPosts('table.uncategorized', '未分類')}
                                                    </span>
                                                </div>
                                                <div className="text-xs text-neutral-500">
                                                    {post.space?.name ?? tPosts('table.no_space', '未綁定空間')}
                                                </div>
                                                <div className="text-xs text-neutral-400">
                                                    {tPosts('table.views', '瀏覽數：:count', { count: post.views ?? 0 })}
                                                </div>
                                            </TableCell>
                                            <TableCell className="space-y-1 text-right text-xs text-neutral-500">
                                                <div className="flex flex-col items-end gap-1">
                                                    <span className="font-medium text-neutral-700">
                                                        {formatDateTime(post.published_at ?? post.created_at, locale) || '—'}
                                                    </span>
                                                    <span className="text-neutral-400">
                                                        {formatDateTime(post.updated_at, locale) || ''}
                                                    </span>
                                                </div>
                                                {post.author ? (
                                                    <div className="flex items-center justify-end gap-1 text-neutral-500">
                                                        <Users className="h-3 w-3" />
                                                        <span>{post.author.name}</span>
                                                    </div>
                                                ) : null}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>

                    <footer className="flex flex-col gap-3 border-t border-neutral-200/80 px-4 py-3 text-sm text-neutral-500 md:flex-row md:items-center md:justify-between">
                        <span>
                            {tPosts('table.pagination_summary', '顯示 :from-:to，共 :total 筆', {
                                from: posts.meta.from ?? 0,
                                to: posts.meta.to ?? 0,
                                total: posts.meta.total ?? 0,
                            })}
                        </span>
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" disabled={!paginationLinks.prev} asChild>
                                    <Link
                                        href={paginationLinks.prev ?? '#'}
                                        preserveState
                                        preserveScroll
                                    >
                                        {tPosts('pagination.prev', '上一頁')}
                                    </Link>
                                </Button>
                                <Button variant="outline" size="sm" disabled={!paginationLinks.next} asChild>
                                    <Link
                                        href={paginationLinks.next ?? '#'}
                                        preserveState
                                        preserveScroll
                                    >
                                        {tPosts('pagination.next', '下一頁')}
                                    </Link>
                                </Button>
                            </div>
                            <form
                                className="flex items-center gap-2 text-xs text-neutral-500"
                                onSubmit={(event) => {
                                    event.preventDefault();
                                    const pageNumber = Number(pageInput);
                                    if (Number.isNaN(pageNumber) || pageNumber < 1) {
                                        setPageInput('1');
                                        applyFilters({ page: 1 });
                                        return;
                                    }

                                    const bounded = Math.min(Math.max(1, pageNumber), posts.meta.last_page ?? pageNumber);
                                    setPageInput(String(bounded));
                                    applyFilters({ page: bounded });
                                }}
                            >
                                <label htmlFor="page-input" className="font-medium">
                                    {tPosts('pagination.goto', '跳至')}
                                </label>
                                <Input
                                    id="page-input"
                                    type="number"
                                    min={1}
                                    max={posts.meta.last_page ?? undefined}
                                    value={pageInput}
                                    onChange={(event) => setPageInput(event.target.value)}
                                    className="h-8 w-20 border-neutral-200 text-sm"
                                />
                                <span className="text-neutral-400">/ {posts.meta.last_page ?? 1}</span>
                                <Button type="submit" size="sm" variant="outline" className="text-xs">
                                    {tPosts('pagination.go', '前往')}
                                </Button>
                            </form>
                        </div>
                    </footer>
                </section>
            </ManagePage>
        </>
    );
}

ManageAdminPostsIndex.layout = (page: ReactElement) => <AppLayout>{page}</AppLayout>;
