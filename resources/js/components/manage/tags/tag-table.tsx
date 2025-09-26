import { useMemo } from 'react';
import { Link } from '@inertiajs/react';
import { Eye, Pen, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useTranslator } from '@/hooks/use-translator';

import type { TagContextOption } from './tag-form';
import type { TagListItem } from './tag-types';

interface TagTableProps {
    /** 標籤資料列 */
    tags: TagListItem[];
    /** 後端提供的管理場景選項，維持顯示順序 */
    contextOptions: TagContextOption[];
    /** 刪除操作的回呼，讓頁面層負責實際的刪除流程 */
    onDelete: (tag: TagListItem) => void;
}

/**
 * 將 ISO 時間字串依語系格式化，若沒有值則回傳破折號。
 */
const formatDate = (value: string | null | undefined, locale: 'zh-TW' | 'en') => {
    if (!value) {
        return '—';
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return '—';
    }

    return date.toLocaleString(locale === 'zh-TW' ? 'zh-TW' : 'en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
    });
};

export function TagTable({ tags, contextOptions, onDelete }: TagTableProps) {
    const { t, localeKey } = useTranslator('manage');

    // 依據 context 建立索引，確保呈現順序與後端一致。
    const contexts = useMemo(() => {
        const known = new Map(contextOptions.map((option) => [option.value, option.label] as const));
        const contextOrder: Array<{ value: string; label: string }> = contextOptions.map((option) => ({
            value: option.value,
            label: option.label,
        }));

        // 加入未定義於選項中的 context，避免資料遺漏。
        tags.forEach((tag) => {
            if (!known.has(tag.context)) {
                known.set(tag.context, tag.context_label ?? tag.context);
                contextOrder.push({ value: tag.context, label: tag.context_label ?? tag.context });
            }
        });

        return contextOrder;
    }, [contextOptions, tags]);

    const tagsByContext = useMemo(() => {
        const grouped = new Map<string, TagListItem[]>();
        tags.forEach((tag) => {
            const list = grouped.get(tag.context) ?? [];
            list.push(tag);
            grouped.set(tag.context, list);
        });
        return grouped;
    }, [tags]);

    if (tags.length === 0) {
        return (
            <Card className="border border-slate-200 bg-white shadow-sm">
                <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
                    <Badge variant="outline" className="rounded-full px-3 py-1 text-xs font-semibold text-slate-500">
                        {t('tags.table.empty.badge', '尚未建立標籤')}
                    </Badge>
                    <h2 className="text-2xl font-semibold text-slate-900">
                        {t('tags.table.empty.title', '目前沒有任何標籤資料')}
                    </h2>
                    <p className="max-w-md text-sm text-slate-600">
                        {t('tags.table.empty.description', '點擊右上角的「新增標籤」以建立第一筆資料，協助其他管理頁面完成分類。')}
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {contexts
                .map(({ value, label }) => {
                    const items = tagsByContext.get(value) ?? [];
                    return { value, label, items };
                })
                .filter((context) => context.items.length > 0)
                .map((context) => (
                    <Card key={context.value} className="border border-slate-200 bg-white shadow-sm">
                        <CardHeader className="border-b border-slate-100 pb-4">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <CardTitle className="text-lg font-semibold text-slate-900">{context.label}</CardTitle>
                                    <p className="text-sm text-slate-600">
                                        {t('tags.table.context.description', '共 :count 個標籤，依排序優先度由小到大排列。', {
                                            count: String(context.items.length),
                                        })}
                                    </p>
                                </div>
                                <Badge className="rounded-full bg-slate-100 text-slate-700">
                                    {t('tags.table.context.badge', 'Context：:context', { context: context.value })}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-slate-50/80">
                                        <TableHead className="w-[28%] px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-600">
                                            {t('tags.table.columns.name', '標籤名稱')}
                                        </TableHead>
                                        <TableHead className="w-[30%] px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-600">
                                            {t('tags.table.columns.description', '描述')}
                                        </TableHead>
                                        <TableHead className="w-[12%] px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-600">
                                            {t('tags.table.columns.sort_order', '排序')}
                                        </TableHead>
                                        <TableHead className="w-[18%] px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-600">
                                            {t('tags.table.columns.updated_at', '最後更新')}
                                        </TableHead>
                                        <TableHead className="w-[12%] px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">
                                            {t('tags.table.columns.actions', '操作')}
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {context.items.map((tag) => (
                                        <TableRow key={tag.id} className="border-slate-100">
                                            <TableCell className="px-6 py-4 align-top">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-sm font-semibold text-slate-900">{tag.name}</span>
                                                    <span className="text-xs text-slate-500">
                                                        {t('tags.table.row.slug', '網址代稱：:slug', { slug: tag.slug })}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-6 py-4 align-top text-sm text-slate-600">
                                                {tag.description && tag.description.trim() !== ''
                                                    ? tag.description
                                                    : t('tags.table.row.no_description', '未提供描述')}
                                            </TableCell>
                                            <TableCell className="px-6 py-4 align-top text-sm font-semibold text-slate-700">
                                                {tag.sort_order ?? 0}
                                            </TableCell>
                                            <TableCell className="px-6 py-4 align-top text-sm text-slate-600">
                                                {formatDate(tag.updated_at ?? tag.created_at, localeKey)}
                                            </TableCell>
                                            <TableCell className="px-6 py-4 align-top text-right text-sm">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        asChild
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-9 w-9 rounded-full text-slate-600 hover:text-slate-900"
                                                    >
                                                        <Link href={`/manage/tags/${tag.id}`} aria-label={t('tags.table.actions.view', '檢視標籤')}>
                                                            <Eye className="h-4 w-4" />
                                                            <span className="sr-only">{t('tags.table.actions.view', '檢視標籤')}</span>
                                                        </Link>
                                                    </Button>
                                                    <Button
                                                        asChild
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-9 w-9 rounded-full text-slate-600 hover:text-slate-900"
                                                    >
                                                        <Link href={`/manage/tags/${tag.id}/edit`} aria-label={t('tags.table.actions.edit', '編輯標籤')}>
                                                            <Pen className="h-4 w-4" />
                                                            <span className="sr-only">{t('tags.table.actions.edit', '編輯標籤')}</span>
                                                        </Link>
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-9 w-9 rounded-full text-red-500 hover:bg-red-50 hover:text-red-600"
                                                        onClick={() => onDelete(tag)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                        <span className="sr-only">{t('tags.table.actions.delete', '刪除標籤')}</span>
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                ))}
        </div>
    );
}

export default TagTable;
