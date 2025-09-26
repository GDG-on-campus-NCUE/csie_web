import { Head, Link } from '@inertiajs/react';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import { useEffect, useMemo } from 'react';

import TagForm, { type TagContextOption, type TagFormSubmitHandler } from '@/components/manage/tags/tag-form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import ToastContainer from '@/components/ui/toast-container';
import ManageLayout from '@/layouts/manage/manage-layout';
import { useToast } from '@/hooks/use-toast';
import { useTranslator } from '@/hooks/use-translator';
import type { BreadcrumbItem } from '@/types';

interface TagsCreatePageProps {
    contextOptions: TagContextOption[];
    tableReady: boolean;
}

export default function TagsCreatePage({ contextOptions, tableReady }: TagsCreatePageProps) {
    const { t } = useTranslator('manage');
    const { toasts, dismissToast, showError, showWarning } = useToast();

    const breadcrumbs = useMemo<BreadcrumbItem[]>(
        () => [
            { title: t('layout.breadcrumbs.dashboard', '管理首頁'), href: '/manage/dashboard' },
            { title: t('layout.breadcrumbs.tags', '標籤管理'), href: '/manage/tags' },
            { title: t('layout.breadcrumbs.tags_create', '新增標籤'), href: '/manage/tags/create' },
        ],
        [t],
    );

    const pageTitle = t('tags.create.title', '新增標籤');
    const pageDescription = t('tags.create.description', '建立新的標籤以供公告或其他模組使用。');
    const backToIndex = t('tags.create.back_to_index', '返回標籤列表');

    // 頁面載入時檢查資料表狀態，若未就緒則立即提醒管理者先完成遷移。
    useEffect(() => {
        if (!tableReady) {
            showWarning(
                t('tags.index.toast.table_not_ready.title', '標籤資料表尚未建立'),
                t('tags.index.toast.table_not_ready.description', '請先執行資料庫遷移後再進行標籤管理。'),
            );
        }
    }, [tableReady, showWarning, t]);

    // 送出表單時再次驗證資料表狀態，避免在遷移未完成前誤送資料。
    const handleSubmit: TagFormSubmitHandler = (form) => {
        if (!tableReady) {
            showWarning(
                t('tags.index.toast.table_not_ready.title', '標籤資料表尚未建立'),
                t('tags.index.toast.table_not_ready.description', '請先執行資料庫遷移後再進行標籤管理。'),
            );
            return;
        }

        form.post('/manage/tags', {
            preserveScroll: true,
            onError: (errors) => {
                const aggregated = Object.values(errors ?? {})
                    .flat()
                    .map((message) => String(message))
                    .filter((message) => message.trim().length > 0);

                const fallbackMessage = t('tags.create.toast.error.description', '建立標籤時發生錯誤，請確認欄位內容。');

                showError(t('tags.create.toast.error.title', '建立失敗'), aggregated[0] ?? fallbackMessage);
            },
        });
    };

    return (
        <ManageLayout role="admin" breadcrumbs={breadcrumbs}>
            <Head title={pageTitle} />

            <ToastContainer toasts={toasts} onDismiss={dismissToast} position="bottom-right" />

            <section className="mx-auto flex w-full max-w-4xl flex-col gap-6">
                <Card className="border border-slate-200 bg-white shadow-sm">
                    <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-2">
                            <h1 className="text-3xl font-semibold text-slate-900">{pageTitle}</h1>
                            <p className="text-sm text-slate-600">{pageDescription}</p>
                        </div>
                        <Button asChild variant="outline" className="rounded-full">
                            <Link href="/manage/tags" className="inline-flex items-center gap-2" aria-label={backToIndex}>
                                <ArrowLeft className="h-4 w-4" />
                                {backToIndex}
                            </Link>
                        </Button>
                    </CardContent>
                </Card>

                {!tableReady && (
                    <Alert className="border-amber-200 bg-amber-50 text-amber-900">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>{t('tags.create.alert.migration_needed.title', '目前無法建立標籤')}</AlertTitle>
                        <AlertDescription>
                            {t(
                                'tags.create.alert.migration_needed.description',
                                '尚未建立標籤資料表，請先執行 `php artisan migrate` 後再重試。',
                            )}
                        </AlertDescription>
                    </Alert>
                )}

                <TagForm
                    contextOptions={contextOptions}
                    submitLabel={t('tags.create.submit', '建立標籤')}
                    cancelUrl="/manage/tags"
                    onSubmit={handleSubmit}
                />
            </section>
        </ManageLayout>
    );
}
