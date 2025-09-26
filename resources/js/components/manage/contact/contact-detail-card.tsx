import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CalendarClock, Mail, UserCircle } from 'lucide-react';
import type { ContactMessageItem } from './contact-types';
import { contactStatusBadgeVariant, contactStatusLabels } from './contact-types';

interface ContactDetailCardProps {
    message: ContactMessageItem;
    fallbackLanguage: 'zh' | 'en';
    localeForDate: 'zh-TW' | 'en';
}

/**
 * 顯示單筆聯絡訊息詳細資料的卡片
 */
export function ContactDetailCard({ message, fallbackLanguage, localeForDate }: ContactDetailCardProps) {
    const formatDateTime = (value: string | null): string => {
        if (!value) {
            return fallbackLanguage === 'zh' ? '尚未提供' : 'Not available';
        }

        const parsed = new Date(value);
        if (Number.isNaN(parsed.getTime())) {
            return fallbackLanguage === 'zh' ? '格式錯誤' : 'Invalid format';
        }

        return parsed.toLocaleString(localeForDate === 'zh-TW' ? 'zh-TW' : 'en-US', {
            dateStyle: 'medium',
            timeStyle: 'short',
        });
    };

    const statusLabel = contactStatusLabels[message.status][fallbackLanguage];
    const badgeVariant = contactStatusBadgeVariant[message.status];

    return (
        <Card className="border border-slate-200 bg-white shadow-sm">
            <CardHeader className="space-y-4 border-b border-slate-100 pb-6">
                <div className="flex items-center justify-between gap-4">
                    <CardTitle className="text-2xl font-semibold text-slate-900">
                        {message.subject || (fallbackLanguage === 'zh' ? '未填寫主旨' : 'No subject')}
                    </CardTitle>
                    <Badge variant={badgeVariant}>{statusLabel}</Badge>
                </div>
                <div className="grid gap-2 text-sm text-slate-600 md:grid-cols-2">
                    <div className="flex items-center gap-2">
                        <UserCircle className="h-5 w-5 text-slate-500" />
                        <span className="font-medium text-slate-900">{message.name}</span>
                        {message.locale && (
                            <span className="text-xs text-slate-500">{`Locale：${message.locale}`}</span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <Mail className="h-5 w-5 text-slate-500" />
                        <a href={`mailto:${message.email}`} className="text-blue-600 hover:underline">
                            {message.email}
                        </a>
                    </div>
                </div>
                <div className="text-xs text-slate-500">
                    {fallbackLanguage === 'zh' ? '送出時間：' : 'Submitted at: '}
                    {formatDateTime(message.created_at)}
                </div>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
                <section>
                    <h2 className="text-base font-semibold text-slate-900">
                        {fallbackLanguage === 'zh' ? '訊息內容' : 'Message'}
                    </h2>
                    <Separator className="my-2" />
                    <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700">{message.message}</p>
                    {message.file_url && (
                        <a
                            href={message.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-3 inline-flex text-sm text-blue-600 hover:underline"
                        >
                            {fallbackLanguage === 'zh' ? '下載附件' : 'Download attachment'}
                        </a>
                    )}
                </section>

                <section>
                    <h2 className="text-base font-semibold text-slate-900">
                        {fallbackLanguage === 'zh' ? '處理紀錄' : 'Processing history'}
                    </h2>
                    <Separator className="my-2" />
                    {message.processor ? (
                        <div className="space-y-2 text-sm text-slate-700">
                            <div className="flex items-center gap-2">
                                <UserCircle className="h-5 w-5 text-slate-500" />
                                <span className="font-medium text-slate-900">{message.processor.name}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                <CalendarClock className="h-4 w-4" />
                                <span>{formatDateTime(message.processed_at)}</span>
                            </div>
                        </div>
                    ) : (
                        <p className="text-sm text-slate-600">
                            {fallbackLanguage === 'zh' ? '尚未指派處理人員。' : 'No processor assigned yet.'}
                        </p>
                    )}
                </section>
            </CardContent>
        </Card>
    );
}
