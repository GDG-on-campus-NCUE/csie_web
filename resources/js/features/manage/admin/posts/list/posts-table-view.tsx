import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useTranslator } from '@/hooks/use-translator';
import { cn } from '@/lib/shared/utils';
import { formatDateTime } from '@/lib/shared/format';
import type { ManagePostListResponse } from '@/types/manage';
import { Link } from '@inertiajs/react';
import { Eye, FileText, Tag as TagIcon, Users } from 'lucide-react';
import type { ReactNode } from 'react';

export interface PostsTableViewProps {
    posts: ManagePostListResponse['data'];
    locale: string;
    statusLabelMap: Map<string, string>;
    selectedIds: number[];
    headerCheckboxState: boolean | 'indeterminate';
    onToggleSelectAll: (checked: boolean) => void;
    onToggleSelect: (postId: number, checked: boolean) => void;
    getStatusBadgeClass: (status: string) => string;
    getStatusIcon: (status: string) => ReactNode;
    visibilityToneMap: Record<string, string>;
    truncate: (value: string | null | undefined, length?: number) => string;
}

export default function PostsTableView({
    posts,
    locale,
    statusLabelMap,
    selectedIds,
    headerCheckboxState,
    onToggleSelectAll,
    onToggleSelect,
    getStatusBadgeClass,
    getStatusIcon,
    visibilityToneMap,
    truncate,
}: PostsTableViewProps) {
    const { t: tPosts } = useTranslator('manage.posts');

    return (
        <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow className="border-neutral-200/80">
                        <TableHead className="w-12 text-neutral-400">
                            <Checkbox
                                checked={headerCheckboxState}
                                onCheckedChange={(checked) => onToggleSelectAll(checked === true)}
                                aria-label={tPosts('table.select_all', '全選公告')}
                            />
                        </TableHead>
                        <TableHead className="w-[38%] text-neutral-500">
                            {tPosts('table.title', '標題與摘要')}
                        </TableHead>
                        <TableHead className="w-[20%] text-neutral-500">
                            {tPosts('table.status', '狀態')}
                        </TableHead>
                        <TableHead className="hidden w-[20%] text-neutral-500 lg:table-cell">
                            {tPosts('table.meta', '分類 / 空間')}
                        </TableHead>
                        <TableHead className="w-[22%] text-right text-neutral-500">
                            {tPosts('table.timestamps', '時間 / 負責人')}
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {posts.map((post) => {
                        const isSelected = selectedIds.includes(post.id);
                        const statusLabel =
                            statusLabelMap.get(post.status) ?? tPosts(`status.${post.status}`, post.status);
                        const visibilityLabel = tPosts(`visibility.${post.visibility}`, post.visibility);

                        return (
                            <TableRow
                                key={post.id}
                                className={cn(
                                    'border-neutral-200/60 transition-colors duration-150 hover:bg-blue-50/40',
                                    isSelected && 'bg-blue-50/70'
                                )}
                            >
                                <TableCell className="align-top">
                                    <Checkbox
                                        checked={isSelected}
                                        onCheckedChange={(checked) => onToggleSelect(post.id, checked === true)}
                                        aria-label={tPosts('table.select_post', '選取公告')}
                                    />
                                </TableCell>
                                <TableCell className="space-y-3 align-top">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex flex-col gap-1">
                                            <Link
                                                href={`/manage/admin/posts/${post.id}/edit`}
                                                className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                                            >
                                                {post.title}
                                            </Link>
                                            <p className="text-xs text-neutral-500">{truncate(post.excerpt ?? '', 140)}</p>
                                        </div>
                                        {post.attachments_count ? (
                                            <Badge
                                                variant="outline"
                                                className="inline-flex items-center gap-1 rounded-full border-blue-200 bg-blue-50 px-3 py-1 text-[11px] font-medium text-blue-700"
                                            >
                                                <FileText className="h-3.5 w-3.5" />
                                                {post.attachments_count}
                                            </Badge>
                                        ) : null}
                                    </div>
                                    {post.tags?.length ? (
                                        <div className="flex flex-wrap items-center gap-2">
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
                                </TableCell>
                                <TableCell className="space-y-2 align-top">
                                    <Badge
                                        variant="outline"
                                        className={cn(
                                            'inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium uppercase',
                                            getStatusBadgeClass(post.status)
                                        )}
                                    >
                                        {getStatusIcon(post.status)}
                                        {statusLabel}
                                    </Badge>
                                    <Badge
                                        variant="outline"
                                        className={cn(
                                            'inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[11px] font-medium uppercase',
                                            visibilityToneMap[post.visibility] ?? 'border-neutral-200 bg-neutral-100 text-neutral-600'
                                        )}
                                    >
                                        <Eye className="h-3.5 w-3.5" />
                                        {visibilityLabel}
                                    </Badge>
                                    {post.pinned ? (
                                        <Badge className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-[11px] font-medium text-amber-700">
                                            {tPosts('badges.pinned', '已置頂')}
                                        </Badge>
                                    ) : null}
                                </TableCell>
                                <TableCell className="hidden space-y-2 text-sm text-neutral-600 lg:table-cell">
                                    <div className="font-medium text-neutral-800">
                                        {post.category?.name ?? tPosts('table.uncategorized', '未分類')}
                                    </div>
                                    <div className="text-xs text-neutral-500">
                                        {post.space?.name ?? tPosts('table.no_space', '未綁定空間')}
                                    </div>
                                    <div className="text-xs text-neutral-400">
                                        {tPosts('table.views', '瀏覽數：:count', { count: post.views ?? 0 })}
                                    </div>
                                </TableCell>
                                <TableCell className="space-y-2 text-right text-xs text-neutral-500">
                                    <div className="flex flex-col items-end gap-1">
                                        <span className="font-medium text-neutral-700">
                                            {formatDateTime(post.published_at ?? post.created_at, locale) || '—'}
                                        </span>
                                        <span className="text-neutral-400">
                                            {formatDateTime(post.updated_at, locale) || ''}
                                        </span>
                                    </div>
                                    {post.author ? (
                                        <div className="flex items-center justify-end gap-1 text-neutral-500">
                                            <Users className="h-3.5 w-3.5" />
                                            <span>{post.author.name}</span>
                                        </div>
                                    ) : null}
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
}
