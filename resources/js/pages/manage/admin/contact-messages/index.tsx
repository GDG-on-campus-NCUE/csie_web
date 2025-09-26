import { Head, router, usePage } from '@inertiajs/react';
import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { ManagePageHeader } from '@/components/manage/manage-page-header';
import { ContactFilterForm } from '@/components/manage/contact/contact-filter-form';
import { ContactTable } from '@/components/manage/contact/contact-table';
import { contactStatusLabels } from '@/components/manage/contact/contact-types';
import type {
    ContactFilterState,
    ContactFlashMessages,
    ContactMessageItem,
    ContactPaginationLink,
    ContactPaginationMeta,
    ContactStatusOption,
    ContactMessageStatus,
} from '@/components/manage/contact/contact-types';
import ManageLayout from '@/layouts/manage/manage-layout';
import ToastContainer from '@/components/ui/toast-container';
import { useToast } from '@/hooks/use-toast';
import type { BreadcrumbItem, SharedData } from '@/types';

/**
 * 頁面 props 定義，對應後端 Controller 回傳結構
 */
interface ContactMessagesIndexProps {
    messages: {
        data: ContactMessageItem[];
        links: ContactPaginationLink[];
        meta: ContactPaginationMeta;
    };
    filters: Partial<ContactFilterState>;
    statusOptions: Record<ContactMessageStatus, ContactMessageStatus>;
    perPageOptions: number[];
}

/**
 * 建立篩選表單預設值
 */
const createInitialFilterState = (
    filters: Partial<ContactFilterState>,
    defaultPerPage: number,
): ContactFilterState => ({
    search: filters.search ?? '',
    status: filters.status ?? '',
    per_page: filters.per_page ?? String(defaultPerPage),
});

