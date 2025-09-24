import { useMemo } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import ManageLayout from '@/layouts/manage/manage-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { BreadcrumbItem } from '@/types';
import { cn } from '@/lib/utils';
import { ArrowLeft, CheckCircle, Download, Mail, ShieldAlert } from 'lucide-react';

// 聯絡訊息狀態型別
type ContactMessageStatus = 'new' | 'in_progress' | 'resolved' | 'spam';

// 聯絡訊息詳細資料介面
interface ContactMessageDetail {
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
    created_at?: string | null;
    updated_at?: string | null;
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

interface ContactMessageShowProps {
    message: ContactMessageDetail;
}

// 狀態對應樣式
const STATUS_META: Record<ContactMessageStatus, { label: string; badgeClass: string; description: string }> = {
    new: {
        label: '新訊息',
        badgeClass: 'border-sky-200 bg-sky-50 text-sky-700',
        description: '尚未處理的最新訊息',
    },
    in_progress: {
        label: '處理中',
        badgeClass: 'border-amber-200 bg-amber-50 text-amber-700',
        description: '目前由管理員追蹤處理',
    },
    resolved: {
        label: '已處理',
        badgeClass: 'border-emerald-200 bg-emerald-50 text-emerald-700',
        description: '訊息已完成處理流程',
    },
    spam: {
        label: '垃圾訊息',
        badgeClass: 'border-rose-200 bg-rose-50 text-rose-700',
        description: '已被標記為垃圾訊息',
    },
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

export default function ContactMessageShow({ message }: ContactMessageShowProps) {
    const breadcrumbs: BreadcrumbItem[] = useMemo(
        () => [
            { title: '管理首頁', href: '/manage/dashboard' },
            { title: '聯絡訊息', href: '/manage/contact-messages' },
            { title: '訊息詳情', href: `/manage/contact-messages/${message.id}` },
        ],
        [message.id]
    );

    const statusMeta = STATUS_META[message.status];
    const processedUser = message.processor ?? message.processedBy ?? message.processed_by_user ?? null;

    // 標記為已處理
    const markAsResolved = () => {
        if (message.status === 'resolved') {
            return;
        }

        router.patch(`/manage/contact-messages/${message.id}/resolved`, {}, {
            preserveScroll: true,
        });
    };

    // 標記為垃圾訊息
    const markAsSpam = () => {
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

    return (
        <ManageLayout breadcrumbs={breadcrumbs} role="admin">
            <Head title={`聯絡訊息 - ${message.subject ?? message.name}`} />

            <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-4 rounded-xl bg-white p-6 shadow-sm ring-1 ring-black/5 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-neutral-900">聯絡訊息詳情</h1>
                        <p className="mt-1 text-sm text-neutral-500">檢視訪客提交的訊息內容與處理紀錄。</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <Button variant="outline" className="gap-2" asChild>
                            <Link href="/manage/contact-messages">
                                <ArrowLeft className="h-4 w-4" />
                                返回列表
                            </Link>
                        </Button>
                        <Button variant="outline" className="gap-2" asChild>
                            <Link href={`/manage/contact-messages/${message.id}/edit`}>
                                <Mail className="h-4 w-4" />
                                更新狀態
                            </Link>
                        </Button>
                        {message.status !== 'resolved' && (
                            <Button className="gap-2" onClick={markAsResolved}>
                                <CheckCircle className="h-4 w-4" />
                                標記為已處理
                            </Button>
                        )}
                        {message.status !== 'spam' && (
                            <Button variant="destructive" className="gap-2" onClick={markAsSpam}>
                                <ShieldAlert className="h-4 w-4" />
                                標記為垃圾
                            </Button>
                        )}
                    </div>
                </div>

                <Card className="bg-white">
                    <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="space-y-1">
                            <CardTitle className="text-xl text-neutral-900">訪客資訊</CardTitle>
                            <CardDescription>來源與聯絡方式</CardDescription>
                        </div>
                        <Badge variant="outline" className={cn('px-3 py-1 text-sm font-semibold', statusMeta.badgeClass)}>
                            {statusMeta.label}
                        </Badge>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <div className="text-sm text-neutral-500">姓名</div>
                                <div className="mt-1 text-base font-medium text-neutral-900">{message.name}</div>
                            </div>
                            <div>
                                <div className="text-sm text-neutral-500">Email</div>
                                <div className="mt-1 text-base font-medium text-neutral-900">{message.email}</div>
                            </div>
                            <div>
                                <div className="text-sm text-neutral-500">語系</div>
                                <div className="mt-1 text-base font-medium text-neutral-900">{message.locale ?? '未指定'}</div>
                            </div>
                            <div>
                                <div className="text-sm text-neutral-500">狀態說明</div>
                                <div className="mt-1 text-base text-neutral-700">{statusMeta.description}</div>
                            </div>
                        </div>

                        <Separator />

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <div className="text-sm text-neutral-500">建立時間</div>
                                <div className="mt-1 text-base text-neutral-900">{formatDateTime(message.created_at)}</div>
                            </div>
                            <div>
                                <div className="text-sm text-neutral-500">最後更新</div>
                                <div className="mt-1 text-base text-neutral-900">{formatDateTime(message.updated_at)}</div>
                            </div>
                            <div>
                                <div className="text-sm text-neutral-500">處理時間</div>
                                <div className="mt-1 text-base text-neutral-900">{formatDateTime(message.processed_at)}</div>
                            </div>
                            <div>
                                <div className="text-sm text-neutral-500">處理人員</div>
                                {processedUser ? (
                                    <div className="mt-1 text-base text-neutral-900">
                                        <div className="font-medium">{processedUser.name}</div>
                                        <div className="text-sm text-neutral-500">{processedUser.email}</div>
                                    </div>
                                ) : (
                                    <div className="mt-1 text-base text-neutral-500">尚未指定</div>
                                )}
                            </div>
                        </div>

                        {message.file_url && (
                            <div className="rounded-lg bg-slate-50 p-4 text-sm text-neutral-700">
                                <div className="font-medium text-neutral-900">附件</div>
                                <p className="mt-1 text-neutral-600">訪客於表單上傳的檔案，可供下載檢視。</p>
                                <Button asChild variant="outline" size="sm" className="mt-3 gap-2">
                                    <a href={message.file_url} target="_blank" rel="noopener noreferrer">
                                        <Download className="h-4 w-4" />
                                        下載附件
                                    </a>
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="bg-white">
                    <CardHeader>
                        <CardTitle className="text-xl text-neutral-900">訊息內容</CardTitle>
                        <CardDescription>訪客留下的詳細訊息</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-neutral-800">
                            <div className="text-sm text-neutral-500">主題</div>
                            <div className="mt-1 text-base font-medium text-neutral-900">
                                {message.subject ?? '（未填寫主題）'}
                            </div>
                            <Separator className="my-4" />
                            <div className="text-sm text-neutral-500">訊息內容</div>
                            <p className="mt-2 whitespace-pre-wrap text-base leading-relaxed text-neutral-800">
                                {message.message}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </ManageLayout>
    );
}
