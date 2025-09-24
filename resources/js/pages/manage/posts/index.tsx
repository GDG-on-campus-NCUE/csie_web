import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import ManageLayout from '@/layouts/manage/manage-layout';
import { Button, buttonVariants } from '@/components/ui/button';
import { ManagePageHeader } from '@/components/manage/manage-page-header';
import { Filter, Upload } from 'lucide-react';
import type { BreadcrumbItem, SharedData } from '@/types';
import { useTranslator } from '@/hooks/use-translator';
import { cn } from '@/lib/utils';
import {
    type AuthorOption,
    type CategoryOption,
    type FilterState,
    type PaginationLink,
    type PaginationMeta,
    type PostFlashMessages,
    type PostItem,
    type PostStatus,
} from '@/components/manage/post/post-types';
import { PostFilterForm } from '@/components/manage/post/post-filter-form';
import { PostTable } from '@/components/manage/post/post-table';
import { PostImportUploader } from '@/components/manage/post/post-import-uploader';
import { PostFlashAlerts } from '@/components/manage/post/post-flash-alerts';
import { PostToastContainer, usePostToast } from '@/components/manage/post/post-toast';

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

const createInitialFilterState = (
    filters: PostsIndexProps['filters'],
    defaultPerPage: number,
): FilterState => ({
    search: filters.search ?? '',
    category: filters.category ?? '',
    status: filters.status ?? '',
    author: filters.author ?? '',
    date_from: filters.date_from ?? '',
    date_to: filters.date_to ?? '',
    per_page: filters.per_page ?? String(defaultPerPage),
});

