import { FormEvent, useCallback, useMemo, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Edit2, Eye, EyeOff, Plus, RefreshCcw, RotateCcw, Trash2 } from 'lucide-react';

import ManageLayout from '@/layouts/manage/manage-layout';
import { ManagePageHeader } from '@/components/manage/manage-page-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Pagination from '@/components/ui/pagination';

import { useTranslator } from '@/hooks/use-translator';

import type { BreadcrumbItem } from '@/types';
import type { StaffIndexProps, Staff, Teacher } from '@/types/staff';

const buildStatusBadgeClass = (status: string): string => {
    switch (status) {
        case 'active':
            return 'bg-emerald-100 text-emerald-700 border-emerald-200';
        case 'inactive':
            return 'bg-amber-100 text-amber-700 border-amber-200';
        case 'retired':
        case 'left':
            return 'bg-rose-100 text-rose-700 border-rose-200';
        default:
            return 'bg-slate-100 text-slate-600 border-slate-200';
    }
};

const buildVisibilityBadgeClass = (visible: boolean): string =>
    visible
        ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
        : 'bg-slate-100 text-slate-500 border-slate-200';

const resolveDisplayName = (record: Staff | Teacher): string => {
    const zhName = record.name?.['zh-TW']?.trim();
    const enName = record.name?.en?.trim();

    if (zhName && enName) {
        return `${zhName} / ${enName}`;
    }

    return zhName ?? enName ?? '-';
};

const resolvePosition = (record: Staff | Teacher): string => {
    const zh = (record as Staff).position?.['zh-TW'] ?? (record as Teacher).title?.['zh-TW'];
    const en = (record as Staff).position?.en ?? (record as Teacher).title?.en;

    if (zh && en) {
        return `${zh} / ${en}`;
    }

    return zh ?? en ?? '-';
};

const resolveEmploymentPeriod = (record: Staff | Teacher, ongoingLabel: string): string => {
    const start = record.employment_started_at ?? '';
    const end = record.employment_ended_at ?? '';

    if (!start && !end) {
        return '-';
    }

    const endLabel = end || ongoingLabel;

    return `${start || '?'} ~ ${endLabel}`;
};

const buildStaffName = (staff: Staff): string =>
    staff.name?.['zh-TW']?.trim() || staff.name?.en?.trim() || `#${staff.id}`;

const buildTeacherName = (teacher: Teacher): string =>
    teacher.name?.['zh-TW']?.trim() || teacher.name?.en?.trim() || `#${teacher.id}`;

