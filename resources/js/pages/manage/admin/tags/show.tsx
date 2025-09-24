import { Head, Link } from '@inertiajs/react';
import ManageLayout from '@/layouts/manage/manage-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pencil, ArrowLeft } from 'lucide-react';
import type { BreadcrumbItem } from '@/types';
import { useTranslator } from '@/hooks/use-translator';

interface TagDetail {
    id: number;
    context: string;
    context_label: string;
    name: string;
    slug: string;
    description?: string | null;
    sort_order: number;
    created_at?: string | null;
    updated_at?: string | null;
}

interface TagShowProps {
    tag: TagDetail;
}

export default function ShowTag({ tag }: TagShowProps) {
    const { t } = useTranslator('manage');

    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('layout.breadcrumbs.dashboard', '管理首頁'), href: '/manage/dashboard' },
        { title: t('layout.breadcrumbs.tags', '標籤管理'), href: '/manage/tags' },
        { title: t('layout.breadcrumbs.tags_show', '標籤詳情'), href: `/manage/tags/${tag.id}` },
    ];

    const pageTitle = t('tags.show.header.title', '標籤詳情');
    const pageDescription = t('tags.show.header.description', '檢視標籤的對應管理頁面與設定。');

    const formatDate = (value?: string | null) => {
        if (!value) {
            return '—';
        }
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) {
            return '—';
        }
        return date.toLocaleString();
    };

    return (
        <ManageLayout role="admin" breadcrumbs={breadcrumbs}>
            <Head title={`${pageTitle} - ${tag.name}`} />

            <section className="mx-auto flex w-full max-w-4xl flex-col gap-6">
                <Card className="border border-slate-200 bg-white shadow-sm">
                    <CardHeader className="border-b border-slate-100 pb-4">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <CardTitle className="text-3xl font-semibold text-slate-900">{tag.name}</CardTitle>
                                <p className="text-sm text-slate-600">{pageDescription}</p>
                            </div>
                            <div className="flex gap-2">
                                <Button asChild variant="outline" className="rounded-full">
                                    <Link href="/manage/tags" className="inline-flex items-center gap-2">
                                        <ArrowLeft className="h-4 w-4" />
                                        {t('tags.show.actions.back', '返回列表')}
                                    </Link>
                                </Button>
                                <Button asChild className="rounded-full">
                                    <Link href={`/manage/tags/${tag.id}/edit`} className="inline-flex items-center gap-2">
                                        <Pencil className="h-4 w-4" />
                                        {t('tags.show.actions.edit', '編輯標籤')}
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                        <div className="flex flex-wrap items-center gap-3">
                            <Badge variant="outline" className="text-xs font-medium">
                                {tag.context_label}
                            </Badge>
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                                #{tag.slug}
                            </span>
                        </div>

                        <dl className="grid gap-6 sm:grid-cols-2">
                            <div className="space-y-1">
                                <dt className="text-sm text-slate-500">{t('tags.show.fields.name', '標籤名稱')}</dt>
                                <dd className="text-base font-medium text-slate-900">{tag.name}</dd>
                            </div>
                            <div className="space-y-1">
                                <dt className="text-sm text-slate-500">{t('tags.show.fields.sort_order', '排序優先度')}</dt>
                                <dd className="text-base font-medium text-slate-900">{tag.sort_order}</dd>
                            </div>
                            <div className="space-y-1 sm:col-span-2">
                                <dt className="text-sm text-slate-500">{t('tags.show.fields.description', '描述')}</dt>
                                <dd className="text-base text-slate-700">
                                    {tag.description ? tag.description : t('tags.show.empty.description', '未提供描述')}
                                </dd>
                            </div>
                        </dl>

                        <div className="grid gap-6 sm:grid-cols-2">
                            <div className="space-y-1">
                                <dt className="text-sm text-slate-500">{t('tags.show.fields.created_at', '建立時間')}</dt>
                                <dd className="text-base text-slate-700">{formatDate(tag.created_at)}</dd>
                            </div>
                            <div className="space-y-1">
                                <dt className="text-sm text-slate-500">{t('tags.show.fields.updated_at', '最後更新')}</dt>
                                <dd className="text-base text-slate-700">{formatDate(tag.updated_at)}</dd>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </section>
        </ManageLayout>
    );
}