export default function PostsIndex({ posts, categories, authors, filters, statusOptions, perPageOptions, can }: PostsIndexProps) {
    const { auth, flash } = usePage<SharedData & { flash?: PostFlashMessages }>().props;
    const userRole = auth?.user?.role ?? 'user';
    const layoutRole: 'admin' | 'teacher' | 'user' =
        userRole === 'admin' ? 'admin' : userRole === 'teacher' ? 'teacher' : 'user';
    const { t, localeKey } = useTranslator('manage');
    const fallbackLanguage: 'zh' | 'en' = localeKey === 'zh-TW' ? 'zh' : 'en';
    const localeForDate: 'zh-TW' | 'en' = localeKey === 'zh-TW' ? 'zh-TW' : 'en';
    const iconActionClass = cn(buttonVariants({ variant: 'outline', size: 'icon' }), 'h-9 w-9 p-0');
    const defaultPerPage = perPageOptions[0] ?? 20;

    const flashMessages: PostFlashMessages = flash ?? {};
    const hasFlashAlerts = Boolean(
        flashMessages.success ||
            flashMessages.error ||
            (flashMessages.importErrors && flashMessages.importErrors.length > 0),
    );

    const [selected, setSelected] = useState<number[]>([]);
    const [filterState, setFilterState] = useState<FilterState>(
        createInitialFilterState(filters, defaultPerPage),
    );
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

    const { toasts, showToast, dismissToast } = usePostToast();
    const skipFlashToastRef = useRef(false);
    const previousFlashRef = useRef<PostFlashMessages>({});

    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('layout.breadcrumbs.dashboard', '管理首頁'), href: '/manage/dashboard' },
        { title: t('layout.breadcrumbs.posts', '公告管理'), href: '/manage/posts' },
    ];

    const handleFilterChange = useCallback(
        (key: keyof FilterState, value: string) => {
            setFilterState((previous) => ({ ...previous, [key]: value }));
        },
        [],
    );

    const applyFilters = (event?: FormEvent<HTMLFormElement>) => {
        event?.preventDefault();
        router.get(
            '/manage/posts',
            {
                ...Object.fromEntries(
                    Object.entries(filterState).filter(([, value]) => value !== ''),
                ),
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const resetFilters = () => {
        const resetState = createInitialFilterState({}, defaultPerPage);
        setFilterState(resetState);
        router.get(
            '/manage/posts',
            { per_page: defaultPerPage },
            {
                preserveState: true,
                preserveScroll: true,
            },
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
                : [...prev, postId],
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
                skipFlashToastRef.current = true;
                showToast({
                    type: 'success',
                    title: t('posts.index.flash.success_title', '操作成功'),
                    description: t('posts.index.bulk.success', '批次操作已完成。'),
                });
            },
            onError: (errors) => {
                skipFlashToastRef.current = true;
                const messages = Object.values(errors)
                    .flat()
                    .map((value) => String(value))
                    .filter((value) => value.length > 0);
                showToast({
                    type: 'error',
                    title: t('posts.index.flash.error_title', '操作失敗'),
                    description:
                        messages[0] ?? t('posts.index.bulk.error', '批次操作失敗，請稍後再試。'),
                });
            },
            onFinish: () => {
                bulkForm.setData('action', '');
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
                    Object.entries(filterState).filter(([, value]) => value !== ''),
                ),
                page,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
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
        [filterState],
    );

    const handleImportStart = useCallback(
        (message: string) => {
            showToast({
                type: 'info',
                title: t('posts.index.import.start_title', fallbackLanguage === 'zh' ? '開始匯入' : 'Import started'),
                description: message,
            });
        },
        [showToast, t, fallbackLanguage],
    );

    const handleImportSuccess = useCallback(
        (message?: string) => {
            skipFlashToastRef.current = true;
            showToast({
                type: 'success',
                title: t('posts.index.flash.success_title', '操作成功'),
                description: message ?? t('posts.index.import.success_toast', '公告匯入已送出'),
            });
        },
        [showToast, t],
    );

    const handleImportError = useCallback(
        (messages: string[]) => {
            skipFlashToastRef.current = true;
            showToast({
                type: 'error',
                title: t('posts.index.flash.error_title', '操作失敗'),
                description:
                    messages[0] ?? t('posts.index.import.error_fallback', '匯入失敗，請確認檔案內容或稍後再試。'),
            });
        },
        [showToast, t],
    );

    const handleImportClientError = useCallback(
        (message: string) => {
            showToast({
                type: 'error',
                title: t('posts.index.flash.error_title', '操作失敗'),
                description: message,
            });
        },
        [showToast, t],
    );

    useEffect(() => {
        setFilterState(createInitialFilterState(filters, defaultPerPage));
    }, [filters, defaultPerPage]);

    useEffect(() => {
        setSelected([]);
    }, [pagination.current_page, pagination.total]);

    // 根據後端 flash 訊息補上 toast 提示，確保使用者能即時掌握狀態。
    useEffect(() => {
        if (skipFlashToastRef.current) {
            previousFlashRef.current = flashMessages;
            skipFlashToastRef.current = false;
            return;
        }

        if (flashMessages.success && flashMessages.success !== previousFlashRef.current.success) {
            showToast({
                type: 'success',
                title: t('posts.index.flash.success_title', '操作成功'),
                description: flashMessages.success,
            });
        }

        if (flashMessages.error && flashMessages.error !== previousFlashRef.current.error) {
            showToast({
                type: 'error',
                title: t('posts.index.flash.error_title', '操作失敗'),
                description: flashMessages.error,
            });
        }

        const previousImportErrors = previousFlashRef.current.importErrors ?? [];
        const currentImportErrors = flashMessages.importErrors ?? [];

        currentImportErrors
            .filter((message) => !previousImportErrors.includes(message))
            .forEach((message) => {
                showToast({
                    type: 'error',
                    title: t('posts.index.import.error_title', '部分資料未匯入'),
                    description: message,
                });
            });

        previousFlashRef.current = flashMessages;
    }, [flashMessages, showToast, t]);

    return (
        <ManageLayout role={layoutRole} breadcrumbs={breadcrumbs}>
            <Head title={t('posts.index.title', '公告管理')} />
            <PostToastContainer toasts={toasts} onDismiss={dismissToast} />

            <section className="space-y-6">
                {hasFlashAlerts && <PostFlashAlerts messages={flashMessages} t={t} />}

                <ManagePageHeader
                    badge={{ icon: <Filter className="h-4 w-4" />, label: t('posts.index.badge', '公告總覽') }}
                    title={t('posts.index.title', '公告管理')}
                    description={t(
                        'posts.index.description',
                        '管理公告分類、排程發布及附件檔案，確保資訊即時且一致。',
                    )}
                    actions={
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                            {can.bulk && (
                                <PostImportUploader
                                    t={t}
                                    fallbackLanguage={fallbackLanguage}
                                    trigger={
                                        <Button variant="outline" className="rounded-full px-6">
                                            <Upload className="mr-2 h-4 w-4" />
                                            {t('posts.index.actions.import_csv', fallbackLanguage === 'zh' ? '批次發布' : 'Bulk import')}
                                        </Button>
                                    }
                                    onStart={handleImportStart}
                                    onSuccess={handleImportSuccess}
                                    onError={handleImportError}
                                    onClientError={handleImportClientError}
                                />
                            )}
                            {can.create && (
                                <Button asChild className="rounded-full px-6">
                                    <Link href="/manage/posts/create">{t('posts.index.create', '新增公告')}</Link>
                                </Button>
                            )}
                        </div>
                    }
                />

                <PostFilterForm
                    filterState={filterState}
                    categories={categories}
                    statusOptions={statusOptions}
                    authors={authors}
                    perPageOptions={perPageOptions}
                    hasActiveFilters={hasActiveFilters}
                    onChange={handleFilterChange}
                    onSubmit={applyFilters}
                    onReset={resetFilters}
                    t={t}
                    fallbackLanguage={fallbackLanguage}
                />

                <PostTable
                    posts={postData}
                    selectedIds={selected}
                    canBulk={can.bulk}
                    onToggleSelectAll={toggleSelectAll}
                    onToggleSelection={toggleSelection}
                    onBulkAction={performBulkAction}
                    bulkFormProcessing={bulkForm.processing}
                    pagination={pagination}
                    paginationLinks={paginationLinks}
                    changePage={changePage}
                    iconActionClass={iconActionClass}
                    t={t}
                    fallbackLanguage={fallbackLanguage}
                    localeForDate={localeForDate}
                />
            </section>
        </ManageLayout>
    );
}
