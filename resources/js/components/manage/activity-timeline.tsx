import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/shared/utils';
import type { ManageActivityLogItem } from '@/types/manage/common';

interface ActivityTimelineProps {
    activities?: ManageActivityLogItem[] | null;
    emptyText?: string;
    locale?: string;
    className?: string;
}

/**
 * 活動時間線：用於顯示後台操作紀錄，最多呈現 20 筆。
 * 透過共用元件降低各頁面重複樣板，並以 badge 標示操作代碼。
 */
export default function ActivityTimeline({
    activities,
    emptyText = '目前沒有相關紀錄。',
    locale = 'zh-TW',
    className,
}: ActivityTimelineProps) {
    const list = (activities ?? []).slice(0, 20);

    if (list.length === 0) {
        return (
            <div className={cn('rounded-lg border border-dashed border-neutral-200/80 bg-neutral-50/80 p-4 text-sm text-neutral-500', className)}>
                {emptyText}
            </div>
        );
    }

    return (
        <ol className={cn('space-y-3', className)}>
            {list.map((activity) => {
                const timestamp = activity.created_at
                    ? new Date(activity.created_at).toLocaleString(locale)
                    : null;

                return (
                    <li key={String(activity.id)} className="flex items-start gap-3 rounded-lg border border-neutral-200/80 bg-white/90 p-3">
                        <Badge variant="outline" className="mt-0.5 text-[11px] uppercase tracking-wide text-neutral-600">
                            {activity.action}
                        </Badge>
                        <div className="flex flex-1 flex-col gap-1">
                            {/* 顯示操作描述，為空時仍保留 placeholder 確保排版穩定 */}
                            <p className="text-sm text-neutral-700">
                                {activity.description ?? '未提供描述'}
                            </p>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-400">
                                {timestamp ? <span>{timestamp}</span> : null}
                                {activity.properties ? (
                                    <>
                                        <span>•</span>
                                        {/* 將屬性輸出為精簡 JSON，方便除錯 */}
                                        <code className="max-w-[260px] overflow-hidden text-ellipsis whitespace-nowrap rounded bg-neutral-100 px-1.5 py-0.5 text-[11px] text-neutral-500">
                                            {JSON.stringify(activity.properties)}
                                        </code>
                                    </>
                                ) : null}
                            </div>
                        </div>
                    </li>
                );
            })}
        </ol>
    );
}
