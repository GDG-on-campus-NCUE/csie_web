import { useEffect, useMemo, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import ManageLayout from '@/layouts/manage/manage-layout';
import type { BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Pagination from '@/components/ui/pagination';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Filter, Pencil, Plus, Search, Trash2 } from 'lucide-react';

interface CourseProgramOption {
    id: number;
    name: string;
    name_en?: string | null;
}

interface CourseProgramSummary {
    id: number;
    name: string;
    name_en?: string | null;
}

interface CourseRecord {
    id: number;
    code: string;
    name: string;
    name_en?: string | null;
    credit?: number | string | null;
    hours?: number | null;
    visible: boolean;
    level?: string | null;
    updated_at?: string | null;
    program?: CourseProgramSummary | null;
    programs?: CourseProgramSummary[];
}

interface ProgramRecord {
    id: number;
    code?: string | null;
    name: string;
    name_en?: string | null;
    level: string;
    visible: boolean;
    sort_order?: number | null;
    courses_count?: number | null;
    updated_at?: string | null;
    website_url?: string | null;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginationMeta {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from?: number | null;
    to?: number | null;
    links?: PaginationLink[];
}

interface AcademicsIndexProps {
    courses: {
        data: CourseRecord[];
        meta?: PaginationMeta;
        links?: PaginationLink[];
    };
    courseProgramOptions: CourseProgramOption[];
    courseFilters?: Partial<Record<'search' | 'program' | 'level' | 'visible' | 'per_page', string>>;
    coursePerPageOptions?: number[];
    programs: {
        data: ProgramRecord[];
        meta?: PaginationMeta;
        links?: PaginationLink[];
    };
    programFilters?: Partial<Record<'search' | 'level' | 'visible' | 'per_page', string>>;
    programPerPageOptions?: number[];
    activeTab?: 'courses' | 'programs';
}

type CourseFilterState = {
    search: string;
    program: string;
    level: string;
    visible: string;
    per_page: string;
};

type ProgramFilterState = {
    search: string;
    level: string;
    visible: string;
    per_page: string;
};

const LEVEL_OPTIONS = [
    { value: '', label: '全部學制' },
    { value: 'bachelor', label: '學士班' },
    { value: 'master', label: '碩士班' },
    { value: 'ai_inservice', label: 'AI 在職專班' },
    { value: 'dual', label: '學碩雙聯' },
];

const buildCourseQuery = (state: CourseFilterState) =>
    Object.fromEntries(
        Object.entries(state).filter(([, value]) => value !== '' && value !== null && value !== undefined)
    );

const buildProgramQuery = (state: ProgramFilterState) =>
    Object.fromEntries(
        Object.entries(state).filter(([, value]) => value !== '' && value !== null && value !== undefined)
    );

const formatDateTime = (value?: string | null) => {
    if (!value) {
        return '—';
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleString('zh-TW', {
        dateStyle: 'medium',
        timeStyle: 'short',
    });
};

const resolveVisibilityBadge = (visible: boolean) =>
    visible
        ? { label: '顯示中', className: 'border-emerald-200 bg-emerald-50 text-emerald-700' }
        : { label: '已隱藏', className: 'border-amber-200 bg-amber-50 text-amber-700' };

export default function AcademicsIndex({
    courses,
    courseProgramOptions,
    courseFilters = {},
    coursePerPageOptions = [],
    programs,
    programFilters = {},
    programPerPageOptions = [],
    activeTab = 'courses',
}: AcademicsIndexProps) {
    const resolvedCoursePerPageOptions = coursePerPageOptions.length > 0 ? coursePerPageOptions : [15, 30, 50, 100, 200];
    const resolvedProgramPerPageOptions = programPerPageOptions.length > 0 ? programPerPageOptions : [15, 30, 50, 100, 200];

    const [tab, setTab] = useState<'courses' | 'programs'>(activeTab);
    useEffect(() => {
        setTab(activeTab);
    }, [activeTab]);

    const [courseFilterState, setCourseFilterState] = useState<CourseFilterState>({
        search: courseFilters.search ?? '',
        program: courseFilters.program ?? '',
        level: courseFilters.level ?? '',
        visible: courseFilters.visible ?? '',
        per_page: String(courseFilters.per_page ?? resolvedCoursePerPageOptions[0] ?? 15),
    });

    const [programFilterState, setProgramFilterState] = useState<ProgramFilterState>({
        search: programFilters.search ?? '',
        level: programFilters.level ?? '',
        visible: programFilters.visible ?? '',
        per_page: String(programFilters.per_page ?? resolvedProgramPerPageOptions[0] ?? 15),
    });

    useEffect(() => {
        setCourseFilterState({
            search: courseFilters.search ?? '',
            program: courseFilters.program ?? '',
            level: courseFilters.level ?? '',
            visible: courseFilters.visible ?? '',
            per_page: String(courseFilters.per_page ?? resolvedCoursePerPageOptions[0] ?? 15),
        });
    }, [
        courseFilters.search,
        courseFilters.program,
        courseFilters.level,
        courseFilters.visible,
        courseFilters.per_page,
        resolvedCoursePerPageOptions,
    ]);

    useEffect(() => {
        setProgramFilterState({
            search: programFilters.search ?? '',
            level: programFilters.level ?? '',
            visible: programFilters.visible ?? '',
            per_page: String(programFilters.per_page ?? resolvedProgramPerPageOptions[0] ?? 15),
        });
    }, [
        programFilters.search,
        programFilters.level,
        programFilters.visible,
        programFilters.per_page,
        resolvedProgramPerPageOptions,
    ]);

    const coursePagination = {
        current_page: courses.meta?.current_page ?? 1,
        last_page: courses.meta?.last_page ?? 1,
        per_page: courses.meta?.per_page ?? Number(courseFilterState.per_page) ?? 15,
        total: courses.meta?.total ?? courses.data.length,
        from: courses.meta?.from ?? (courses.data.length > 0 ? 1 : 0),
        to: courses.meta?.to ?? courses.data.length,
        links: courses.meta?.links ?? courses.links ?? [],
    } as PaginationMeta;

    const programPagination = {
        current_page: programs.meta?.current_page ?? 1,
        last_page: programs.meta?.last_page ?? 1,
        per_page: programs.meta?.per_page ?? Number(programFilterState.per_page) ?? 15,
        total: programs.meta?.total ?? programs.data.length,
        from: programs.meta?.from ?? (programs.data.length > 0 ? 1 : 0),
        to: programs.meta?.to ?? programs.data.length,
        links: programs.meta?.links ?? programs.links ?? [],
    } as PaginationMeta;

    const breadcrumbs: BreadcrumbItem[] = useMemo(
        () => [
            { title: '管理首頁', href: '/manage/dashboard' },
            { title: '課程與學程', href: '/manage/academics' },
        ],
        []
    );

    const visitWithQuery = (
        nextTab: 'courses' | 'programs',
        nextCourse?: CourseFilterState,
        nextProgram?: ProgramFilterState,
        options?: { replace?: boolean }
    ) => {
        const query = {
            ...buildCourseQuery(nextCourse ?? courseFilterState),
            ...buildProgramQuery(nextProgram ?? programFilterState),
            tab: nextTab,
        };

        router.get('/manage/academics', query, {
            preserveState: true,
            preserveScroll: true,
            replace: options?.replace ?? false,
        });
    };

    const handleTabChange = (value: string) => {
        const nextTab = value === 'programs' ? 'programs' : 'courses';
        setTab(nextTab);
        visitWithQuery(nextTab, courseFilterState, programFilterState);
    };

    const applyCourseFilters = (state: CourseFilterState, options?: { replace?: boolean }) => {
        visitWithQuery('courses', state, programFilterState, options);
    };

    const applyProgramFilters = (state: ProgramFilterState, options?: { replace?: boolean }) => {
        visitWithQuery('programs', courseFilterState, state, options);
    };

    const handleCourseFilterChange = (next: Partial<CourseFilterState>, options?: { replace?: boolean }) => {
        setCourseFilterState((previous) => {
            const updated = { ...previous, ...next } as CourseFilterState;
            applyCourseFilters(updated, options);
            return updated;
        });
    };

    const handleProgramFilterChange = (next: Partial<ProgramFilterState>, options?: { replace?: boolean }) => {
        setProgramFilterState((previous) => {
            const updated = { ...previous, ...next } as ProgramFilterState;
            applyProgramFilters(updated, options);
            return updated;
        });
    };

    const handleCourseSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        applyCourseFilters(courseFilterState);
    };

    const handleProgramSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        applyProgramFilters(programFilterState);
    };

    const resetCourseFilters = () => {
        const resetState: CourseFilterState = {
            search: '',
            program: '',
            level: '',
            visible: '',
            per_page: String(resolvedCoursePerPageOptions[0] ?? 15),
        };
        setCourseFilterState(resetState);
        applyCourseFilters(resetState);
    };

    const resetProgramFilters = () => {
        const resetState: ProgramFilterState = {
            search: '',
            level: '',
            visible: '',
            per_page: String(resolvedProgramPerPageOptions[0] ?? 15),
        };
        setProgramFilterState(resetState);
        applyProgramFilters(resetState);
    };

    const courseProgramLabel = (course: CourseRecord) => {
        if (course.program) {
            return course.program.name;
        }
        if (course.programs && course.programs.length > 0) {
            return course.programs.map((item) => item.name).join('、');
        }
        return '—';
    };

    const levelLabel = (value?: string | null) => {
        const option = LEVEL_OPTIONS.find((item) => item.value === (value ?? ''));
        return option ? option.label : '—';
    };

    const visibilityBadge = (visible: boolean) => {
        const meta = resolveVisibilityBadge(visible);
        return <Badge variant="outline" className={meta.className}>{meta.label}</Badge>;
    };

    const handleDeleteCourse = (course: CourseRecord) => {
        if (!window.confirm(`確定要刪除課程「${course.name}」嗎？`)) {
            return;
        }
        router.delete(`/manage/courses/${course.id}`, { preserveScroll: true });
    };

    const handleDeleteProgram = (program: ProgramRecord) => {
        if (!window.confirm(`確定要刪除學程「${program.name}」嗎？`)) {
            return;
        }
        router.delete(`/manage/programs/${program.id}`, { preserveScroll: true });
    };

    return (
        <ManageLayout breadcrumbs={breadcrumbs} role="admin">
            <Head title="課程與學程管理" />

            <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
                <div className="border-b border-gray-200 px-6 py-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900">課程與學程管理</h1>
                            <p className="mt-1 text-sm text-gray-600">集中檢視並管理所有課程與學程資訊</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Button
                                variant={tab === 'courses' ? 'default' : 'outline'}
                                onClick={() => router.visit('/manage/courses/create')}
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                新增課程
                            </Button>
                            <Button
                                variant={tab === 'programs' ? 'default' : 'outline'}
                                onClick={() => router.visit('/manage/programs/create')}
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                新增學程
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="px-6 py-6">
                    <Tabs value={tab} onValueChange={handleTabChange}>
                        <TabsList className="mb-6">
                            <TabsTrigger value="courses">課程列表</TabsTrigger>
                            <TabsTrigger value="programs">學程列表</TabsTrigger>
                        </TabsList>

                        <TabsContent value="courses" className="space-y-6">
                            <form onSubmit={handleCourseSubmit} className="grid grid-cols-1 gap-4 lg:grid-cols-12">
                                <div className="lg:col-span-4">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input
                                            value={courseFilterState.search}
                                            onChange={(event) =>
                                                setCourseFilterState((previous) => ({ ...previous, search: event.target.value }))
                                            }
                                            placeholder="搜尋課程名稱或代碼"
                                            className="pl-10"
                                        />
                                    </div>
                                </div>

                                <div className="lg:col-span-3">
                                    <Select
                                        value={courseFilterState.program}
                                        onChange={(event) =>
                                            handleCourseFilterChange({ program: event.target.value }, { replace: true })
                                        }
                                    >
                                        <option value="">全部學程</option>
                                        {courseProgramOptions.map((program) => (
                                            <option key={program.id} value={String(program.id)}>
                                                {program.name}
                                                {program.name_en ? ` / ${program.name_en}` : ''}
                                            </option>
                                        ))}
                                    </Select>
                                </div>

                                <div className="lg:col-span-2">
                                    <Select
                                        value={courseFilterState.level}
                                        onChange={(event) =>
                                            handleCourseFilterChange({ level: event.target.value }, { replace: true })
                                        }
                                    >
                                        {LEVEL_OPTIONS.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </Select>
                                </div>

                                <div className="lg:col-span-2">
                                    <Select
                                        value={courseFilterState.visible}
                                        onChange={(event) =>
                                            handleCourseFilterChange({ visible: event.target.value }, { replace: true })
                                        }
                                    >
                                        <option value="">顯示狀態</option>
                                        <option value="1">顯示</option>
                                        <option value="0">隱藏</option>
                                    </Select>
                                </div>

                                <div className="lg:col-span-1">
                                    <Select
                                        value={courseFilterState.per_page}
                                        onChange={(event) =>
                                            handleCourseFilterChange({ per_page: event.target.value }, { replace: true })
                                        }
                                    >
                                        {resolvedCoursePerPageOptions.map((option) => (
                                            <option key={option} value={String(option)}>
                                                每頁 {option} 筆
                                            </option>
                                        ))}
                                    </Select>
                                </div>

                                <div className="flex items-center justify-end gap-2 lg:col-span-12">
                                    <Button type="submit" variant="outline" className="w-full max-w-[120px]">
                                        <Filter className="mr-2 h-4 w-4" />
                                        套用
                                    </Button>
                                    <Button type="button" variant="ghost" className="w-full max-w-[120px]" onClick={resetCourseFilters}>
                                        清除
                                    </Button>
                                </div>
                            </form>

                            <div className="overflow-hidden rounded-2xl border border-gray-200">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-gray-50">
                                            <TableHead className="w-[28%]">課程名稱</TableHead>
                                            <TableHead className="w-[18%]">歸屬學程</TableHead>
                                            <TableHead className="w-[12%]">課程代碼</TableHead>
                                            <TableHead className="w-[10%]">學分</TableHead>
                                            <TableHead className="w-[10%]">時數</TableHead>
                                            <TableHead className="w-[10%]">學制</TableHead>
                                            <TableHead className="w-[12%]">狀態</TableHead>
                                            <TableHead className="w-[12%]">最後更新</TableHead>
                                            <TableHead className="w-[10%] text-right">操作</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {courses.data.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={9} className="py-12 text-center text-sm text-gray-500">
                                                    尚無符合條件的課程資料。
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            courses.data.map((course) => (
                                                <TableRow key={course.id} className="align-top">
                                                    <TableCell>
                                                        <div className="space-y-1">
                                                            <span className="font-semibold text-gray-900">{course.name}</span>
                                                            {course.name_en && (
                                                                <p className="text-sm text-gray-500">{course.name_en}</p>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-sm text-gray-700">{courseProgramLabel(course)}</TableCell>
                                                    <TableCell className="text-sm text-gray-700">{course.code}</TableCell>
                                                    <TableCell className="text-sm text-gray-700">{course.credit ?? '—'}</TableCell>
                                                    <TableCell className="text-sm text-gray-700">{course.hours ?? '—'}</TableCell>
                                                    <TableCell className="text-sm text-gray-700">{levelLabel(course.level)}</TableCell>
                                                    <TableCell>{visibilityBadge(course.visible)}</TableCell>
                                                    <TableCell className="text-sm text-gray-700">{formatDateTime(course.updated_at)}</TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <Button
                                                                variant="outline"
                                                                size="icon"
                                                                className="h-9 w-9"
                                                                onClick={() => router.visit(`/manage/courses/${course.id}/edit`)}
                                                            >
                                                                <Pencil className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                size="icon"
                                                                className="h-9 w-9 text-red-600 hover:text-red-700"
                                                                onClick={() => handleDeleteCourse(course)}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            <Pagination
                                meta={{
                                    current_page: coursePagination.current_page,
                                    last_page: coursePagination.last_page,
                                    per_page: coursePagination.per_page,
                                    total: coursePagination.total,
                                    from: coursePagination.from ?? 0,
                                    to: coursePagination.to ?? 0,
                                    links: coursePagination.links ?? [],
                                }}
                                perPageOptions={resolvedCoursePerPageOptions}
                                onPerPageChange={(value) =>
                                    handleCourseFilterChange({ per_page: String(value) }, { replace: true })
                                }
                            />
                        </TabsContent>

                        <TabsContent value="programs" className="space-y-6">
                            <form onSubmit={handleProgramSubmit} className="grid grid-cols-1 gap-4 lg:grid-cols-12">
                                <div className="lg:col-span-5">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input
                                            value={programFilterState.search}
                                            onChange={(event) =>
                                                setProgramFilterState((previous) => ({ ...previous, search: event.target.value }))
                                            }
                                            placeholder="搜尋學程名稱或代碼"
                                            className="pl-10"
                                        />
                                    </div>
                                </div>

                                <div className="lg:col-span-3">
                                    <Select
                                        value={programFilterState.level}
                                        onChange={(event) =>
                                            handleProgramFilterChange({ level: event.target.value }, { replace: true })
                                        }
                                    >
                                        {LEVEL_OPTIONS.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </Select>
                                </div>

                                <div className="lg:col-span-2">
                                    <Select
                                        value={programFilterState.visible}
                                        onChange={(event) =>
                                            handleProgramFilterChange({ visible: event.target.value }, { replace: true })
                                        }
                                    >
                                        <option value="">顯示狀態</option>
                                        <option value="1">顯示</option>
                                        <option value="0">隱藏</option>
                                    </Select>
                                </div>

                                <div className="lg:col-span-1">
                                    <Select
                                        value={programFilterState.per_page}
                                        onChange={(event) =>
                                            handleProgramFilterChange({ per_page: event.target.value }, { replace: true })
                                        }
                                    >
                                        {resolvedProgramPerPageOptions.map((option) => (
                                            <option key={option} value={String(option)}>
                                                每頁 {option} 筆
                                            </option>
                                        ))}
                                    </Select>
                                </div>

                                <div className="flex items-center justify-end gap-2 lg:col-span-12">
                                    <Button type="submit" variant="outline" className="w-full max-w-[120px]">
                                        <Filter className="mr-2 h-4 w-4" />
                                        套用
                                    </Button>
                                    <Button type="button" variant="ghost" className="w-full max-w-[120px]" onClick={resetProgramFilters}>
                                        清除
                                    </Button>
                                </div>
                            </form>

                            <div className="overflow-hidden rounded-2xl border border-gray-200">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-gray-50">
                                            <TableHead className="w-[28%]">學程名稱</TableHead>
                                            <TableHead className="w-[14%]">代碼</TableHead>
                                            <TableHead className="w-[14%]">學制</TableHead>
                                            <TableHead className="w-[16%]">課程數</TableHead>
                                            <TableHead className="w-[18%]">狀態</TableHead>
                                            <TableHead className="w-[16%]">最後更新</TableHead>
                                            <TableHead className="w-[10%] text-right">操作</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {programs.data.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={7} className="py-12 text-center text-sm text-gray-500">
                                                    尚無符合條件的學程資料。
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            programs.data.map((program) => (
                                                <TableRow key={program.id} className="align-top">
                                                    <TableCell>
                                                        <div className="space-y-1">
                                                            <span className="font-semibold text-gray-900">{program.name}</span>
                                                            {program.name_en && (
                                                                <p className="text-sm text-gray-500">{program.name_en}</p>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-sm text-gray-700">{program.code ?? '—'}</TableCell>
                                                    <TableCell className="text-sm text-gray-700">{levelLabel(program.level)}</TableCell>
                                                    <TableCell className="text-sm text-gray-700">{program.courses_count ?? '—'}</TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-col gap-1">
                                                            {visibilityBadge(program.visible)}
                                                            <span className="text-xs text-gray-500">{formatDateTime(program.updated_at)}</span>
                                                            {program.website_url && (
                                                                <a
                                                                    href={program.website_url}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-xs text-blue-600 underline"
                                                                >
                                                                    前往學程網站
                                                                </a>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <Button
                                                                variant="outline"
                                                                size="icon"
                                                                className="h-9 w-9"
                                                                onClick={() => router.visit(`/manage/programs/${program.id}/edit`)}
                                                            >
                                                                <Pencil className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                size="icon"
                                                                className="h-9 w-9 text-red-600 hover:text-red-700"
                                                                onClick={() => handleDeleteProgram(program)}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            <Pagination
                                meta={{
                                    current_page: programPagination.current_page,
                                    last_page: programPagination.last_page,
                                    per_page: programPagination.per_page,
                                    total: programPagination.total,
                                    from: programPagination.from ?? 0,
                                    to: programPagination.to ?? 0,
                                    links: programPagination.links ?? [],
                                }}
                                perPageOptions={resolvedProgramPerPageOptions}
                                onPerPageChange={(value) =>
                                    handleProgramFilterChange({ per_page: String(value) }, { replace: true })
                                }
                            />
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </ManageLayout>
    );
}
