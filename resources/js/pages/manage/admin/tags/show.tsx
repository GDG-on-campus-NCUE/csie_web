import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft, PenLine, Tag as TagIcon } from 'lucide-react';
import { useEffect, useMemo, useRef } from 'react';

import { ManagePageHeader } from '@/components/manage/manage-page-header';
import TagDetailCard from '@/components/manage/tags/tag-detail-card';
import type { TagDetail, TagFlashMessages } from '@/components/manage/tags/tag-types';
import { Button } from '@/components/ui/button';
import ToastContainer from '@/components/ui/toast-container';
import ManageLayout from '@/layouts/manage/manage-layout';
import { useToast } from '@/hooks/use-toast';
import { useTranslator } from '@/hooks/use-translator';
import type { BreadcrumbItem, SharedData } from '@/types';

interface TagShowPageProps {
    tag: TagDetail;
}

type PageProps = SharedData & { flash?: TagFlashMessages };

export default function TagShowPage({ tag }: TagShowPageProps) {
    const page = usePage<PageProps>();
    const flash = page.props.flash ?? {};

    const { t } = useTranslator('manage');
    const { toasts, dismissToast, showSuccess, showError, showInfo } = useToast();

    const previousFlashRef = useRef<TagFlashMessages>({});

    const breadcrumbs = useMemo<BreadcrumbItem[]>(
        () => [
            { title: t('layout.breadcrumbs.dashboard', '管理首頁'), href: '/manage/dashboard' },
            { title: t('layout.breadcrumbs.tags', '標籤管理'), href: '/manage/tags' },
            { title: t('layout.breadcrumbs.tags_show', '標籤詳情'), href: `/manage/tags/${tag.id}` },
        ],
        [t, tag.id],
    );

    const pageTitle = t('tags.show.title', '標籤詳情');
    const pageDescription = t(
        'tags.show.description',
        '檢視標籤的詳細設定與建立時間，協助了解分類使用狀況。',
    );

    // 若後端帶有 flash 訊息，統一在此轉換為 Toast，避免資訊被忽略。
    useEffect(() => {
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
                    badge={{ icon: <TagIcon className="h-4 w-4" />, label: tag.context_label ?? tag.context }}
                    title={pageTitle}
                    description={pageDescription}
                    actions={
                        <div className="flex flex-col gap-2 sm:flex-row">
                            <Button asChild variant="outline" className="rounded-full">
                                <Link href="/manage/tags" className="inline-flex items-center gap-2">
                                    <ArrowLeft className="h-4 w-4" />
                                    {t('tags.show.actions.back', '返回列表')}
                                </Link>
                            </Button>
                            <Button asChild className="rounded-full">
                                <Link href={`/manage/tags/${tag.id}/edit`} className="inline-flex items-center gap-2">
                                    <PenLine className="h-4 w-4" />
                                    {t('tags.show.actions.edit', '編輯標籤')}
                                </Link>
                            </Button>
                        </div>
                    }
                />

                <TagDetailCard tag={tag} />
            </section>
        </ManageLayout>
    );
}
