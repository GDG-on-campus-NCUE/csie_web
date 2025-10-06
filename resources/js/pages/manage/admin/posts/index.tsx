import AppLayout from '@/layouts/app-layout';
import ManagePage from '@/layouts/manage/manage-page';
import FilterPanel from '@/components/manage/filter-panel';
import {
    manageFilterControlClass,
    manageToolbarPrimaryButtonClass,
    manageToolbarSecondaryButtonClass,
} from '@/components/manage/filter-styles';
import ManageToolbar from '@/components/manage/manage-toolbar';
import ResponsiveDataView from '@/components/manage/responsive-data-view';
import DataCard, { type DataCardStatusTone } from '@/components/manage/data-card';
import TableEmpty from '@/components/manage/table-empty';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useTranslator } from '@/hooks/use-translator';
import { cn } from '@/lib/shared/utils';
import { formatDateTime } from '@/lib/shared/format';
import type { ManagePostFilterOptions, ManagePostFilterState, ManagePostListResponse } from '@/types/manage';
import type { BreadcrumbItem, SharedData } from '@/types/shared';
import { Head, Link, router, usePage } from '@inertiajs/react';
import type { ChangeEvent, FormEvent, ReactElement } from 'react';
import { useEffect, useMemo, useState } from 'react';
import {
    Archive,
    Building2,
    CalendarClock,
    CheckSquare,
    Eye,
    EyeOff,
    FilePlus2,
    FileText,
    Filter,
    Megaphone,
    MegaphoneOff,
    RefreshCcw,
    Tag as TagIcon,
    Trash2,
    Users,
} from 'lucide-react';
import StatusFilterTabs from '@/components/manage/status-filter-tabs';

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

type BulkActionType = 'publish' | 'unpublish' | 'archive' | 'delete';

