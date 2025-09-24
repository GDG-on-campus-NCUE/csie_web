import { useEffect, useMemo, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import ManageLayout from '@/layouts/manage/manage-layout';
import { ManagePageHeader } from '@/components/manage/manage-page-header';
import type { BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Pagination from '@/components/ui/pagination';
import { Plus, Search, Filter, Pencil, Trash2 } from 'lucide-react';

interface TeacherOption {
    id: number;
    name: string;
    name_en?: string | null;
}

interface LabTeacher {
    id: number;
    name: string;
    name_en?: string | null;
}

interface LabRecord {
    id: number;
    name: string;
    name_en?: string | null;
    code?: string | null;
    email?: string | null;
    phone?: string | null;
    website_url?: string | null;
    visible: boolean;
    sort_order?: number | null;
    updated_at?: string | null;
    teachers?: LabTeacher[];
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

interface LabsIndexProps {
    labs: {
        data: LabRecord[];
        meta?: PaginationMeta;
        links?: PaginationLink[];
    };
    teachers: TeacherOption[];
    filters?: Partial<Record<'search' | 'teacher' | 'visible' | 'per_page', string | number>>;
    perPageOptions?: number[];
}

type FilterState = {
    search: string;
    teacher: string;
    visible: string;
    per_page: string;
};

const buildQueryFromFilters = (filters: FilterState) =>
    Object.fromEntries(
        Object.entries(filters).filter(([, value]) => value !== '' && value !== null && value !== undefined)
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

export default function LabsIndex({
    labs,
    teachers,
    filters = {},
    perPageOptions = [],
}: LabsIndexProps) {
    const resolvedPerPageOptions = perPageOptions.length > 0 ? perPageOptions : [15, 30, 50, 100, 200];
    const defaultPerPage = String(
        filters.per_page ??
            labs.meta?.per_page ??
            resolvedPerPageOptions[0] ??
            15
    );

    const [filterState, setFilterState] = useState<FilterState>({
        search: (filters.search as string) ?? '',
        teacher: filters.teacher ? String(filters.teacher) : '',
        visible: filters.visible ? String(filters.visible) : '',
        per_page: defaultPerPage,
    });

    useEffect(() => {
        setFilterState({
            search: (filters.search as string) ?? '',
            teacher: filters.teacher ? String(filters.teacher) : '',
            visible: filters.visible ? String(filters.visible) : '',
            per_page: String(
                filters.per_page ??
                    labs.meta?.per_page ??
                    resolvedPerPageOptions[0] ??
                    15
            ),
        });
    }, [
        filters.search,
        filters.teacher,
        filters.visible,
        filters.per_page,
        labs.meta?.per_page,
        resolvedPerPageOptions,
    ]);

    const labsData = labs?.data ?? [];
    const paginationMeta = {
        current_page: labs.meta?.current_page ?? 1,
        last_page: labs.meta?.last_page ?? 1,
        per_page: labs.meta?.per_page ?? Number(filterState.per_page) ?? 15,
        total: labs.meta?.total ?? labsData.length,
        from: labs.meta?.from ?? (labsData.length > 0 ? 1 : 0),
        to: labs.meta?.to ?? labsData.length,
        links: labs.meta?.links ?? labs.links ?? [],
    } as PaginationMeta;

    const breadcrumbs: BreadcrumbItem[] = useMemo(
        () => [
            { title: '管理首頁', href: '/manage/dashboard' },
            { title: '實驗室管理', href: '/manage/labs' },
        ],
        []
    );

    const applyFilters = (state: FilterState, options?: { replace?: boolean }) => {
        const query = buildQueryFromFilters(state);
        router.get('/manage/labs', query, {
            preserveState: true,
            preserveScroll: true,
            replace: options?.replace ?? false,
        });
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        applyFilters(filterState);
    };

    const handleReset = () => {
        const resetState: FilterState = {
            search: '',
            teacher: '',
            visible: '',
            per_page: resolvedPerPageOptions[0] ? String(resolvedPerPageOptions[0]) : '15',
        };
        setFilterState(resetState);
        applyFilters(resetState);
    };

    const handleFilterChange = (next: Partial<FilterState>, options?: { replace?: boolean }) => {
        setFilterState((previous) => {
            const updated = { ...previous, ...next } as FilterState;
            applyFilters(updated, options);
            return updated;
        });
    };

    const handleDelete = (lab: LabRecord) => {
        if (!window.confirm(`確定要刪除「${lab.name}」嗎？`)) {
            return;
        }

        router.delete(`/manage/labs/${lab.id}`, {
            preserveScroll: true,
        });
    };

    return (
        <ManageLayout breadcrumbs={breadcrumbs} role="admin">
            <Head title="實驗室管理" />

            <section className="space-y-6">
                <ManagePageHeader
                    title="實驗室管理"
                    description="維護前台實驗室列表、顯示狀態與基本資訊"
                    actions={
                        <Button className="rounded-full" onClick={() => router.visit('/manage/labs/create')}>
                            <Plus className="mr-2 h-4 w-4" />
                            新增實驗室
                        </Button>
                    }
                />

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 lg:grid-cols-12">
                        <div className="lg:col-span-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    value={filterState.search}
                                    onChange={(event) => setFilterState((previous) => ({ ...previous, search: event.target.value }))}
                                    placeholder="搜尋實驗室名稱或代碼"
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        <div className="lg:col-span-3">
                            <Select
                                value={filterState.teacher}
                                onChange={(event) =>
                                    handleFilterChange({ teacher: event.target.value }, { replace: true })
                                }
                            >
                                <option value="">全部教師</option>
                                {teachers.map((teacher) => (
                                    <option key={teacher.id} value={String(teacher.id)}>
                                        {teacher.name}
                                        {teacher.name_en ? ` / ${teacher.name_en}` : ''}
                                    </option>
                                ))}
                            </Select>
                        </div>

                        <div className="lg:col-span-2">
                            <Select
                                value={filterState.visible}
                                onChange={(event) =>
                                    handleFilterChange({ visible: event.target.value }, { replace: true })
                                }
                            >
                                <option value="">顯示狀態</option>
                                <option value="1">顯示</option>
                                <option value="0">隱藏</option>
                            </Select>
                        </div>

                        <div className="lg:col-span-2">
                            <Select
                                value={filterState.per_page}
                                onChange={(event) =>
                                    handleFilterChange({ per_page: event.target.value }, { replace: true })
                                }
                            >
                                {resolvedPerPageOptions.map((option) => (
                                    <option key={option} value={String(option)}>
                                        每頁 {option} 筆
                                    </option>
                                ))}
                            </Select>
                        </div>

                        <div className="flex items-center justify-end gap-2 lg:col-span-1">
                            <Button type="submit" variant="outline" className="w-full whitespace-nowrap">
                                <Filter className="mr-2 h-4 w-4" />
                                套用
                            </Button>
                            <Button type="button" variant="ghost" className="w-full whitespace-nowrap" onClick={handleReset}>
                                清除
                            </Button>
                        </div>
                    </form>

                    <div className="overflow-hidden rounded-2xl border border-gray-200">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50">
                                    <TableHead className="w-[26%]">實驗室</TableHead>
                                    <TableHead className="w-[18%]">負責教師</TableHead>
                                    <TableHead className="w-[12%]">代碼</TableHead>
                                    <TableHead className="w-[18%]">聯絡資訊</TableHead>
                                    <TableHead className="w-[12%]">排序</TableHead>
                                    <TableHead className="w-[14%]">最後更新</TableHead>
                                    <TableHead className="w-[10%] text-right">操作</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {labsData.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="py-12 text-center text-sm text-gray-500">
                                            目前尚無符合條件的實驗室資料。
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    labsData.map((lab) => (
                                        <TableRow key={lab.id} className="align-top">
                                            <TableCell>
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold text-gray-900">{lab.name}</span>
                                                        {!lab.visible && <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-700">已隱藏</Badge>}
                                                    </div>
                                                    {lab.name_en && (
                                                        <p className="text-sm text-gray-500">{lab.name_en}</p>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {lab.teachers && lab.teachers.length > 0 ? (
                                                    <ul className="space-y-1 text-sm text-gray-700">
                                                        {lab.teachers.map((teacher) => (
                                                            <li key={teacher.id}>
                                                                {teacher.name}
                                                                {teacher.name_en ? ` / ${teacher.name_en}` : ''}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                ) : (
                                                    <span className="text-sm text-gray-400">尚未指派</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-sm text-gray-700">{lab.code ?? '—'}</TableCell>
                                            <TableCell>
                                                <div className="space-y-1 text-sm text-gray-700">
                                                    {lab.email && <div>✉️ {lab.email}</div>}
                                                    {lab.phone && <div>☎️ {lab.phone}</div>}
                                                    {lab.website_url && (
                                                        <Link
                                                            href={lab.website_url}
                                                            className="inline-flex items-center text-blue-600 hover:underline"
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                        >
                                                            官方網站
                                                        </Link>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-sm text-gray-700">{lab.sort_order ?? '—'}</TableCell>
                                            <TableCell className="text-sm text-gray-700">{formatDateTime(lab.updated_at)}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        className="h-9 w-9"
                                                        onClick={() => router.visit(`/manage/labs/${lab.id}/edit`)}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        className="h-9 w-9 text-red-600 hover:text-red-700"
                                                        onClick={() => handleDelete(lab)}
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
                            current_page: paginationMeta.current_page,
                            last_page: paginationMeta.last_page,
                            per_page: paginationMeta.per_page,
                            total: paginationMeta.total,
                            from: paginationMeta.from ?? 0,
                            to: paginationMeta.to ?? 0,
                            links: paginationMeta.links ?? [],
                        }}
                        perPageOptions={resolvedPerPageOptions}
                        onPerPageChange={(value) =>
                            handleFilterChange({ per_page: String(value) }, { replace: true })
                        }
                    />
                </div>
            </section>
        </ManageLayout>
    );
}
