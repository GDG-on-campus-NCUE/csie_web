import AppLayout from '@/layouts/app-layout';
import ManagePage from '@/layouts/manage/manage-page';
import ActivityTimeline from '@/components/manage/activity-timeline';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslator } from '@/hooks/use-translator';
import type { BreadcrumbItem } from '@/types/shared';
import type { ManageActivityLogItem } from '@/types/manage/common';
import type { ManageProjectDetail } from '@/types/manage/teacher';
import { Head, Link, router, usePage } from '@inertiajs/react';
import type { ReactElement } from 'react';
import {
    ArrowLeft,
    CalendarDays,
    Edit,
    DollarSign,
    History,
    Tag as TagIcon,
    Trash2,
    UserCircle,
    Building2,
    FileText,
} from 'lucide-react';

interface ManageTeacherProjectsShowPageProps {
    auth: { user: { id: number; name: string; email: string; role: string } };
    flash: { success?: string; error?: string };
    locale: string;
    project: ManageProjectDetail;
    abilities: {
        canUpdate: boolean;
        canDelete: boolean;
    };
    recent_activities: ManageActivityLogItem[];
    [key: string]: unknown;
}

function formatDate(value: string | null | undefined, locale: string) {
    if (!value) {
        return '—';
    }

    return new Date(value).toLocaleString(locale, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    });
}

