import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { useMemo } from 'react';

import TagForm, { type TagContextOption, type TagFormSubmitHandler, type TagResource } from '@/components/manage/tags/tag-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import ToastContainer from '@/components/ui/toast-container';
import ManageLayout from '@/layouts/manage/manage-layout';
import { useToast } from '@/hooks/use-toast';
import { useTranslator } from '@/hooks/use-translator';
import type { BreadcrumbItem } from '@/types';

interface EditableTag extends TagResource {
    id: number;
}

interface TagsEditPageProps {
    tag: EditableTag;
    contextOptions: TagContextOption[];
}

export default function TagsEditPage({ tag, contextOptions }: TagsEditPageProps) {
    const { t } = useTranslator('manage');
    const { toasts, dismissToast, showError } = useToast();

    const breadcrumbs = useMemo<BreadcrumbItem[]>(
        () => [
            { title: t('layout.breadcrumbs.dashboard', '管理首頁'), href: '/manage/dashboard' },
            { title: t('layout.breadcrumbs.tags', '標籤管理'), href: '/manage/tags' },
            { title: t('layout.breadcrumbs.tags_edit', '編輯標籤'), href: `/manage/tags/${tag.id}/edit` },
        ],
        [t, tag.id],
    );

    const pageTitle = t('tags.edit.title', '編輯標籤');
    const pageDescription = t('tags.edit.description', '調整標籤資訊以保持分類一致性。');
    const backToIndex = t('tags.edit.back_to_index', '返回標籤列表');

    // 更新時只顯示錯誤 Toast，成功會透過重新導向的列表頁顯示統一提示。
    const handleSubmit: TagFormSubmitHandler = (form) => {
        form.put(`/manage/tags/${tag.id}`, {
            preserveScroll: true,
            onError: (errors) => {
                const aggregated = Object.values(errors ?? {})
                    .flat()
                    .map((message) => String(message))
                    .filter((message) => message.trim().length > 0);

                const fallbackMessage = t('tags.edit.toast.error.description', '更新標籤時發生錯誤，請確認欄位內容。');

                showError(t('tags.edit.toast.error.title', '更新失敗'), aggregated[0] ?? fallbackMessage);
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

                <TagForm
                    tag={tag}
                    contextOptions={contextOptions}
                    submitLabel={t('tags.edit.submit', '儲存變更')}
                    cancelUrl="/manage/tags"
                    onSubmit={handleSubmit}
                />
            </section>
        </ManageLayout>
    );
}
