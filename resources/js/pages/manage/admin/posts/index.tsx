import AppLayout from '@/layouts/app-layout';
import ManagePage from '@/layouts/manage/manage-page';
import ManageResourceLayout from '@/layouts/manage/manage-resource-layout';
import ResponsiveDataView from '@/components/manage/responsive-data-view';
import TableEmpty from '@/components/manage/table-empty';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTranslator } from '@/hooks/use-translator';
import ManagePostsFilterForm from '@/features/manage/admin/posts/list/filter-form';
import ManagePostsStatusToolbar from '@/features/manage/admin/posts/list/status-toolbar';
import PostsTableView from '@/features/manage/admin/posts/list/posts-table-view';
import PostsCardView from '@/features/manage/admin/posts/list/posts-card-view';
import BulkActionsBar, {
    type BulkActionConfig,
    type BulkActionType,
} from '@/features/manage/admin/posts/list/bulk-actions-bar';
import type { DataCardStatusTone } from '@/components/manage/data-card';
import type { ManagePostFilterOptions, ManagePostFilterState, ManagePostListResponse } from '@/types/manage';
import type { BreadcrumbItem, SharedData } from '@/types/shared';
import { Head, Link, router, usePage } from '@inertiajs/react';
import type { ChangeEvent, ReactElement } from 'react';
import { useEffect, useMemo, useState } from 'react';
import {
    Archive,
    CalendarClock,
    EyeOff,
    FileText,
    Megaphone,
    MegaphoneOff,
    Trash2,
} from 'lucide-react';

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

const STATUS_BADGE_CLASS: Record<string, string> = {
    draft: 'border-blue-200 bg-blue-50 text-blue-700',
    scheduled: 'border-amber-200 bg-amber-50 text-amber-700',
    published: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    hidden: 'border-neutral-200 bg-neutral-100 text-neutral-600',
    archived: 'border-rose-200 bg-rose-50 text-rose-700',
};

const STATUS_TONE_MAP: Record<string, DataCardStatusTone> = {
    draft: 'info',
    scheduled: 'warning',
    published: 'success',
    hidden: 'neutral',
    archived: 'danger',
};

const STATUS_ICON_COMPONENT: Record<string, typeof Megaphone> = {
    draft: FileText,
    scheduled: CalendarClock,
    published: Megaphone,
    hidden: EyeOff,
    archived: Archive,
};

function getStatusBadgeClass(status: string) {
    return STATUS_BADGE_CLASS[status] ?? 'border-neutral-200 bg-neutral-100 text-neutral-600';
}

function getStatusTone(status: string): DataCardStatusTone {
    return STATUS_TONE_MAP[status] ?? 'neutral';
}

function getStatusIcon(status: string) {
    const IconComponent = STATUS_ICON_COMPONENT[status] ?? Megaphone;
    return <IconComponent className="h-3.5 w-3.5" aria-hidden="true" />;
}

