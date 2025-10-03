import AppLayout from '@/layouts/app-layout';
import ManagePage from '@/layouts/manage/manage-page';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useTranslator } from '@/hooks/use-translator';
import type { BreadcrumbItem } from '@/types/shared';
import { Head, useForm } from '@inertiajs/react';
import type { ReactElement } from 'react';
import { Bell, Mail, MessageCircle } from 'lucide-react';

interface NotificationPreference {
    notification_type: string;
    channels: string[];
    is_enabled: boolean;
}

interface NotificationPreferencesPageProps {
    preferences: NotificationPreference[];
    [key: string]: unknown;
}

const notificationTypes = [
    { value: 'post_published', label: '公告發布', description: '當有新公告發布時通知您' },
    {
        value: 'space_sync_started',
        label: 'Space 同步開始',
        description: '當 Space 資源同步開始時通知您',
    },
    {
        value: 'space_sync_completed',
        label: 'Space 同步完成',
        description: '當 Space 資源同步完成時通知您',
    },
    {
        value: 'space_sync_failed',
        label: 'Space 同步失敗',
        description: '當 Space 資源同步失敗時通知您',
    },
    { value: 'permission_changed', label: '權限變更', description: '當您的權限被更改時通知您' },
    {
        value: 'support_ticket_reply',
        label: '工單回覆',
        description: '當您的支援工單收到回覆時通知您',
    },
    {
        value: 'support_ticket_status_changed',
        label: '工單狀態變更',
        description: '當您的工單狀態改變時通知您',
    },
    {
        value: 'system_maintenance',
        label: '系統維護',
        description: '系統維護或重要更新通知',
    },
];

const channels = [
    { value: 'email', label: 'Email', icon: Mail, description: '透過電子郵件接收通知' },
    { value: 'app', label: '站內通知', icon: Bell, description: '在系統內接收通知' },
    { value: 'line', label: 'LINE', icon: MessageCircle, description: '透過 LINE Bot 接收通知' },
];

export default function NotificationPreferences({
    preferences,
}: NotificationPreferencesPageProps) {
    const { t } = useTranslator('manage');

    // 將 preferences 轉換為表單資料格式
    const initialData: { [key: string]: { enabled: boolean; channels: string[] } } = {};
    notificationTypes.forEach((type) => {
        const pref = preferences.find((p) => p.notification_type === type.value);
        initialData[type.value] = {
            enabled: pref?.is_enabled ?? true,
            channels: pref?.channels ?? ['email', 'app'],
        };
    });

    const { data, setData, put, processing, errors } = useForm(initialData);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('layout.breadcrumbs.dashboard', '管理後台'), href: '/manage/user/dashboard' },
        { title: '通知設定', href: '/manage/settings/notifications' },
    ];

    const handleToggleEnabled = (type: string) => {
        setData({
            ...data,
            [type]: {
                ...data[type],
                enabled: !data[type].enabled,
            },
        });
    };

    const handleToggleChannel = (type: string, channel: string) => {
        const currentChannels = data[type].channels || [];
        const newChannels = currentChannels.includes(channel)
            ? currentChannels.filter((c) => c !== channel)
            : [...currentChannels, channel];

        setData({
            ...data,
            [type]: {
                ...data[type],
                channels: newChannels,
            },
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put('/manage/settings/notifications');
    };

    return (
        <>
            <Head title="通知設定" />
            <ManagePage
                title="通知設定"
                description="管理您的通知偏好設定"
                breadcrumbs={breadcrumbs}
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* 頻道說明 */}
                    <Card>
                        <CardHeader>
                            <CardTitle>通知頻道</CardTitle>
                            <CardDescription>選擇您想要接收通知的方式</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-3">
                                {channels.map((channel) => {
                                    const Icon = channel.icon;
                                    return (
                                        <div
                                            key={channel.value}
                                            className="flex items-start gap-3 rounded-lg border p-4"
                                        >
                                            <Icon className="h-5 w-5 text-primary" />
                                            <div>
                                                <p className="font-medium">{channel.label}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {channel.description}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    {/* 通知類型設定 */}
                    <Card>
                        <CardHeader>
                            <CardTitle>通知類型</CardTitle>
                            <CardDescription>
                                設定每種通知類型的接收方式
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {notificationTypes.map((type) => (
                                    <div key={type.value} className="border-b pb-6 last:border-b-0">
                                        <div className="mb-3 flex items-start justify-between">
                                            <div className="flex-1">
                                                <Label className="text-base font-medium">
                                                    {type.label}
                                                </Label>
                                                <p className="mt-1 text-sm text-muted-foreground">
                                                    {type.description}
                                                </p>
                                            </div>
                                            <label className="relative inline-flex cursor-pointer items-center">
                                                <input
                                                    type="checkbox"
                                                    className="peer sr-only"
                                                    checked={data[type.value]?.enabled ?? true}
                                                    onChange={() => handleToggleEnabled(type.value)}
                                                />
                                                <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary peer-focus:ring-offset-2"></div>
                                            </label>
                                        </div>

                                        {data[type.value]?.enabled && (
                                            <div className="ml-6 flex gap-4">
                                                {channels.map((channel) => (
                                                    <label
                                                        key={channel.value}
                                                        className="flex cursor-pointer items-center gap-2"
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-2 focus:ring-primary focus:ring-offset-2"
                                                            checked={
                                                                data[type.value]?.channels?.includes(
                                                                    channel.value
                                                                ) ?? false
                                                            }
                                                            onChange={() =>
                                                                handleToggleChannel(
                                                                    type.value,
                                                                    channel.value
                                                                )
                                                            }
                                                        />
                                                        <span className="text-sm">
                                                            {channel.label}
                                                        </span>
                                                    </label>
                                                ))}
                                            </div>
                                        )}

                                        {errors[type.value] && (
                                            <p className="mt-2 text-sm text-red-600">
                                                {errors[type.value]}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* 儲存按鈕 */}
                    <div className="flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => window.history.back()}
                        >
                            取消
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? '儲存中...' : '儲存設定'}
                        </Button>
                    </div>
                </form>
            </ManagePage>
        </>
    );
}

NotificationPreferences.layout = (page: ReactElement) => <AppLayout children={page} />;
