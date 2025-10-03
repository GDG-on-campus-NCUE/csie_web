import AppLayout from '@/layouts/app-layout';
import ManagePage from '@/layouts/manage/manage-page';
import ActivityTimeline from '@/components/manage/activity-timeline';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useTranslator } from '@/hooks/use-translator';
import type { ManageLabDetail } from '@/types/manage/teacher';
import type { BreadcrumbItem, SharedData } from '@/types/shared';
import { Head, Link, router, usePage } from '@inertiajs/react';
import type { ReactElement } from 'react';
import {
    ArrowLeft,
    CalendarDays,
    Edit,
    Eye,
    History,
    FlaskConical,
    Globe,
    MapPin,
    Tag as TagIcon,
    Trash2,
    UserCircle,
    Users,
    Fingerprint,
    Phone,
    Mail,
} from 'lucide-react';

interface ManageTeacherLabsShowPageProps extends SharedData {
    lab: ManageLabDetail;
    abilities: {
        canUpdate: boolean;
        canDelete: boolean;
        canManageMembers: boolean;
    };
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

export default function ManageTeacherLabsShow() {
    const page = usePage<ManageTeacherLabsShowPageProps>();
    const { lab, abilities } = page.props;
    const locale = page.props.locale ?? 'zh-TW';
    const { t } = useTranslator('manage');

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('layout.breadcrumbs.dashboard', '管理後台'),
            href: '/manage/dashboard',
        },
        {
            title: t('sidebar.teacher.labs', '實驗室'),
            href: '/manage/teacher/labs',
        },
        {
            title: t('teacher.labs.show.breadcrumb', '實驗室詳情'),
            href: `/manage/teacher/labs/${lab.id}`,
        },
    ];

    const pageTitle = `${lab.name}｜${t('sidebar.teacher.labs', '實驗室')}`;

    const handleDelete = () => {
        // 刪除前進行二次確認，避免誤刪資料
        if (confirm(t('teacher.labs.show.confirm_delete', '確定要刪除這個實驗室嗎？此操作無法復原。'))) {
            router.delete(`/manage/teacher/labs/${lab.id}`);
        }
    };

    return (
        <>
            <Head title={pageTitle} />
            <ManagePage
                title={lab.name}
                description={
                    lab.description
                        ? lab.description
                        : t('teacher.labs.show.description', '檢視實驗室資訊、成員分工與最新活動紀錄。')
                }
                breadcrumbs={breadcrumbs}
                toolbar={
                    <div className="flex flex-wrap items-center gap-2">
                        <Button variant="ghost" size="sm" className="gap-2" asChild>
                            <Link href="/manage/teacher/labs">
                                <ArrowLeft className="h-4 w-4" />
                                {t('layout.back', '返回列表')}
                            </Link>
                        </Button>
                        {abilities.canUpdate ? (
                            <Button size="sm" className="gap-2" asChild>
                                <Link href={`/manage/teacher/labs/${lab.id}/edit`}>
                                    <Edit className="h-4 w-4" />
                                    {t('teacher.labs.show.edit', '編輯實驗室')}
                                </Link>
                            </Button>
                        ) : null}
                        {abilities.canDelete ? (
                            <Button variant="destructive" size="sm" className="gap-2" onClick={handleDelete}>
                                <Trash2 className="h-4 w-4" />
                                {t('teacher.labs.show.delete', '刪除實驗室')}
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
                                    <Badge
                                        variant={lab.visible ? 'default' : 'outline'}
                                        className={lab.visible ? 'bg-emerald-500/10 text-emerald-700' : 'border-neutral-200 text-neutral-600'}
                                    >
                                        {lab.visible
                                            ? t('teacher.labs.show.visible', '公開顯示')
                                            : t('teacher.labs.show.hidden', '僅限成員')}
                                    </Badge>
                                    {lab.field ? (
                                        <Badge variant="outline" className="gap-1 text-neutral-600">
                                            <FlaskConical className="h-3.5 w-3.5" />
                                            {lab.field}
                                        </Badge>
                                    ) : null}
                                    {lab.code ? (
                                        <Badge variant="outline" className="gap-1 text-neutral-600">
                                            <Fingerprint className="h-3.5 w-3.5" />
                                            {lab.code}
                                        </Badge>
                                    ) : null}
                                </div>
                                <CardTitle className="text-2xl font-semibold text-neutral-900">{lab.name}</CardTitle>
                                {lab.name_en ? (
                                    <CardDescription className="text-sm text-neutral-600">{lab.name_en}</CardDescription>
                                ) : null}
                            </CardHeader>
                            <CardContent>
                                <dl className="grid gap-4 sm:grid-cols-2">
                                    <div className="flex items-start gap-3">
                                        <UserCircle className="mt-0.5 h-5 w-5 text-neutral-400" />
                                        <div className="space-y-1">
                                            <dt className="text-xs uppercase tracking-wide text-neutral-400">
                                                {t('teacher.labs.show.principal', '主持人')}
                                            </dt>
                                            <dd className="text-sm font-medium text-neutral-800">
                                                {lab.principal_investigator?.name ?? t('teacher.labs.show.principal_empty', '尚未指定')}
                                            </dd>
                                            {lab.principal_investigator?.email ? (
                                                <dd className="text-xs text-neutral-500">{lab.principal_investigator.email}</dd>
                                            ) : null}
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <Users className="mt-0.5 h-5 w-5 text-neutral-400" />
                                        <div className="space-y-1">
                                            <dt className="text-xs uppercase tracking-wide text-neutral-400">
                                                {t('teacher.labs.show.member_count', '成員數量')}
                                            </dt>
                                            <dd className="text-sm font-medium text-neutral-800">{lab.members?.length ?? 0}</dd>
                                            <dd className="text-xs text-neutral-500">
                                                {t('teacher.labs.show.capacity_hint', '建議容量')}：{lab.capacity ?? t('teacher.labs.show.capacity_unknown', '未設定')}
                                            </dd>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <MapPin className="mt-0.5 h-5 w-5 text-neutral-400" />
                                        <div className="space-y-1">
                                            <dt className="text-xs uppercase tracking-wide text-neutral-400">
                                                {t('teacher.labs.show.location', '位置')}
                                            </dt>
                                            <dd className="text-sm font-medium text-neutral-800">{lab.location ?? '—'}</dd>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <CalendarDays className="mt-0.5 h-5 w-5 text-neutral-400" />
                                        <div className="space-y-1">
                                            <dt className="text-xs uppercase tracking-wide text-neutral-400">
                                                {t('teacher.labs.show.updated_at', '最後更新')}
                                            </dt>
                                            <dd className="text-sm font-medium text-neutral-800">{formatDateTime(lab.updated_at, locale)}</dd>
                                            <dd className="text-xs text-neutral-500">
                                                {t('teacher.labs.show.created_at', '建立於')}：{formatDate(lab.created_at, locale)}
                                            </dd>
                                        </div>
                                    </div>
                                </dl>
                            </CardContent>
                        </Card>

                        {(lab.description || lab.equipment_summary || lab.description_en) ? (
                            <Card className="border border-neutral-200/80">
                                <CardHeader>
                                    <CardTitle className="text-base font-semibold text-neutral-800">
                                        {t('teacher.labs.show.about', '實驗室介紹')}
                                    </CardTitle>
                                    <CardDescription className="text-sm text-neutral-500">
                                        {t('teacher.labs.show.about_description', '提供實驗室的研究方向與設備概要。')}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4 text-sm leading-relaxed text-neutral-700">
                                    {lab.description ? <p>{lab.description}</p> : null}
                                    {lab.description_en ? (
                                        <p className="text-neutral-500">{lab.description_en}</p>
                                    ) : null}
                                    {lab.equipment_summary ? (
                                        <div className="rounded-lg border border-dashed border-neutral-200/70 bg-neutral-50 p-4 text-sm text-neutral-700">
                                            <h3 className="mb-2 text-sm font-semibold text-neutral-800">
                                                {t('teacher.labs.show.equipment', '設備與資源')}
                                            </h3>
                                            <p className="whitespace-pre-line">{lab.equipment_summary}</p>
                                        </div>
                                    ) : null}
                                </CardContent>
                            </Card>
                        ) : null}

                        <Card className="border border-neutral-200/80">
                            <CardHeader>
                                <CardTitle className="text-base font-semibold text-neutral-800 flex items-center gap-2">
                                    <Users className="h-4 w-4 text-neutral-500" />
                                    {t('teacher.labs.show.members', '實驗室成員')}
                                </CardTitle>
                                <CardDescription className="text-sm text-neutral-500">
                                    {abilities.canManageMembers
                                        ? t('teacher.labs.show.members_description_manage', '管理成員組成與分工，調整權限。')
                                        : t('teacher.labs.show.members_description_view', '查看目前成員列表與角色分配。')}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {lab.members?.length ? (
                                    <div className="overflow-x-auto">
                                        <Table className="min-w-full">
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="w-[180px] text-neutral-500">{t('teacher.labs.show.member_name', '姓名')}</TableHead>
                                                    <TableHead className="text-neutral-500">{t('teacher.labs.show.member_role', '角色')}</TableHead>
                                                    <TableHead className="text-neutral-500">Email</TableHead>
                                                    <TableHead className="text-right text-neutral-500">{t('teacher.labs.show.member_joined', '加入時間')}</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {lab.members.map((member) => (
                                                    <TableRow key={member.id}>
                                                        <TableCell className="font-medium text-neutral-800">{member.name}</TableCell>
                                                        <TableCell className="text-neutral-600">
                                                            {member.pivot_role ?? member.role ?? t('teacher.labs.show.member_role_unknown', '未指定')}
                                                        </TableCell>
                                                        <TableCell className="text-neutral-600">{member.email}</TableCell>
                                                        <TableCell className="text-right text-neutral-500 text-sm">
                                                            {member.joined_at ? formatDate(member.joined_at, locale) : '—'}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                ) : (
                                    <p className="rounded-lg border border-dashed border-neutral-200/80 px-4 py-6 text-center text-sm text-neutral-500">
                                        {t('teacher.labs.show.members_empty', '尚未加入任何成員。')}
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <div className="flex flex-col gap-4">
                        <Card className="border border-neutral-200/80">
                            <CardHeader>
                                <CardTitle className="text-base font-semibold text-neutral-800">
                                    {t('teacher.labs.show.contact', '聯絡資訊')}
                                </CardTitle>
                                <CardDescription className="text-sm text-neutral-500">
                                    {t('teacher.labs.show.contact_description', '提供聯絡方式與外部資源連結。')}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm text-neutral-700">
                                <div className="flex items-start gap-2">
                                    <Eye className="mt-0.5 h-4 w-4 text-neutral-400" />
                                    <div>
                                        <p className="text-xs uppercase tracking-wide text-neutral-400">
                                            {t('teacher.labs.show.visibility', '顯示狀態')}
                                        </p>
                                        <p className="font-medium text-neutral-800">
                                            {lab.visible
                                                ? t('teacher.labs.show.visible', '公開顯示')
                                                : t('teacher.labs.show.hidden', '僅限成員')}
                                        </p>
                                    </div>
                                </div>
                                {lab.contact_email ? (
                                    <div className="flex items-start gap-2">
                                        <Mail className="mt-0.5 h-4 w-4 text-neutral-400" />
                                        <div>
                                            <p className="text-xs uppercase tracking-wide text-neutral-400">Email</p>
                                            <a
                                                href={`mailto:${lab.contact_email}`}
                                                className="font-medium text-primary-600 hover:underline"
                                            >
                                                {lab.contact_email}
                                            </a>
                                        </div>
                                    </div>
                                ) : null}
                                {lab.contact_phone ? (
                                    <div className="flex items-start gap-2">
                                        <Phone className="mt-0.5 h-4 w-4 text-neutral-400" />
                                        <div>
                                            <p className="text-xs uppercase tracking-wide text-neutral-400">
                                                {t('teacher.labs.show.phone', '聯絡電話')}
                                            </p>
                                            <p className="font-medium text-neutral-800">{lab.contact_phone}</p>
                                        </div>
                                    </div>
                                ) : null}
                                {lab.website_url ? (
                                    <div className="flex items-start gap-2">
                                        <Globe className="mt-0.5 h-4 w-4 text-neutral-400" />
                                        <div>
                                            <p className="text-xs uppercase tracking-wide text-neutral-400">
                                                {t('teacher.labs.show.website', '外部網站')}
                                            </p>
                                            <a
                                                href={lab.website_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="font-medium text-primary-600 hover:underline"
                                            >
                                                {lab.website_url}
                                            </a>
                                        </div>
                                    </div>
                                ) : null}
                            </CardContent>
                        </Card>

                        <Card className="border border-neutral-200/80">
                            <CardHeader>
                                <CardTitle className="text-base font-semibold text-neutral-800 flex items-center gap-2">
                                    <TagIcon className="h-4 w-4 text-neutral-500" />
                                    {t('teacher.labs.show.tags', '標籤')}
                                </CardTitle>
                                <CardDescription className="text-sm text-neutral-500">
                                    {t('teacher.labs.show.tags_description', '標籤有助於快速搜尋與分類。')}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {lab.tags?.length ? (
                                    <div className="flex flex-wrap gap-2">
                                        {lab.tags.map((tag) => (
                                            <span
                                                key={`${tag.id ?? tag.name}`}
                                                className="inline-flex items-center rounded-full bg-neutral-100 px-3 py-1 text-xs text-neutral-600"
                                            >
                                                {tag.name}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="rounded-lg border border-dashed border-neutral-200/80 px-4 py-6 text-center text-sm text-neutral-500">
                                        {t('teacher.labs.show.tags_empty', '尚未設定任何標籤。')}
                                    </p>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="border border-neutral-200/80">
                            <CardHeader>
                                <CardTitle className="text-base font-semibold text-neutral-800 flex items-center gap-2">
                                    <History className="h-4 w-4 text-neutral-500" />
                                    {t('teacher.labs.show.activity', '活動紀錄')}
                                </CardTitle>
                                <CardDescription className="text-sm text-neutral-500">
                                    {t('teacher.labs.show.activity_description', '追蹤最近的建立、更新與成員調整紀錄。')}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ActivityTimeline
                                    activities={lab.recent_activities}
                                    emptyText={t('teacher.labs.show.activity_empty', '目前沒有相關操作紀錄。')}
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

ManageTeacherLabsShow.layout = (page: ReactElement) => <AppLayout>{page}</AppLayout>;
