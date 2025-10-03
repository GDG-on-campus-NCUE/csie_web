import AppLayout from '@/layouts/app-layout';
import ManagePage from '@/layouts/manage/manage-page';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useTranslator } from '@/hooks/use-translator';
import type { BreadcrumbItem } from '@/types/shared';
import { Head, Link, useForm } from '@inertiajs/react';
import type { ReactElement } from 'react';
import { MessageCircle, Clock, User, CheckCircle } from 'lucide-react';

interface SupportTicketReply {
    id: number;
    user: {
        id: number;
        name: string;
    };
    message: string;
    is_staff: boolean;
    created_at: string;
}

interface SupportTicket {
    id: number;
    ticket_number: string;
    subject: string;
    category: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    status: 'open' | 'in_progress' | 'resolved' | 'closed';
    message: string;
    created_at: string;
    updated_at: string;
    user: {
        id: number;
        name: string;
    };
    replies: SupportTicketReply[];
    can_reply: boolean;
}

interface TicketShowPageProps {
    ticket: SupportTicket;
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

export default function TicketShow({ ticket }: TicketShowPageProps) {
    const { t } = useTranslator('manage');

    const { data, setData, post, processing, errors, reset } = useForm({
        message: '',
    });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('layout.breadcrumbs.dashboard', '管理後台'), href: '/manage/user/dashboard' },
        { title: '支援工單', href: '/manage/user/support/tickets' },
        { title: ticket.ticket_number, href: `/manage/user/support/tickets/${ticket.id}` },
    ];

    const handleReply = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/manage/user/support/tickets/${ticket.id}/reply`, {
            onSuccess: () => {
                reset('message');
            },
        });
    };

    const handleClose = () => {
        if (confirm('確定要關閉此工單嗎？關閉後將無法再回覆。')) {
            post(`/manage/user/support/tickets/${ticket.id}/close`);
        }
    };

    return (
        <>
            <Head title={`工單 ${ticket.ticket_number}`} />
            <ManagePage
                title={ticket.subject}
                description={`工單編號：${ticket.ticket_number}`}
                breadcrumbs={breadcrumbs}
                actions={
                    <div className="flex gap-2">
                        {ticket.status !== 'closed' && (
                            <Button variant="outline" onClick={handleClose}>
                                關閉工單
                            </Button>
                        )}
                        <Link href="/manage/user/support/tickets">
                            <Button variant="outline">返回列表</Button>
                        </Link>
                    </div>
                }
            >
                {/* 工單資訊 */}
                <Card className="mb-6">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>工單資訊</CardTitle>
                            <div className="flex gap-2">
                                <Badge className={statusConfig[ticket.status].color}>
                                    {statusConfig[ticket.status].label}
                                </Badge>
                                <Badge className={priorityConfig[ticket.priority].color}>
                                    {priorityConfig[ticket.priority].label}
                                </Badge>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <p className="text-sm text-muted-foreground">工單編號</p>
                                <p className="font-mono font-medium">{ticket.ticket_number}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">分類</p>
                                <p className="font-medium">{ticket.category}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">建立者</p>
                                <p className="font-medium">{ticket.user.name}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">建立時間</p>
                                <p className="font-medium">
                                    {new Date(ticket.created_at).toLocaleString('zh-TW')}
                                </p>
                            </div>
                        </div>

                        <div>
                            <p className="mb-2 text-sm text-muted-foreground">問題描述</p>
                            <div className="rounded-md bg-muted p-4">
                                <p className="whitespace-pre-wrap">{ticket.message}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* 回覆記錄 */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MessageCircle className="h-5 w-5" />
                            回覆記錄 ({ticket.replies.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {ticket.replies.length === 0 ? (
                            <div className="py-8 text-center text-muted-foreground">
                                尚無回覆記錄
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {ticket.replies.map((reply) => (
                                    <div
                                        key={reply.id}
                                        className={`rounded-lg border p-4 ${
                                            reply.is_staff
                                                ? 'border-blue-200 bg-blue-50'
                                                : 'bg-white'
                                        }`}
                                    >
                                        <div className="mb-2 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <User className="h-4 w-4" />
                                                <span className="font-medium">{reply.user.name}</span>
                                                {reply.is_staff && (
                                                    <Badge className="bg-blue-100 text-blue-800">
                                                        客服人員
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                <Clock className="h-3 w-3" />
                                                {new Date(reply.created_at).toLocaleString('zh-TW')}
                                            </div>
                                        </div>
                                        <p className="whitespace-pre-wrap text-sm">
                                            {reply.message}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* 新增回覆 */}
                {ticket.can_reply ? (
                    <Card>
                        <CardHeader>
                            <CardTitle>新增回覆</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleReply} className="space-y-4">
                                <div>
                                    <Label htmlFor="message">回覆內容 *</Label>
                                    <Textarea
                                        id="message"
                                        rows={6}
                                        value={data.message}
                                        onChange={(e) => setData('message', e.target.value)}
                                        placeholder="請輸入您的回覆..."
                                    />
                                    {errors.message && (
                                        <p className="mt-1 text-sm text-red-600">{errors.message}</p>
                                    )}
                                </div>

                                <div className="flex justify-end gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => reset('message')}
                                    >
                                        清除
                                    </Button>
                                    <Button type="submit" disabled={processing}>
                                        {processing ? '送出中...' : '送出回覆'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                ) : (
                    <Card>
                        <CardContent className="py-8 text-center">
                            <CheckCircle className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                            <p className="text-lg font-medium text-muted-foreground">
                                此工單已關閉，無法新增回覆
                            </p>
                        </CardContent>
                    </Card>
                )}
            </ManagePage>
        </>
    );
}

TicketShow.layout = (page: ReactElement) => <AppLayout children={page} />;
