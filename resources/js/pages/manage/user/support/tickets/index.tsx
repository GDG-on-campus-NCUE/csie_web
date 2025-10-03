import AppLayout from '@/layouts/app-layout';
import ManagePage from '@/layouts/manage/manage-page';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { useTranslator } from '@/hooks/use-translator';
import type { BreadcrumbItem } from '@/types/shared';
import { Head, Link, router } from '@inertiajs/react';
import type { ReactElement } from 'react';
import { useState } from 'react';
import { Plus, Search, Ticket } from 'lucide-react';

interface SupportTicket {
    id: number;
    ticket_number: string;
    subject: string;
    category: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    status: 'open' | 'in_progress' | 'resolved' | 'closed';
    created_at: string;
    updated_at: string;
    replies_count: number;
}

interface Pagination {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface TicketsIndexPageProps {
    tickets: {
        data: SupportTicket[];
        pagination: Pagination;
    };
    filters: {
        search?: string;
        status?: string;
        priority?: string;
        category?: string;
    };
    [key: string]: unknown;
}

const statusConfig = {
    open: { label: '開啟', color: 'bg-blue-100 text-blue-800' },
    in_progress: { label: '處理中', color: 'bg-yellow-100 text-yellow-800' },
    resolved: { label: '已解決', color: 'bg-green-100 text-green-800' },
    closed: { label: '已關閉', color: 'bg-gray-100 text-gray-800' },
};

const priorityConfig = {
    low: { label: '低', color: 'bg-gray-100 text-gray-800' },
    medium: { label: '中', color: 'bg-blue-100 text-blue-800' },
    high: { label: '高', color: 'bg-orange-100 text-orange-800' },
    urgent: { label: '緊急', color: 'bg-red-100 text-red-800' },
};

export default function TicketsIndex({ tickets, filters }: TicketsIndexPageProps) {
    const { t } = useTranslator('manage');
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || 'all');
    const [priority, setPriority] = useState(filters.priority || 'all');

    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('layout.breadcrumbs.dashboard', '管理後台'), href: '/manage/user/dashboard' },
        { title: '支援工單', href: '/manage/user/support/tickets' },
    ];

    const handleFilter = () => {
        router.get(
            '/manage/user/support/tickets',
            {
                search: search || undefined,
                status: status !== 'all' ? status : undefined,
                priority: priority !== 'all' ? priority : undefined,
            },
            { preserveState: true }
        );
    };

    return (
        <>
            <Head title="支援工單" />
            <ManagePage
                title="支援工單"
                description="查看和管理您的支援請求"
                breadcrumbs={breadcrumbs}
                actions={
                    <Link href="/manage/user/support/tickets/create">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            建立工單
                        </Button>
                    </Link>
                }
            >
                {/* 篩選器 */}
                <Card className="mb-6">
                    <CardContent className="pt-6">
                        <div className="grid gap-4 md:grid-cols-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="搜尋工單..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
                                    className="pl-9"
                                />
                            </div>

                            <Select value={status} onChange={(e) => setStatus(e.target.value)}>
                                <option value="all">全部狀態</option>
                                <option value="open">開啟</option>
                                <option value="in_progress">處理中</option>
                                <option value="resolved">已解決</option>
                                <option value="closed">已關閉</option>
                            </Select>

                            <Select value={priority} onChange={(e) => setPriority(e.target.value)}>
                                <option value="all">全部優先順序</option>
                                <option value="low">低</option>
                                <option value="medium">中</option>
                                <option value="high">高</option>
                                <option value="urgent">緊急</option>
                            </Select>

                            <Button onClick={handleFilter} className="w-full">
                                套用篩選
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* 工單列表 */}
                <div className="space-y-4">
                    {tickets.data.length === 0 ? (
                        <Card>
                            <CardContent className="py-12 text-center">
                                <Ticket className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                                <p className="text-lg font-medium text-muted-foreground">
                                    尚無工單
                                </p>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    建立您的第一個支援工單
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        tickets.data.map((ticket) => (
                            <Link key={ticket.id} href={`/manage/user/support/tickets/${ticket.id}`}>
                                <Card className="transition-all hover:shadow-md">
                                    <CardContent className="p-6">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="mb-2 flex items-center gap-2">
                                                    <span className="font-mono text-sm text-muted-foreground">
                                                        {ticket.ticket_number}
                                                    </span>
                                                    <Badge className={statusConfig[ticket.status].color}>
                                                        {statusConfig[ticket.status].label}
                                                    </Badge>
                                                    <Badge className={priorityConfig[ticket.priority].color}>
                                                        {priorityConfig[ticket.priority].label}
                                                    </Badge>
                                                </div>
                                                <h3 className="mb-2 text-lg font-semibold">
                                                    {ticket.subject}
                                                </h3>
                                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                    <span>分類: {ticket.category}</span>
                                                    <span>回覆: {ticket.replies_count}</span>
                                                    <span>
                                                        更新時間:{' '}
                                                        {new Date(ticket.updated_at).toLocaleDateString(
                                                            'zh-TW'
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))
                    )}
                </div>

                {/* 分頁 */}
                {tickets.pagination.last_page > 1 && (
                    <div className="mt-6 flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                            顯示 {(tickets.pagination.current_page - 1) * tickets.pagination.per_page + 1} 到{' '}
                            {Math.min(
                                tickets.pagination.current_page * tickets.pagination.per_page,
                                tickets.pagination.total
                            )}{' '}
                            筆，共 {tickets.pagination.total} 筆
                        </div>
                        <div className="flex gap-2">
                            {Array.from({ length: tickets.pagination.last_page }, (_, i) => i + 1).map(
                                (page) => (
                                    <Button
                                        key={page}
                                        variant={
                                            page === tickets.pagination.current_page
                                                ? 'default'
                                                : 'outline'
                                        }
                                        size="sm"
                                        onClick={() => {
                                            router.get(
                                                '/manage/user/support/tickets',
                                                { ...filters, page },
                                                { preserveState: true }
                                            );
                                        }}
                                    >
                                        {page}
                                    </Button>
                                )
                            )}
                        </div>
                    </div>
                )}
            </ManagePage>
        </>
    );
}

TicketsIndex.layout = (page: ReactElement) => <AppLayout children={page} />;
