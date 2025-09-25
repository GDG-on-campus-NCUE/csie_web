import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { Filter, Upload } from 'lucide-react';
import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { ManagePageHeader } from '@/components/manage/manage-page-header';
import { Button } from '@/components/ui/button';
import ToastContainer from '@/components/ui/toast-container';
import ManageLayout from '@/layouts/manage/manage-layout';

import { useToast } from '@/hooks/use-toast';
import { useTranslator } from '@/hooks/use-translator';

import { PostFilterForm } from '@/components/manage/post/post-filter-form';
import { PostTable } from '@/components/manage/post/post-table';
import { PostImportUploader } from '@/components/manage/post/post-import-uploader';
import type {
    AuthorOption,
    CategoryOption,
    FilterState,
    PaginationLink,
    PaginationMeta,
    PostFlashMessages,
    PostItem,
    PostStatus,
} from '@/components/manage/post/post-types';
import type { BreadcrumbItem, SharedData } from '@/types';

/**
 * 公告列表頁面屬性定義
 */
interface PostsIndexProps {
    posts: {
        data: PostItem[];
        links: PaginationLink[];
        meta: PaginationMeta;
    };
    categories: CategoryOption[];
    authors: AuthorOption[];
    filters: Partial<FilterState>;
    statusOptions: PostStatus[];
    perPageOptions: number[];
    can: {
        create: boolean;
        bulk: boolean;
    };
}

/**
 * 建立初始篩選狀態，確保重新整理或重新載入後狀態一致
 */
const createInitialFilterState = (filters: PostsIndexProps['filters'], defaultPerPage: number): FilterState => ({
    search: filters.search ?? '',
    category: filters.category ?? '',
    status: filters.status ?? '',
    author: filters.author ?? '',
    date_from: filters.date_from ?? '',
    date_to: filters.date_to ?? '',
    per_page: filters.per_page ?? String(defaultPerPage),
});

