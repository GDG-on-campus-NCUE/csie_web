import { useEffect, useMemo, useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import ManageLayout from '@/layouts/manage/manage-layout';
import { ManagePageHeader } from '@/components/manage/manage-page-header';
import type { BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Pagination from '@/components/ui/pagination';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Filter, FileText, Loader2, Pencil, Plus, Search, Trash2 } from 'lucide-react';

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
    posts?: ProgramPostSummary[];
}

type PostStatus = 'draft' | 'published' | 'scheduled';

interface ProgramPostSummary {
    id: number;
    title: string;
    status: PostStatus;
    publish_at?: string | null;
}

interface ProgramPostOption extends ProgramPostSummary {
    created_at?: string | null;
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
    postOptions?: ProgramPostOption[];
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

const buildCourseQuery = (state: CourseFilterState) => {
    const query: Record<string, string> = {};

    if (state.search) query.course_search = state.search;
    if (state.program) query.course_program = state.program;
    if (state.level) query.course_level = state.level;
    if (state.visible) query.course_visible = state.visible;
    if (state.per_page) query.course_per_page = state.per_page;

    return query;
};

const buildProgramQuery = (state: ProgramFilterState) => {
    const query: Record<string, string> = {};

    if (state.search) query.program_search = state.search;
    if (state.level) query.program_level = state.level;
    if (state.visible) query.program_visible = state.visible;
    if (state.per_page) query.program_per_page = state.per_page;

    return query;
};

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

const POST_STATUS_META: Record<PostStatus, { label: string; className: string }> = {
    draft: { label: '草稿', className: 'border-amber-200 bg-amber-50 text-amber-700' },
    published: { label: '已發布', className: 'border-emerald-200 bg-emerald-50 text-emerald-700' },
    scheduled: { label: '排程中', className: 'border-blue-200 bg-blue-50 text-blue-700' },
};

const resolvePostStatusBadge = (status: string) => {
    const meta = POST_STATUS_META[status as PostStatus];
    return (
        meta ?? {
            label: status,
            className: 'border-slate-200 bg-slate-50 text-slate-600',
        }
    );
};

export default function AcademicsIndex({
    courses,
    courseProgramOptions,
    courseFilters = {},
    coursePerPageOptions = [],
    programs,
    programFilters = {},
    programPerPageOptions = [],
    activeTab = 'courses',
    postOptions = [],
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

    const [editingProgram, setEditingProgram] = useState<ProgramRecord | null>(null);
    const [postSearch, setPostSearch] = useState('');
    const programPostsForm = useForm<{ action: 'sync-posts'; posts: number[] }>({
        action: 'sync-posts',
        posts: [],
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

    useEffect(() => {
        if (editingProgram) {
            programPostsForm.setData(
                'posts',
                (editingProgram.posts ?? []).map((post) => post.id)
            );
        } else {
            programPostsForm.reset();
            setPostSearch('');
        }
    }, [editingProgram]);

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

    const selectedPostIds = programPostsForm.data.posts ?? [];

    const filteredPostOptions = useMemo(() => {
        const keyword = postSearch.trim().toLowerCase();
        const selectedSet = new Set(selectedPostIds);

        return postOptions
            .filter((post) => {
                if (selectedSet.has(post.id)) {
                    return true;
                }

                if (keyword === '') {
                    return true;
                }

                return post.title.toLowerCase().includes(keyword);
            })
            .sort((a, b) => {
                const aSelected = selectedSet.has(a.id) ? 1 : 0;
                const bSelected = selectedSet.has(b.id) ? 1 : 0;
                if (aSelected !== bSelected) {
                    return bSelected - aSelected;
                }

                const aDate = a.publish_at ?? a.created_at ?? '';
                const bDate = b.publish_at ?? b.created_at ?? '';
                if (aDate === bDate) {
                    return 0;
                }
                return aDate > bDate ? -1 : 1;
            });
    }, [postOptions, postSearch, selectedPostIds]);

    const selectedPosts = useMemo(
        () => postOptions.filter((post) => selectedPostIds.includes(post.id)),
        [postOptions, selectedPostIds]
    );

    const postsErrorMessage =
        programPostsForm.errors.posts ??
        Object.entries(programPostsForm.errors).find(([key]) => key.startsWith('posts.'))?.[1];

    const togglePostSelection = (postId: number) => {
        if (selectedPostIds.includes(postId)) {
            programPostsForm.setData(
                'posts',
                selectedPostIds.filter((id) => id !== postId)
            );
        } else {
            programPostsForm.setData('posts', [...selectedPostIds, postId]);
        }
    };

    const handleClearSelectedPosts = () => {
        programPostsForm.setData('posts', []);
    };

    const openManagePosts = (program: ProgramRecord) => {
        setEditingProgram(program);
        setPostSearch('');
        programPostsForm.clearErrors();
    };

    const closeManagePosts = () => {
        setEditingProgram(null);
        programPostsForm.clearErrors();
    };

    const handleProgramPostsSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!editingProgram) {
            return;
        }

        programPostsForm.put(`/manage/programs/${editingProgram.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                closeManagePosts();
            },
        });
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

    const postStatusBadge = (status: string, className = '') => {
        const meta = resolvePostStatusBadge(status);
        return <Badge variant="outline" className={`${meta.className} ${className}`.trim()}>{meta.label}</Badge>;
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

            <section className="space-y-6">
                <ManagePageHeader
                    title="課程與學程管理"
                    description="集中檢視並管理所有課程與學程資訊"
                    actions={
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
                    }
                />

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
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

                            <div className="hidden overflow-hidden rounded-2xl border border-gray-200 md:block">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-gray-50">
                                            <TableHead className="w-[26%]">學程資訊</TableHead>
                                            <TableHead className="w-[30%]">對應公告</TableHead>
                                            <TableHead className="w-[12%]">學程類別</TableHead>
                                            <TableHead className="w-[14%]">顯示狀態</TableHead>
                                            <TableHead className="w-[18%]">最後更新</TableHead>
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
                                                        <div className="space-y-2">
                                                            <div className="space-y-1">
                                                                <span className="font-semibold text-gray-900">{program.name}</span>
                                                                {program.name_en && (
                                                                    <p className="text-sm text-gray-500">{program.name_en}</p>
                                                                )}
                                                            </div>
                                                            <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                                                                {program.code && <span>代碼：{program.code}</span>}
                                                                <span>課程數：{program.courses_count ?? 0}</span>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        {program.posts && program.posts.length > 0 ? (
                                                            <div className="flex flex-wrap gap-3">
                                                                {program.posts.map((post) => (
                                                                    <button
                                                                        key={post.id}
                                                                        type="button"
                                                                        onClick={() => router.visit(`/manage/posts/${post.id}/edit`)}
                                                                        className="group flex max-w-[240px] flex-col gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-left text-xs transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm"
                                                                    >
                                                                        <span className="truncate text-sm font-medium text-slate-900 group-hover:text-slate-900">
                                                                            {post.title}
                                                                        </span>
                                                                        <div className="flex items-center justify-between gap-2 text-[11px] text-slate-500">
                                                                            {postStatusBadge(post.status, 'px-2 py-0.5 text-[11px]')}
                                                                            <span>{formatDateTime(post.publish_at)}</span>
                                                                        </div>
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <span className="text-sm text-gray-500">尚未指定公告</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-sm text-gray-700">{levelLabel(program.level)}</TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-col gap-1">
                                                            {visibilityBadge(program.visible)}
                                                            <span className="text-xs text-gray-500">{program.visible ? '顯示於前台' : '目前未顯示'}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-col gap-1 text-sm text-gray-700">
                                                            <span>{formatDateTime(program.updated_at)}</span>
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
                                                                onClick={() => openManagePosts(program)}
                                                                title="管理公告"
                                                            >
                                                                <FileText className="h-4 w-4" />
                                                            </Button>
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

                            <div className="space-y-4 md:hidden">
                                {programs.data.length === 0 ? (
                                    <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center text-sm text-gray-500">
                                        尚無符合條件的學程資料。
                                    </div>
                                ) : (
                                    programs.data.map((program) => (
                                        <div key={program.id} className="space-y-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                                            <div className="space-y-3">
                                                <div className="flex flex-col gap-2">
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="space-y-1">
                                                            <p className="text-lg font-semibold text-slate-900">{program.name}</p>
                                                            {program.name_en && <p className="text-sm text-slate-500">{program.name_en}</p>}
                                                        </div>
                                                        {visibilityBadge(program.visible)}
                                                    </div>
                                                    <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                                                        {program.code && (
                                                            <span className="rounded-full bg-slate-100 px-2 py-1">代碼：{program.code}</span>
                                                        )}
                                                        <span className="rounded-full bg-slate-100 px-2 py-1">課程數：{program.courses_count ?? 0}</span>
                                                        <span className="rounded-full bg-slate-100 px-2 py-1">{levelLabel(program.level)}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="text-sm font-semibold text-slate-800">對應公告</h4>
                                                    <Button size="sm" variant="outline" onClick={() => openManagePosts(program)}>
                                                        <FileText className="mr-2 h-4 w-4" />
                                                        管理公告
                                                    </Button>
                                                </div>
                                                {program.posts && program.posts.length > 0 ? (
                                                    <div className="space-y-2">
                                                        {program.posts.map((post) => (
                                                            <button
                                                                key={post.id}
                                                                type="button"
                                                                onClick={() => router.visit(`/manage/posts/${post.id}/edit`)}
                                                                className="group w-full rounded-2xl border border-slate-200 px-3 py-2 text-left transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm"
                                                            >
                                                                <span className="block truncate text-sm font-medium text-slate-900">{post.title}</span>
                                                                <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
                                                                    {postStatusBadge(post.status, 'px-2 py-0.5 text-[11px]')}
                                                                    <span>{formatDateTime(post.publish_at)}</span>
                                                                </div>
                                                            </button>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-slate-500">尚未指定公告</p>
                                                )}
                                            </div>

                                            <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
                                                <span>最後更新：{formatDateTime(program.updated_at)}</span>
                                                {program.website_url && (
                                                    <a
                                                        href={program.website_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-600 underline"
                                                    >
                                                        前往學程網站
                                                    </a>
                                                )}
                                            </div>

                                            <div className="flex flex-col gap-2 sm:flex-row">
                                                <Button
                                                    variant="outline"
                                                    className="w-full"
                                                    onClick={() => router.visit(`/manage/programs/${program.id}/edit`)}
                                                >
                                                    <Pencil className="mr-2 h-4 w-4" />
                                                    編輯學程
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    className="w-full text-red-600 hover:text-red-700"
                                                    onClick={() => handleDeleteProgram(program)}
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    刪除學程
                                                </Button>
                                            </div>
                                        </div>
                                    ))
                                )}
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
            </section>

            <Dialog open={Boolean(editingProgram)} onOpenChange={(open) => (open ? undefined : closeManagePosts())}>
                <DialogContent className="max-w-3xl">
                    <form onSubmit={handleProgramPostsSubmit} className="space-y-6">
                        <DialogHeader>
                            <DialogTitle>
                                {editingProgram ? `管理「${editingProgram.name}」的公告內容` : '管理學程公告'}
                            </DialogTitle>
                            <p className="text-sm text-slate-500">
                                從列表中勾選或取消勾選公告，完成後儲存即可同步更新前台顯示內容。
                            </p>
                        </DialogHeader>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="program-post-search">搜尋公告</Label>
                                <div className="relative">
                                    <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                    <Input
                                        id="program-post-search"
                                        value={postSearch}
                                        onChange={(event) => setPostSearch(event.target.value)}
                                        placeholder="輸入公告標題關鍵字"
                                        className="pl-10"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm text-slate-600">
                                    <span>
                                        共 {filteredPostOptions.length} 筆可選公告，已選擇 {selectedPostIds.length} 筆
                                    </span>
                                    {selectedPostIds.length > 0 && (
                                        <Button type="button" variant="ghost" size="sm" onClick={handleClearSelectedPosts}>
                                            清除全部
                                        </Button>
                                    )}
                                </div>

                                <div className="max-h-[360px] overflow-y-auto rounded-2xl border border-slate-200">
                                    {filteredPostOptions.length === 0 ? (
                                        <div className="p-6 text-center text-sm text-slate-500">目前查無符合條件的公告。</div>
                                    ) : (
                                        <div className="divide-y divide-slate-100">
                                            {filteredPostOptions.map((post) => {
                                                const isChecked = selectedPostIds.includes(post.id);
                                                const metaText = formatDateTime(post.publish_at ?? post.created_at ?? null);

                                                return (
                                                    <label
                                                        key={post.id}
                                                        className="flex cursor-pointer items-start gap-3 p-4 transition hover:bg-slate-50"
                                                    >
                                                        <Checkbox
                                                            checked={isChecked}
                                                            onCheckedChange={() => togglePostSelection(post.id)}
                                                        />
                                                        <div className="flex-1 space-y-1">
                                                            <div className="flex flex-wrap items-center gap-2">
                                                                <span className="font-medium text-slate-900">{post.title}</span>
                                                                {postStatusBadge(post.status, 'px-2 py-0.5 text-[11px]')}
                                                            </div>
                                                            <p className="text-xs text-slate-500">
                                                                發布時間：{metaText === '—' ? '未設定' : metaText}
                                                            </p>
                                                        </div>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {selectedPosts.length > 0 && (
                                <div className="rounded-2xl bg-slate-50 p-4">
                                    <p className="text-sm font-semibold text-slate-700">已選公告</p>
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {selectedPosts.map((post) => (
                                            <Badge key={post.id} variant="outline" className="bg-white px-3 py-1 text-xs">
                                                {post.title}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {postsErrorMessage && (
                                <p className="text-sm text-red-600">{postsErrorMessage}</p>
                            )}
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="ghost" onClick={closeManagePosts} disabled={programPostsForm.processing}>
                                取消
                            </Button>
                            <Button type="submit" disabled={programPostsForm.processing}>
                                {programPostsForm.processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                儲存設定
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </ManageLayout>
    );
}
