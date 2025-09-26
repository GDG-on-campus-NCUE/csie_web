import { Head, router, usePage } from '@inertiajs/react';
import { AlertTriangle, Plus, Tag as TagIcon } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef } from 'react';

import { ManagePageHeader } from '@/components/manage/manage-page-header';
import TagTable from '@/components/manage/tags/tag-table';
import type { TagContextOption } from '@/components/manage/tags/tag-form';
import type { TagFlashMessages, TagListItem } from '@/components/manage/tags/tag-types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import ToastContainer from '@/components/ui/toast-container';
import ManageLayout from '@/layouts/manage/manage-layout';
import { useToast } from '@/hooks/use-toast';
import { useTranslator } from '@/hooks/use-translator';
import type { BreadcrumbItem, SharedData } from '@/types';

interface TagsIndexPageProps {
    contextOptions: TagContextOption[];
    tags: TagListItem[];
    tableReady: boolean;
}

type PageProps = SharedData & { flash?: TagFlashMessages };

export default function TagsIndexPage({ contextOptions, tags, tableReady }: TagsIndexPageProps) {
    const page = usePage<PageProps>();
    const flash = page.props.flash ?? {};

    const { t } = useTranslator('manage');
    const { toasts, dismissToast, showSuccess, showError, showInfo, showWarning } = useToast();

    // 透過 ref 紀錄是否已由前端顯示 Toast，避免重複顯示後端 flash 訊息。
    const skipFlashToastRef = useRef(false);
    const previousFlashRef = useRef<TagFlashMessages>({});

    const breadcrumbs = useMemo<BreadcrumbItem[]>(
        () => [
            { title: t('layout.breadcrumbs.dashboard', '管理首頁'), href: '/manage/dashboard' },
            { title: t('layout.breadcrumbs.tags', '標籤管理'), href: '/manage/tags' },
        ],
        [t],
    );

    const pageTitle = t('tags.index.title', '標籤管理');
    const pageDescription = t(
        'tags.index.description',
        '維護公告、師資等各模組共用的標籤，協助建立一致的分類與篩選經驗。',
    );

    const createLabel = t('tags.index.actions.create', '新增標籤');

    // 若資料表尚未建立，於初次載入時即提醒使用者處理遷移。
    useEffect(() => {
        if (!tableReady) {
            showWarning(
                t('tags.index.toast.table_not_ready.title', '標籤資料表尚未建立'),
                t('tags.index.toast.table_not_ready.description', '請先執行資料庫遷移後再進行標籤管理。'),
            );
        }
    }, [tableReady, showWarning, t]);

    // 刪除流程需二次確認，並在成功或失敗時即時提示使用者。
    const handleDelete = useCallback(
        (tag: TagListItem) => {
            if (!tableReady) {
                showWarning(
                    t('tags.index.toast.table_not_ready.title', '標籤資料表尚未建立'),
                    t('tags.index.toast.table_not_ready.description', '請先執行資料庫遷移後再進行標籤管理。'),
                );
                return;
            }

            const confirmed = window.confirm(
                t('tags.index.confirm.delete', '確定要刪除標籤「:name」嗎？此操作無法復原。', { name: tag.name }),
            );

            if (!confirmed) {
                return;
            }

            router.delete(`/manage/tags/${tag.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    skipFlashToastRef.current = true;
                    showSuccess(
                        t('tags.index.toast.delete_success.title', '刪除成功'),
                        t('tags.index.toast.delete_success.description', '已刪除標籤「:name」。', { name: tag.name }),
                    );
                },
                onError: (errors) => {
                    skipFlashToastRef.current = true;
                    const aggregated = Object.values(errors ?? {})
                        .flat()
                        .map((message) => String(message))
                        .filter((message) => message.trim().length > 0);

                    const fallbackMessage = t(
                        'tags.index.toast.delete_error.description',
                        '刪除標籤時發生錯誤，請稍後再試。',
                    );

                    showError(
                        t('tags.index.toast.delete_error.title', '刪除失敗'),
                        aggregated[0] ?? fallbackMessage,
                    );
                },
            });
        },
        [tableReady, t, showWarning, showSuccess, showError],
    );

    useEffect(() => {
        if (skipFlashToastRef.current) {
            previousFlashRef.current = flash;
            skipFlashToastRef.current = false;
            return;
        }

        if (flash.success && flash.success !== previousFlashRef.current.success) {
            showSuccess(t('tags.index.toast.flash_success.title', '操作成功'), flash.success);
        }

        if (flash.error && flash.error !== previousFlashRef.current.error) {
            showError(t('tags.index.toast.flash_error.title', '操作失敗'), flash.error);
        }

        if (flash.info && flash.info !== previousFlashRef.current.info) {
            showInfo(t('tags.index.toast.flash_info.title', '系統訊息'), flash.info);
        }

        previousFlashRef.current = flash;
    }, [flash, showSuccess, showError, showInfo, t]);

    return (
        <ManageLayout role="admin" breadcrumbs={breadcrumbs}>
            <Head title={pageTitle} />

            <ToastContainer toasts={toasts} onDismiss={dismissToast} position="bottom-right" />

            <section className="space-y-6">
                <ManagePageHeader
                    badge={{ icon: <TagIcon className="h-4 w-4" />, label: t('tags.index.badge', '標籤總覽') }}
                    title={pageTitle}
                    description={pageDescription}
                    actions={
                        <Button
                            type="button"
                            className="rounded-full px-5"
                            disabled={!tableReady}
                            onClick={() => {
                                if (!tableReady) {
                                    showWarning(
                                        t('tags.index.toast.table_not_ready.title', '標籤資料表尚未建立'),
                                        t('tags.index.toast.table_not_ready.description', '請先執行資料庫遷移後再進行標籤管理。'),
                                    );
                                    return;
                                }

                                router.visit('/manage/tags/create');
                            }}
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            {createLabel}
                        </Button>
                    }
                />

                {!tableReady && (
                    <Alert className="border-amber-200 bg-amber-50 text-amber-900">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>{t('tags.index.alert.migration_needed.title', '請先執行資料庫遷移')}</AlertTitle>
                        <AlertDescription>
                            {t(
                                'tags.index.alert.migration_needed.description',
                                '系統偵測到標籤資料表尚未建立，請先執行 `php artisan migrate` 後重新整理此頁面。',
                            )}
                        </AlertDescription>
                    </Alert>
                )}

                <TagTable tags={tags} contextOptions={contextOptions} onDelete={handleDelete} />
            </section>
        </ManageLayout>
    );
}
