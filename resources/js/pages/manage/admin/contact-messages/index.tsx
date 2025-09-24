import { useEffect, useMemo, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import ManageLayout from '@/layouts/manage/manage-layout';
import { ManagePageHeader } from '@/components/manage/manage-page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Pagination from '@/components/ui/pagination';
import type { BreadcrumbItem } from '@/types';
import { cn } from '@/lib/utils';
import {
    CheckCircle,
    Eye,
    Pencil,
    RotateCcw,
    Search,
    ShieldAlert,
    Trash2,
} from 'lucide-react';

// 聯絡訊息狀態型別
type ContactMessageStatus = 'new' | 'in_progress' | 'resolved' | 'spam';

// 聯絡訊息資料介面
interface ContactMessage {
    id: number;
    locale?: string | null;
    name: string;
    email: string;
    subject?: string | null;
    message: string;
    file_url?: string | null;
    status: ContactMessageStatus;
    processed_by?: number | null;
    processed_at?: string | null;
    created_at?: string;
    updated_at?: string;
    processor?: {
        id: number;
        name: string;
        email: string;
    } | null;
    processedBy?: {
        id: number;
        name: string;
        email: string;
    } | null;
    processed_by_user?: {
        id: number;
        name: string;
        email: string;
    } | null;
}

// 分頁資訊介面
interface PaginationMeta {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
    links: PaginationLink[];
}

// 分頁連結介面
interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

// 篩選條件型別
interface FilterState {
    search: string;
    status: string;
    per_page: string;
}

// 頁面屬性
interface ContactMessagesIndexProps {
    messages: {
        data: ContactMessage[];
        meta?: Partial<PaginationMeta> & { links?: PaginationLink[] };
        links?: PaginationLink[];
    };
    filters?: Partial<Record<'search' | 'status' | 'per_page', string>>;
    statusOptions?: Record<ContactMessageStatus, string>;
    perPageOptions?: number[];
}

// 狀態對應資料
const STATUS_META: Record<ContactMessageStatus, { label: string; badgeClass: string }> = {
    new: { label: '新訊息', badgeClass: 'border-sky-200 bg-sky-50 text-sky-700' },
    in_progress: { label: '處理中', badgeClass: 'border-amber-200 bg-amber-50 text-amber-700' },
    resolved: { label: '已處理', badgeClass: 'border-emerald-200 bg-emerald-50 text-emerald-700' },
    spam: { label: '垃圾訊息', badgeClass: 'border-rose-200 bg-rose-50 text-rose-700' },
};

// 將篩選狀態轉換為查詢參數
const buildQueryFromFilters = (filters: FilterState) => {
    return Object.fromEntries(
        Object.entries(filters).filter(([, value]) => value !== '')
    );
};

// 轉換日期字串為易讀格式
const formatDateTime = (value?: string | null) => {
    if (!value) {
        return '—';
    }

    try {
        return new Date(value).toLocaleString('zh-TW', {
            dateStyle: 'medium',
            timeStyle: 'short',
        });
    } catch (error) {
        return value;
    }
};

export default function ContactMessagesIndex({
    messages,
    filters = {},
    statusOptions,
    perPageOptions,
}: ContactMessagesIndexProps) {
    // 麵包屑設定
    const breadcrumbs: BreadcrumbItem[] = useMemo(
        () => [
            { title: '管理首頁', href: '/manage/dashboard' },
            { title: '聯絡訊息', href: '/manage/contact-messages' },
        ],
        []
    );

    // 預設每頁筆數
    const resolvedPerPageOptions = perPageOptions && perPageOptions.length > 0
        ? perPageOptions
        : [15, 30, 50, 100, 200];
    const defaultPerPage = String(
        filters.per_page ??
            messages.meta?.per_page ??
            resolvedPerPageOptions[0] ??
            15
    );

    // 篩選狀態
    const [filterState, setFilterState] = useState<FilterState>({
        search: filters.search ?? '',
        status: filters.status ?? '',
        per_page: defaultPerPage,
    });

    // 當後端篩選資料更新時同步狀態
    useEffect(() => {
        setFilterState({
            search: filters.search ?? '',
            status: filters.status ?? '',
            per_page: String(
                filters.per_page ??
                    messages.meta?.per_page ??
                    resolvedPerPageOptions[0] ??
                    15
            ),
        });
    }, [
        filters.search,
        filters.status,
        filters.per_page,
        messages.meta?.per_page,
        resolvedPerPageOptions,
    ]);

    // 取得分頁資訊
    const paginationMeta: PaginationMeta = {
        current_page: messages.meta?.current_page ?? 1,
        last_page: messages.meta?.last_page ?? 1,
        per_page: messages.meta?.per_page ?? Number(filterState.per_page) ?? 15,
        total: messages.meta?.total ?? messages.data.length,
        from: messages.meta?.from ?? (messages.data.length > 0 ? 1 : 0),
        to: messages.meta?.to ?? messages.data.length,
        links: messages.meta?.links ?? messages.links ?? [],
    };

    // 套用篩選條件
    const applyFilters = (nextState: FilterState, options?: { replace?: boolean }) => {
        const query = buildQueryFromFilters(nextState);

        router.get('/manage/contact-messages', query, {
            preserveState: true,
            preserveScroll: true,
            replace: options?.replace ?? false,
        });
    };

    // 處理表單送出
    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        applyFilters(filterState);
    };

    // 重設篩選
    const handleReset = () => {
        const defaultState: FilterState = {
            search: '',
            status: '',
            per_page: String(resolvedPerPageOptions[0] ?? 15),
        };
        setFilterState(defaultState);
        applyFilters(defaultState, { replace: true });
    };

    // 狀態切換即時套用
    const handleStatusChange = (value: string) => {
        const nextState = { ...filterState, status: value };
        setFilterState(nextState);
        applyFilters(nextState);
    };

    // 每頁筆數變更
    const handlePerPageChange = (value: string | number) => {
        const stringValue = String(value);
        const nextState = { ...filterState, per_page: stringValue };
        setFilterState(nextState);
        applyFilters(nextState);
    };

    // 標記為已處理
    const handleMarkResolved = (message: ContactMessage) => {
        if (message.status === 'resolved') {
            return;
        }

        router.patch(`/manage/contact-messages/${message.id}/resolved`, {}, {
            preserveScroll: true,
        });
    };

    // 標記為垃圾訊息
    const handleMarkSpam = (message: ContactMessage) => {
        if (message.status === 'spam') {
            return;
        }

        if (!window.confirm('確定要將此訊息標記為垃圾訊息嗎？')) {
            return;
        }

        router.patch(`/manage/contact-messages/${message.id}/spam`, {}, {
            preserveScroll: true,
        });
    };

    // 刪除訊息
    const handleDelete = (message: ContactMessage) => {
        if (!window.confirm(`確定要刪除「${message.name}」的聯絡訊息嗎？`)) {
            return;
        }

        router.delete(`/manage/contact-messages/${message.id}`, {
            preserveScroll: true,
        });
    };

    // 取得處理人員
    const resolveProcessor = (message: ContactMessage) => {
        return message.processor ?? message.processedBy ?? message.processed_by_user ?? null;
    };

    const statusOptionEntries: Array<{ value: string; label: string }> = statusOptions
        ? Object.entries(statusOptions).map(([value, label]) => ({ value, label }))
        : [
            { value: 'new', label: STATUS_META.new.label },
            { value: 'in_progress', label: STATUS_META.in_progress.label },
            { value: 'resolved', label: STATUS_META.resolved.label },
            { value: 'spam', label: STATUS_META.spam.label },
        ];

    return (
        <ManageLayout breadcrumbs={breadcrumbs} role="admin">
            <Head title="聯絡訊息管理" />

            <Card className="bg-white">
                <CardHeader>
                    <CardTitle className="text-2xl text-gray-900">聯絡訊息管理</CardTitle>
                    <CardDescription>檢視來自網站聯絡表單的訊息並進行處理。</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-4">
                        <div className="md:col-span-2">
                            <label className="mb-2 block text-sm font-medium text-gray-700">搜尋</label>
                            <div className="relative">
                                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                <Input
                                    value={filterState.search}
                                    onChange={(event) => setFilterState((prev) => ({ ...prev, search: event.target.value }))}
                                    placeholder="輸入姓名、Email 或主題"
                                    className="pl-9"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">狀態</label>
                            <Select
                                value={filterState.status}
                                onChange={(event) => handleStatusChange(event.target.value)}
                            >
                                <option value="">全部狀態</option>
                                {statusOptionEntries.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {STATUS_META[option.value as ContactMessageStatus]?.label ?? option.label}
                                    </option>
                                ))}
                            </Select>
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">每頁筆數</label>
                            <Select
                                value={filterState.per_page}
                                onChange={(event) => handlePerPageChange(event.target.value)}
                            >
                                {resolvedPerPageOptions.map((option) => (
                                    <option key={option} value={option.toString()}>
                                        每頁 {option} 筆
                                    </option>
                                ))}
                            </Select>
                        </div>
                        <div className="flex gap-3 md:col-span-4">
                            <Button type="submit" className="flex items-center gap-2">
                                <Search className="h-4 w-4" />
                                套用篩選
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                className="flex items-center gap-2"
                                onClick={handleReset}
                            >
                                <RotateCcw className="h-4 w-4" />
                                重設條件
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-black/5">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-neutral-50/80">
                            <TableHead className="w-20">狀態</TableHead>
                            <TableHead>訪客資訊</TableHead>
                            <TableHead className="hidden md:table-cell">主題</TableHead>
                            <TableHead className="hidden lg:table-cell">處理人員</TableHead>
                            <TableHead className="w-48">建立時間</TableHead>
                            <TableHead className="w-64">操作</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {messages.data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="py-10 text-center text-sm text-neutral-500">
                                    目前沒有符合條件的聯絡訊息。
                                </TableCell>
                            </TableRow>
                        ) : (
                            messages.data.map((message) => {
                                const statusMeta = STATUS_META[message.status];
                                const processor = resolveProcessor(message);

                                return (
                                    <TableRow key={message.id} className="hover:bg-neutral-50/70">
                                        <TableCell>
                                            <Badge
                                                variant="outline"
                                                className={cn('px-3 py-1 text-xs font-semibold', statusMeta?.badgeClass)}
                                            >
                                                {statusMeta?.label ?? message.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col text-sm">
                                                <span className="font-medium text-neutral-900">{message.name}</span>
                                                <span className="text-neutral-500">{message.email}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell">
                                            <span className="text-sm text-neutral-700">
                                                {message.subject ?? '（未填寫主題）'}
                                            </span>
                                        </TableCell>
                                        <TableCell className="hidden lg:table-cell">
                                            {processor ? (
                                                <div className="flex flex-col text-sm">
                                                    <span className="text-neutral-900">{processor.name}</span>
                                                    <span className="text-neutral-500">{processor.email}</span>
                                                </div>
                                            ) : (
                                                <span className="text-sm text-neutral-400">尚未指定</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col text-sm text-neutral-600">
                                                <span>{formatDateTime(message.created_at)}</span>
                                                {message.processed_at && (
                                                    <span className="text-xs text-neutral-400">
                                                        更新：{formatDateTime(message.processed_at)}
                                                    </span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-2">
                                                <Button asChild size="sm" variant="outline" className="gap-1">
                                                    <Link href={`/manage/contact-messages/${message.id}`}>
                                                        <Eye className="h-4 w-4" />
                                                        檢視
                                                    </Link>
                                                </Button>
                                                <Button asChild size="sm" variant="outline" className="gap-1">
                                                    <Link href={`/manage/contact-messages/${message.id}/edit`}>
                                                        <Pencil className="h-4 w-4" />
                                                        編輯
                                                    </Link>
                                                </Button>
                                                {message.status !== 'resolved' && (
                                                    <Button
                                                        size="sm"
                                                        className="gap-1"
                                                        onClick={() => handleMarkResolved(message)}
                                                    >
                                                        <CheckCircle className="h-4 w-4" />
                                                        已處理
                                                    </Button>
                                                )}
                                                {message.status !== 'spam' && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="gap-1"
                                                        onClick={() => handleMarkSpam(message)}
                                                    >
                                                        <ShieldAlert className="h-4 w-4" />
                                                        垃圾
                                                    </Button>
                                                )}
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    className="gap-1"
                                                    onClick={() => handleDelete(message)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                    刪除
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>

            <Pagination
                meta={paginationMeta}
                perPageOptions={resolvedPerPageOptions}
                onPerPageChange={handlePerPageChange}
                className="rounded-xl bg-white px-6 py-4 shadow-sm ring-1 ring-black/5"
            />
        </ManageLayout>
    );
}
