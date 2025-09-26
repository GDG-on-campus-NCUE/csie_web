import { Head, router, useForm, usePage } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Paperclip } from 'lucide-react';

import ManageLayout from '@/layouts/manage/manage-layout';
import { ManagePageHeader } from '@/components/manage/manage-page-header';
import ToastContainer from '@/components/ui/toast-container';
import { Button } from '@/components/ui/button';

import { AttachmentFilterForm } from '@/components/manage/attachment/attachment-filter-form';
import { AttachmentTable } from '@/components/manage/attachment/attachment-table';
import type {
    AttachmentFilterState,
    AttachmentFlashMessages,
    AttachmentItem,
    PaginationLink,
    PaginationMeta,
    SortOption,
} from '@/components/manage/attachment/attachment-types';
import type { BreadcrumbItem, SharedData } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useTranslator } from '@/hooks/use-translator';

interface AttachmentIndexProps {
    attachments: {
        data: AttachmentItem[];
        links: PaginationLink[];
        meta: PaginationMeta;
    };
    filters: Partial<AttachmentFilterState>;
    typeOptions: string[];
    visibilityOptions: string[];
    attachedTypeOptions: string[];
    perPageOptions: number[];
    sortOptions: SortOption[];
}

// 建立初始篩選狀態，確保重新整理時狀態保持一致。
const createInitialFilterState = (
    filters: Partial<AttachmentFilterState>,
    defaultPerPage: number,
    defaultSort: string,
): AttachmentFilterState => ({
    search: filters.search ?? '',
    type: filters.type ?? '',
    attached_to_type: filters.attached_to_type ?? '',
    attached_to_id: filters.attached_to_id ?? '',
    visibility: filters.visibility ?? '',
    trashed: filters.trashed ?? '',
    per_page: filters.per_page ?? String(defaultPerPage),
    sort: filters.sort ?? defaultSort,
});

