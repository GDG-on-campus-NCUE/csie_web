import { Head, Link, router } from '@inertiajs/react';
import ManageLayout from '@/layouts/manage/manage-layout';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Pencil, Trash2, AlertTriangle } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { BreadcrumbItem } from '@/types';
import type { TagContextOption, TagResource } from '@/components/manage/tags/tag-form';
import { useTranslator } from '@/hooks/use-translator';

interface TagListItem extends TagResource {
    context_label: string;
    created_at?: string | null;
    updated_at?: string | null;
}

interface TagsIndexProps {
    tags: TagListItem[];
    contextOptions: TagContextOption[];
    tableReady: boolean;
}

export default function TagsIndex({ tags, contextOptions, tableReady }: TagsIndexProps) {
    const { t } = useTranslator('manage');
    const [filter, setFilter] = useState<string>('all');

    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('layout.breadcrumbs.dashboard', '管理首頁'), href: '/manage/dashboard' },
        { title: t('layout.breadcrumbs.tags', '標籤管理'), href: '/manage/tags' },
    ];

    const filterOptions = useMemo(
        () => [
            { value: 'all', label: t('tags.index.filters.all', '全部管理頁面') },
            ...contextOptions.map((option) => ({ value: option.value, label: option.label })),
        ],
        [contextOptions, t]
    );

    const filteredTags = useMemo(() => {
        if (!tableReady) {
            return [];
        }

        if (filter === 'all') {
            return tags;
        }

        return tags.filter((tag) => tag.context === filter);
    }, [filter, tableReady, tags]);

    const pageTitle = t('tags.index.header.title', '標籤管理');
    const pageDescription = t('tags.index.header.description', '統一管理各後台模組可用的標籤。');
    const migrationHint = t(
        'tags.index.alert.missing_table',
        '標籤資料表尚未建立，請執行資料庫遷移（php artisan migrate）後重新整理此頁面。'
    );

    const handleDelete = (tag: TagListItem) => {
        if (!tableReady) {
            return;
        }

        const message = t('tags.index.actions.delete_confirm', '確定要刪除此標籤嗎？');
        if (confirm(message)) {
            router.delete(`/manage/tags/${tag.id}`);
        }
    };

    return (
        <ManageLayout role="admin" breadcrumbs={breadcrumbs}>
            <Head title={pageTitle} />

            <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
                <Card className="border border-slate-200 bg-white shadow-sm">
                    <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-2">
                            <h1 className="text-3xl font-semibold text-slate-900">{pageTitle}</h1>
                            <p className="text-sm text-slate-600">{pageDescription}</p>
                        </div>
                        {tableReady ? (
                            <Button asChild className="rounded-full">
                                <Link href="/manage/tags/create" className="inline-flex items-center gap-2">
                                    <Plus className="h-4 w-4" />
                                    {t('tags.index.actions.create', '新增標籤')}
                                </Link>
                            </Button>
                        ) : (
                            <Button className="rounded-full" disabled>
                                <Plus className="h-4 w-4" />
                                {t('tags.index.actions.create', '新增標籤')}
                            </Button>
                        )}
                    </CardContent>
                </Card>

                <Card className="border border-slate-200 bg-white shadow-sm">
                    <CardHeader className="border-b border-slate-100 pb-4">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <CardTitle className="text-xl font-semibold text-slate-900">
                                {t('tags.index.table.title', '標籤列表')}
                            </CardTitle>
                            <div className="flex items-center gap-3">
                                <label htmlFor="tag-context-filter" className="text-sm text-slate-600">
                                    {t('tags.index.filters.context', '篩選管理頁面：')}
                                </label>
                                <Select
                                    id="tag-context-filter"
                                    value={filter}
                                    onChange={(event) => setFilter(event.target.value)}
                                    disabled={!tableReady}
                                >
                                    {filterOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </Select>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {!tableReady ? (
                            <div className="px-6 py-10">
                                <Alert className="border-amber-200 bg-amber-50 text-amber-900">
                                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                                    <AlertDescription>{migrationHint}</AlertDescription>
                                </Alert>
                            </div>
                        ) : filteredTags.length === 0 ? (
                            <div className="flex flex-col items-center justify-center gap-3 py-12 text-center text-slate-500">
                                <p className="text-base font-medium">
                                    {t('tags.index.empty.title', '目前尚未建立標籤')}
                                </p>
                                <p className="max-w-md text-sm text-slate-500">
                                    {t('tags.index.empty.description', '建立標籤後，即可在公告或其他管理頁面快速套用。')}
                                </p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-48">
                                            {t('tags.index.table.headers.context', '管理頁面')}
                                        </TableHead>
                                        <TableHead>{t('tags.index.table.headers.name', '標籤名稱')}</TableHead>
                                        <TableHead>{t('tags.index.table.headers.slug', '網址代稱')}</TableHead>
                                        <TableHead className="w-24 text-right">
                                            {t('tags.index.table.headers.sort_order', '排序')}
                                        </TableHead>
                                        <TableHead>{t('tags.index.table.headers.description', '描述')}</TableHead>
                                        <TableHead className="w-32 text-right">
                                            {t('tags.index.table.headers.actions', '操作')}
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredTags.map((tag) => (
                                        <TableRow key={tag.id}>
                                            <TableCell>
                                                <Badge variant="outline" className="text-xs font-medium">
                                                    {tag.context_label}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="font-medium text-slate-900">{tag.name}</TableCell>
                                            <TableCell className="text-slate-600">{tag.slug}</TableCell>
                                            <TableCell className="text-right text-slate-600">
                                                {tag.sort_order ?? 0}
                                            </TableCell>
                                            <TableCell className="text-slate-600">
                                                {tag.description ? tag.description : t('tags.index.table.empty_description', '—')}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center justify-end gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        asChild
                                                        className="text-slate-600 hover:text-slate-900"
                                                        aria-label={t('tags.index.actions.edit', '編輯標籤')}
                                                    >
                                                        <Link href={`/manage/tags/${tag.id}/edit`}>
                                                            <Pencil className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-slate-600 hover:text-red-600"
                                                        onClick={() => handleDelete(tag)}
                                                        aria-label={t('tags.index.actions.delete', '刪除標籤')}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </section>
        </ManageLayout>
    );
}
