import AppLayout from '@/layouts/app-layout';
import ManagePage from '@/layouts/manage/manage-page';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTranslator } from '@/hooks/use-translator';
import type { BreadcrumbItem, PaginationMeta, SharedData } from '@/types/shared';
import type { ManageProjectListItem, ManageProjectFilterState } from '@/types/manage/teacher';
import { Head, Link, router, usePage } from '@inertiajs/react';
import type { ReactElement } from 'react';
import { useEffect, useState } from 'react';
import { Plus, Search, MoreVertical, Eye, Edit, Trash2, Filter } from 'lucide-react';

interface ManageTeacherProjectsIndexPageProps extends SharedData {
    projects: {
        data: ManageProjectListItem[];
        meta: PaginationMeta;
    };
    filters: ManageProjectFilterState;
    sponsors: string[];
    years: number[];
    abilities: {
        canCreate: boolean;
    };
}

export default function ManageTeacherProjectsIndex() {
    const page = usePage<ManageTeacherProjectsIndexPageProps>();
    const { projects, filters, sponsors, years, abilities } = page.props;
    const { t } = useTranslator('manage');

    const [searchKeyword, setSearchKeyword] = useState(filters.search || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || '');
    const [selectedSponsor, setSelectedSponsor] = useState(filters.sponsor || '');
    const [selectedYear, setSelectedYear] = useState(filters.year?.toString() || '');
    const [perPage, setPerPage] = useState(filters.per_page || 15);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('layout.breadcrumbs.dashboard', '管理後台'),
            href: '/manage/dashboard',
        },
        {
            title: t('sidebar.teacher.projects', '研究計畫'),
            href: '/manage/teacher/projects',
        },
    ];

    const pageTitle = t('sidebar.teacher.projects', '研究計畫');

    // 狀態選項
    const statusOptions = [
        { value: '', label: t('teacher.projects.filter.all_status', '全部狀態') },
        { value: 'planning', label: t('teacher.projects.status.planning', '規劃中') },
        { value: 'upcoming', label: t('teacher.projects.status.upcoming', '即將開始') },
        { value: 'ongoing', label: t('teacher.projects.status.ongoing', '進行中') },
        { value: 'completed', label: t('teacher.projects.status.completed', '已完成') },
    ];

    // 狀態顏色映射
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

    // 處理搜尋
    const handleSearch = () => {
        router.get(
            '/manage/teacher/projects',
            {
                search: searchKeyword || undefined,
                status: selectedStatus || undefined,
                sponsor: selectedSponsor || undefined,
                year: selectedYear || undefined,
                per_page: perPage,
            },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    // 重置篩選
    const handleReset = () => {
        setSearchKeyword('');
        setSelectedStatus('');
        setSelectedSponsor('');
        setSelectedYear('');
        setPerPage(15);
        router.get('/manage/teacher/projects', {}, { preserveScroll: true });
    };

    // 刪除計畫
    const handleDelete = (projectId: number, projectTitle: string) => {
        if (confirm(t('teacher.projects.confirm_delete', `確定要刪除「${projectTitle}」嗎？此操作無法復原。`))) {
            router.delete(`/manage/teacher/projects/${projectId}`);
        }
    };

    // 搜尋輸入時的防抖
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchKeyword !== filters.search) {
                handleSearch();
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchKeyword]);

    return (
        <>
            <Head title={pageTitle} />
            <ManagePage
                title={pageTitle}
                description={t('teacher.projects.description', '管理研究計畫，追蹤執行進度與成果。')}
                breadcrumbs={breadcrumbs}
                toolbar={
                    abilities.canCreate ? (
                        <Button size="sm" className="gap-2" asChild>
                            <Link href="/manage/teacher/projects/create">
                                <Plus className="h-4 w-4" />
                                {t('teacher.projects.create', '新增計畫')}
                            </Link>
                        </Button>
                    ) : null
                }
            >
                {/* 篩選區 */}
                <section className="mb-4 rounded-lg border border-neutral-200/80 bg-white p-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                        {/* 搜尋 */}
                        <div className="lg:col-span-2">
                            <Label htmlFor="search" className="mb-2 text-sm text-neutral-600">
                                {t('teacher.projects.filter.search', '搜尋')}
                            </Label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                                <Input
                                    id="search"
                                    type="text"
                                    placeholder={t('teacher.projects.filter.search_placeholder', '搜尋計畫名稱、執行單位、主持人...')}
                                    value={searchKeyword}
                                    onChange={(e) => setSearchKeyword(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                        </div>

                        {/* 狀態篩選 */}
                        <div>
                            <Label htmlFor="status" className="mb-2 text-sm text-neutral-600">
                                {t('teacher.projects.filter.status', '狀態')}
                            </Label>
                            <Select id="status" value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
                                {statusOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </Select>
                        </div>

                        {/* 執行單位篩選 */}
                        <div>
                            <Label htmlFor="sponsor" className="mb-2 text-sm text-neutral-600">
                                {t('teacher.projects.filter.sponsor', '執行單位')}
                            </Label>
                            <Select id="sponsor" value={selectedSponsor} onChange={(e) => setSelectedSponsor(e.target.value)}>
                                <option value="">{t('teacher.projects.filter.all_sponsors', '全部單位')}</option>
                                {sponsors.map((sponsor) => (
                                    <option key={sponsor} value={sponsor}>
                                        {sponsor}
                                    </option>
                                ))}
                            </Select>
                        </div>

                        {/* 年份篩選 */}
                        <div>
                            <Label htmlFor="year" className="mb-2 text-sm text-neutral-600">
                                {t('teacher.projects.filter.year', '年份')}
                            </Label>
                            <Select id="year" value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
                                <option value="">{t('teacher.projects.filter.all_years', '全部年份')}</option>
                                {years.map((year) => (
                                    <option key={year} value={year.toString()}>
                                        {year}
                                    </option>
                                ))}
                            </Select>
                        </div>
                    </div>

                    {/* 篩選按鈕 */}
                    <div className="mt-4 flex items-center gap-2">
                        <Button size="sm" onClick={handleSearch} className="gap-2">
                            <Filter className="h-4 w-4" />
                            {t('teacher.projects.filter.apply', '套用篩選')}
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleReset}>
                            {t('teacher.projects.filter.reset', '重置')}
                        </Button>
                        <div className="ml-auto flex items-center gap-2">
                            <Label htmlFor="per_page" className="text-sm text-neutral-600">
                                {t('teacher.projects.filter.per_page', '每頁顯示')}:
                            </Label>
                            <Select
                                id="per_page"
                                className="w-20"
                                value={perPage.toString()}
                                onChange={(e) => setPerPage(Number(e.target.value))}
                            >
                                <option value="10">10</option>
                                <option value="15">15</option>
                                <option value="25">25</option>
                                <option value="50">50</option>
                            </Select>
                        </div>
                    </div>
                </section>

                {/* 計畫列表 */}
                <section className="rounded-xl border border-neutral-200/80 bg-white/95 shadow-sm">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-neutral-200/80">
                                <TableHead className="w-[30%] text-neutral-500">
                                    {t('teacher.projects.table.title', '計畫名稱')}
                                </TableHead>
                                <TableHead className="w-[15%] text-neutral-500">
                                    {t('teacher.projects.table.sponsor', '執行單位')}
                                </TableHead>
                                <TableHead className="w-[12%] text-neutral-500">
                                    {t('teacher.projects.table.principal', '主持人')}
                                </TableHead>
                                <TableHead className="w-[18%] text-neutral-500">
                                    {t('teacher.projects.table.duration', '期間')}
                                </TableHead>
                                <TableHead className="w-[12%] text-right text-neutral-500">
                                    {t('teacher.projects.table.budget', '經費')}
                                </TableHead>
                                <TableHead className="w-[8%] text-neutral-500">
                                    {t('teacher.projects.table.status', '狀態')}
                                </TableHead>
                                <TableHead className="w-[5%] text-right text-neutral-500">
                                    {t('teacher.projects.table.actions', '操作')}
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {projects.data.length > 0 ? (
                                projects.data.map((project) => (
                                    <TableRow key={project.id} className="border-neutral-200/60">
                                        <TableCell className="font-medium text-neutral-800">
                                            <Link
                                                href={`/manage/teacher/projects/${project.id}`}
                                                className="hover:text-primary-600 hover:underline"
                                            >
                                                {project.title}
                                            </Link>
                                            {project.tags && project.tags.length > 0 ? (
                                                <div className="mt-1 flex flex-wrap gap-1">
                                                    {project.tags.slice(0, 3).map((tag) => (
                                                        <span
                                                            key={tag.id ?? tag.name}
                                                            className="inline-flex items-center rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600"
                                                        >
                                                            {tag.name}
                                                        </span>
                                                    ))}
                                                    {project.tags.length > 3 ? (
                                                        <span className="inline-flex items-center rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600">
                                                            +{project.tags.length - 3}
                                                        </span>
                                                    ) : null}
                                                </div>
                                            ) : null}
                                        </TableCell>
                                        <TableCell className="text-neutral-600">{project.sponsor}</TableCell>
                                        <TableCell className="text-neutral-600">{project.principal_investigator}</TableCell>
                                        <TableCell className="text-neutral-600">{project.duration}</TableCell>
                                        <TableCell className="text-right text-neutral-600">{project.formatted_budget}</TableCell>
                                        <TableCell>{getStatusBadge(project.status)}</TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/manage/teacher/projects/${project.id}`} className="flex items-center gap-2">
                                                            <Eye className="h-4 w-4" />
                                                            {t('teacher.projects.actions.view', '查看')}
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/manage/teacher/projects/${project.id}/edit`} className="flex items-center gap-2">
                                                            <Edit className="h-4 w-4" />
                                                            {t('teacher.projects.actions.edit', '編輯')}
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => handleDelete(project.id, project.title)}
                                                        className="flex items-center gap-2 text-destructive"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                        {t('teacher.projects.actions.delete', '刪除')}
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={7} className="py-12 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <p className="text-sm text-neutral-500">
                                                {t('teacher.projects.empty', '目前沒有研究計畫')}
                                            </p>
                                            {abilities.canCreate ? (
                                                <Button size="sm" variant="outline" asChild>
                                                    <Link href="/manage/teacher/projects/create">
                                                        <Plus className="mr-2 h-4 w-4" />
                                                        {t('teacher.projects.create_first', '新增第一個計畫')}
                                                    </Link>
                                                </Button>
                                            ) : null}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>

                    {/* 分頁 */}
                    {projects.data.length > 0 && projects.meta.last_page > 1 ? (
                        <div className="flex items-center justify-between border-t border-neutral-200/80 px-4 py-3">
                            <div className="text-sm text-neutral-600">
                                {t('teacher.projects.pagination.showing', '顯示')} {projects.meta.from} - {projects.meta.to} {' / '}
                                {projects.meta.total} {t('teacher.projects.pagination.items', '筆')}
                            </div>
                            <div className="flex items-center gap-2">
                                {projects.meta.links.map((link: { label: string; url: string | null; active: boolean }, index: number) => (
                                    <Button
                                        key={index}
                                        size="sm"
                                        variant={link.active ? 'default' : 'outline'}
                                        disabled={!link.url}
                                        onClick={() => link.url && router.visit(link.url)}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    ) : null}
                </section>
            </ManagePage>
        </>
    );
}

ManageTeacherProjectsIndex.layout = (page: ReactElement) => <AppLayout>{page}</AppLayout>;