export default function AttachmentIndex({
    attachments,
    filters,
    typeOptions,
    visibilityOptions,
    attachedTypeOptions,
    perPageOptions,
    sortOptions,
}: AttachmentIndexProps) {
    const page = usePage<SharedData & { flash?: AttachmentFlashMessages }>();
    const flashMessages: AttachmentFlashMessages = page.props.flash ?? {};
    const locale = page.props.locale ?? 'zh-TW';

    const { t } = useTranslator('manage');
    // 支援 zh_TW、zh-TW 等變體，確保語系判斷穩定。
    const normalizedLocale = locale.toLowerCase().replace('_', '-');
    const isTraditionalChinese = normalizedLocale.startsWith('zh');
    const fallbackLanguage: 'zh' | 'en' = isTraditionalChinese ? 'zh' : 'en';
    const localeForDate: 'zh-TW' | 'en' = isTraditionalChinese ? 'zh-TW' : 'en';

    const defaultPerPage = perPageOptions[0] ?? 15;
    const defaultSort = sortOptions[0]?.value ?? '-created_at';

    const attachmentData = attachments?.data ?? [];
    const paginationMeta = attachments?.meta ?? {
        current_page: 1,
        last_page: 1,
        per_page: defaultPerPage,
        total: attachmentData.length,
        from: attachmentData.length > 0 ? 1 : 0,
        to: attachmentData.length,
    };

    const pagination: PaginationMeta = {
        current_page: paginationMeta.current_page,
        last_page: paginationMeta.last_page,
        per_page: paginationMeta.per_page,
        total: paginationMeta.total,
        from: paginationMeta.from,
        to: paginationMeta.to,
    };

    const paginationLinks = attachments?.links ?? [];

    const { toasts, showSuccess, showError, showInfo, showBatchErrors, dismissToast } = useToast();

    const [filterState, setFilterState] = useState<AttachmentFilterState>(
        createInitialFilterState(filters, defaultPerPage, defaultSort),
    );
    const [selected, setSelected] = useState<number[]>([]);

    // 避免成功操作後重複顯示 flash 訊息的旗標。
    const skipFlashToastRef = useRef(false);
    const previousFlashRef = useRef<AttachmentFlashMessages>({});

    const iconActionClass = useMemo(
        () =>
            'inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500/60',
        [],
    );

    const breadcrumbs: BreadcrumbItem[] = useMemo(
        () => [
            { title: t('layout.breadcrumbs.dashboard', '管理首頁'), href: '/manage/dashboard' },
            {
                title: t(
                    'attachments.index.title',
                    fallbackLanguage === 'zh' ? '附件管理' : 'Attachment manager',
                ),
                href: '/manage/attachments',
            },
        ],
        [t, fallbackLanguage],
    );

    const hasActiveFilters = useMemo(
        () =>
            filterState.search !== '' ||
            filterState.type !== '' ||
            filterState.attached_to_type !== '' ||
            filterState.attached_to_id !== '' ||
            filterState.visibility !== '' ||
            filterState.trashed !== '',
        [filterState],
    );

    const handleFilterChange = useCallback((key: keyof AttachmentFilterState, value: string) => {
        setFilterState((previous) => ({ ...previous, [key]: value }));
    }, []);

    const applyFilters = useCallback(
        (event?: FormEvent<HTMLFormElement>) => {
            event?.preventDefault();

            const params = Object.fromEntries(
                Object.entries(filterState).filter(([key, value]) => {
                    if (key === 'per_page' || key === 'sort') {
                        return true;
                    }

                    return value !== '';
                }),
            );

            router.get('/manage/attachments', params, {
                preserveState: true,
                preserveScroll: true,
            });
        },
        [filterState],
    );

    const resetFilters = useCallback(() => {
        const initialState = createInitialFilterState({}, defaultPerPage, defaultSort);
        setFilterState(initialState);
        router.get(
            '/manage/attachments',
            { per_page: defaultPerPage, sort: defaultSort },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    }, [defaultPerPage, defaultSort]);

    const changePage = useCallback(
        (pageNumber: number) => {
            if (pageNumber <= 0 || pageNumber > pagination.last_page || pageNumber === pagination.current_page) {
                return;
            }

            const params = Object.fromEntries(
                Object.entries(filterState).filter(([key, value]) => {
                    if (key === 'per_page' || key === 'sort') {
                        return true;
                    }

                    return value !== '';
                }),
            );

            params.page = pageNumber.toString();

            router.get('/manage/attachments', params, {
                preserveState: true,
                preserveScroll: true,
            });
        },
        [filterState, pagination],
    );

    const handleToggleSelectAll = useCallback(
        (checked: boolean) => {
            setSelected(checked ? attachmentData.map((attachment) => attachment.id) : []);
        },
        [attachmentData],
    );

    const handleToggleSelection = useCallback((attachmentId: number) => {
        setSelected((previous) =>
            previous.includes(attachmentId)
                ? previous.filter((id) => id !== attachmentId)
                : [...previous, attachmentId],
        );
    }, []);

    const bulkForm = useForm<{ action: 'delete' | 'force'; ids: number[] }>({
        action: 'delete',
        ids: [],
    });

    const performBulkAction = useCallback(
        (action: 'delete' | 'force') => {
            if (selected.length === 0 || bulkForm.processing) {
                return;
            }

            if (action === 'delete') {
                const confirmed = window.confirm(
                    fallbackLanguage === 'zh'
                        ? `確定要刪除選取的 ${selected.length} 筆附件嗎？附件將移至回收桶。`
                        : `Are you sure you want to delete the selected ${selected.length} attachment(s)? They will be moved to recycle bin.`,
                );

                if (!confirmed) {
                    return;
                }
            }

            if (action === 'force') {
                const confirmed = window.confirm(
                    fallbackLanguage === 'zh'
                        ? `確定要永久刪除選取的 ${selected.length} 筆附件嗎？此操作無法復原。`
                        : `Permanently delete the selected ${selected.length} attachment(s)? This action cannot be undone.`,
                );

                if (!confirmed) {
                    return;
                }
            }

            bulkForm.transform(() => ({
                action,
                ids: selected,
            }));

            bulkForm.post('/manage/attachments/bulk', {
                preserveScroll: true,
                onSuccess: (pageResponse) => {
                    setSelected([]);
                    bulkForm.reset();
                    skipFlashToastRef.current = true;

                    const successMessage =
                        (pageResponse?.props?.flash as AttachmentFlashMessages | undefined)?.success ??
                        (fallbackLanguage === 'zh'
                            ? action === 'delete'
                                ? '已將選取的附件移至回收桶。'
                                : '已永久刪除選取的附件。'
                            : action === 'delete'
                                ? 'Selected attachments moved to recycle bin.'
                                : 'Selected attachments permanently deleted.');

                    showSuccess(t('attachments.index.flash.success', '操作成功'), successMessage);
                },
                onError: (errors) => {
                    skipFlashToastRef.current = true;
                    const errorMessages = Object.values(errors)
                        .flat()
                        .map((value) => String(value))
                        .filter((value) => value.length > 0);

                    const fallbackMessage =
                        fallbackLanguage === 'zh'
                            ? '批次操作失敗，請稍後再試。'
                            : 'Bulk action failed. Please try again later.';

                    showBatchErrors(
                        errorMessages.length > 0 ? errorMessages : [fallbackMessage],
                        t('attachments.index.flash.error', '操作失敗'),
                    );
                },
            });
        },
        [selected, bulkForm, fallbackLanguage, t, showSuccess, showBatchErrors],
    );

    const handleDelete = useCallback(
        (attachment: AttachmentItem) => {
            if (attachment.deleted_at) {
                showInfo(
                    t(
                        'attachments.index.info.already_deleted',
                        fallbackLanguage === 'zh' ? '附件已在回收桶中' : 'Attachment is already in recycle bin',
                    ),
                );
                return;
            }

            const confirmed = window.confirm(
                t(
                    'attachments.index.dialogs.delete_confirm',
                    fallbackLanguage === 'zh'
                        ? `確定要移除附件「${attachment.title ?? attachment.filename ?? attachment.id}」嗎？`
                        : `Delete attachment "${attachment.title ?? attachment.filename ?? attachment.id}"?`,
                    {
                        name: attachment.title ?? attachment.filename ?? String(attachment.id),
                    },
                ),
            );

            if (!confirmed) {
                return;
            }

            router.delete(`/manage/attachments/${attachment.id}`, {
                preserveScroll: true,
                onSuccess: (pageResponse) => {
                    skipFlashToastRef.current = true;
                    const successMessage =
                        (pageResponse?.props?.flash as AttachmentFlashMessages | undefined)?.success ??
                        (fallbackLanguage === 'zh' ? '附件已移至回收桶。' : 'Attachment moved to recycle bin.');

                    showSuccess(t('attachments.index.flash.success', '操作成功'), successMessage);
                },
                onError: (errors) => {
                    skipFlashToastRef.current = true;
                    const errorMessages = Object.values(errors)
                        .flat()
                        .map((value) => String(value))
                        .filter((value) => value.length > 0);

                    const fallbackMessage =
                        fallbackLanguage === 'zh' ? '刪除失敗，請稍後再試。' : 'Failed to delete attachment.';

                    showBatchErrors(
                        errorMessages.length > 0 ? errorMessages : [fallbackMessage],
                        t('attachments.index.flash.error', '操作失敗'),
                    );
                },
            });
        },
        [fallbackLanguage, showInfo, showSuccess, showBatchErrors, t],
    );

    const handleRestore = useCallback(
        (attachment: AttachmentItem) => {
            if (!attachment.deleted_at) {
                showInfo(
                    t(
                        'attachments.index.info.not_deleted',
                        fallbackLanguage === 'zh' ? '附件尚未刪除' : 'Attachment is not deleted',
                    ),
                );
                return;
            }

            router.patch(`/manage/attachments/${attachment.id}/restore`, undefined, {
                preserveScroll: true,
                onSuccess: (pageResponse) => {
                    skipFlashToastRef.current = true;
                    const successMessage =
                        (pageResponse?.props?.flash as AttachmentFlashMessages | undefined)?.success ??
                        (fallbackLanguage === 'zh' ? '附件已還原。' : 'Attachment restored.');

                    showSuccess(t('attachments.index.flash.success', '操作成功'), successMessage);
                },
                onError: (errors) => {
                    skipFlashToastRef.current = true;
                    const errorMessages = Object.values(errors)
                        .flat()
                        .map((value) => String(value))
                        .filter((value) => value.length > 0);

                    const fallbackMessage =
                        fallbackLanguage === 'zh' ? '還原失敗，請稍後再試。' : 'Failed to restore attachment.';

                    showBatchErrors(
                        errorMessages.length > 0 ? errorMessages : [fallbackMessage],
                        t('attachments.index.flash.error', '操作失敗'),
                    );
                },
            });
        },
        [fallbackLanguage, showInfo, showSuccess, showBatchErrors, t],
    );

    const handleForceDelete = useCallback(
        (attachment: AttachmentItem) => {
            const confirmed = window.confirm(
                t(
                    'attachments.index.dialogs.force_delete_confirm',
                    fallbackLanguage === 'zh'
                        ? '確定要永久刪除此附件？此動作無法復原。'
                        : 'Permanently delete this attachment? This action cannot be undone.',
                ),
            );

            if (!confirmed) {
                return;
            }

            router.delete(`/manage/attachments/${attachment.id}/force`, {
                preserveScroll: true,
                onSuccess: (pageResponse) => {
                    skipFlashToastRef.current = true;
                    const successMessage =
                        (pageResponse?.props?.flash as AttachmentFlashMessages | undefined)?.success ??
                        (fallbackLanguage === 'zh' ? '附件已永久刪除。' : 'Attachment permanently deleted.');

                    showSuccess(t('attachments.index.flash.success', '操作成功'), successMessage);
                },
                onError: (errors) => {
                    skipFlashToastRef.current = true;
                    const errorMessages = Object.values(errors)
                        .flat()
                        .map((value) => String(value))
                        .filter((value) => value.length > 0);

                    const fallbackMessage =
                        fallbackLanguage === 'zh' ? '刪除失敗，請稍後再試。' : 'Failed to delete attachment.';

                    showBatchErrors(
                        errorMessages.length > 0 ? errorMessages : [fallbackMessage],
                        t('attachments.index.flash.error', '操作失敗'),
                    );
                },
            });
        },
        [fallbackLanguage, showSuccess, showBatchErrors, t],
    );

    useEffect(() => {
        setFilterState(createInitialFilterState(filters, defaultPerPage, defaultSort));
    }, [filters, defaultPerPage, defaultSort]);

    useEffect(() => {
        setSelected([]);
    }, [pagination.current_page, pagination.total]);

    useEffect(() => {
        if (skipFlashToastRef.current) {
            previousFlashRef.current = flashMessages;
            skipFlashToastRef.current = false;
            return;
        }

        if (flashMessages.success && flashMessages.success !== previousFlashRef.current.success) {
            showSuccess(t('attachments.index.flash.success', '操作成功'), flashMessages.success);
        }

        if (flashMessages.error && flashMessages.error !== previousFlashRef.current.error) {
            showError(t('attachments.index.flash.error', '操作失敗'), flashMessages.error);
        }

        if (flashMessages.info && flashMessages.info !== previousFlashRef.current.info) {
            showInfo(t('attachments.index.flash.info', '訊息'), flashMessages.info);
        }

        previousFlashRef.current = flashMessages;
    }, [flashMessages, showSuccess, showError, showInfo, t]);

    return (
        <ManageLayout breadcrumbs={breadcrumbs}>
            <Head title={t('attachments.index.title', fallbackLanguage === 'zh' ? '附件管理' : 'Attachment manager')} />

            <ToastContainer toasts={toasts} onDismiss={dismissToast} position="bottom-right" />

            <section className="space-y-6">
                <ManagePageHeader
                    badge={{
                        icon: <Paperclip className="h-4 w-4" />,
                        label: t(
                            'attachments.index.badge',
                            fallbackLanguage === 'zh' ? '附件總覽' : 'Attachment overview',
                        ),
                    }}
                    title={t('attachments.index.title', fallbackLanguage === 'zh' ? '附件管理' : 'Attachment manager')}
                    description={t(
                        'attachments.index.description',
                        fallbackLanguage === 'zh'
                            ? '檢視與維護公告、頁面所使用的檔案與連結資源。'
                            : 'Review and maintain files or links used across posts and pages.',
                    )}
                    actions={
                        <Button
                            type="button"
                            variant="outline"
                            className="rounded-full"
                            onClick={() => router.get('/manage/posts')}
                        >
                            {t('attachments.index.back_to_posts', fallbackLanguage === 'zh' ? '回公告列表' : 'Back to posts')}
                        </Button>
                    }
                />

                <AttachmentFilterForm
                    filterState={filterState}
                    typeOptions={typeOptions}
                    visibilityOptions={visibilityOptions}
                    attachedTypeOptions={attachedTypeOptions}
                    perPageOptions={perPageOptions}
                    sortOptions={sortOptions}
                    hasActiveFilters={hasActiveFilters}
                    onChange={handleFilterChange}
                    onSubmit={applyFilters}
                    onReset={resetFilters}
                    t={t}
                    fallbackLanguage={fallbackLanguage}
                />

                <AttachmentTable
                    attachments={attachmentData}
                    selectedIds={selected}
                    onToggleSelectAll={handleToggleSelectAll}
                    onToggleSelection={handleToggleSelection}
                    onDelete={handleDelete}
                    onRestore={handleRestore}
                    onForceDelete={handleForceDelete}
                    onBulkAction={performBulkAction}
                    bulkProcessing={bulkForm.processing}
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
