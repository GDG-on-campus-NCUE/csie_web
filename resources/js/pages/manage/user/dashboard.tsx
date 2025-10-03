import AppLayout from '@/layouts/app-layout';
import ManagePage from '@/layouts/manage/manage-page';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTranslator } from '@/hooks/use-translator';
import type { BreadcrumbItem } from '@/types/shared';
import { Head, Link } from '@inertiajs/react';
import type { ReactElement } from 'react';
import { User, FileText, Box, AlertCircle, ArrowRight } from 'lucide-react';

interface RecentPost {
    id: number;
    title: string;
    summary: string | null;
    category: string | null;
    published_at: string;
    tags: string[];
}

interface QuickLink {
    title: string;
    description: string;
    href: string;
    icon: string;
}

interface Stats {
    profile_completeness: number;
    unread_messages: number;
    space_bindings: number;
}

interface ManageUserDashboardPageProps {
    stats: Stats;
    recentPosts: RecentPost[];
    quickLinks: QuickLink[];
    [key: string]: unknown;
}

const iconMap = {
    user: User,
    shield: User,
    palette: User,
    box: Box,
};

export default function ManageUserDashboard({
    stats,
    recentPosts,
    quickLinks,
}: ManageUserDashboardPageProps) {
    const { t } = useTranslator('manage');

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('layout.breadcrumbs.dashboard', '管理後台'),
            href: '/manage/user/dashboard',
        },
    ];

    const pageTitle = t('user.dashboard.title', '個人主頁');

    return (
        <>
            <Head title={pageTitle} />
            <ManagePage
                title={pageTitle}
                description={t('user.dashboard.description', '查看您的個人資訊和最新公告')}
                breadcrumbs={breadcrumbs}
            >
                {/* 統計卡片 */}
                <div className="grid gap-6 md:grid-cols-3 mb-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">個人資料完整度</CardTitle>
                            <User className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.profile_completeness}%</div>
                            <div className="mt-2 h-2 w-full rounded-full bg-neutral-200">
                                <div
                                    className="h-full rounded-full bg-primary transition-all"
                                    style={{ width: `${stats.profile_completeness}%` }}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">待處理訊息</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.unread_messages}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Space 綁定</CardTitle>
                            <Box className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.space_bindings}</div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* 快速連結 */}
                    <Card>
                        <CardHeader>
                            <CardTitle>快速連結</CardTitle>
                            <CardDescription>常用功能快速存取</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {quickLinks.map((link) => {
                                const Icon = iconMap[link.icon as keyof typeof iconMap] || Box;
                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className="flex items-center justify-between p-4 rounded-lg border border-neutral-200 hover:border-primary hover:bg-primary/5 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                                <Icon className="h-5 w-5 text-primary" />
                                            </div>
                                            <div>
                                                <div className="font-medium">{link.title}</div>
                                                <div className="text-sm text-muted-foreground">{link.description}</div>
                                            </div>
                                        </div>
                                        <ArrowRight className="h-5 w-5 text-muted-foreground" />
                                    </Link>
                                );
                            })}
                        </CardContent>
                    </Card>

                    {/* 最近公告 */}
                    <Card>
                        <CardHeader>
                            <CardTitle>最近公告</CardTitle>
                            <CardDescription>查看系統最新的公告資訊</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {recentPosts.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-8 text-center">
                                    <AlertCircle className="h-12 w-12 text-muted-foreground mb-3" />
                                    <p className="text-sm text-muted-foreground">目前沒有公告</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {recentPosts.map((post) => (
                                        <div
                                            key={post.id}
                                            className="flex flex-col gap-2 p-3 rounded-lg border border-neutral-200"
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <h4 className="font-medium line-clamp-1">{post.title}</h4>
                                                {post.category && <Badge variant="outline">{post.category}</Badge>}
                                            </div>
                                            <div className="text-xs text-muted-foreground">{post.published_at}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </ManagePage>
        </>
    );
}

ManageUserDashboard.layout = (page: ReactElement) => <AppLayout>{page}</AppLayout>;
