import AppLayout from '@/layouts/app-layout';
import ManagePage from '@/layouts/manage/manage-page';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTranslator } from '@/hooks/use-translator';
import type { BreadcrumbItem } from '@/types/shared';
import { Head, useForm } from '@inertiajs/react';
import type { ReactElement } from 'react';
import { Link2, Plus, Trash2, Edit, CheckCircle, XCircle } from 'lucide-react';

interface Space {
    id: number;
    name: string;
    type: string;
    description: string | null;
}

interface UserSpace {
    id: number;
    space: Space;
    role: 'member' | 'collaborator' | 'manager';
    access_level: 'read' | 'write' | 'admin';
    is_active: boolean;
    joined_at: string;
}

interface ManageUserSpacesPageProps {
    userSpaces: UserSpace[];
    availableSpaces: Space[];
    [key: string]: unknown;
}

export default function ManageUserSpaces({ userSpaces, availableSpaces }: ManageUserSpacesPageProps) {
    const { t } = useTranslator('manage');

    const { delete: destroy, processing } = useForm();

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('layout.breadcrumbs.dashboard', '管理後台'),
            href: '/manage/user/dashboard',
        },
        {
            title: t('spaces.title', '空間綁定'),
            href: '/manage/user/spaces',
        },
    ];

    const pageTitle = t('spaces.title', '空間綁定');

    const handleUnbind = (spaceId: number) => {
        if (!confirm('確定要解除與此空間的綁定嗎？')) return;

        destroy(route('manage.user.spaces.destroy', { space: spaceId }));
    };

    const getRoleBadgeVariant = (role: string) => {
        switch (role) {
            case 'manager':
                return 'default';
            case 'collaborator':
                return 'secondary';
            default:
                return 'outline';
        }
    };

    const getAccessLevelBadgeVariant = (level: string) => {
        switch (level) {
            case 'admin':
                return 'destructive';
            case 'write':
                return 'default';
            default:
                return 'outline';
        }
    };

    return (
        <>
            <Head title={pageTitle} />
            <ManagePage
                title={pageTitle}
                description={t('spaces.description', '管理您所屬的實驗室、研究計畫等空間。')}
                breadcrumbs={breadcrumbs}
            >
                <div className="space-y-6">
                    {/* Current Bindings */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Link2 className="h-5 w-5" />
                                我的空間
                            </CardTitle>
                            <CardDescription>
                                您目前綁定的空間清單，包含角色與權限資訊。
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {userSpaces.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    尚未綁定任何空間
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {userSpaces.map((userSpace) => (
                                        <div
                                            key={userSpace.id}
                                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                                        >
                                            <div className="flex-1 space-y-2">
                                                <div className="flex items-center gap-3">
                                                    <h3 className="font-semibold">{userSpace.space.name}</h3>
                                                    {userSpace.is_active ? (
                                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                                    ) : (
                                                        <XCircle className="h-4 w-4 text-red-600" />
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <Badge variant={getRoleBadgeVariant(userSpace.role)}>
                                                        {userSpace.role === 'manager' ? '管理員' :
                                                         userSpace.role === 'collaborator' ? '協作者' : '成員'}
                                                    </Badge>
                                                    <Badge variant={getAccessLevelBadgeVariant(userSpace.access_level)}>
                                                        {userSpace.access_level === 'admin' ? '完整權限' :
                                                         userSpace.access_level === 'write' ? '讀寫' : '唯讀'}
                                                    </Badge>
                                                    <span>•</span>
                                                    <span>加入於 {new Date(userSpace.joined_at).toLocaleDateString('zh-TW')}</span>
                                                </div>
                                                {userSpace.space.description && (
                                                    <p className="text-sm text-muted-foreground">
                                                        {userSpace.space.description}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 ml-4">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => window.location.href = route('manage.user.spaces.edit', { space: userSpace.id })}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleUnbind(userSpace.id)}
                                                    disabled={processing}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Available Spaces */}
                    {availableSpaces.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Plus className="h-5 w-5" />
                                    可綁定的空間
                                </CardTitle>
                                <CardDescription>
                                    您可以加入以下空間，點擊綁定按鈕以開始。
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4 md:grid-cols-2">
                                    {availableSpaces.map((space) => (
                                        <div
                                            key={space.id}
                                            className="p-4 border rounded-lg hover:border-primary/50 transition-colors"
                                        >
                                            <h3 className="font-semibold mb-1">{space.name}</h3>
                                            <p className="text-sm text-muted-foreground mb-3">
                                                {space.description || '暫無描述'}
                                            </p>
                                            <Button
                                                size="sm"
                                                className="w-full gap-2"
                                                onClick={() => window.location.href = route('manage.user.spaces.create', { space_id: space.id })}
                                            >
                                                <Plus className="h-4 w-4" />
                                                綁定此空間
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </ManagePage>
        </>
    );
}

ManageUserSpaces.layout = (page: ReactElement) => <AppLayout>{page}</AppLayout>;
