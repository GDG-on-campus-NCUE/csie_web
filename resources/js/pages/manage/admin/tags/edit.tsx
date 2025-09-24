import { Head, Link } from '@inertiajs/react';
import ManageLayout from '@/layouts/manage/manage-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import TagForm, { TagContextOption, TagFormSubmitHandler, TagResource } from '@/components/manage/tags/tag-form';
import type { BreadcrumbItem } from '@/types';
import { useTranslator } from '@/hooks/use-translator';

interface TagEditProps {
    tag: TagResource & { id: number };
    contextOptions: TagContextOption[];
}

export default function EditTag({ tag, contextOptions }: TagEditProps) {
    const { t } = useTranslator('manage');

    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('layout.breadcrumbs.dashboard', '管理首頁'), href: '/manage/dashboard' },
        { title: t('layout.breadcrumbs.tags', '標籤管理'), href: '/manage/tags' },
        { title: t('layout.breadcrumbs.tags_edit', '編輯標籤'), href: `/manage/tags/${tag.id}/edit` },
    ];

    const pageTitle = t('tags.edit.header.title', '編輯標籤');
    const pageDescription = t('tags.edit.header.description', '更新標籤名稱、排序與用途描述。');
    const backToIndex = t('tags.edit.actions.back', '返回標籤列表');

    const handleSubmit: TagFormSubmitHandler = (form) => {
        form.put(`/manage/tags/${tag.id}`, { preserveScroll: true });
    };

    return (
        <ManageLayout role="admin" breadcrumbs={breadcrumbs}>
            <Head title={pageTitle} />

            <section className="mx-auto flex w-full max-w-4xl flex-col gap-6">
                <Card className="border border-slate-200 bg-white shadow-sm">
                    <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-2">
                            <h1 className="text-3xl font-semibold text-slate-900">{pageTitle}</h1>
                            <p className="text-sm text-slate-600">{pageDescription}</p>
                        </div>
                        <Button asChild variant="outline" className="rounded-full">
                            <Link href="/manage/tags" className="inline-flex items-center gap-2">
                                <ArrowLeft className="h-4 w-4" />
                                {backToIndex}
                            </Link>
                        </Button>
                    </CardContent>
                </Card>

                <TagForm
                    tag={tag}
                    contextOptions={contextOptions}
                    submitLabel={t('tags.form.actions.update', '更新標籤')}
                    cancelUrl="/manage/tags"
                    onSubmit={handleSubmit}
                />
            </section>
        </ManageLayout>
    );
}
