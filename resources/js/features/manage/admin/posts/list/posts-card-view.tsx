import DataCard, { type DataCardStatusTone } from '@/components/manage/data-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useTranslator } from '@/hooks/use-translator';
import { cn } from '@/lib/shared/utils';
import { formatDateTime } from '@/lib/shared/format';
import type { ManagePostListResponse } from '@/types/manage';
import { Link } from '@inertiajs/react';
import { Building2, CalendarClock, Eye, FileText, Tag as TagIcon, Users } from 'lucide-react';
import type { ReactNode } from 'react';

export interface PostsCardViewProps {
    posts: ManagePostListResponse['data'];
    locale: string;
    statusLabelMap: Map<string, string>;
    selectedIds: number[];
    onToggleSelect: (postId: number, checked: boolean) => void;
    getStatusTone: (status: string) => DataCardStatusTone;
    getStatusIcon: (status: string) => ReactNode;
    visibilityToneMap: Record<string, string>;
    truncate: (value: string | null | undefined, length?: number) => string;
    abilities: {
        canBulkUpdate: boolean;
        canCreate: boolean;
    };
}

export default function PostsCardView({
    posts,
    locale,
    statusLabelMap,
    selectedIds,
    onToggleSelect,
    getStatusTone,
    getStatusIcon,
    visibilityToneMap,
    truncate,
    abilities,
}: PostsCardViewProps) {
    const { t: tPosts } = useTranslator('manage.posts');

    return (
        <div className="flex flex-col gap-4 px-4 pb-5 pt-4">
            {posts.map((post) => {
                const isSelected = selectedIds.includes(post.id);
                const statusLabel = statusLabelMap.get(post.status) ?? tPosts(`status.${post.status}`, post.status);
                const visibilityLabel = tPosts(`visibility.${post.visibility}`, post.visibility);
                const metadata = [
                    {
                        label: tPosts('table.published_at', '發佈'),
                        value: formatDateTime(post.published_at ?? post.created_at, locale) || '—',
                        icon: <CalendarClock className="h-3.5 w-3.5 text-neutral-400" />,
                    },
                    {
                        label: tPosts('table.views_short', '瀏覽數'),
                        value: post.views ?? 0,
                        icon: <Eye className="h-3.5 w-3.5 text-neutral-400" />,
                    },
                    {
                        label: tPosts('table.owner', '負責人'),
                        value: post.author?.name ?? tPosts('table.no_author', '未指定'),
                        icon: <Users className="h-3.5 w-3.5 text-neutral-400" />,
                    },
                ];

                const cardMobileActions = (
                    <>
                        {abilities.canBulkUpdate ? (
                            <div className="flex items-center justify-between rounded-lg border border-neutral-200 px-3 py-2">
                                <span className="text-sm text-neutral-600">
                                    {isSelected
                                        ? tPosts('bulk.selected_single', '已加入批次操作')
                                        : tPosts('bulk.select_prompt', '加入批次操作')}
                                </span>
                                <Checkbox
                                    checked={isSelected}
                                    onCheckedChange={(checked) => onToggleSelect(post.id, checked === true)}
                                    aria-label={tPosts('table.select_post', '選取公告')}
                                />
                            </div>
                        ) : null}
                        <Button type="button" variant="tonal" className="w-full justify-center gap-2" asChild>
                            <Link href={`/manage/admin/posts/${post.id}/edit`}>
                                <FileText className="h-4 w-4" />
                                {tPosts('actions.edit', '編輯公告')}
                            </Link>
                        </Button>
                    </>
                );

                return (
                    <DataCard
                        key={post.id}
                        title={post.title}
                        description={truncate(post.excerpt ?? '', 140)}
                        status={{
                            label: statusLabel,
                            tone: getStatusTone(post.status),
                            icon: getStatusIcon(post.status),
                        }}
                        metadata={metadata}
                        mobileActions={cardMobileActions}
                        className={cn(isSelected && 'border-blue-200 shadow-md ring-2 ring-blue-200/70')}
                    >
                        <div className="flex flex-wrap items-center gap-2">
                            <Badge
                                variant="outline"
                                className="inline-flex items-center gap-1 rounded-full border-neutral-200 bg-neutral-50 px-2.5 py-1 text-[11px] text-neutral-600"
                            >
                                <TagIcon className="h-3 w-3 text-neutral-400" />
                                {post.category?.name ?? tPosts('table.uncategorized', '未分類')}
                            </Badge>
                            <Badge
                                variant="outline"
                                className="inline-flex items-center gap-1 rounded-full border-neutral-200 bg-neutral-50 px-2.5 py-1 text-[11px] text-neutral-600"
                            >
                                <Building2 className="h-3 w-3 text-neutral-400" />
                                {post.space?.name ?? tPosts('table.no_space', '未綁定空間')}
                            </Badge>
                            <Badge
                                variant="outline"
                                className={cn(
                                    'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium uppercase',
                                    visibilityToneMap[post.visibility] ?? 'border-neutral-200 bg-neutral-100 text-neutral-600'
                                )}
                            >
                                <Eye className="h-3 w-3" />
                                {visibilityLabel}
                            </Badge>
                            {post.pinned ? (
                                <Badge className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-medium text-amber-700">
                                    {tPosts('badges.pinned', '已置頂')}
                                </Badge>
                            ) : null}
                            {post.attachments_count ? (
                                <Badge
                                    variant="outline"
                                    className="inline-flex items-center gap-1 rounded-full border-blue-200 bg-blue-50 px-2.5 py-1 text-[11px] text-blue-700"
                                >
                                    <FileText className="h-3 w-3" />
                                    {post.attachments_count}
                                </Badge>
                            ) : null}
                        </div>
                        {post.tags?.length ? (
                            <div className="flex flex-wrap gap-2 pt-2">
                                {post.tags.map((tag) => (
                                    <Badge
                                        key={tag.id ?? tag.name}
                                        variant="outline"
                                        className="inline-flex items-center gap-1 rounded-full border-neutral-200 bg-neutral-50 px-2.5 py-1 text-[11px] text-neutral-600"
                                    >
                                        <TagIcon className="h-3 w-3 text-neutral-400" />
                                        {tag.name}
                                    </Badge>
                                ))}
                            </div>
                        ) : null}
                    </DataCard>
                );
            })}
        </div>
    );
}