export default function PostsIndex({ posts, categories, authors, filters, statusOptions, perPageOptions, can }: PostsIndexProps) {
    const page = usePage<SharedData & { flash?: PostFlashMessages }>();
    const flashMessages: PostFlashMessages = page.props.flash ?? {};
    const locale = page.props.locale ?? 'zh-TW';

    const { t } = useTranslator('manage');
    // 以更彈性的語系判斷方式支援 zh_TW、zh-Hant 等格式，避免中英文切換失效。
    const normalizedLocale = locale.toLowerCase().replace('_', '-');
    const isTraditionalChinese = normalizedLocale.startsWith('zh');
    const fallbackLanguage: 'zh' | 'en' = isTraditionalChinese ? 'zh' : 'en';
    const localeForDate: 'zh-TW' | 'en' = isTraditionalChinese ? 'zh-TW' : 'en';

    const defaultPerPage = perPageOptions[0] ?? 15;
    const postData = posts?.data ?? [];
    const paginationMeta = posts?.meta ?? {
        current_page: 1,
        last_page: 1,
        per_page: defaultPerPage,
        total: postData.length,
        from: postData.length > 0 ? 1 : 0,
        to: postData.length,
    };
    const pagination: PaginationMeta = {
        current_page: paginationMeta.current_page,
        last_page: paginationMeta.last_page,
        per_page: paginationMeta.per_page,
        total: paginationMeta.total,
        from: paginationMeta.from,
        to: paginationMeta.to,
    };
    const paginationLinks = posts?.links ?? [];

    // Toast 管理，確保各種操作都有即時提示
    const { toasts, showSuccess, showError, showInfo, showBatchErrors, dismissToast } = useToast();

    // 頁面狀態管理
    const [filterState, setFilterState] = useState<FilterState>(createInitialFilterState(filters, defaultPerPage));
    const [selected, setSelected] = useState<number[]>([]);

    // 由於批次操作與匯入可能會回傳 flash 訊息，此旗標用來避免重複顯示 toast
    const skipFlashToastRef = useRef(false);
    const previousFlashRef = useRef<PostFlashMessages>({});

    const iconActionClass = useMemo(
        () =>
            'inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500/60',
        [],
    );

    const breadcrumbs: BreadcrumbItem[] = useMemo(
        () => [
            { title: t('layout.breadcrumbs.dashboard', '管理首頁'), href: '/manage/dashboard' },
            { title: t('layout.breadcrumbs.posts', '公告管理'), href: '/manage/posts' },
        ],
        [t],
    );

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

    /**
     * 監聽篩選器輸入，並更新狀態
     */
    const handleFilterChange = useCallback((key: keyof FilterState, value: string) => {
        setFilterState((previous) => ({ ...previous, [key]: value }));
    }, []);

    /**
     * 提交篩選條件給後端
     */
    const applyFilters = useCallback(
        (event?: FormEvent<HTMLFormElement>) => {
            event?.preventDefault();

            const params = Object.fromEntries(Object.entries(filterState).filter(([, value]) => value !== ''));

            router.get('/manage/posts', params, {
                preserveState: true,
                preserveScroll: true,
            });
        },
        [filterState],
    );

    /**
     * 重設篩選條件並回到預設每頁筆數
     */
    const resetFilters = useCallback(() => {
        const initialState = createInitialFilterState({}, defaultPerPage);
        setFilterState(initialState);
        router.get(
            '/manage/posts',
            { per_page: defaultPerPage },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    }, [defaultPerPage]);

    /**
     * 切換分頁
     */
    const changePage = useCallback(
        (pageNumber: number) => {
            if (pageNumber <= 0 || pageNumber > pagination.last_page || pageNumber === pagination.current_page) {
                return;
            }

            const params = Object.fromEntries(Object.entries(filterState).filter(([, value]) => value !== ''));

            params.page = pageNumber.toString();

            router.get('/manage/posts', params, {
                preserveState: true,
                preserveScroll: true,
            });
        },
        [filterState, pagination],
    );

    /**
     * 切換全選狀態
     */
    const handleToggleSelectAll = useCallback(
        (checked: boolean) => {
            setSelected(checked ? postData.map((post) => post.id) : []);
        },
        [postData],
    );

    /**
     * 切換單筆公告的選取狀態
     */
    const handleToggleSelection = useCallback((postId: number) => {
        setSelected((previous) => (previous.includes(postId) ? previous.filter((id) => id !== postId) : [...previous, postId]));
    }, []);

    // Inertia 表單處理批次操作
    const bulkForm = useForm<{ action: 'publish' | 'unpublish' | 'delete'; ids: number[] }>({
        action: 'publish',
        ids: [],
    });

    /**
     * 執行批次操作，涵蓋發布、取消發布與刪除
     */
    const performBulkAction = useCallback(
        (action: 'publish' | 'unpublish' | 'delete') => {
            if (selected.length === 0 || bulkForm.processing) {
                return;
            }

            if (action === 'delete') {
                const confirmed = window.confirm(
                    t(
                        'posts.index.bulk.delete_confirm',
                        fallbackLanguage === 'zh'
                            ? `確定要刪除選取的 ${selected.length} 筆公告嗎？此操作無法復原。`
                            : `Are you sure you want to delete the selected ${selected.length} announcements? This action cannot be undone.`,
                    ),
                );

                if (!confirmed) {
                    return;
                }
            }

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

                    const successMessages: Record<typeof action, string> = {
                        publish: t('posts.index.bulk.publish_success', '已發布選取的公告'),
                        unpublish: t('posts.index.bulk.unpublish_success', '已取消發布選取的公告'),
                        delete: t('posts.index.bulk.delete_success', '已刪除選取的公告'),
                    };

                    showSuccess(t('posts.index.flash.success_title', '操作成功'), successMessages[action]);
                },
                onError: (errors) => {
                    skipFlashToastRef.current = true;

                    const errorMessages = Object.values(errors)
                        .flat()
                        .map((value) => String(value))
                        .filter((value) => value.length > 0);

                    const fallbackMessage = fallbackLanguage === 'zh' ? '批次操作失敗，請重新嘗試。' : 'Bulk action failed, please try again.';

                    showBatchErrors(errorMessages.length > 0 ? errorMessages : [fallbackMessage], t('posts.index.flash.error_title', '操作失敗'));
                },
            });
        },
        [selected, bulkForm, t, fallbackLanguage, showSuccess, showBatchErrors],
    );

    /**
     * 開始匯入時的提示，讓使用者了解背景流程
     */
    const handleImportStart = useCallback(
        (message?: string) => {
            // 以預設提示確保沒有訊息時仍能顯示友善文字
            const fallbackMessage =
                fallbackLanguage === 'zh' ? '開始匯入公告，請稍候…' : 'Import started, please wait…';

            showInfo(
                t('posts.index.import.start_title', fallbackLanguage === 'zh' ? '開始匯入' : 'Import started'),
                message ?? fallbackMessage,
            );
        },
        [showInfo, t, fallbackLanguage],
    );

    /**
     * 匯入成功時顯示提示並重新整理列表
     */
    const handleImportSuccess = useCallback(
        (message?: string) => {
            skipFlashToastRef.current = true;
            // 若後端未提供提示訊息，套用預設文字以維持一致體驗
            const fallbackMessage =
                fallbackLanguage === 'zh' ? '公告匯入已送出' : 'Import request submitted';

            showSuccess(t('posts.index.flash.success_title', '操作成功'), message ?? fallbackMessage);
            router.reload({ only: ['posts'] });
        },
        [showSuccess, t, fallbackLanguage],
    );

    /**
     * 後端回傳的匯入錯誤整合顯示
     */
    const handleImportError = useCallback(
        (messages: string[]) => {
            skipFlashToastRef.current = true;
            showBatchErrors(messages, t('posts.index.import.error_title', fallbackLanguage === 'zh' ? '匯入錯誤' : 'Import errors'));
        },
        [showBatchErrors, t, fallbackLanguage],
    );

    /**
     * 客戶端驗證失敗時給予友善提示
     */
    const handleImportClientError = useCallback(
        (message: string) => {
            showError(t('posts.index.flash.error_title', '操作失敗'), message);
        },
        [showError, t],
    );

    // 來源資料更新時重新建立篩選狀態，確保與伺服器同步
    useEffect(() => {
        setFilterState(createInitialFilterState(filters, defaultPerPage));
    }, [filters, defaultPerPage]);

    // 切換頁面或資料量變化後清除選取狀態，避免誤操作
    useEffect(() => {
        setSelected([]);
    }, [pagination.current_page, pagination.total]);

    // 監控後端 flash 訊息並顯示對應的 Toast
    useEffect(() => {
        if (skipFlashToastRef.current) {
            previousFlashRef.current = flashMessages;
            skipFlashToastRef.current = false;
            return;
        }

        if (flashMessages.success && flashMessages.success !== previousFlashRef.current.success) {
            showSuccess(t('posts.index.flash.success_title', '操作成功'), flashMessages.success);
        }

        if (flashMessages.error && flashMessages.error !== previousFlashRef.current.error) {
            showError(t('posts.index.flash.error_title', '操作失敗'), flashMessages.error);
        }

        if (flashMessages.info && flashMessages.info !== previousFlashRef.current.info) {
            showInfo(t('posts.index.flash.info_title', '訊息'), flashMessages.info);
        }

        const importErrors = flashMessages.importErrors ?? [];
        const previousImportErrors = previousFlashRef.current.importErrors ?? [];
        const newImportErrors = importErrors.filter((message) => !previousImportErrors.includes(message));

        if (newImportErrors.length > 0) {
            showBatchErrors(newImportErrors, t('posts.index.import.error_title', fallbackLanguage === 'zh' ? '匯入錯誤' : 'Import errors'));
        }

        previousFlashRef.current = flashMessages;
    }, [flashMessages, showSuccess, showError, showInfo, showBatchErrors, t, fallbackLanguage]);

    return (
        <ManageLayout breadcrumbs={breadcrumbs}>
            <Head title={t('posts.index.title', '公告管理')} />

            <ToastContainer toasts={toasts} onDismiss={dismissToast} position="bottom-right" />

            <section className="space-y-6">
                <ManagePageHeader
                    badge={{ icon: <Filter className="h-4 w-4" />, label: t('posts.index.badge', '公告總覽') }}
                    title={t('posts.index.title', '公告管理')}
                    description={t('posts.index.description', '管理公告分類、排程發布及附件檔案，確保資訊即時且一致。')}
                    actions={
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                            {can.bulk && (
                                <PostImportUploader
                                    t={t}
                                    fallbackLanguage={fallbackLanguage}
                                    trigger={
                                        <Button variant="outline" className="rounded-full px-6">
                                            <Upload className="mr-2 h-4 w-4" />
                                            {t('posts.index.actions.import_csv', fallbackLanguage === 'zh' ? '批次匯入' : 'Bulk import')}
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
                    onToggleSelectAll={handleToggleSelectAll}
                    onToggleSelection={handleToggleSelection}
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
