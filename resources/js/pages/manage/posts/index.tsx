import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import type { ChangeEvent, DragEvent } from 'react';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import ManageLayout from '@/layouts/manage/manage-layout';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ManagePageHeader } from '@/components/manage/manage-page-header';
import {
    AlertCircle,
    Calendar,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Eye,
    FileText,
    Filter,
    Loader2,
    Pen,
    Trash2,
    Upload,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { BreadcrumbItem, SharedData } from '@/types';
import { useTranslator } from '@/hooks/use-translator';

interface CategoryOption {
    id: number;
    name: string;
    name_en: string;
    slug: string;
}

interface AuthorOption {
    id: number;
    name: string;
}

type PostStatus = 'draft' | 'published' | 'scheduled';

interface PostItem {
    id: number;
    title: string;
    slug: string;
    status: PostStatus;
    publish_at: string | null;
    category: CategoryOption | null;
    author: { id: number; name: string; email: string } | null;
    views: number;
    attachments_count: number;
    created_at: string | null;
    updated_at: string | null;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginationMeta {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface PostsIndexProps {
    posts: {
        data: PostItem[];
        links: PaginationLink[];
        meta: PaginationMeta;
    };
    categories: CategoryOption[];
    authors: AuthorOption[];
    filters: Partial<Record<'search' | 'category' | 'status' | 'author' | 'date_from' | 'date_to' | 'per_page', string>>;
    statusOptions: Array<PostStatus>;
    perPageOptions: number[];
    can: {
        create: boolean;
        bulk: boolean;
    };
}

type FilterState = {
    search: string;
    category: string;
    status: string;
    author: string;
    date_from: string;
    date_to: string;
    per_page: string;
};

const statusVariantMap: Record<PostStatus, 'secondary' | 'outline' | 'default'> = {
    draft: 'secondary',
    published: 'default',
    scheduled: 'outline',
};

const statusFallbackLabels: Record<PostStatus, { zh: string; en: string }> = {
    draft: { zh: '草稿', en: 'Draft' },
    published: { zh: '已發布', en: 'Published' },
    scheduled: { zh: '排程中', en: 'Scheduled' },
};

const formatDateTime = (value: string | null, locale: 'zh-TW' | 'en') => {
    if (!value) return null;

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return null;
    }

    return date.toLocaleString(locale === 'zh-TW' ? 'zh-TW' : 'en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
    });
};

interface PostFlashMessages {
    success?: string;
    error?: string;
    info?: string;
    importErrors?: string[];
}

interface PostsPageProps extends SharedData {
    flash?: PostFlashMessages;
}

export default function PostsIndex({ posts, categories, authors, filters, statusOptions, perPageOptions, can }: PostsIndexProps) {
    const { auth, flash } = usePage<PostsPageProps>().props;
    const userRole = auth?.user?.role ?? 'user';
    const layoutRole: 'admin' | 'teacher' | 'user' =
        userRole === 'admin' ? 'admin' : userRole === 'teacher' ? 'teacher' : 'user';
    const { t, localeKey } = useTranslator('manage');
    const fallbackLanguage: 'zh' | 'en' = localeKey === 'zh-TW' ? 'zh' : 'en';
    const localeForDate: 'zh-TW' | 'en' = localeKey === 'zh-TW' ? 'zh-TW' : 'en';
    const iconActionClass = cn(buttonVariants({ variant: 'outline', size: 'icon' }), 'h-9 w-9 p-0');
    const [selected, setSelected] = useState<number[]>([]);
    const [importDialogOpen, setImportDialogOpen] = useState(false);
    const [fileInputKey, setFileInputKey] = useState(0);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const defaultPerPage = perPageOptions[0] ?? 20;

    const flashMessages: PostFlashMessages = flash ?? {};
    const importForm = useForm<{ action: 'import'; files: File[] }>({
        action: 'import',
        files: [],
    });

    const resetImportForm = () => {
        importForm.reset();
        setFileInputKey((previous) => previous + 1);
        importForm.clearErrors();
        setIsDragging(false);
    };

    const handleDialogChange = (open: boolean) => {
        setImportDialogOpen(open);
        if (!open) {
            resetImportForm();
        }
    };

    const updateSelectedFiles = (files: FileList | File[] | null) => {
        const normalized = files ? Array.from(files) : [];
        importForm.setData('files', normalized);

        if (normalized.length > 0) {
            importForm.clearErrors();
        }
    };

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        updateSelectedFiles(event.target.files);
    };

    const handleDropZoneDragEnter = (event: DragEvent<HTMLLabelElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragging(true);
    };

    const handleDropZoneDragOver = (event: DragEvent<HTMLLabelElement>) => {
        event.preventDefault();
        event.stopPropagation();
        if (!isDragging) {
            setIsDragging(true);
        }
    };

    const handleDropZoneDragLeave = (event: DragEvent<HTMLLabelElement>) => {
        event.preventDefault();
        event.stopPropagation();

        const relatedTarget = event.relatedTarget as Node | null;
        if (!relatedTarget || !event.currentTarget.contains(relatedTarget)) {
            setIsDragging(false);
        }
    };

    const handleDropZoneDrop = (event: DragEvent<HTMLLabelElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragging(false);
        updateSelectedFiles(event.dataTransfer?.files ?? null);
    };

    const selectedFiles = importForm.data.files;

    const fileErrorMessage = useMemo(() => {
        if (importForm.errors.files) {
            return importForm.errors.files;
        }

        const entries = Object.entries(importForm.errors) as Array<[string, string]>;
        const nested = entries.find(([key]) => key.startsWith('files.'));

        return nested ? nested[1] : undefined;
    }, [importForm.errors]);

    const handleImportSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!importForm.data.files || importForm.data.files.length === 0) {
            importForm.setError('files', '請選擇要上傳的 CSV 檔案');
            return;
        }

        importForm.post('/manage/posts/bulk', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                resetImportForm();
                setImportDialogOpen(false);
            },
        });
    };

    const initialFilters: FilterState = {
        search: filters.search ?? '',
        category: filters.category ?? '',
        status: filters.status ?? '',
        author: filters.author ?? '',
        date_from: filters.date_from ?? '',
        date_to: filters.date_to ?? '',
        per_page: filters.per_page ?? String(defaultPerPage),
    } as FilterState;

    const [filterState, setFilterState] = useState<FilterState>(initialFilters);
    const resolvedPerPage = Number(filterState.per_page || defaultPerPage);

    const postData = posts?.data ?? [];
    const pagination: PaginationMeta = posts?.meta ?? {
        current_page: 1,
        last_page: 1,
        per_page: resolvedPerPage,
        total: postData.length,
    };
    const paginationLinks = posts?.links ?? [];

    const bulkForm = useForm({
        action: '',
        ids: [] as number[],
    });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('layout.breadcrumbs.dashboard', '管理首頁'), href: '/manage/dashboard' },
        { title: t('layout.breadcrumbs.posts', '公告管理'), href: '/manage/posts' },
    ];

    const applyFilters = (event?: React.FormEvent) => {
        event?.preventDefault();
        router.get(
            '/manage/posts',
            {
                ...Object.fromEntries(
                    Object.entries(filterState).filter(([, value]) => value !== '')
                ),
            },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    const resetFilters = () => {
        setFilterState({
            search: '',
            category: '',
            status: '',
            author: '',
            date_from: '',
            date_to: '',
            per_page: String(defaultPerPage),
        });
        router.get(
            '/manage/posts',
            { per_page: defaultPerPage },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    const toggleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelected(postData.map((post) => post.id));
        } else {
            setSelected([]);
        }
    };

    const toggleSelection = (postId: number) => {
        setSelected((prev) =>
            prev.includes(postId)
                ? prev.filter((id) => id !== postId)
                : [...prev, postId]
        );
    };

    const performBulkAction = (action: 'publish' | 'unpublish' | 'delete') => {
        if (selected.length === 0 || bulkForm.processing) return;

        bulkForm.transform(() => ({
            action,
            ids: selected,
        }));

        bulkForm.post('/manage/posts/bulk', {
            preserveScroll: true,
            onSuccess: () => {
                setSelected([]);
                bulkForm.reset();
            },
        });
    };

    const changePage = (page: number) => {
        if (page <= 0 || page > pagination.last_page || page === pagination.current_page) {
            return;
        }

        router.get(
            '/manage/posts',
            {
                ...Object.fromEntries(
                    Object.entries(filterState).filter(([, value]) => value !== '')
                ),
                page,
            },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    const hasActiveFilters = useMemo(
        () =>
            filterState.search !== '' ||
            filterState.category !== '' ||
            filterState.status !== '' ||
            filterState.author !== '' ||
            filterState.date_from !== '' ||
            filterState.date_to !== '',
        [filterState]
    );

    useEffect(() => {
        setFilterState({
            search: filters.search ?? '',
            category: filters.category ?? '',
            status: filters.status ?? '',
            author: filters.author ?? '',
            date_from: filters.date_from ?? '',
            date_to: filters.date_to ?? '',
            per_page: filters.per_page ?? String(defaultPerPage),
        } as FilterState);
    }, [filters.search, filters.category, filters.status, filters.author, filters.date_from, filters.date_to, filters.per_page, perPageOptions]);

    useEffect(() => {
        setSelected([]);
    }, [pagination.current_page, pagination.total]);

    return (
        <ManageLayout role={layoutRole} breadcrumbs={breadcrumbs}>
            <Head title={t('posts.index.title', '公告管理')} />

            <section className="space-y-6">
                {flashMessages.success && (
                    <Alert className="border-emerald-200 bg-emerald-50 text-emerald-800">
                        <CheckCircle2 className="h-5 w-5" />
                        <AlertTitle>{t('posts.index.flash.success_title', '操作成功')}</AlertTitle>
                        <AlertDescription>{flashMessages.success}</AlertDescription>
                    </Alert>
                )}

                {flashMessages.error && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-5 w-5" />
                        <AlertTitle>{t('posts.index.flash.error_title', '操作失敗')}</AlertTitle>
                        <AlertDescription>{flashMessages.error}</AlertDescription>
                    </Alert>
                )}

                {flashMessages.importErrors && flashMessages.importErrors.length > 0 && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-5 w-5" />
                        <AlertTitle>{t('posts.index.import.error_title', '部分資料未匯入')}</AlertTitle>
                        <AlertDescription>
                            <ul className="list-disc space-y-1 pl-4">
                                {flashMessages.importErrors.map((message, index) => (
                                    <li key={`import-error-${index}`}>{message}</li>
                                ))}
                            </ul>
                        </AlertDescription>
                    </Alert>
                )}

                <Dialog open={importDialogOpen} onOpenChange={handleDialogChange}>
                    <ManagePageHeader
                        badge={{ icon: <Filter className="h-4 w-4" />, label: t('posts.index.badge', '公告總覽') }}
                        title={t('posts.index.title', '公告管理')}
                        description={t(
                            'posts.index.description',
                            '管理公告分類、排程發布及附件檔案，確保資訊即時且一致。'
                        )}
                        actions={
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                                {can.bulk && (
                                    <DialogTrigger asChild>
                                        <Button variant="outline" className="rounded-full px-6">
                                            <Upload className="mr-2 h-4 w-4" />
                                            {t('posts.index.actions.import_csv', '批次發布')}
                                        </Button>
                                    </DialogTrigger>
                                )}
                                {can.create && (
                                    <Button asChild className="rounded-full px-6">
                                        <Link href="/manage/posts/create">{t('posts.index.create', '新增公告')}</Link>
                                    </Button>
                                )}
                            </div>
                        }
                    />

                    <DialogContent className="max-w-lg">
                        <DialogHeader>
                            <DialogTitle>{t('posts.index.import.title', '上傳公告 CSV')}</DialogTitle>
                            <DialogDescription>
                                {t('posts.index.import.description', '一次匯入多筆公告，支援自訂發布時間與狀態。')}
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleImportSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="posts-import-file">{t('posts.index.import.file_label', '選擇 CSV 檔案')}</Label>
                                <label
                                    htmlFor="posts-import-file"
                                    onDragEnter={handleDropZoneDragEnter}
                                    onDragOver={handleDropZoneDragOver}
                                    onDragLeave={handleDropZoneDragLeave}
                                    onDrop={handleDropZoneDrop}
                                    className={cn(
                                        'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center transition-colors',
                                        isDragging ? 'border-primary bg-primary/5' : 'hover:border-slate-400'
                                    )}
                                >
                                    <input
                                        key={fileInputKey}
                                        ref={fileInputRef}
                                        id="posts-import-file"
                                        type="file"
                                        accept=".csv"
                                        multiple
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />

                                    <Upload className="h-10 w-10 text-slate-400" />
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-slate-700">
                                            {t('posts.index.import.drop_label', '拖曳或點擊上傳 CSV 檔案')}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            {t('posts.index.import.drop_hint', '支援一次匯入多個檔案')}
                                        </p>
                                    </div>
                                </label>

                                {selectedFiles.length > 0 && (
                                    <ul className="space-y-1 rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-700">
                                        {selectedFiles.map((file, index) => (
                                            <li key={`${file.name}-${index}`} className="flex items-center gap-2">
                                                <FileText className="h-4 w-4 text-slate-400" />
                                                <span className="truncate" title={file.name}>
                                                    {file.name}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                )}

                                {fileErrorMessage && <p className="text-sm text-red-600">{fileErrorMessage}</p>}
                            </div>

                            <div className="space-y-1 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-600">
                                <p>{t('posts.index.import.hint_required', '必要欄位：title、content、category_slug 或 category_id。')}</p>
                                <p>
                                    {t(
                                        'posts.index.import.hint_optional',
                                        '可選欄位：slug、status、publish_at、summary、summary_en、title_en、content_en、tags、source_url。'
                                    )}
                                </p>
                                <p>
                                    {t(
                                        'posts.index.import.hint_datetime',
                                        '建議使用 YYYY-MM-DD HH:MM 格式，若狀態為 scheduled 需搭配 publish_at。'
                                    )}
                                </p>
                                <p>{t('posts.index.import.hint_sample', '專案內的 .test_file/post.csv 可作為測試檔案。')}</p>
                            </div>

                            <DialogFooter>
                                <Button type="button" variant="ghost" onClick={() => handleDialogChange(false)}>
                                    {t('posts.index.import.cancel', '取消')}
                                </Button>
                                <Button type="submit" className="gap-2" disabled={importForm.processing}>
                                    {importForm.processing && <Loader2 className="h-4 w-4 animate-spin" />}
                                    {t('posts.index.import.submit', '開始匯入')}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                <Card className="border border-slate-200 bg-white shadow-sm">
                    <CardHeader className="border-b border-slate-100 pb-4">
                        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                            <Filter className="h-5 w-5" /> {t('posts.index.filters_title', '篩選條件')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form
                            onSubmit={applyFilters}
                            className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-6"
                        >
                            <div className="xl:col-span-2 space-y-1">
                                <label className="text-sm font-medium text-slate-700" htmlFor="filter-search">
                                    {t('posts.index.filters.keyword', '關鍵字')}
                                </label>
                                <Input
                                    id="filter-search"
                                    value={filterState.search}
                                    onChange={(event) => setFilterState((prev) => ({ ...prev, search: event.target.value }))}
                                    placeholder={t('posts.index.filters.keyword_placeholder', '搜尋標題或內容')}
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium text-slate-700" htmlFor="filter-category">
                                    {t('posts.index.filters.category', '分類')}
                                </label>
                                <Select
                                    id="filter-category"
                                    value={filterState.category}
                                    onChange={(event) => setFilterState((prev) => ({ ...prev, category: event.target.value }))}
                                >
                                    <option value="">{t('posts.index.filters.all', '全部')}</option>
                                    {categories.map((category) => (
                                        <option key={category.id} value={category.id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </Select>
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium text-slate-700" htmlFor="filter-status">
                                    {t('posts.index.filters.status', '狀態')}
                                </label>
                                <Select
                                    id="filter-status"
                                    value={filterState.status}
                                    onChange={(event) => setFilterState((prev) => ({ ...prev, status: event.target.value }))}
                                >
                                    <option value="">{t('posts.index.filters.all', '全部')}</option>
                                    {statusOptions.map((status) => (
                                        <option key={status} value={status}>
                                            {t(
                                                `posts.status.${status}`,
                                                statusFallbackLabels[status][fallbackLanguage]
                                            )}
                                        </option>
                                    ))}
                                </Select>
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium text-slate-700" htmlFor="filter-author">
                                    {t('posts.index.filters.author', '作者')}
                                </label>
                                <Select
                                    id="filter-author"
                                    value={filterState.author}
                                    onChange={(event) => setFilterState((prev) => ({ ...prev, author: event.target.value }))}
                                >
                                    <option value="">{t('posts.index.filters.all', '全部')}</option>
                                    {authors.map((author) => (
                                        <option key={author.id} value={author.id}>
                                            {author.name}
                                        </option>
                                    ))}
                                </Select>
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium text-slate-700" htmlFor="filter-date-from">
                                    {t('posts.index.filters.date_from', '起始日期')}
                                </label>
                                <Input
                                    id="filter-date-from"
                                    type="date"
                                    value={filterState.date_from}
                                    onChange={(event) => setFilterState((prev) => ({ ...prev, date_from: event.target.value }))}
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium text-slate-700" htmlFor="filter-date-to">
                                    {t('posts.index.filters.date_to', '結束日期')}
                                </label>
                                <Input
                                    id="filter-date-to"
                                    type="date"
                                    value={filterState.date_to}
                                    onChange={(event) => setFilterState((prev) => ({ ...prev, date_to: event.target.value }))}
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium text-slate-700" htmlFor="filter-per-page">
                                    {t('posts.index.filters.per_page', '每頁數量')}
                                </label>
                                <Select
                                    id="filter-per-page"
                                    value={filterState.per_page}
                                    onChange={(event) => setFilterState((prev) => ({ ...prev, per_page: event.target.value }))}
                                >
                                    {perPageOptions.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </Select>
                            </div>

                            <div className="flex items-end gap-2">
                                <Button type="submit" className="w-full rounded-full">
                                    {t('posts.index.filters.apply', '套用')}
                                </Button>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    disabled={!hasActiveFilters}
                                    className="w-full rounded-full"
                                    onClick={resetFilters}
                                >
                                    {t('posts.index.filters.reset', '重設')}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <Card className="border border-slate-200 bg-white shadow-sm">
                    <CardHeader className="flex flex-col gap-4 border-b border-slate-100 pb-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <CardTitle className="text-lg font-semibold text-slate-900">
                                {t('posts.index.table.title', '公告列表')}
                            </CardTitle>
                            <p className="text-sm text-slate-600">
                                {t('posts.index.table.records_total', '共 :total 筆資料', {
                                    total: pagination.total,
                                })}
                            </p>
                        </div>
                        {can.bulk && (
                            <div className="flex flex-wrap items-center gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    disabled={selected.length === 0 || bulkForm.processing}
                                    onClick={() => performBulkAction('publish')}
                                >
                                    <FileText className="mr-2 h-4 w-4" />
                                    {t('posts.index.actions.bulk_publish', '批次發布')}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    disabled={selected.length === 0 || bulkForm.processing}
                                    onClick={() => performBulkAction('unpublish')}
                                >
                                    <Calendar className="mr-2 h-4 w-4" />
                                    {t('posts.index.actions.bulk_unpublish', '設為草稿')}
                                </Button>
                                <Button
                                    type="button"
                                    variant="destructive"
                                    disabled={selected.length === 0 || bulkForm.processing}
                                    onClick={() => performBulkAction('delete')}
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    {t('posts.index.actions.bulk_delete', '刪除選取')}
                                </Button>
                            </div>
                        )}
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="hidden md:block">
                            <table className="min-w-full divide-y divide-slate-200 text-sm">
                                <thead className="bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                                    <tr>
                                        {can.bulk && (
                                            <th className="px-4 py-3">
                                                <Checkbox
                                                    checked={selected.length === postData.length && postData.length > 0}
                                                    onCheckedChange={(value) => toggleSelectAll(Boolean(value))}
                                                />
                                            </th>
                                        )}
                                        <th className="px-4 py-3">
                                            {t('posts.index.table.columns.title', '標題')}
                                        </th>
                                        <th className="px-4 py-3">
                                            {t('posts.index.table.columns.category', '分類')}
                                        </th>
                                        <th className="px-4 py-3">
                                            {t('posts.index.table.columns.author', '作者')}
                                        </th>
                                        <th className="px-4 py-3">
                                            {t('posts.index.table.columns.status', '狀態')}
                                        </th>
                                        <th className="px-4 py-3">
                                            {t('posts.index.table.columns.published_at', '發布時間')}
                                        </th>
                                        <th className="px-4 py-3">
                                            {t('posts.index.table.columns.views', '瀏覽數')}
                                        </th>
                                        <th className="px-4 py-3">
                                            {t('posts.index.table.columns.attachments', '附件')}
                                        </th>
                                        <th className="px-4 py-3 text-right">
                                            {t('posts.index.table.columns.actions', '操作')}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {postData.length === 0 && (
                                        <tr>
                                            <td colSpan={can.bulk ? 9 : 8} className="px-4 py-12 text-center text-sm text-slate-500">
                                                {t('posts.index.table.empty', '尚無符合條件的公告。')}
                                            </td>
                                        </tr>
                                    )}
                                    {postData.map((post) => {
                                        const statusVariant = statusVariantMap[post.status];
                                        const statusLabel = t(
                                            `posts.status.${post.status}`,
                                            statusFallbackLabels[post.status][fallbackLanguage]
                                        );
                                        const isSelected = selected.includes(post.id);
                                        const categoryLabel = post.category
                                            ? localeKey === 'zh-TW'
                                                ? post.category.name
                                                : post.category.name_en ?? post.category.name
                                            : t('posts.show.not_set', fallbackLanguage === 'zh' ? '未設定' : 'Not set');
                                        const authorLabel = post.author
                                            ? post.author.name
                                            : t('posts.show.not_set', fallbackLanguage === 'zh' ? '未設定' : 'Not set');
                                        const publishDate = formatDateTime(post.publish_at, localeForDate);

                                        return (
                                            <tr key={post.id} className="bg-white hover:bg-slate-50">
                                                {can.bulk && (
                                                    <td className="px-4 py-3">
                                                        <Checkbox
                                                            checked={isSelected}
                                                            onCheckedChange={() => toggleSelection(post.id)}
                                                        />
                                                    </td>
                                                )}
                                                <td className="px-4 py-3">
                                                    <div className="flex flex-col gap-1">
                                                        <Link
                                                            href={`/manage/posts/${post.id}`}
                                                            className="font-semibold text-slate-800 hover:text-slate-900"
                                                        >
                                                            {post.title}
                                                        </Link>
                                                        <span className="text-xs text-slate-500">
                                                            {`${t('posts.show.slug', '網址 Slug')}：${post.slug}`}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-slate-600">{categoryLabel}</td>
                                                <td className="px-4 py-3 text-slate-600">{authorLabel}</td>
                                                <td className="px-4 py-3">
                                                    <Badge variant={statusVariant}>{statusLabel}</Badge>
                                                </td>
                                                <td className="px-4 py-3 text-slate-600">
                                                    {publishDate ??
                                                        t(
                                                            'posts.index.table.not_scheduled',
                                                            fallbackLanguage === 'zh' ? '未排程' : 'Not scheduled'
                                                        )}
                                                </td>
                                                <td className="px-4 py-3 text-slate-600">{post.views}</td>
                                                <td className="px-4 py-3 text-slate-600">{post.attachments_count}</td>
                                                <td className="px-4 py-3">
                                                    <div className="flex justify-end gap-2">
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Link
                                                                    href={`/manage/posts/${post.id}`}
                                                                    className={iconActionClass}
                                                                    aria-label={t(
                                                                        'posts.index.actions.view_aria',
                                                                        fallbackLanguage === 'zh' ? '檢視公告' : 'View announcement'
                                                                    )}
                                                                >
                                                                    <Eye className="h-4 w-4" />
                                                                </Link>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                {t(
                                                                    'posts.index.actions.view_label',
                                                                    fallbackLanguage === 'zh' ? '檢視公告內容' : 'View details'
                                                                )}
                                                            </TooltipContent>
                                                        </Tooltip>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Link
                                                                    href={`/manage/posts/${post.id}/edit`}
                                                                    className={iconActionClass}
                                                                    aria-label={t(
                                                                        'posts.index.actions.edit_aria',
                                                                        fallbackLanguage === 'zh' ? '編輯公告' : 'Edit announcement'
                                                                    )}
                                                                >
                                                                    <Pen className="h-4 w-4" />
                                                                </Link>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                {t(
                                                                    'posts.index.actions.edit_label',
                                                                    fallbackLanguage === 'zh' ? '編輯公告內容' : 'Edit this bulletin'
                                                                )}
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        <div className="grid gap-3 md:hidden">
                            {postData.length === 0 ? (
                                <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
                                    {t('posts.index.table.empty', '尚無符合條件的公告。')}
                                </div>
                            ) : (
                                postData.map((post) => {
                                    const statusVariant = statusVariantMap[post.status];
                                    const statusLabel = t(
                                        `posts.status.${post.status}`,
                                        statusFallbackLabels[post.status][fallbackLanguage]
                                    );
                                    const isSelected = selected.includes(post.id);
                                    const categoryLabel = post.category
                                        ? localeKey === 'zh-TW'
                                            ? post.category.name
                                            : post.category.name_en ?? post.category.name
                                        : t('posts.show.not_set', fallbackLanguage === 'zh' ? '未設定' : 'Not set');
                                    const authorLabel = post.author
                                        ? post.author.name
                                        : t('posts.show.not_set', fallbackLanguage === 'zh' ? '未設定' : 'Not set');
                                    const publishDate = formatDateTime(post.publish_at, localeForDate);

                                    return (
                                        <div
                                            key={`mobile-post-${post.id}`}
                                            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                                        >
                                            <div className="flex flex-col gap-3">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                                        <Link
                                                            href={`/manage/posts/${post.id}`}
                                                            className="text-base font-semibold text-slate-900"
                                                        >
                                                            {post.title}
                                                        </Link>
                                                        <Badge variant={statusVariant}>{statusLabel}</Badge>
                                                    </div>
                                                    <span className="text-xs text-slate-500">
                                                        {`${t('posts.show.slug', '網址 Slug')}：${post.slug}`}
                                                    </span>
                                                </div>

                                                <div className="grid gap-2 text-sm text-slate-600">
                                                    <div className="flex items-center justify-between gap-3">
                                                        <span className="font-medium text-slate-700">
                                                            {t('posts.index.table.columns.category', '分類')}
                                                        </span>
                                                        <span className="text-right">{categoryLabel}</span>
                                                    </div>
                                                    <div className="flex items-center justify-between gap-3">
                                                        <span className="font-medium text-slate-700">
                                                            {t('posts.index.table.columns.author', '作者')}
                                                        </span>
                                                        <span className="text-right">{authorLabel}</span>
                                                    </div>
                                                    <div className="flex items-center justify-between gap-3">
                                                        <span className="font-medium text-slate-700">
                                                            {t('posts.index.table.columns.published_at', '發布時間')}
                                                        </span>
                                                        <span className="text-right">
                                                            {publishDate ??
                                                                t(
                                                                    'posts.index.table.not_scheduled',
                                                                    fallbackLanguage === 'zh' ? '未排程' : 'Not scheduled'
                                                                )}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between gap-3">
                                                        <span className="font-medium text-slate-700">
                                                            {t('posts.index.table.columns.views', '瀏覽數')}
                                                        </span>
                                                        <span className="text-right">{post.views}</span>
                                                    </div>
                                                    <div className="flex items-center justify-between gap-3">
                                                        <span className="font-medium text-slate-700">
                                                            {t('posts.index.table.columns.attachments', '附件')}
                                                        </span>
                                                        <span className="text-right">{post.attachments_count}</span>
                                                    </div>
                                                </div>

                                                <div className="flex flex-wrap items-center justify-between gap-3">
                                                    {can.bulk && (
                                                        <div className="flex items-center gap-2">
                                                            <Checkbox
                                                                checked={isSelected}
                                                                onCheckedChange={() => toggleSelection(post.id)}
                                                            />
                                                            <span className="text-xs text-slate-600">
                                                                {isSelected
                                                                    ? t('posts.index.mobile.selected', '已選取')
                                                                    : t('posts.index.mobile.select', '選取')}
                                                            </span>
                                                        </div>
                                                    )}
                                                    <div className="flex flex-1 justify-end gap-2">
                                                        <Button asChild variant="outline" size="sm">
                                                            <Link href={`/manage/posts/${post.id}`}>
                                                                <Eye className="mr-1 h-4 w-4" />
                                                                {t('posts.index.actions.view_label', '檢視公告內容')}
                                                            </Link>
                                                        </Button>
                                                        <Button asChild variant="outline" size="sm">
                                                            <Link href={`/manage/posts/${post.id}/edit`}>
                                                                <Pen className="mr-1 h-4 w-4" />
                                                                {t('posts.index.actions.edit_label', '編輯公告內容')}
                                                            </Link>
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {paginationLinks.length > 0 && (
                            <div className="flex flex-col gap-4 border-t border-slate-100 pt-4 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
                                <p>
                                    {t('posts.index.table.page', '第 :current / :last 頁', {
                                        current: pagination.current_page,
                                        last: pagination.last_page,
                                    })}
                                    ，
                                    {t('posts.index.table.records_total', '共 :total 筆資料', {
                                        total: pagination.total,
                                    })}
                                </p>
                                <div className="flex items-center gap-2">
                                    <Button
                                        type="button"
                                        size="icon"
                                        variant="outline"
                                        className="h-9 w-9"
                                        onClick={() => changePage(pagination.current_page - 1)}
                                        disabled={pagination.current_page <= 1}
                                        aria-label={t('posts.index.table.prev', '上一頁')}
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    {paginationLinks.map((link, index) => {
                                        if (!link.url) {
                                            return null;
                                        }

                                        const label = link.label.replace(/&laquo;|&raquo;|&nbsp;/g, '');
                                        const url = new URL(link.url);
                                        const pageParam = url.searchParams.get('page');
                                        const pageNumber = pageParam ? Number(pageParam) : 1;

                                        return (
                                            <Button
                                                type="button"
                                                key={`${link.label}-${index}`}
                                                variant={link.active ? 'default' : 'outline'}
                                                size="sm"
                                                className="min-w-9"
                                                onClick={() => changePage(pageNumber)}
                                            >
                                                {label || pageNumber}
                                            </Button>
                                        );
                                    })}
                                    <Button
                                        type="button"
                                        size="icon"
                                        variant="outline"
                                        className="h-9 w-9"
                                        onClick={() => changePage(pagination.current_page + 1)}
                                        disabled={pagination.current_page >= pagination.last_page}
                                        aria-label={t('posts.index.table.next', '下一頁')}
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </section>
        </ManageLayout>
    );
}
