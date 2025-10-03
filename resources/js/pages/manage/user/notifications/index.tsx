import AppLayout from '@/layouts/app-layout';
import ManagePage from '@/layouts/manage/manage-page';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTranslator } from '@/hooks/use-translator';
import type { BreadcrumbItem } from '@/types/shared';
import { Head, router } from '@inertiajs/react';
import type { ReactElement } from 'react';
import { Bell, Check, CheckCheck, Trash2, X, ExternalLink } from 'lucide-react';

interface Notification {
    id: string;
    type: string;
    data: {
        title?: string;
        message?: string;
        action_url?: string;
        priority?: 'low' | 'normal' | 'high' | 'urgent';
    };
    read_at: string | null;
    created_at: string;
}

interface Pagination {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface NotificationsIndexPageProps {
    notifications: {
        data: Notification[];
        pagination: Pagination;
    };
    unreadCount: number;
    [key: string]: unknown;
}

const priorityConfig = {
    low: { color: 'bg-gray-100 text-gray-800' },
    normal: { color: 'bg-blue-100 text-blue-800' },
    high: { color: 'bg-orange-100 text-orange-800' },
    urgent: { color: 'bg-red-100 text-red-800' },
};

const typeLabels: { [key: string]: string } = {
    'App\\Notifications\\PostPublishedNotification': '公告發布',
    'App\\Notifications\\SpaceSyncNotification': 'Space 同步',
    'App\\Notifications\\PermissionChangedNotification': '權限變更',
    'App\\Notifications\\SupportTicketNotification': '工單通知',
    'App\\Notifications\\SystemMaintenanceNotification': '系統維護',
};

export default function NotificationsIndex({
    notifications,
    unreadCount,
}: NotificationsIndexPageProps) {
    const { t } = useTranslator('manage');

    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('layout.breadcrumbs.dashboard', '管理後台'), href: '/manage/user/dashboard' },
        { title: '通知中心', href: '/manage/user/notifications' },
    ];

    const handleMarkAsRead = (id: string) => {
        router.post(`/manage/user/notifications/${id}/read`, {}, { preserveState: true });
    };

    const handleMarkAllAsRead = () => {
        if (confirm('確定要標記所有通知為已讀嗎？')) {
            router.post('/manage/user/notifications/read-all', {}, { preserveState: true });
        }
    };

    const handleDelete = (id: string) => {
        if (confirm('確定要刪除此通知嗎？')) {
            router.delete(`/manage/user/notifications/${id}`, { preserveState: true });
        }
    };

    const handleClearRead = () => {
        if (confirm('確定要清除所有已讀通知嗎？')) {
            router.delete('/manage/user/notifications/clear', { preserveState: true });
        }
    };

    const getTypeLabel = (type: string): string => {
        return typeLabels[type] || '系統通知';
    };

    return (
        <>
            <Head title="通知中心" />
            <ManagePage
                title="通知中心"
                description={`您有 ${unreadCount} 則未讀通知`}
                breadcrumbs={breadcrumbs}
                actions={
                    <div className="flex gap-2">
                        {unreadCount > 0 && (
                            <Button variant="outline" onClick={handleMarkAllAsRead}>
                                <CheckCheck className="mr-2 h-4 w-4" />
                                全部標記為已讀
                            </Button>
                        )}
                        <Button variant="outline" onClick={handleClearRead}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            清除已讀通知
                        </Button>
                    </div>
                }
            >
                {notifications.data.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <Bell className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                            <p className="text-lg font-medium text-muted-foreground">
                                目前沒有通知
                            </p>
                            <p className="mt-2 text-sm text-muted-foreground">
                                當有新的系統通知時，將會顯示在這裡
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-3">
                        {notifications.data.map((notification) => {
                            const isUnread = !notification.read_at;
                            const priority = notification.data.priority || 'normal';

                            return (
                                <Card
                                    key={notification.id}
                                    className={`transition-all ${
                                        isUnread
                                            ? 'border-l-4 border-l-primary bg-primary/5'
                                            : 'opacity-60'
                                    }`}
                                >
                                    <CardContent className="p-4">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="mb-2 flex items-center gap-2">
                                                    <Badge className="bg-blue-100 text-blue-800">
                                                        {getTypeLabel(notification.type)}
                                                    </Badge>
                                                    {priority !== 'normal' && (
                                                        <Badge
                                                            className={priorityConfig[priority].color}
                                                        >
                                                            {priority === 'urgent' && '緊急'}
                                                            {priority === 'high' && '重要'}
                                                            {priority === 'low' && '一般'}
                                                        </Badge>
                                                    )}
                                                    {isUnread && (
                                                        <Badge className="bg-red-100 text-red-800">
                                                            未讀
                                                        </Badge>
                                                    )}
                                                </div>

                                                <h3 className="mb-1 font-semibold">
                                                    {notification.data.title || '系統通知'}
                                                </h3>

                                                <p className="mb-2 text-sm text-muted-foreground">
                                                    {notification.data.message || ''}
                                                </p>

                                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                    <span>
                                                        {new Date(
                                                            notification.created_at
                                                        ).toLocaleString('zh-TW')}
                                                    </span>
                                                    {notification.data.action_url && (
                                                        <a
                                                            href={notification.data.action_url}
                                                            className="flex items-center gap-1 text-primary hover:underline"
                                                        >
                                                            查看詳情
                                                            <ExternalLink className="h-3 w-3" />
                                                        </a>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex gap-2">
                                                {isUnread && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() =>
                                                            handleMarkAsRead(notification.id)
                                                        }
                                                        title="標記為已讀"
                                                    >
                                                        <Check className="h-4 w-4" />
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(notification.id)}
                                                    title="刪除"
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}

                {/* 分頁 */}
                {notifications.pagination.last_page > 1 && (
                    <div className="mt-6 flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                            顯示{' '}
                            {(notifications.pagination.current_page - 1) *
                                notifications.pagination.per_page +
                                1}{' '}
                            到{' '}
                            {Math.min(
                                notifications.pagination.current_page *
                                    notifications.pagination.per_page,
                                notifications.pagination.total
                            )}{' '}
                            筆，共 {notifications.pagination.total} 筆
                        </div>
                        <div className="flex gap-2">
                            {Array.from(
                                { length: notifications.pagination.last_page },
                                (_, i) => i + 1
                            ).map((page) => (
                                <Button
                                    key={page}
                                    variant={
                                        page === notifications.pagination.current_page
                                            ? 'default'
                                            : 'outline'
                                    }
                                    size="sm"
                                    onClick={() => {
                                        router.get(
                                            '/manage/user/notifications',
                                            { page },
                                            { preserveState: true }
                                        );
                                    }}
                                >
                                    {page}
                                </Button>
                            ))}
                        </div>
                    </div>
                )}
            </ManagePage>
        </>
    );
}

NotificationsIndex.layout = (page: ReactElement) => <AppLayout children={page} />;