export default function ContactMessagesIndex({ messages, filters, statusOptions, perPageOptions }: ContactMessagesIndexProps) {
    const page = usePage<SharedData & { flash?: ContactFlashMessages }>();
    const flashMessages: ContactFlashMessages = page.props.flash ?? {};
    const locale = page.props.locale ?? 'zh-TW';

    const { toasts, showSuccess, showError, showInfo, showBatchErrors, dismissToast } = useToast();

    const normalizedLocale = locale.toLowerCase().replace('_', '-');
    const isTraditionalChinese = normalizedLocale.startsWith('zh');
    const fallbackLanguage: 'zh' | 'en' = isTraditionalChinese ? 'zh' : 'en';
    const localeForDate: 'zh-TW' | 'en' = isTraditionalChinese ? 'zh-TW' : 'en';

    const defaultPerPage = perPageOptions[0] ?? 15;
    const messageData = messages?.data ?? [];
    const paginationMeta = messages?.meta ?? {
        current_page: 1,
        last_page: 1,
        per_page: defaultPerPage,
        total: messageData.length,
        from: messageData.length > 0 ? 1 : 0,
        to: messageData.length,
    };

    const pagination: ContactPaginationMeta = {
        current_page: paginationMeta.current_page ?? 1,
        last_page: paginationMeta.last_page ?? 1,
        per_page: paginationMeta.per_page ?? defaultPerPage,
        total: paginationMeta.total ?? messageData.length,
        from: paginationMeta.from ?? (messageData.length > 0 ? 1 : 0),
        to: paginationMeta.to ?? messageData.length,
    };

    const paginationLinks = messages?.links ?? [];

    const [filterState, setFilterState] = useState<ContactFilterState>(createInitialFilterState(filters, defaultPerPage));
    const [processingId, setProcessingId] = useState<number | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const skipFlashToastRef = useRef(false);
    const previousFlashRef = useRef<ContactFlashMessages>({});

    const iconActionClass = useMemo(
        () =>
            'inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500/60',
        [],
    );

    const breadcrumbs: BreadcrumbItem[] = useMemo(
        () => [
            { title: fallbackLanguage === 'zh' ? '管理首頁' : 'Dashboard', href: '/manage/dashboard' },
            { title: fallbackLanguage === 'zh' ? '聯絡訊息管理' : 'Contact messages', href: '/manage/contact-messages' },
        ],
        [fallbackLanguage],
    );

    const statusOptionsList: ContactStatusOption[] = useMemo(() => {
        const fallbackLabels = contactStatusLabels;
        return Object.keys(statusOptions ?? {}).map((key) => {
            const statusKey = key as ContactMessageStatus;
            const label = fallbackLabels[statusKey]?.[fallbackLanguage] ?? statusKey;
            return { value: statusKey, label };
        });
    }, [statusOptions, fallbackLanguage]);

    const hasActiveFilters = useMemo(
        () => filterState.search !== '' || filterState.status !== '' || filterState.per_page !== String(defaultPerPage),
        [filterState, defaultPerPage],
    );

    const handleFilterChange = useCallback((key: keyof ContactFilterState, value: string) => {
        setFilterState((previous) => ({ ...previous, [key]: value }));
    }, []);

    const applyFilters = useCallback(
        (event?: FormEvent<HTMLFormElement>) => {
            event?.preventDefault();

            const params = Object.fromEntries(
                Object.entries(filterState).filter(([, value]) => value !== ''),
            );

            router.get('/manage/contact-messages', params, {
                preserveScroll: true,
                preserveState: true,
            });
        },
        [filterState],
    );

    const resetFilters = useCallback(() => {
        const initialState = createInitialFilterState({}, defaultPerPage);
        setFilterState(initialState);

        router.get(
            '/manage/contact-messages',
            { per_page: defaultPerPage },
            {
                preserveScroll: true,
                preserveState: true,
            },
        );
    }, [defaultPerPage]);

    const changePage = useCallback(
        (pageNumber: number) => {
            if (pageNumber <= 0 || pageNumber > pagination.last_page || pageNumber === pagination.current_page) {
                return;
            }

            const params = Object.fromEntries(
                Object.entries(filterState).filter(([, value]) => value !== ''),
            );

            params.page = pageNumber.toString();

            router.get('/manage/contact-messages', params, {
                preserveScroll: true,
                preserveState: true,
            });
        },
        [filterState, pagination],
    );

    const handleUpdateStatus = useCallback(
        (id: number, status: ContactMessageStatus) => {
            if (processingId !== null) {
                return;
            }

            setProcessingId(id);

            router.patch(`/manage/contact-messages/${id}`, { status }, {
                preserveScroll: true,
                onSuccess: () => {
                    skipFlashToastRef.current = true;
                    showSuccess(
                        fallbackLanguage === 'zh' ? '狀態更新成功' : 'Status updated',
                        fallbackLanguage === 'zh' ? '已更新聯絡訊息狀態。' : 'The contact message status has been updated.',
                    );
                },
                onError: (errors) => {
                    const errorMessages = Object.values(errors ?? {})
                        .flat()
                        .map((value) => String(value))
                        .filter((value) => value.length > 0);

                    const fallbackMessage =
                        fallbackLanguage === 'zh'
                            ? '狀態更新失敗，請稍後再試。'
                            : 'Failed to update status, please try again.';

                    showBatchErrors(errorMessages.length > 0 ? errorMessages : [fallbackMessage]);
                },
                onFinish: () => {
                    setProcessingId(null);
                },
            });
        },
        [processingId, showSuccess, showBatchErrors, fallbackLanguage],
    );

    const handleDelete = useCallback(
        (id: number) => {
            if (deletingId !== null) {
                return;
            }

            const confirmed = window.confirm(
                fallbackLanguage === 'zh'
                    ? '確定要刪除此聯絡訊息嗎？此操作無法復原。'
                    : 'Are you sure you want to delete this contact message? This action cannot be undone.',
            );

            if (!confirmed) {
                return;
            }

            setDeletingId(id);

            router.delete(`/manage/contact-messages/${id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    skipFlashToastRef.current = true;
                    showSuccess(
                        fallbackLanguage === 'zh' ? '刪除成功' : 'Deleted',
                        fallbackLanguage === 'zh' ? '聯絡訊息已刪除。' : 'The contact message has been deleted.',
                    );
                },
                onError: (errors) => {
                    const errorMessages = Object.values(errors ?? {})
                        .flat()
                        .map((value) => String(value))
                        .filter((value) => value.length > 0);

                    const fallbackMessage =
                        fallbackLanguage === 'zh'
                            ? '刪除失敗，請稍後再試。'
                            : 'Failed to delete, please try again later.';

                    showBatchErrors(errorMessages.length > 0 ? errorMessages : [fallbackMessage]);
                },
                onFinish: () => {
                    setDeletingId(null);
                },
            });
        },
        [deletingId, showSuccess, showBatchErrors, fallbackLanguage],
    );

    useEffect(() => {
        setFilterState(createInitialFilterState(filters, defaultPerPage));
    }, [filters, defaultPerPage]);

    useEffect(() => {
        if (skipFlashToastRef.current) {
            previousFlashRef.current = flashMessages;
            skipFlashToastRef.current = false;
            return;
        }

        if (flashMessages.success && flashMessages.success !== previousFlashRef.current.success) {
            showSuccess(fallbackLanguage === 'zh' ? '操作成功' : 'Success', flashMessages.success);
        }

        if (flashMessages.error && flashMessages.error !== previousFlashRef.current.error) {
            showError(fallbackLanguage === 'zh' ? '操作失敗' : 'Error', flashMessages.error);
        }

        if (flashMessages.info && flashMessages.info !== previousFlashRef.current.info) {
            showInfo(fallbackLanguage === 'zh' ? '提示' : 'Info', flashMessages.info);
        }

        previousFlashRef.current = flashMessages;
    }, [flashMessages, showSuccess, showError, showInfo, fallbackLanguage]);

    const pageTitle = fallbackLanguage === 'zh' ? '聯絡訊息管理' : 'Contact messages management';
    const pageDescription =
        fallbackLanguage === 'zh'
            ? '檢視與處理網站訪客透過聯絡我們表單送出的訊息，確保每則需求均獲妥善回覆。'
            : 'Review and process messages submitted from the contact form to ensure every request is handled properly.';

    return (
        <ManageLayout role="admin" breadcrumbs={breadcrumbs}>
            <Head title={pageTitle} />

            <ToastContainer toasts={toasts} onDismiss={dismissToast} position="bottom-right" />

            <section className="space-y-6">
                <ManagePageHeader
                    title={pageTitle}
                    description={pageDescription}
                />

                <ContactFilterForm
                    state={filterState}
                    statusOptions={statusOptionsList}
                    perPageOptions={perPageOptions}
                    onChange={handleFilterChange}
                    onSubmit={applyFilters}
                    onReset={resetFilters}
                    hasActiveFilters={hasActiveFilters}
                />

                <ContactTable
                    messages={messageData}
                    pagination={pagination}
                    paginationLinks={paginationLinks}
                    changePage={changePage}
                    iconActionClass={iconActionClass}
                    fallbackLanguage={fallbackLanguage}
                    localeForDate={localeForDate}
                    onUpdateStatus={handleUpdateStatus}
                    onDelete={handleDelete}
                    processingId={processingId}
                    deletingId={deletingId}
                />
            </section>
        </ManageLayout>
    );
}