type BulkActionConfig = {
    type: BulkActionType;
    label: string;
    icon: typeof Megaphone;
    buttonClass: string;
    iconClass: string;
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
    const tagOptions = filterOptions.tags ?? [];
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
    const mobileBulkActions =
        abilities.canBulkUpdate && selectedIds.length > 0
            ? (
                  <div className="flex flex-col gap-2">
                      {bulkActions.map((action) => {
                          const Icon = action.icon;
                          return (
                              <Button
                                  key={action.type}
                                  type="button"
                                  className={cn('w-full justify-center gap-2', action.buttonClass)}
                                  onClick={() => handleBulkAction(action.type)}
                              >
                                  <Icon className="h-4 w-4" />
                                  {action.label}
                              </Button>
                          );
                      })}
                  </div>
              )
            : null;

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

    // 狀態篩選選項
    const statusFilterOptions = useMemo(() => [
        {
            value: '',
            label: tPosts('filters.status_all', '全部'),
            count: Object.values(statusSummary).reduce((sum, count) => sum + count, 0),
            icon: Megaphone
        },
        ...statusOptions.map((status) => {
            // 根據狀態選擇不同的圖標
            let icon = Megaphone;
            if (status.value === 'draft') icon = FileText;
            else if (status.value === 'scheduled') icon = CalendarClock;
            else if (status.value === 'hidden') icon = EyeOff;
            else if (status.value === 'archived') icon = Archive;

            return {
                value: String(status.value),
                label: status.label,
                count: status.count ?? statusSummary[status.value] ?? 0,
                icon
            };
        })
    ], [statusOptions, statusSummary, tPosts]);

    const handleStatusFilterChange = (value: string) => {
        updateFilterForm('status', value);
        applyFilters({ status: value });
    };

    // 篩選器與工具列
    const filterBar = (
        <FilterPanel
            title={tPosts('filters.title', '篩選條件')}
            collapsible={true}
            defaultOpen={true}
            onApply={() => applyFilters()}
            onReset={handleClearFilters}
            applyLabel={tPosts('filters.apply', '套用篩選')}
            resetLabel={tPosts('filters.reset', '重設')}
        >
            <div className="grid grid-cols-12 gap-3">
                {/* 搜尋框 */}
                <div className="col-span-12 md:col-span-4 space-y-2">
                    <label className="text-sm font-medium text-neutral-700">
                        {tPosts('filters.keyword_label', '搜尋公告')}
                    </label>
                    <Input
                        type="search"
                        value={filterForm.keyword}
                        onChange={handleKeywordChange}
                        placeholder={tPosts('filters.keyword_placeholder', '搜尋標題或關鍵字')}
                        className={manageFilterControlClass()}
                        aria-label={tPosts('filters.keyword_label', '搜尋公告')}
                    />
                </div>

                {/* 標籤篩選 */}
                <div className="col-span-12 md:col-span-4 space-y-2">
                    <label className="text-sm font-medium text-neutral-700">
                        {tPosts('filters.tag_label', '標籤篩選')}
                    </label>
                    <Select
                        value={filterForm.tag}
                        onChange={handleTagChange}
                        className={manageFilterControlClass()}
                        aria-label={tPosts('filters.tag_label', '標籤篩選')}
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
                </div>

                {/* 每頁筆數 */}
                <div className="col-span-12 md:col-span-4 space-y-2">
                    <label className="text-sm font-medium text-neutral-700">
                        {tPosts('filters.per_page_label', '每頁筆數')}
                    </label>
                    <Select
                        value={filterForm.per_page}
                        onChange={handlePerPageChange}
                        className={manageFilterControlClass()}
                        aria-label={tPosts('filters.per_page_label', '每頁筆數')}
                    >
                        {perPageOptions.map((option) => (
                            <option key={option} value={option}>
                                {tPosts('filters.per_page_option', ':count 筆/頁', { count: Number(option) })}
                            </option>
                        ))}
                    </Select>
                </div>
            </div>
        </FilterPanel>
    );

    // 整合的工具列：包含狀態篩選和操作按鈕
    const toolbar = (
        <ManageToolbar
            primary={
                <>
                    {/* 狀態篩選標籤 */}
                    <StatusFilterTabs
                        options={statusFilterOptions}
                        value={filterForm.status}
                        onChange={handleStatusFilterChange}
                    />
                </>
            }
            secondary={
                <div className="flex flex-col gap-2 md:flex-row md:items-center">
                    {/* 批次操作 */}
                    {abilities.canBulkUpdate && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={bulkDisabled}
                                    className={cn(
                                        'h-10 gap-2 border-neutral-300 bg-white text-neutral-700 shadow-sm hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700',
                                        selectedIds.length > 0 && 'border-primary-300 bg-primary-50 text-primary-700'
                                    )}
                                >
                                    <Filter className="h-4 w-4" />
                                    {tPosts('bulk.menu', '批次操作')}
                                    {selectedIds.length > 0 && (
                                        <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                                            {selectedIds.length}
                                        </Badge>
                                    )}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                {bulkActions.map((action) => {
                                    const Icon = action.icon;
                                    return (
                                        <DropdownMenuItem
                                            key={action.type}
                                            onSelect={() => handleBulkAction(action.type)}
                                            className="gap-2"
                                        >
                                            <Icon className={cn('h-4 w-4', action.iconClass)} />
                                            {action.label}
                                        </DropdownMenuItem>
                                    );
                                })}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}

                    {/* 新增公告按鈕 */}
                    {abilities.canCreate && (
                        <Button
                            size="sm"
                            variant="default"
                            className="h-10 gap-2 bg-primary-600 px-4 shadow-sm hover:bg-primary-700"
                            asChild
                        >
                            <Link href="/manage/admin/posts/create">
                                <FilePlus2 className="h-4 w-4" />
                                {t('sidebar.admin.posts_create', '新增公告')}
                            </Link>
                        </Button>
                    )}
                </div>
            }
        />
    );

    return (
        <>
            <Head title={pageTitle} />
            <ManagePage
                title={pageTitle}
                description={t('posts.description', '集中管理公告的草稿、審核與發佈狀態。')}
                breadcrumbs={breadcrumbs}
            >
                {/* 篩選器面板 */}
                {filterBar}

                {/* 整合的工具列：狀態篩選 + 操作按鈕 */}
                {toolbar}

                <section className="mt-4 rounded-xl border border-neutral-200/80 bg-white/95 shadow-sm">\
                    <ResponsiveDataView
                        className="space-y-0"
                        table={() => (
                            <div className="overflow-x-auto">
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
                                            <TableHead className="w-[38%] text-neutral-500">
                                                {tPosts('table.title', '標題與摘要')}
                                            </TableHead>
                                            <TableHead className="w-[20%] text-neutral-500">
                                                {tPosts('table.status', '狀態')}
                                            </TableHead>
                                            <TableHead className="hidden w-[20%] text-neutral-500 lg:table-cell">
                                                {tPosts('table.meta', '分類 / 空間')}
                                            </TableHead>
                                            <TableHead className="w-[22%] text-right text-neutral-500">
                                                {tPosts('table.timestamps', '時間 / 負責人')}
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {posts.data.map((post) => {
                                            const isSelected = selectedIds.includes(post.id);
                                            const statusLabel = statusLabelMap.get(post.status) ?? tPosts(`status.${post.status}`, post.status);
                                            const visibilityLabel = tPosts(`visibility.${post.visibility}`, post.visibility);

                                            return (
                                                <TableRow
                                                    key={post.id}
                                                    className={cn(
                                                        'border-neutral-200/60 transition-colors duration-150 hover:bg-blue-50/40',
                                                        isSelected && 'bg-blue-50/70'
                                                    )}
                                                >
                                                    <TableCell className="align-top">
                                                        <Checkbox
                                                            checked={isSelected}
                                                            onCheckedChange={(checked) => toggleSelect(post.id, checked === true)}
                                                            aria-label={tPosts('table.select_post', '選取公告')}
                                                        />
                                                    </TableCell>
                                                    <TableCell className="space-y-3 align-top">
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
                                                                <Badge
                                                                    variant="outline"
                                                                    className="inline-flex items-center gap-1 rounded-full border-blue-200 bg-blue-50 px-3 py-1 text-[11px] font-medium text-blue-700"
                                                                >
                                                                    <FileText className="h-3.5 w-3.5" />
                                                                    {post.attachments_count}
                                                                </Badge>
                                                            ) : null}
                                                        </div>
                                                        {post.tags?.length ? (
                                                            <div className="flex flex-wrap items-center gap-2">
                                                                {post.tags.map((tag) => (
                                                                    <Badge
                                                                        key={tag.id ?? tag.name}
                                                                        variant="outline"
                                                                        className="inline-flex items-center gap-1 rounded-full border-neutral-200 bg-neutral-50 px-2.5 py-1 text-[11px] text-neutral-600"
                                                                    >
                                                                        <TagIcon className="h-3 w-3 text-neutral-400" />
                                                                        {tag.name}
                                                                    </Badge>
                                                                ))}
                                                            </div>
                                                        ) : null}
                                                    </TableCell>
                                                    <TableCell className="space-y-2 align-top">
                                                        <Badge
                                                            variant="outline"
                                                            className={cn(
                                                                'inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium uppercase',
                                                                getStatusBadgeClass(post.status)
                                                            )}
                                                        >
                                                            {getStatusIcon(post.status)}
                                                            {statusLabel}
                                                        </Badge>
                                                        <Badge
                                                            variant="outline"
                                                            className={cn(
                                                                'inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[11px] font-medium uppercase',
                                                                visibilityToneMap[post.visibility] ?? 'border-neutral-200 bg-neutral-100 text-neutral-600'
                                                            )}
                                                        >
                                                            <Eye className="h-3.5 w-3.5" />
                                                            {visibilityLabel}
                                                        </Badge>
                                                        {post.pinned ? (
                                                            <Badge className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-[11px] font-medium text-amber-700">
                                                                {tPosts('badges.pinned', '已置頂')}
                                                            </Badge>
                                                        ) : null}
                                                    </TableCell>
                                                    <TableCell className="hidden space-y-2 text-sm text-neutral-600 lg:table-cell">
                                                        <div className="font-medium text-neutral-800">
                                                            {post.category?.name ?? tPosts('table.uncategorized', '未分類')}
                                                        </div>
                                                        <div className="text-xs text-neutral-500">
                                                            {post.space?.name ?? tPosts('table.no_space', '未綁定空間')}
                                                        </div>
                                                        <div className="text-xs text-neutral-400">
                                                            {tPosts('table.views', '瀏覽數：:count', { count: post.views ?? 0 })}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="space-y-2 text-right text-xs text-neutral-500">
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
                                                                <Users className="h-3.5 w-3.5" />
                                                                <span>{post.author.name}</span>
                                                            </div>
                                                        ) : null}
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                        card={() => (
                            <div className="flex flex-col gap-4 px-4 pb-5 pt-4">
                                {posts.data.map((post) => {
                                    const isSelected = selectedIds.includes(post.id);
                                    const statusLabel = statusLabelMap.get(post.status) ?? tPosts(`status.${post.status}`, post.status);
                                    const visibilityLabel = tPosts(`visibility.${post.visibility}`, post.visibility);
                                    const metadata = [
                                        {
                                            label: tPosts('table.published_at', '發佈'),
                                            value: formatDateTime(post.published_at ?? post.created_at, locale) || '—',
                                            icon: <CalendarClock className="h-3.5 w-3.5 text-neutral-400" />,
                                        },
                                        {
                                            label: tPosts('table.views_short', '瀏覽數'),
                                            value: post.views ?? 0,
                                            icon: <Eye className="h-3.5 w-3.5 text-neutral-400" />,
                                        },
                                        {
                                            label: tPosts('table.owner', '負責人'),
                                            value: post.author?.name ?? tPosts('table.no_author', '未指定'),
                                            icon: <Users className="h-3.5 w-3.5 text-neutral-400" />,
                                        },
                                    ];

                                    const cardMobileActions = (
                                        <>
                                            {abilities.canBulkUpdate ? (
                                                <div className="flex items-center justify-between rounded-lg border border-neutral-200 px-3 py-2">
                                                    <span className="text-sm text-neutral-600">
                                                        {isSelected
                                                            ? tPosts('bulk.selected_single', '已加入批次操作')
                                                            : tPosts('bulk.select_prompt', '加入批次操作')}
                                                    </span>
                                                    <Checkbox
                                                        checked={isSelected}
                                                        onCheckedChange={(checked) => toggleSelect(post.id, checked === true)}
                                                        aria-label={tPosts('table.select_post', '選取公告')}
                                                    />
                                                </div>
                                            ) : null}
                                            <Button
                                                type="button"
                                                variant="tonal"
                                                className="w-full justify-center gap-2"
                                                asChild
                                            >
                                                <Link href={`/manage/admin/posts/${post.id}/edit`}>
                                                    <FileText className="h-4 w-4" />
                                                    {tPosts('actions.edit', '編輯公告')}
                                                </Link>
                                            </Button>
                                        </>
                                    );

                                    return (
                                        <DataCard
                                            key={post.id}
                                            title={post.title}
                                            description={truncate(post.excerpt ?? '', 140)}
                                            status={{
                                                label: statusLabel,
                                                tone: getStatusTone(post.status),
                                                icon: getStatusIcon(post.status),
                                            }}
                                            metadata={metadata}
                                            mobileActions={cardMobileActions}
                                            className={cn(
                                                isSelected && 'border-blue-200 shadow-md ring-2 ring-blue-200/70'
                                            )}
                                        >
                                            <div className="flex flex-wrap items-center gap-2">
                                                <Badge
                                                    variant="outline"
                                                    className="inline-flex items-center gap-1 rounded-full border-neutral-200 bg-neutral-50 px-2.5 py-1 text-[11px] text-neutral-600"
                                                >
                                                    <TagIcon className="h-3 w-3 text-neutral-400" />
                                                    {post.category?.name ?? tPosts('table.uncategorized', '未分類')}
                                                </Badge>
                                                <Badge
                                                    variant="outline"
                                                    className="inline-flex items-center gap-1 rounded-full border-neutral-200 bg-neutral-50 px-2.5 py-1 text-[11px] text-neutral-600"
                                                >
                                                    <Building2 className="h-3 w-3 text-neutral-400" />
                                                    {post.space?.name ?? tPosts('table.no_space', '未綁定空間')}
                                                </Badge>
                                                <Badge
                                                    variant="outline"
                                                    className={cn(
                                                        'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium uppercase',
                                                        visibilityToneMap[post.visibility] ?? 'border-neutral-200 bg-neutral-100 text-neutral-600'
                                                    )}
                                                >
                                                    <Eye className="h-3 w-3" />
                                                    {visibilityLabel}
                                                </Badge>
                                                {post.pinned ? (
                                                    <Badge className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-medium text-amber-700">
                                                        {tPosts('badges.pinned', '已置頂')}
                                                    </Badge>
                                                ) : null}
                                                {post.attachments_count ? (
                                                    <Badge
                                                        variant="outline"
                                                        className="inline-flex items-center gap-1 rounded-full border-blue-200 bg-blue-50 px-2.5 py-1 text-[11px] text-blue-700"
                                                    >
                                                        <FileText className="h-3 w-3" />
                                                        {post.attachments_count}
                                                    </Badge>
                                                ) : null}
                                            </div>
                                            {post.tags?.length ? (
                                                <div className="flex flex-wrap gap-2 pt-2">
                                                    {post.tags.map((tag) => (
                                                        <Badge
                                                            key={tag.id ?? tag.name}
                                                            variant="outline"
                                                            className="inline-flex items-center gap-1 rounded-full border-neutral-200 bg-neutral-50 px-2.5 py-1 text-[11px] text-neutral-600"
                                                        >
                                                            <TagIcon className="h-3 w-3 text-neutral-400" />
                                                            {tag.name}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            ) : null}
                                        </DataCard>
                                    );
                                })}
                            </div>
                        )}
                        isEmpty={!hasPosts}
                        emptyState={
                            <TableEmpty
                                title={tPosts('empty.title', '目前沒有公告')}
                                description={tPosts('empty.description', '試著調整篩選條件或新增公告。')}
                            />
                        }
                        stickyActions={mobileBulkActions}
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
                                    <Button
                                        type="submit"
                                        size="sm"
                                        variant="tonal"
                                        className="h-9 px-4 text-xs"
                                    >
                                        {tPosts('pagination.go', '前往')}
                                    </Button>
                                </form>
                            </div>
                        </footer>
                    ) : null}
                </section>

            </ManagePage>
        </>
    );
}

ManageAdminPostsIndex.layout = (page: ReactElement) => <AppLayout>{page}</AppLayout>;
