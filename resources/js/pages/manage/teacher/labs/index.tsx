import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import type { ChangeEvent, ReactElement } from 'react';

import AppLayout from '@/layouts/app-layout';
import ManagePage from '@/layouts/manage/manage-page';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import TableEmpty from '@/components/manage/table-empty';
import { useTranslator } from '@/hooks/use-translator';
import type { BreadcrumbItem, SharedData } from '@/types/shared';
import type { ManageLabListResponse, ManageLabFilterState, ManageLabAbilities } from '@/types/manage/teacher';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Plus, Search, Filter, MoreHorizontal, Edit, Eye, EyeOff, Users, Trash2 } from 'lucide-react';

type ManageTeacherLabsPageProps = SharedData & {
    labs: ManageLabListResponse;
    filters: ManageLabFilterState;
    fields: string[];
    abilities: ManageLabAbilities;
};

type FilterFormState = {
    keyword: string;
    field: string;
    visible: string;
    tag: string;
    per_page: string;
};

const PER_PAGE_OPTIONS = ['10', '15', '20', '50'] as const;

export default function ManageTeacherLabsIndex() {
    const page = usePage<ManageTeacherLabsPageProps>();
    const { labs, filters, fields, abilities } = page.props;
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
    ];

    const pageTitle = t('sidebar.teacher.labs', '實驗室');

    const defaultFilterForm = useMemo<FilterFormState>(() => ({
        keyword: filters.keyword ?? '',
        field: filters.field ?? '',
        visible: filters.visible !== null ? String(filters.visible) : '',
        tag: filters.tag ?? '',
        per_page: filters.per_page ? String(filters.per_page) : PER_PAGE_OPTIONS[1],
    }), [filters]);

    const [filterForm, setFilterForm] = useState<FilterFormState>(defaultFilterForm);
    const [lastKeyword, setLastKeyword] = useState(defaultFilterForm.keyword);
    const [showFilters, setShowFilters] = useState(false);
    const keywordTimer = useRef<number | null>(null);

    useEffect(() => {
        setFilterForm(defaultFilterForm);
        setLastKeyword(defaultFilterForm.keyword);
    }, [defaultFilterForm]);

    const handleFilterChange = (field: keyof FilterFormState, value: string) => {
        setFilterForm(prev => ({ ...prev, [field]: value }));
    };

    const applyFilters = useCallback((overrides: Partial<FilterFormState> = {}, options: { replace?: boolean } = {}) => {
        const payload: Record<string, string | number | boolean | null> = {
            search: (overrides.keyword ?? filterForm.keyword) || null,
            field: (overrides.field ?? filterForm.field) || null,
            visible: (overrides.visible ?? filterForm.visible) ? (overrides.visible ?? filterForm.visible) === 'true' : null,
            tag: (overrides.tag ?? filterForm.tag) || null,
            per_page: overrides.per_page ? Number(overrides.per_page) : Number(filterForm.per_page) || 15,
        };

        router.get('/manage/teacher/labs', payload, {
            preserveScroll: true,
            preserveState: true,
            replace: options.replace ?? false,
        });
    }, [filterForm]);

    // 關鍵字搜尋延遲
    useEffect(() => {
        if (filterForm.keyword === lastKeyword) {
            return;
        }

        if (keywordTimer.current) {
            window.clearTimeout(keywordTimer.current);
        }

        keywordTimer.current = window.setTimeout(() => {
            applyFilters({ keyword: filterForm.keyword }, { replace: true });
            setLastKeyword(filterForm.keyword);
        }, 400);

        return () => {
            if (keywordTimer.current) {
                window.clearTimeout(keywordTimer.current);
            }
        };
    }, [applyFilters, filterForm.keyword, lastKeyword]);

    const resetFilters = () => {
        setFilterForm({
            keyword: '',
            field: '',
            visible: '',
            tag: '',
            per_page: PER_PAGE_OPTIONS[1],
        });
        router.get('/manage/teacher/labs', {}, {
            preserveScroll: true,
            preserveState: true,
        });
    };

    const hasActiveFilters = filterForm.field || filterForm.visible || filterForm.tag;

    const formatDateTime = (value: string | null | undefined): string => {
        if (!value) return '—';
        return new Date(value).toLocaleString(locale, {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        });
    };

    return (
        <>
            <Head title={pageTitle} />
            <ManagePage
                title={pageTitle}
                description={t('teacher.labs.description', '管理實驗室資訊與成員分工。')}
                breadcrumbs={breadcrumbs}
                toolbar={
                    abilities.canCreate ? (
                        <Link href="/manage/teacher/labs/create">
                            <Button size="sm" className="gap-2">
                                <Plus className="h-4 w-4" />
                                {t('teacher.labs.create', '新增實驗室')}
                            </Button>
                        </Link>
                    ) : null
                }
            >
                {/* 搜尋與篩選工具列 */}
                <div className="mb-4 flex flex-col gap-3 rounded-lg border border-neutral-200/80 bg-white p-4 shadow-sm">
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="relative flex-1 min-w-[240px]">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                            <Input
                                placeholder={t('teacher.labs.search_placeholder', '搜尋實驗室名稱、領域、描述...')}
                                value={filterForm.keyword}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => handleFilterChange('keyword', e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        <Button
                            variant={showFilters ? "default" : "outline"}
                            size="sm"
                            onClick={() => setShowFilters(!showFilters)}
                            className="gap-2"
                        >
                            <Filter className="h-4 w-4" />
                            {t('common.filters', '篩選')}
                            {hasActiveFilters && (
                                <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 text-xs">
                                    {[filterForm.field, filterForm.visible, filterForm.tag].filter(Boolean).length}
                                </Badge>
                            )}
                        </Button>
                    </div>

                    {/* 進階篩選 */}
                    {showFilters && (
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 pt-3 border-t border-neutral-200/80">
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-neutral-600">
                                    {t('teacher.labs.filter.field', '研究領域')}
                                </label>
                                <Select
                                    value={filterForm.field}
                                    onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                                        const value = e.target.value;
                                        handleFilterChange('field', value);
                                        applyFilters({ field: value });
                                    }}
                                >
                                    <option value="">{t('common.all', '全部')}</option>
                                    {fields.map((field) => (
                                        <option key={field} value={field}>
                                            {field}
                                        </option>
                                    ))}
                                </Select>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-medium text-neutral-600">
                                    {t('teacher.labs.filter.visibility', '可見性')}
                                </label>
                                <Select
                                    value={filterForm.visible}
                                    onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                                        const value = e.target.value;
                                        handleFilterChange('visible', value);
                                        applyFilters({ visible: value });
                                    }}
                                >
                                    <option value="">{t('common.all', '全部')}</option>
                                    <option value="true">{t('common.visible', '可見')}</option>
                                    <option value="false">{t('common.hidden', '隱藏')}</option>
                                </Select>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-medium text-neutral-600">
                                    {t('common.per_page', '每頁顯示')}
                                </label>
                                <Select
                                    value={filterForm.per_page}
                                    onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                                        const value = e.target.value;
                                        handleFilterChange('per_page', value);
                                        applyFilters({ per_page: value });
                                    }}
                                >
                                    {PER_PAGE_OPTIONS.map((option) => (
                                        <option key={option} value={option}>
                                            {option} {t('common.items', '筆')}
                                        </option>
                                    ))}
                                </Select>
                            </div>

                            <div className="flex items-end">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={resetFilters}
                                    className="w-full"
                                >
                                    {t('common.reset_filters', '重置篩選')}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {/* 實驗室列表 */}
                <div className="rounded-xl border border-neutral-200/80 bg-white/95 shadow-sm overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-neutral-200/80 bg-neutral-50/50">
                                <TableHead className="w-[30%] text-neutral-700 font-semibold">
                                    {t('teacher.labs.table.name', '實驗室名稱')}
                                </TableHead>
                                <TableHead className="w-[15%] text-neutral-700 font-semibold">
                                    {t('teacher.labs.table.field', '研究領域')}
                                </TableHead>
                                <TableHead className="w-[15%] text-neutral-700 font-semibold">
                                    {t('teacher.labs.table.pi', '主持人')}
                                </TableHead>
                                <TableHead className="w-[10%] text-center text-neutral-700 font-semibold">
                                    {t('teacher.labs.table.members', '成員')}
                                </TableHead>
                                <TableHead className="w-[10%] text-center text-neutral-700 font-semibold">
                                    {t('teacher.labs.table.visibility', '可見')}
                                </TableHead>
                                <TableHead className="w-[15%] text-neutral-700 font-semibold">
                                    {t('teacher.labs.table.updated', '更新時間')}
                                </TableHead>
                                <TableHead className="w-[5%] text-right text-neutral-700 font-semibold">
                                    {t('common.actions', '操作')}
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {labs.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7}>
                                        <TableEmpty
                                            title={t('teacher.labs.empty.title', '尚無實驗室')}
                                            description={t('teacher.labs.empty.description', '建立第一個實驗室來開始管理研究團隊。')}
                                        />
                                    </TableCell>
                                </TableRow>
                            ) : (
                                labs.data.map((lab) => (
                                    <TableRow key={lab.id} className="border-neutral-200/60">
                                        <TableCell>
                                            <div>
                                                <Link
                                                    href={`/manage/teacher/labs/${lab.id}`}
                                                    className="font-medium text-neutral-900 hover:text-primary-600 transition-colors"
                                                >
                                                    {lab.name}
                                                </Link>
                                                {lab.name_en && (
                                                    <div className="text-xs text-neutral-500 mt-0.5">{lab.name_en}</div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-neutral-700">
                                            {lab.field || '—'}
                                        </TableCell>
                                        <TableCell className="text-neutral-700">
                                            {lab.principal_investigator?.name || '—'}
                                        </TableCell>
                                        <TableCell className="text-center text-neutral-700">
                                            {lab.members_count || 0}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {lab.visible ? (
                                                <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
                                                    <Eye className="h-3 w-3 mr-1" />
                                                    {t('common.visible', '可見')}
                                                </Badge>
                                            ) : (
                                                <Badge variant="secondary" className="bg-neutral-100 text-neutral-600">
                                                    <EyeOff className="h-3 w-3 mr-1" />
                                                    {t('common.hidden', '隱藏')}
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-neutral-600 text-sm">
                                            {formatDateTime(lab.updated_at)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/manage/teacher/labs/${lab.id}`} className="cursor-pointer">
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            {t('common.view', '查看')}
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    {abilities.canUpdate && (
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/manage/teacher/labs/${lab.id}/edit`} className="cursor-pointer">
                                                                <Edit className="mr-2 h-4 w-4" />
                                                                {t('common.edit', '編輯')}
                                                            </Link>
                                                        </DropdownMenuItem>
                                                    )}
                                                    {abilities.canManageMembers && (
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/manage/teacher/labs/${lab.id}#members`} className="cursor-pointer">
                                                                <Users className="mr-2 h-4 w-4" />
                                                                {t('teacher.labs.manage_members', '管理成員')}
                                                            </Link>
                                                        </DropdownMenuItem>
                                                    )}
                                                    {abilities.canDelete && (
                                                        <>
                                                            <DropdownMenuItem
                                                                className="text-red-600 focus:text-red-600"
                                                                onSelect={() => {
                                                                    if (confirm(t('teacher.labs.confirm_delete', '確定要刪除此實驗室嗎？'))) {
                                                                        router.delete(`/manage/teacher/labs/${lab.id}`);
                                                                    }
                                                                }}
                                                            >
                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                {t('common.delete', '刪除')}
                                                            </DropdownMenuItem>
                                                        </>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>

                    {/* 分頁 */}
                    {labs.meta.last_page > 1 && (
                        <div className="flex items-center justify-between border-t border-neutral-200/80 px-4 py-3">
                            <div className="text-sm text-neutral-600">
                                {t('common.showing', '顯示')} {labs.meta.from} - {labs.meta.to} / {labs.meta.total} {t('common.items', '筆')}
                            </div>
                            <div className="flex gap-1">
                                {labs.meta.current_page > 1 && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => router.get(`/manage/teacher/labs?page=${labs.meta.current_page - 1}`)}
                                    >
                                        {t('common.previous', '上一頁')}
                                    </Button>
                                )}
                                {labs.meta.current_page < labs.meta.last_page && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => router.get(`/manage/teacher/labs?page=${labs.meta.current_page + 1}`)}
                                    >
                                        {t('common.next', '下一頁')}
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </ManagePage>
        </>
    );
}

ManageTeacherLabsIndex.layout = (page: ReactElement) => <AppLayout>{page}</AppLayout>;