export default function StaffIndex({
    initialTab,
    staff,
    teachers,
    filters,
    perPageOptions,
    employmentStatusOptions,
    visibilityOptions,
}: StaffIndexProps) {
    const { t } = useTranslator('manage');

    const breadcrumbs: BreadcrumbItem[] = useMemo(
        () => [
            { title: t('layout.breadcrumbs.dashboard', '管理首頁'), href: '/manage/dashboard' },
            { title: t('sidebar.admin.staff', '師資與職員'), href: '/manage/staff' },
        ],
        [t],
    );

    const [activeTab, setActiveTab] = useState<'staff' | 'teachers'>(initialTab);
    const [filterState, setFilterState] = useState({
        search: filters.search ?? '',
        status: filters.status ?? '',
        visible: filters.visible ?? '',
        per_page: String(filters.per_page ?? perPageOptions[0] ?? 15),
    });

    const staffStatusLabels = useMemo(
        () => ({
            active: t('staff.staff.status.active', '在職'),
            inactive: t('staff.staff.status.inactive', '暫離'),
            retired: t('staff.teachers.status.retired', '退休'),
            left: t('staff.teachers.status.left', '離職'),
        }),
        [t],
    );

    const teacherStatusLabels = useMemo(
        () => ({
            active: t('staff.teachers.status.active', '在職'),
            inactive: t('staff.staff.status.inactive', '暫離'),
            retired: t('staff.teachers.status.retired', '退休'),
            left: t('staff.teachers.status.left', '離職'),
        }),
        [t],
    );

    const employmentOngoingLabel = t('staff.index.employment.present', '至今');

    const buildFilterQuery = useCallback(
        (state: typeof filterState = filterState, tab: 'staff' | 'teachers' = activeTab) => {
            const params: Record<string, string> = { tab };
            const trimmedSearch = state.search.trim();

            if (trimmedSearch !== '') {
                params.search = trimmedSearch;
            }

            if (state.status) {
                params.status = state.status;
            }

            if (state.visible) {
                params.visible = state.visible;
            }

            if (state.per_page) {
                params.per_page = state.per_page;
            }

            return params;
        },
        [filterState, activeTab],
    );

    const applyFilters = useCallback(
        (state: typeof filterState = filterState, tab: 'staff' | 'teachers' = activeTab) => {
            router.get('/manage/staff', buildFilterQuery(state, tab), {
                preserveState: true,
                preserveScroll: true,
            });
        },
        [buildFilterQuery, filterState, activeTab],
    );

    const handleFilterSubmit = useCallback(
        (event: FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            applyFilters();
        },
        [applyFilters],
    );

    const handleFilterReset = useCallback(() => {
        const resetState = {
            search: '',
            status: '',
            visible: '',
            per_page: String(perPageOptions[0] ?? 15),
        };
        setFilterState(resetState);
        applyFilters(resetState);
    }, [applyFilters, perPageOptions]);

    const handleTabChange = useCallback(
        (value: string) => {
            const nextTab: 'staff' | 'teachers' = value === 'teachers' ? 'teachers' : 'staff';
            setActiveTab(nextTab);
            applyFilters(filterState, nextTab);
        },
        [applyFilters, filterState],
    );

    const handlePerPageChange = useCallback(
        (perPage: number) => {
            const nextState = { ...filterState, per_page: String(perPage) };
            setFilterState(nextState);
            applyFilters(nextState);
        },
        [applyFilters, filterState],
    );

    const toggleStaffStatus = useCallback((member: Staff) => {
        router.patch(`/manage/staff/${member.id}/status`, {}, {
            preserveScroll: true,
            preserveState: true,
        });
    }, []);

    const toggleStaffVisibility = useCallback((member: Staff) => {
        router.patch(`/manage/staff/${member.id}/visibility`, {}, {
            preserveScroll: true,
            preserveState: true,
        });
    }, []);

    const deleteStaff = useCallback((member: Staff) => {
        if (!window.confirm(`確定要刪除職員「${buildStaffName(member)}」嗎？`)) {
            return;
        }

        router.delete(`/manage/staff/${member.id}`, {
            preserveScroll: true,
        });
    }, []);

    const restoreStaff = useCallback((member: Staff) => {
        router.patch(`/manage/staff/${member.id}/restore`, {}, {
            preserveScroll: true,
            preserveState: true,
        });
    }, []);

    const forceDeleteStaff = useCallback((member: Staff) => {
        if (!window.confirm(`確定要永久刪除職員「${buildStaffName(member)}」嗎？此操作無法復原。`)) {
            return;
        }

        router.delete(`/manage/staff/${member.id}/force`, {
            preserveScroll: true,
        });
    }, []);

    const toggleTeacherStatus = useCallback((teacher: Teacher) => {
        router.patch(`/manage/teachers/${teacher.id}/status`, {}, {
            preserveScroll: true,
            preserveState: true,
        });
    }, []);

    const toggleTeacherVisibility = useCallback((teacher: Teacher) => {
        router.patch(`/manage/teachers/${teacher.id}/visibility`, {}, {
            preserveScroll: true,
            preserveState: true,
        });
    }, []);

    const deleteTeacher = useCallback((teacher: Teacher) => {
        if (!window.confirm(`確定要刪除教師「${buildTeacherName(teacher)}」嗎？`)) {
            return;
        }

        router.delete(`/manage/teachers/${teacher.id}`, {
            preserveScroll: true,
        });
    }, []);

    const restoreTeacher = useCallback((teacher: Teacher) => {
        router.patch(`/manage/teachers/${teacher.id}/restore`, {}, {
            preserveScroll: true,
            preserveState: true,
        });
    }, []);

    const forceDeleteTeacher = useCallback((teacher: Teacher) => {
        if (!window.confirm(`確定要永久刪除教師「${buildTeacherName(teacher)}」嗎？此操作無法復原。`)) {
            return;
        }

        router.delete(`/manage/teachers/${teacher.id}/force`, {
            preserveScroll: true,
        });
    }, []);

    const badgeLabel = activeTab === 'staff'
        ? t('staff.index.tabs.staff', '職員管理')
        : t('staff.index.tabs.teachers', '教師管理');

    const filterHasValue =
        filterState.search.trim() !== '' ||
        filterState.status !== '' ||
        filterState.visible !== '';

    return (
        <ManageLayout breadcrumbs={breadcrumbs}>
            <Head title={t('staff.index.title', '師資與職員管理')} />

            <ManagePageHeader
                title={t('staff.index.title', '師資與職員管理')}
                description={t('staff.index.description', '管理系所教師與職員資料，維護個人檔案與聯絡資訊。')}
                badge={{ label: badgeLabel }}
                actions={(
                    <div className="flex flex-col gap-2 sm:flex-row">
                        <Button variant="outline" asChild>
                            <Link href="/manage/staff/create">
                                <Plus className="size-4" />
                                {t('staff.index.create_staff', '新增職員')}
                            </Link>
                        </Button>
                        <Button asChild>
                            <Link href="/manage/teachers/create">
                                <Plus className="size-4" />
                                {t('staff.index.create_teacher', '新增教師')}
                            </Link>
                        </Button>
                    </div>
                )}
                className="mb-6"
            />

            <Card className="mb-6 border border-slate-200 bg-white shadow-sm">
                <CardHeader>
                    <CardTitle>{t('staff.index.title', '師資與職員管理')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleFilterSubmit} className="grid gap-4 md:grid-cols-5">
                        <div className="md:col-span-2">
                            <Label htmlFor="search">{t('staff.filters.search', '關鍵字')}</Label>
                            <Input
                                id="search"
                                value={filterState.search}
                                placeholder={t('staff.filters.search_placeholder', '搜尋姓名、職稱或聯絡資訊')}
                                onChange={(event) =>
                                    setFilterState((previous) => ({
                                        ...previous,
                                        search: event.target.value,
                                    }))
                                }
                            />
                        </div>

                        <div>
                            <Label htmlFor="status">{t('staff.staff.table.status', '狀態')}</Label>
                            <Select
                                id="status"
                                value={filterState.status}
                                onChange={(event) =>
                                    setFilterState((previous) => ({
                                        ...previous,
                                        status: event.target.value,
                                    }))
                                }
                            >
                                {employmentStatusOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="visible">{t('staff.filters.visible', '顯示狀態')}</Label>
                            <Select
                                id="visible"
                                value={filterState.visible}
                                onChange={(event) =>
                                    setFilterState((previous) => ({
                                        ...previous,
                                        visible: event.target.value,
                                    }))
                                }
                            >
                                {visibilityOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="per-page">{t('staff.filters.per_page', '每頁筆數')}</Label>
                            <Select
                                id="per-page"
                                value={filterState.per_page}
                                onChange={(event) =>
                                    setFilterState((previous) => ({
                                        ...previous,
                                        per_page: event.target.value,
                                    }))
                                }
                            >
                                {perPageOptions.map((option) => (
                                    <option key={option} value={String(option)}>
                                        {option}
                                    </option>
                                ))}
                            </Select>
                        </div>

                        <div className="flex items-end gap-2">
                            <Button type="submit" className="flex-1">
                                {t('staff.filters.apply', '套用篩選')}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                className="flex-1"
                                onClick={handleFilterReset}
                                disabled={!filterHasValue}
                            >
                                {t('staff.filters.reset', '清除')}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <Tabs value={activeTab} onValueChange={handleTabChange}>
                <TabsList className="mb-4">
                    <TabsTrigger value="staff">{t('staff.index.tabs.staff', '職員管理')}</TabsTrigger>
                    <TabsTrigger value="teachers">{t('staff.index.tabs.teachers', '教師管理')}</TabsTrigger>
                </TabsList>

                <TabsContent value="staff">
                    <Card className="border border-slate-200 bg-white shadow-sm">
                        <CardHeader>
                            <CardTitle>{t('staff.staff.title', '職員管理')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {staff.active.length === 0 ? (
                                <p className="text-sm text-slate-500">
                                    {t('staff.staff.empty', '目前沒有職員資料。')}
                                </p>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[18%]">{t('staff.staff.table.name', '姓名')}</TableHead>
                                            <TableHead className="w-[18%]">{t('staff.staff.table.position', '職位')}</TableHead>
                                            <TableHead className="w-[22%]">{t('staff.staff.table.email', '聯絡資訊')}</TableHead>
                                            <TableHead className="w-[18%]">{t('staff.staff.table.status', '狀態')}</TableHead>
                                            <TableHead className="w-[14%]">{t('staff.staff.user', '帳號對應')}</TableHead>
                                            <TableHead className="w-[10%] text-right">{t('staff.staff.table.actions', '操作')}</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {staff.active.map((member) => (
                                            <TableRow key={member.id}>
                                                <TableCell>
                                                    <div className="font-medium text-slate-900">{resolveDisplayName(member)}</div>
                                                    {member.avatar_url && (
                                                        <a
                                                            href={member.avatar_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-xs text-primary hover:underline"
                                                        >
                                                            {t('staff.staff.avatar', '檢視照片')}
                                                        </a>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm text-slate-900">{resolvePosition(member)}</div>
                                                    {member.sort_order !== undefined && (
                                                        <div className="text-xs text-slate-500">
                                                            {t('staff.staff.sort_order', '排序')}
                                                            ：{member.sort_order}
                                                        </div>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col gap-1 text-sm">
                                                        {member.email && (
                                                            <a href={`mailto:${member.email}`} className="text-primary hover:underline">
                                                                {member.email}
                                                            </a>
                                                        )}
                                                        {member.phone && <span>{member.phone}</span>}
                                                        {member.office && (
                                                            <span className="text-xs text-slate-500">
                                                                {t('staff.staff.office', '辦公室')}
                                                                ：{member.office}
                                                            </span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col gap-2">
                                                        <Badge className={buildStatusBadgeClass(member.employment_status)}>
                                                            {staffStatusLabels[member.employment_status] ?? member.employment_status}
                                                        </Badge>
                                                        <Badge className={buildVisibilityBadgeClass(member.visible)}>
                                                            {member.visible
                                                                ? t('staff.visibility.visible', '前台顯示')
                                                                : t('staff.visibility.hidden', '已隱藏')}
                                                        </Badge>
                                                        <span className="text-xs text-slate-500">
                                                            {t('staff.staff.employment_period', '任職期間')}
                                                            ：{resolveEmploymentPeriod(member, employmentOngoingLabel)}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {member.user ? (
                                                        <div className="text-sm">
                                                            <div className="font-medium text-slate-900">{member.user.name}</div>
                                                            <div className="text-xs text-slate-500">{member.user.email}</div>
                                                            <div className="text-xs text-slate-400">{member.user.role}</div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-slate-500">
                                                            {t('staff.staff.no_user', '尚未綁定帳號')}
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex flex-wrap justify-end gap-1">
                                                        <Button variant="ghost" size="sm" asChild>
                                                            <Link href={`/manage/staff/${member.id}/edit`}>
                                                                <Edit2 className="size-4" />
                                                                {t('staff.staff.actions.edit', '編輯')}
                                                            </Link>
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => toggleStaffStatus(member)}
                                                        >
                                                            <RefreshCcw className="size-4" />
                                                            {t('staff.staff.actions.toggle_status', '切換狀態')}
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => toggleStaffVisibility(member)}
                                                        >
                                                            {member.visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                                            {member.visible
                                                                ? t('staff.staff.actions.hide', '隱藏')
                                                                : t('staff.staff.actions.show', '顯示')}
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => deleteStaff(member)}
                                                        >
                                                            <Trash2 className="size-4" />
                                                            {t('staff.staff.actions.delete', '刪除')}
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>

                    {staff.trashed.length > 0 && (
                        <Card className="mt-6 border border-rose-100 bg-white shadow-sm">
                            <CardHeader>
                                <CardTitle>{t('staff.staff.trashed', '回收站')}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[30%]">{t('staff.staff.table.name', '姓名')}</TableHead>
                                            <TableHead className="w-[30%]">{t('staff.staff.table.email', '聯絡資訊')}</TableHead>
                                            <TableHead className="w-[20%]">{t('staff.staff.deleted_at', '刪除時間')}</TableHead>
                                            <TableHead className="w-[20%] text-right">{t('staff.staff.table.actions', '操作')}</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {staff.trashed.map((member) => (
                                            <TableRow key={`trashed-${member.id}`}>
                                                <TableCell>{resolveDisplayName(member)}</TableCell>
                                                <TableCell>{member.email ?? '-'}</TableCell>
                                                <TableCell>{member.deleted_at ?? '-'}</TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-1">
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => restoreStaff(member)}
                                                        >
                                                            <RotateCcw className="size-4" />
                                                            {t('staff.staff.actions.restore', '還原')}
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => forceDeleteStaff(member)}
                                                        >
                                                            <Trash2 className="size-4" />
                                                            {t('staff.staff.actions.force_delete', '永久刪除')}
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                <TabsContent value="teachers">
                    <Card className="border border-slate-200 bg-white shadow-sm">
                        <CardHeader>
                            <CardTitle>{t('staff.teachers.title', '教師管理')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {teachers.data.length === 0 ? (
                                <p className="text-sm text-slate-500">
                                    {t('staff.teachers.empty', '目前沒有教師資料。')}
                                </p>
                            ) : (
                                <>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-[18%]">{t('staff.teachers.table.name', '姓名')}</TableHead>
                                                <TableHead className="w-[18%]">{t('staff.teachers.table.title', '職稱')}</TableHead>
                                                <TableHead className="w-[22%]">{t('staff.teachers.table.email', '聯絡資訊')}</TableHead>
                                                <TableHead className="w-[18%]">{t('staff.teachers.table.status', '狀態')}</TableHead>
                                                <TableHead className="w-[14%]">{t('staff.teachers.table.specialization', '所屬單位')}</TableHead>
                                                <TableHead className="w-[10%] text-right">{t('staff.teachers.table.actions', '操作')}</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {teachers.data.map((teacher) => (
                                                <TableRow key={teacher.id}>
                                                    <TableCell>
                                                        <div className="font-medium text-slate-900">{resolveDisplayName(teacher)}</div>
                                                        {teacher.avatar_url && (
                                                            <a
                                                                href={teacher.avatar_url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-xs text-primary hover:underline"
                                                            >
                                                                {t('staff.teachers.avatar', '檢視照片')}
                                                            </a>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="text-sm text-slate-900">{resolvePosition(teacher)}</div>
                                                        {teacher.sort_order !== undefined && (
                                                            <div className="text-xs text-slate-500">
                                                                {t('staff.teachers.sort_order', '排序')}
                                                                ：{teacher.sort_order}
                                                            </div>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-col gap-1 text-sm">
                                                            {teacher.email && (
                                                                <a href={`mailto:${teacher.email}`} className="text-primary hover:underline">
                                                                    {teacher.email}
                                                                </a>
                                                            )}
                                                            {teacher.phone && <span>{teacher.phone}</span>}
                                                            {teacher.office && (
                                                                <span className="text-xs text-slate-500">
                                                                    {t('staff.teachers.office', '辦公室')}
                                                                    ：{teacher.office}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-col gap-2">
                                                            <Badge className={buildStatusBadgeClass(teacher.employment_status)}>
                                                                {teacherStatusLabels[teacher.employment_status] ?? teacher.employment_status}
                                                            </Badge>
                                                            <Badge className={buildVisibilityBadgeClass(teacher.visible)}>
                                                                {teacher.visible
                                                                    ? t('staff.visibility.visible', '前台顯示')
                                                                    : t('staff.visibility.hidden', '已隱藏')}
                                                            </Badge>
                                                            <span className="text-xs text-slate-500">
                                                                {t('staff.teachers.employment_period', '任職期間')}
                                                                ：{resolveEmploymentPeriod(teacher, employmentOngoingLabel)}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        {teacher.labs && teacher.labs.length > 0 ? (
                                                            <div className="flex flex-wrap gap-1">
                                                                {teacher.labs.map((lab) => (
                                                                    <Badge key={lab.id} variant="outline">
                                                                        {lab.name?.['zh-TW'] ?? lab.name?.en ?? lab.code ?? '-'}
                                                                    </Badge>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <span className="text-xs text-slate-500">
                                                                {t('staff.teachers.no_lab', '未分配實驗室')}
                                                            </span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex flex-wrap justify-end gap-1">
                                                            <Button variant="ghost" size="sm" asChild>
                                                                <Link href={`/manage/teachers/${teacher.id}/edit`}>
                                                                    <Edit2 className="size-4" />
                                                                    {t('staff.teachers.actions.edit', '編輯')}
                                                                </Link>
                                                            </Button>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => toggleTeacherStatus(teacher)}
                                                            >
                                                                <RefreshCcw className="size-4" />
                                                                {t('staff.teachers.actions.toggle_status', '切換狀態')}
                                                            </Button>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => toggleTeacherVisibility(teacher)}
                                                            >
                                                                {teacher.visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                                                {teacher.visible
                                                                    ? t('staff.teachers.actions.hide', '隱藏')
                                                                    : t('staff.teachers.actions.show', '顯示')}
                                                            </Button>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => deleteTeacher(teacher)}
                                                            >
                                                                <Trash2 className="size-4" />
                                                                {t('staff.teachers.actions.delete', '刪除')}
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>

                                    {teachers.meta.last_page > 1 && (
                                        <Pagination
                                            meta={{
                                                ...teachers.meta,
                                                links: teachers.links,
                                            }}
                                            perPageOptions={perPageOptions}
                                            onPerPageChange={handlePerPageChange}
                                            className="mt-4"
                                        />
                                    )}
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {teachers.trashed.length > 0 && (
                        <Card className="mt-6 border border-rose-100 bg-white shadow-sm">
                            <CardHeader>
                                <CardTitle>{t('staff.teachers.trashed', '回收站')}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[30%]">{t('staff.teachers.table.name', '姓名')}</TableHead>
                                            <TableHead className="w-[30%]">{t('staff.teachers.table.email', '聯絡資訊')}</TableHead>
                                            <TableHead className="w-[20%]">{t('staff.teachers.deleted_at', '刪除時間')}</TableHead>
                                            <TableHead className="w-[20%] text-right">{t('staff.teachers.table.actions', '操作')}</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {teachers.trashed.map((teacher) => (
                                            <TableRow key={`trashed-teacher-${teacher.id}`}>
                                                <TableCell>{resolveDisplayName(teacher)}</TableCell>
                                                <TableCell>{teacher.email ?? '-'}</TableCell>
                                                <TableCell>{teacher.deleted_at ?? '-'}</TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-1">
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => restoreTeacher(teacher)}
                                                        >
                                                            <RotateCcw className="size-4" />
                                                            {t('staff.teachers.actions.restore', '還原')}
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => forceDeleteTeacher(teacher)}
                                                        >
                                                            <Trash2 className="size-4" />
                                                            {t('staff.teachers.actions.force_delete', '永久刪除')}
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>
            </Tabs>
        </ManageLayout>
    );
}

StaffIndex.layout = (page: React.ReactElement) => page;