function formatDateTime(value: string | null | undefined, locale: string) {
    if (!value) {
        return '—';
    }

    return new Date(value).toLocaleString(locale, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export default function ManageTeacherProjectsShow() {
    const page = usePage<ManageTeacherProjectsShowPageProps>();
    const { project, abilities, recent_activities } = page.props;
    const locale = page.props.locale ?? 'zh-TW';
    const { t } = useTranslator('manage');

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('layout.breadcrumbs.dashboard', '管理後台'),
            href: '/manage/dashboard',
        },
        {
            title: t('sidebar.teacher.projects', '研究計畫'),
            href: '/manage/teacher/projects',
        },
        {
            title: project.title,
            href: `/manage/teacher/projects/${project.id}`,
        },
    ];

    const pageTitle = `${project.title}｜${t('sidebar.teacher.projects', '研究計畫')}`;

    const handleDelete = () => {
        if (confirm(t('teacher.projects.show.confirm_delete', '確定要刪除這個研究計畫嗎？此操作無法復原。'))) {
            router.delete(`/manage/teacher/projects/${project.id}`);
        }
    };

    // 狀態 Badge
    const getStatusBadge = (status: string) => {
        const statusMap = {
            planning: { label: t('teacher.projects.status.planning', '規劃中'), variant: 'outline' as const, color: 'text-neutral-600' },
            upcoming: { label: t('teacher.projects.status.upcoming', '即將開始'), variant: 'default' as const, color: 'bg-blue-500/10 text-blue-700' },
            ongoing: { label: t('teacher.projects.status.ongoing', '進行中'), variant: 'default' as const, color: 'bg-emerald-500/10 text-emerald-700' },
            completed: { label: t('teacher.projects.status.completed', '已完成'), variant: 'outline' as const, color: 'text-neutral-500' },
        };

        const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap.planning;

        return (
            <Badge variant={statusInfo.variant} className={statusInfo.color}>
                {statusInfo.label}
            </Badge>
        );
    };

    return (
        <>
            <Head title={pageTitle} />
            <ManagePage
                title={project.title}
                description={
                    project.summary
                        ? project.summary
                        : t('teacher.projects.show.description', '檢視研究計畫資訊、期程與執行狀態。')
                }
                breadcrumbs={breadcrumbs}
                toolbar={
                    <div className="flex flex-wrap items-center gap-2">
                        <Button variant="ghost" size="sm" className="gap-2" asChild>
                            <Link href="/manage/teacher/projects">
                                <ArrowLeft className="h-4 w-4" />
                                {t('layout.back', '返回列表')}
                            </Link>
                        </Button>
                        {abilities.canUpdate ? (
                            <Button size="sm" className="gap-2" asChild>
                                <Link href={`/manage/teacher/projects/${project.id}/edit`}>
                                    <Edit className="h-4 w-4" />
                                    {t('teacher.projects.show.edit', '編輯計畫')}
                                </Link>
                            </Button>
                        ) : null}
                        {abilities.canDelete ? (
                            <Button variant="destructive" size="sm" className="gap-2" onClick={handleDelete}>
                                <Trash2 className="h-4 w-4" />
                                {t('teacher.projects.show.delete', '刪除計畫')}
                            </Button>
                        ) : null}
                    </div>
                }
            >
                <section className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
                    <div className="flex flex-col gap-4">
                        <Card className="border border-neutral-200/80">
                            <CardHeader className="space-y-4">
                                <div className="flex flex-wrap items-center gap-2">
                                    {getStatusBadge(project.status)}
                                    {project.sponsor ? (
                                        <Badge variant="outline" className="gap-1 text-neutral-600">
                                            <Building2 className="h-3.5 w-3.5" />
                                            {project.sponsor}
                                        </Badge>
                                    ) : null}
                                </div>
                                <CardTitle className="text-2xl font-semibold text-neutral-900">{project.title}</CardTitle>
                                {project.title_en ? (
                                    <CardDescription className="text-sm text-neutral-600">{project.title_en}</CardDescription>
                                ) : null}
                            </CardHeader>
                            <CardContent>
                                <dl className="grid gap-4 sm:grid-cols-2">
                                    <div className="flex items-start gap-3">
                                        <UserCircle className="mt-0.5 h-5 w-5 text-neutral-400" />
                                        <div className="space-y-1">
                                            <dt className="text-xs uppercase tracking-wide text-neutral-400">
                                                {t('teacher.projects.show.principal', '計畫主持人')}
                                            </dt>
                                            <dd className="text-sm font-medium text-neutral-800">
                                                {project.principal_investigator}
                                            </dd>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <DollarSign className="mt-0.5 h-5 w-5 text-neutral-400" />
                                        <div className="space-y-1">
                                            <dt className="text-xs uppercase tracking-wide text-neutral-400">
                                                {t('teacher.projects.show.budget', '總經費')}
                                            </dt>
                                            <dd className="text-sm font-medium text-neutral-800">{project.formatted_budget}</dd>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <CalendarDays className="mt-0.5 h-5 w-5 text-neutral-400" />
                                        <div className="space-y-1">
                                            <dt className="text-xs uppercase tracking-wide text-neutral-400">
                                                {t('teacher.projects.show.duration', '計畫期間')}
                                            </dt>
                                            <dd className="text-sm font-medium text-neutral-800">{project.duration}</dd>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <CalendarDays className="mt-0.5 h-5 w-5 text-neutral-400" />
                                        <div className="space-y-1">
                                            <dt className="text-xs uppercase tracking-wide text-neutral-400">
                                                {t('teacher.projects.show.updated_at', '最後更新')}
                                            </dt>
                                            <dd className="text-sm font-medium text-neutral-800">{formatDateTime(project.updated_at, locale)}</dd>
                                            <dd className="text-xs text-neutral-500">
                                                {t('teacher.projects.show.created_at', '建立於')}：{formatDate(project.created_at, locale)}
                                            </dd>
                                        </div>
                                    </div>
                                </dl>
                            </CardContent>
                        </Card>

                        {project.summary ? (
                            <Card className="border border-neutral-200/80">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-base font-semibold text-neutral-800">
                                        <FileText className="h-4 w-4 text-neutral-500" />
                                        {t('teacher.projects.show.summary', '計畫摘要')}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4 text-sm leading-relaxed text-neutral-700">
                                    <p className="whitespace-pre-line">{project.summary}</p>
                                </CardContent>
                            </Card>
                        ) : null}

                        {project.attachments && project.attachments.length > 0 ? (
                            <Card className="border border-neutral-200/80">
                                <CardHeader>
                                    <CardTitle className="text-base font-semibold text-neutral-800">
                                        {t('teacher.projects.show.attachments', '計畫文件')}
                                    </CardTitle>
                                    <CardDescription className="text-sm text-neutral-500">
                                        {t('teacher.projects.show.attachments_description', '相關文件與附件下載。')}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {project.attachments.map((attachment) => (
                                            <div
                                                key={attachment.id}
                                                className="flex items-center justify-between rounded-lg border border-neutral-200 p-3"
                                            >
                                                <div>
                                                    <p className="text-sm font-medium text-neutral-800">{attachment.filename}</p>
                                                    <p className="text-xs text-neutral-500">
                                                        {(attachment.file_size / 1024).toFixed(2)} KB
                                                    </p>
                                                </div>
                                                <Button size="sm" variant="outline" asChild>
                                                    <a href={attachment.file_path} download>
                                                        {t('teacher.projects.show.download', '下載')}
                                                    </a>
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        ) : null}
                    </div>

                    <div className="flex flex-col gap-4">
                        {project.space ? (
                            <Card className="border border-neutral-200/80">
                                <CardHeader>
                                    <CardTitle className="text-base font-semibold text-neutral-800">
                                        {t('teacher.projects.show.space', 'Space 資源')}
                                    </CardTitle>
                                    <CardDescription className="text-sm text-neutral-500">
                                        {t('teacher.projects.show.space_description', '關聯的 Space 資源連結。')}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="rounded-lg border border-neutral-200 p-3">
                                        <p className="text-sm font-medium text-neutral-800">{project.space.name}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : null}

                        <Card className="border border-neutral-200/80">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base font-semibold text-neutral-800">
                                    <TagIcon className="h-4 w-4 text-neutral-500" />
                                    {t('teacher.projects.show.tags', '標籤')}
                                </CardTitle>
                                <CardDescription className="text-sm text-neutral-500">
                                    {t('teacher.projects.show.tags_description', '標籤有助於快速搜尋與分類。')}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {project.tags && project.tags.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {project.tags.map((tag) => (
                                            <span
                                                key={tag.id ?? tag.name}
                                                className="inline-flex items-center rounded-full bg-neutral-100 px-3 py-1 text-xs text-neutral-600"
                                            >
                                                {tag.name}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="rounded-lg border border-dashed border-neutral-200/80 px-4 py-6 text-center text-sm text-neutral-500">
                                        {t('teacher.projects.show.tags_empty', '尚未設定任何標籤。')}
                                    </p>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="border border-neutral-200/80">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base font-semibold text-neutral-800">
                                    <History className="h-4 w-4 text-neutral-500" />
                                    {t('teacher.projects.show.activity', '活動紀錄')}
                                </CardTitle>
                                <CardDescription className="text-sm text-neutral-500">
                                    {t('teacher.projects.show.activity_description', '追蹤最近的建立、更新與變更紀錄。')}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ActivityTimeline
                                    activities={recent_activities}
                                    emptyText={t('teacher.projects.show.activity_empty', '目前沒有相關操作紀錄。')}
                                    locale={locale}
                                />
                            </CardContent>
                        </Card>
                    </div>
                </section>
            </ManagePage>
        </>
    );
}

ManageTeacherProjectsShow.layout = (page: ReactElement) => <AppLayout>{page}</AppLayout>;
