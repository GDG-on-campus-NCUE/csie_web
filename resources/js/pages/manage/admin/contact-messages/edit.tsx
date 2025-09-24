import { useMemo } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import ManageLayout from '@/layouts/manage/manage-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { BreadcrumbItem } from '@/types';
import { cn } from '@/lib/utils';
import { ArrowLeft, CheckCircle2, Loader2, Mail } from 'lucide-react';

// 聯絡訊息狀態型別
type ContactMessageStatus = 'new' | 'in_progress' | 'resolved' | 'spam';

// 聯絡訊息資料
interface ContactMessageRecord {
    id: number;
    locale?: string | null;
    name: string;
    email: string;
    subject?: string | null;
    message: string;
    file_url?: string | null;
    status: ContactMessageStatus;
    processed_at?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
}

interface ContactMessageEditProps {
    message: ContactMessageRecord;
}

// 狀態選項
const STATUS_OPTIONS: Array<{ value: ContactMessageStatus; label: string; badgeClass: string }> = [
    { value: 'new', label: '新訊息', badgeClass: 'border-sky-200 bg-sky-50 text-sky-700' },
    { value: 'in_progress', label: '處理中', badgeClass: 'border-amber-200 bg-amber-50 text-amber-700' },
    { value: 'resolved', label: '已處理', badgeClass: 'border-emerald-200 bg-emerald-50 text-emerald-700' },
    { value: 'spam', label: '垃圾訊息', badgeClass: 'border-rose-200 bg-rose-50 text-rose-700' },
];

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

export default function ContactMessageEdit({ message }: ContactMessageEditProps) {
    const breadcrumbs: BreadcrumbItem[] = useMemo(
        () => [
            { title: '管理首頁', href: '/manage/dashboard' },
            { title: '聯絡訊息', href: '/manage/contact-messages' },
            { title: '更新狀態', href: `/manage/contact-messages/${message.id}/edit` },
        ],
        [message.id]
    );

    const form = useForm({
        status: message.status as ContactMessageStatus,
    });

    // 送出更新
    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        form.put(`/manage/contact-messages/${message.id}`, {
            preserveScroll: true,
        });
    };

    const selectedMeta = STATUS_OPTIONS.find((option) => option.value === form.data.status) ?? STATUS_OPTIONS[0];

    return (
        <ManageLayout breadcrumbs={breadcrumbs} role="admin">
            <Head title="更新聯絡訊息狀態" />

            <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-4 rounded-xl bg-white p-6 shadow-sm ring-1 ring-black/5 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-neutral-900">更新聯絡訊息狀態</h1>
                        <p className="mt-1 text-sm text-neutral-500">調整訊息處理狀態，協助團隊追蹤進度。</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <Button variant="outline" className="gap-2" asChild>
                            <Link href={`/manage/contact-messages/${message.id}`}>
                                <ArrowLeft className="h-4 w-4" />
                                返回詳情
                            </Link>
                        </Button>
                        <Button variant="outline" className="gap-2" asChild>
                            <Link href="/manage/contact-messages">
                                <Mail className="h-4 w-4" />
                                回到列表
                            </Link>
                        </Button>
                    </div>
                </div>

                <Card className="bg-white">
                    <CardHeader>
                        <CardTitle className="text-xl text-neutral-900">狀態設定</CardTitle>
                        <CardDescription>選擇此訊息目前所處理階段。</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-neutral-700" htmlFor="status">
                                    處理狀態
                                </label>
                                <Select
                                    id="status"
                                    value={form.data.status}
                                    onChange={(event) => form.setData('status', event.target.value as ContactMessageStatus)}
                                    aria-invalid={Boolean(form.errors.status)}
                                >
                                    {STATUS_OPTIONS.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </Select>
                                {form.errors.status && (
                                    <p className="mt-2 text-sm text-red-500">{form.errors.status}</p>
                                )}
                            </div>

                            <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
                                <div className="text-sm text-neutral-500">目前狀態</div>
                                <div className="mt-2 flex items-center gap-3">
                                    <Badge variant="outline" className={cn('px-3 py-1 text-sm font-semibold', selectedMeta.badgeClass)}>
                                        {selectedMeta.label}
                                    </Badge>
                                    <span className="text-sm text-neutral-600">此訊息將以此狀態呈現在列表。</span>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3">
                                <Button type="button" variant="outline" onClick={() => router.visit(`/manage/contact-messages/${message.id}`)}>
                                    取消
                                </Button>
                                <Button type="submit" className="gap-2" disabled={form.processing}>
                                    {form.processing && <Loader2 className="h-4 w-4 animate-spin" />}
                                    <CheckCircle2 className="h-4 w-4" />
                                    儲存變更
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <Card className="bg-white">
                    <CardHeader>
                        <CardTitle className="text-xl text-neutral-900">訊息摘要</CardTitle>
                        <CardDescription>快速參考此訊息的重要資訊。</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm text-neutral-700">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <div className="text-neutral-500">訪客姓名</div>
                                <div className="mt-1 text-base font-medium text-neutral-900">{message.name}</div>
                            </div>
                            <div>
                                <div className="text-neutral-500">聯絡 Email</div>
                                <div className="mt-1 text-base font-medium text-neutral-900">{message.email}</div>
                            </div>
                            <div>
                                <div className="text-neutral-500">建立時間</div>
                                <div className="mt-1 text-base text-neutral-900">{formatDateTime(message.created_at)}</div>
                            </div>
                            <div>
                                <div className="text-neutral-500">最後更新</div>
                                <div className="mt-1 text-base text-neutral-900">{formatDateTime(message.updated_at)}</div>
                            </div>
                        </div>

                        <Separator />

                        <div>
                            <div className="text-neutral-500">主題</div>
                            <div className="mt-1 text-base font-medium text-neutral-900">
                                {message.subject ?? '（未填寫主題）'}
                            </div>
                        </div>
                        <div>
                            <div className="text-neutral-500">訊息內容</div>
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