const visibilityToneMap: Record<string, string> = {
    public: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    internal: 'bg-amber-100 text-amber-700 border-amber-200',
    private: 'bg-rose-100 text-rose-700 border-rose-200',
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
    const tagOptions = (filterOptions.tags ?? []) as NonNullable<ManagePostFilterOptions['tags']>;
    const perPageOptions = PER_PAGE_OPTIONS;
    const statusLabelMap = useMemo(() => {
        const map = new Map<string, string>();
        statusOptions.forEach((option) => {
            map.set(String(option.value), option.label);
        });
        return map;
    }, [statusOptions]);
    const bulkActions = useMemo<BulkActionConfig[]>(
        () => [
            {
                type: 'publish',
                label: tPosts('bulk.publish', '批次發佈'),
                icon: Megaphone,
                buttonClass:
                    'border border-emerald-200 bg-emerald-50 text-emerald-700 shadow-xs hover:bg-emerald-100 hover:text-emerald-800 focus-visible:ring-emerald-200/60',
                iconClass: 'text-emerald-600',
            },
            {
                type: 'unpublish',
                label: tPosts('bulk.unpublish', '批次下架'),
                icon: MegaphoneOff,
                buttonClass:
                    'border border-amber-200 bg-amber-50 text-amber-700 shadow-xs hover:bg-amber-100 hover:text-amber-800 focus-visible:ring-amber-200/60',
                iconClass: 'text-amber-600',
            },
            {
                type: 'archive',
                label: tPosts('bulk.archive', '批次封存'),
                icon: Archive,
                buttonClass:
                    'border border-slate-200 bg-slate-50 text-slate-700 shadow-xs hover:bg-slate-100 hover:text-slate-800 focus-visible:ring-slate-200/60',
                iconClass: 'text-neutral-600',
            },
            {
                type: 'delete',
                label: tPosts('bulk.delete', '批次刪除'),
                icon: Trash2,
                buttonClass:
                    'border border-rose-200 bg-rose-50 text-rose-700 shadow-xs hover:bg-rose-100 hover:text-rose-800 focus-visible:ring-rose-200/60',
                iconClass: 'text-rose-600',
            },
        ],
        [tPosts]
    );

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

    const handleBulkAction = (action: BulkActionType) => {
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

    const headerCheckboxState: boolean | 'indeterminate' = selectedIds.length === 0
        ? false
        : selectedIds.length === posts.data.length
            ? true
            : 'indeterminate';

    const handleStatusFilterChange = (value: string) => {
        updateFilterForm('status', value);
        applyFilters({ status: value });
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

    const statusFilterOptions = useMemo(() => [
        {
            value: '',
            label: tPosts('filters.status_all', '全部'),
            count: Object.values(statusSummary).reduce((sum, count) => sum + count, 0),
            icon: Megaphone,
        },
        ...statusOptions.map((status) => {
            let icon = Megaphone;
            if (status.value === 'draft') icon = FileText;
            else if (status.value === 'scheduled') icon = CalendarClock;
            else if (status.value === 'hidden') icon = EyeOff;
            else if (status.value === 'archived') icon = Archive;

            return {
                value: String(status.value),
                label: status.label,
                count: status.count ?? statusSummary[status.value] ?? 0,
                icon,
            };
        }),
    ], [statusOptions, statusSummary, tPosts]);

    const handleFilterApply = () => {
        applyFilters();
        setLastAppliedKeyword(filterForm.keyword);
    };

    const filterSection = (
        <ManagePostsFilterForm
            keyword={filterForm.keyword}
            tag={filterForm.tag}
            perPage={filterForm.per_page}
            tagOptions={tagOptions}
            perPageOptions={perPageOptions}
            onKeywordChange={handleKeywordChange}
            onTagChange={handleTagChange}
            onPerPageChange={handlePerPageChange}
            onApply={handleFilterApply}
            onReset={handleClearFilters}
        />
    );

    const toolbarSection = (
        <ManagePostsStatusToolbar
            options={statusFilterOptions}
            value={filterForm.status}
            onChange={handleStatusFilterChange}
            canBulkUpdate={abilities.canBulkUpdate}
            canCreate={abilities.canCreate}
            selectedCount={selectedIds.length}
            bulkActions={bulkActions}
            onBulkAction={handleBulkAction}
        />
    );

    const stickyActions =
        abilities.canBulkUpdate && selectedIds.length > 0 ? (
            <BulkActionsBar
                actions={bulkActions}
                selectedCount={selectedIds.length}
                onAction={handleBulkAction}
                variant="list"
            />
        ) : null;

    
    return (
        <>
            <Head title={pageTitle} />
            <ManagePage
                title={pageTitle}
                description={t('posts.description', '集中管理公告的草稿、審核與發佈狀態。')}
                breadcrumbs={breadcrumbs}
            >
                <ManageResourceLayout
                    filter={filterSection}
                    toolbar={toolbarSection}
                    stickyActions={stickyActions}
                >
                    <ResponsiveDataView
                        className="space-y-0"
                        table={
                            <PostsTableView
                                posts={posts.data}
                                locale={locale}
                                statusLabelMap={statusLabelMap}
                                selectedIds={selectedIds}
                                headerCheckboxState={headerCheckboxState}
                                onToggleSelectAll={toggleSelectAll}
                                onToggleSelect={toggleSelect}
                                getStatusBadgeClass={getStatusBadgeClass}
                                getStatusIcon={getStatusIcon}
                                visibilityToneMap={visibilityToneMap}
                                truncate={truncate}
                            />
                        }
                        card={
                            <PostsCardView
                                posts={posts.data}
                                locale={locale}
                                statusLabelMap={statusLabelMap}
                                selectedIds={selectedIds}
                                onToggleSelect={toggleSelect}
                                getStatusTone={getStatusTone}
                                getStatusIcon={getStatusIcon}
                                visibilityToneMap={visibilityToneMap}
                                truncate={truncate}
                                abilities={abilities}
                            />
                        }
                        isEmpty={!hasPosts}
                        emptyState={
                            <TableEmpty
                                title={tPosts('empty.title', '目前沒有公告')}
                                description={tPosts('empty.description', '試著調整篩選條件或新增公告。')}
                            />
                        }
                    />

                    {hasPosts ? (
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
                                    <Button
                                        variant="tonal"
                                        size="sm"
                                        disabled={!paginationLinks.prev}
                                        className="h-10 gap-2 px-4 disabled:border-neutral-200 disabled:bg-neutral-100 disabled:text-neutral-400"
                                        asChild
                                    >
                                        <Link href={paginationLinks.prev ?? '#'} preserveState preserveScroll>
                                            {tPosts('pagination.prev', '上一頁')}
                                        </Link>
                                    </Button>
                                    <Button
                                        variant="tonal"
                                        size="sm"
                                        disabled={!paginationLinks.next}
                                        className="h-10 gap-2 px-4 disabled:border-neutral-200 disabled:bg-neutral-100 disabled:text-neutral-400"
                                        asChild
                                    >
                                        <Link href={paginationLinks.next ?? '#'} preserveState preserveScroll>
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
                                    <label htmlFor="page-input" className="font-medium text-neutral-600">
                                        {tPosts('pagination.goto', '跳至')}
                                    </label>
                                    <Input
                                        id="page-input"
                                        type="number"
                                        min={1}
                                        max={posts.meta.last_page ?? undefined}
                                        value={pageInput}
                                        onChange={(event) => setPageInput(event.target.value)}
                                        className="h-9 w-20 rounded-lg border-neutral-200 text-sm"
                                    />
                                    <span className="text-neutral-400">/ {posts.meta.last_page ?? 1}</span>
                                    <Button type="submit" size="sm" variant="tonal" className="h-9 px-4 text-xs">
                                        {tPosts('pagination.go', '前往')}
                                    </Button>
                                </form>
                            </div>
                        </footer>
                    ) : null}
                </ManageResourceLayout>
            </ManagePage>
        </>
    );

}

ManageAdminPostsIndex.layout = (page: ReactElement) => <AppLayout>{page}</AppLayout>;
