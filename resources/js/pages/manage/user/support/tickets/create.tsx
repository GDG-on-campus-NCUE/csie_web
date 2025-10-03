import AppLayout from '@/layouts/app-layout';
import ManagePage from '@/layouts/manage/manage-page';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { useTranslator } from '@/hooks/use-translator';
import type { BreadcrumbItem } from '@/types/shared';
import { Head, useForm } from '@inertiajs/react';
import type { ReactElement } from 'react';

interface CreateTicketPageProps {
    [key: string]: unknown;
}

export default function CreateTicket({}: CreateTicketPageProps) {
    const { t } = useTranslator('manage');

    const { data, setData, post, processing, errors } = useForm({
        subject: '',
        category: 'technical',
        priority: 'medium',
        message: '',
    });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('layout.breadcrumbs.dashboard', '管理後台'), href: '/manage/user/dashboard' },
        { title: '支援工單', href: '/manage/user/support/tickets' },
        { title: '建立工單', href: '/manage/user/support/tickets/create' },
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/manage/user/support/tickets');
    };

    return (
        <>
            <Head title="建立工單" />
            <ManagePage
                title="建立支援工單"
                description="遇到問題？建立工單，我們會盡快協助您。"
                breadcrumbs={breadcrumbs}
            >
                <form onSubmit={handleSubmit}>
                    <Card>
                        <CardHeader>
                            <CardTitle>工單資訊</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="subject">主旨 *</Label>
                                <Input
                                    id="subject"
                                    value={data.subject}
                                    onChange={(e) => setData('subject', e.target.value)}
                                    placeholder="簡短描述您的問題"
                                />
                                {errors.subject && (
                                    <p className="mt-1 text-sm text-red-600">{errors.subject}</p>
                                )}
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <Label htmlFor="category">分類 *</Label>
                                    <Select
                                        id="category"
                                        value={data.category}
                                        onChange={(e) => setData('category', e.target.value)}
                                    >
                                        <option value="technical">技術問題</option>
                                        <option value="account">帳號問題</option>
                                        <option value="feature">功能請求</option>
                                        <option value="bug">錯誤回報</option>
                                        <option value="other">其他</option>
                                    </Select>
                                    {errors.category && (
                                        <p className="mt-1 text-sm text-red-600">{errors.category}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="priority">優先順序 *</Label>
                                    <Select
                                        id="priority"
                                        value={data.priority}
                                        onChange={(e) => setData('priority', e.target.value)}
                                    >
                                        <option value="low">低</option>
                                        <option value="medium">中</option>
                                        <option value="high">高</option>
                                        <option value="urgent">緊急</option>
                                    </Select>
                                    {errors.priority && (
                                        <p className="mt-1 text-sm text-red-600">{errors.priority}</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="message">詳細描述 *</Label>
                                <Textarea
                                    id="message"
                                    rows={8}
                                    value={data.message}
                                    onChange={(e) => setData('message', e.target.value)}
                                    placeholder="請詳細描述您遇到的問題，包含：&#10;- 問題發生的情境&#10;- 預期結果&#10;- 實際結果&#10;- 錯誤訊息（如有）"
                                />
                                {errors.message && (
                                    <p className="mt-1 text-sm text-red-600">{errors.message}</p>
                                )}
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => window.history.back()}
                                >
                                    取消
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {processing ? '建立中...' : '建立工單'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </ManagePage>
        </>
    );
}

CreateTicket.layout = (page: ReactElement) => <AppLayout children={page} />;
