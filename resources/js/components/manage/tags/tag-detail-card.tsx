import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTranslator } from '@/hooks/use-translator';
import type { TagDetail } from './tag-types';

interface TagDetailCardProps {
    /** 要呈現的標籤資料 */
    tag: TagDetail;
}

export function TagDetailCard({ tag }: TagDetailCardProps) {
    const { t, localeKey } = useTranslator('manage');

    const formatDate = (value: string | null | undefined) => {
        if (!value) {
            return t('tags.show.meta.not_available', '未提供');
        }

        const date = new Date(value);
        if (Number.isNaN(date.getTime())) {
            return t('tags.show.meta.not_available', '未提供');
        }

        return date.toLocaleString(localeKey === 'zh-TW' ? 'zh-TW' : 'en-US', {
            dateStyle: 'medium',
            timeStyle: 'short',
        });
    };

    return (
        <Card className="border border-slate-200 bg-white shadow-sm">
            <CardHeader className="border-b border-slate-100 pb-4">
                <div className="flex flex-col gap-3">
                    <Badge className="w-max rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                        {t('tags.show.context.badge', 'Context：:context', { context: tag.context })}
                    </Badge>
                    <CardTitle className="text-2xl font-semibold text-slate-900">{tag.name}</CardTitle>
                    <p className="text-sm text-slate-600">
                        {tag.description && tag.description.trim() !== ''
                            ? tag.description
                            : t('tags.show.description.empty', '尚未提供描述內容。')}
                    </p>
                </div>
            </CardHeader>
            <CardContent className="space-y-6 py-6">
                <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            {t('tags.show.fields.slug', '網址代稱')}
                        </p>
                        <p className="text-sm font-mono text-slate-800">{tag.slug}</p>
                    </div>
                    <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            {t('tags.show.fields.sort_order', '排序優先度')}
                        </p>
                        <p className="text-sm text-slate-800">{tag.sort_order ?? 0}</p>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="grid gap-4 border-t border-slate-100 bg-slate-50/70 px-6 py-4 text-sm text-slate-600 sm:grid-cols-2">
                <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        {t('tags.show.meta.created_at', '建立時間')}
                    </p>
                    <p>{formatDate(tag.created_at)}</p>
                </div>
                <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        {t('tags.show.meta.updated_at', '最後更新')}
                    </p>
                    <p>{formatDate(tag.updated_at)}</p>
                </div>
            </CardFooter>
        </Card>
    );
}

export default TagDetailCard;
