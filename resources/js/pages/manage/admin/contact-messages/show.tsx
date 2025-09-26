import { Head, Link, router, usePage } from '@inertiajs/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import ManageLayout from '@/layouts/manage/manage-layout';
import { ManagePageHeader } from '@/components/manage/manage-page-header';
import { ContactDetailCard } from '@/components/manage/contact/contact-detail-card';
import type {
    ContactFlashMessages,
    ContactMessageItem,
    ContactMessageStatus,
    ContactStatusOption,
} from '@/components/manage/contact/contact-types';
import { contactStatusLabels } from '@/components/manage/contact/contact-types';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import ToastContainer from '@/components/ui/toast-container';
import { useToast } from '@/hooks/use-toast';
import type { BreadcrumbItem, SharedData } from '@/types';

interface ContactMessageShowProps {
    message: ContactMessageItem;
    statusOptions?: Record<ContactMessageStatus, ContactMessageStatus>;
}

export default function ContactMessageShow({ message, statusOptions }: ContactMessageShowProps) {
    const page = usePage<SharedData & { flash?: ContactFlashMessages }>();
    const flashMessages: ContactFlashMessages = page.props.flash ?? {};
    const locale = page.props.locale ?? 'zh-TW';

    const { toasts, showSuccess, showError, showInfo, showBatchErrors, dismissToast } = useToast();

    const normalizedLocale = locale.toLowerCase().replace('_', '-');
    const isTraditionalChinese = normalizedLocale.startsWith('zh');
    const fallbackLanguage: 'zh' | 'en' = isTraditionalChinese ? 'zh' : 'en';
    const localeForDate: 'zh-TW' | 'en' = isTraditionalChinese ? 'zh-TW' : 'en';

    const [status, setStatus] = useState<ContactMessageStatus>(message.status);
    const [processing, setProcessing] = useState(false);

    const skipFlashToastRef = useRef(false);
    const previousFlashRef = useRef<ContactFlashMessages>({});

    const breadcrumbs: BreadcrumbItem[] = useMemo(
        () => [
            { title: fallbackLanguage === 'zh' ? '管理首頁' : 'Dashboard', href: '/manage/dashboard' },
            { title: fallbackLanguage === 'zh' ? '聯絡訊息管理' : 'Contact messages', href: '/manage/contact-messages' },
            { title: fallbackLanguage === 'zh' ? '訊息詳情' : 'Message detail', href: `/manage/contact-messages/${message.id}` },
        ],
        [fallbackLanguage, message.id],
    );

    const statusOptionsList: ContactStatusOption[] = useMemo(() => {
        const fallbackLabels = contactStatusLabels;
        const available = statusOptions ?? {
            new: 'new',
            in_progress: 'in_progress',
            resolved: 'resolved',
            spam: 'spam',
        };

        return Object.keys(available).map((key) => {
            const statusKey = key as ContactMessageStatus;
            const label = fallbackLabels[statusKey]?.[fallbackLanguage] ?? statusKey;
            return { value: statusKey, label };
        });
    }, [statusOptions, fallbackLanguage]);

    useEffect(() => {
        setStatus(message.status);
    }, [message.status]);

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

    const handleStatusSubmit = useCallback(() => {
        if (processing || status === message.status) {
            if (status === message.status) {
                showInfo(
                    fallbackLanguage === 'zh' ? '狀態未變更' : 'No changes',
                    fallbackLanguage === 'zh' ? '請選擇不同的狀態後再儲存。' : 'Select a different status before saving.',
                );
            }
            return;
        }

        setProcessing(true);

        router.patch(`/manage/contact-messages/${message.id}`, { status }, {
            preserveScroll: true,
            onSuccess: () => {
                skipFlashToastRef.current = true;
                showSuccess(
                    fallbackLanguage === 'zh' ? '狀態已更新' : 'Status updated',
                    fallbackLanguage === 'zh' ? '聯絡訊息狀態已更新。' : 'The contact message status has been updated.',
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
                        : 'Failed to update status, please try again later.';

                showBatchErrors(errorMessages.length > 0 ? errorMessages : [fallbackMessage]);
            },
            onFinish: () => setProcessing(false),
        });
    }, [processing, status, message.id, message.status, showSuccess, showInfo, showBatchErrors, fallbackLanguage]);

    const handleDelete = useCallback(() => {
        if (processing) {
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

        setProcessing(true);

        router.delete(`/manage/contact-messages/${message.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                skipFlashToastRef.current = true;
                showSuccess(
                    fallbackLanguage === 'zh' ? '刪除成功' : 'Deleted',
                    fallbackLanguage === 'zh' ? '已刪除此聯絡訊息。' : 'The contact message has been deleted.',
                );
                router.visit('/manage/contact-messages');
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
            onFinish: () => setProcessing(false),
        });
    }, [processing, message.id, showSuccess, showBatchErrors, fallbackLanguage]);

    const pageTitle = fallbackLanguage === 'zh' ? '聯絡訊息詳情' : 'Contact message detail';
    const pageDescription =
        fallbackLanguage === 'zh'
            ? '查看訪客填寫的聯絡內容與處理紀錄，並可更新狀態或刪除訊息。'
            : 'Review the submitted message, processing history, and update the status or delete the entry.';

    return (
        <ManageLayout role="admin" breadcrumbs={breadcrumbs}>
            <Head title={pageTitle} />

            <ToastContainer toasts={toasts} onDismiss={dismissToast} position="bottom-right" />

            <section className="space-y-6">
                <ManagePageHeader
                    title={pageTitle}
                    description={pageDescription}
                    actions={
                        <div className="flex flex-col gap-2 sm:flex-row">
                            <Button asChild variant="outline" className="rounded-full px-6">
                                <Link href="/manage/contact-messages">
                                    {fallbackLanguage === 'zh' ? '返回列表' : 'Back to list'}
                                </Link>
                            </Button>
                            <Button
                                type="button"
                                variant="destructive"
                                onClick={handleDelete}
                                disabled={processing}
                                className="rounded-full px-6"
                            >
                                {fallbackLanguage === 'zh' ? '刪除訊息' : 'Delete message'}
                            </Button>
                        </div>
                    }
                />

                <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
                    <ContactDetailCard message={message} fallbackLanguage={fallbackLanguage} localeForDate={localeForDate} />

                    <aside className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="space-y-2">
                            <h2 className="text-lg font-semibold text-slate-900">
                                {fallbackLanguage === 'zh' ? '更新狀態' : 'Update status'}
                            </h2>
                            <p className="text-sm text-slate-600">
                                {fallbackLanguage === 'zh'
                                    ? '選擇新的處理狀態後按下更新，系統會紀錄負責人與時間。'
                                    : 'Select a new status and update to log the processor and timestamp.'}
                            </p>
                        </div>

                        <div className="space-y-3">
                            <Select value={status} onChange={(event) => setStatus(event.target.value as ContactMessageStatus)}>
                                {statusOptionsList.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </Select>
                            <Button type="button" onClick={handleStatusSubmit} disabled={processing} className="w-full">
                                {fallbackLanguage === 'zh' ? '儲存狀態' : 'Save status'}
                            </Button>
                        </div>
                    </aside>
                </div>
            </section>
        </ManageLayout>
    );
}
