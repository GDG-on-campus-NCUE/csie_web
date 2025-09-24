import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import ManageLayout from '@/layouts/manage/manage-layout';
import { ManagePageHeader } from '@/components/manage/manage-page-header';
import { LocalizedContent, Staff, Teacher } from '@/types/staff';
import StaffTable from '@/components/manage/staff/StaffTable';
import TeacherTable from '@/components/manage/staff/TeacherTable';
import Pagination from '@/components/ui/pagination';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search, Filter } from 'lucide-react';

interface Props {
    initialTab: string;
    staff: {
        active: Staff[];
        trashed: Staff[];
    };
    teachers: {
        data: Teacher[];
        meta: any;
    };
    filters?: {
        search?: string;
        visible?: boolean | null;
        per_page?: number;
    };
    perPage: number;
    perPageOptions: number[];
}

const resolveStaffText = (
    value: string | LocalizedContent | undefined,
    locale: 'zh-TW' | 'en' = 'zh-TW'
): string => {
    if (!value) {
        return '';
    }

    if (typeof value === 'string') {
        return value;
    }

    return value[locale] ?? value['zh-TW'] ?? '';
};

export default function Index({
    initialTab,
    staff,
    teachers,
    filters = {},
    perPage,
    perPageOptions
}: Props) {
    const [activeTab, setActiveTab] = useState(initialTab || 'staff');
    const [search, setSearch] = useState(filters.search || '');
    const [visibleFilter, setVisibleFilter] = useState(filters.visible);

    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
        router.get('/manage/staff', { tab }, {
            preserveState: true,
            preserveScroll: true
        });
    };

    const handleSearch = (searchTerm: string) => {
        router.get('/manage/staff', {
            tab: activeTab,
            search: searchTerm,
            visible: visibleFilter,
            per_page: perPage
        }, {
            preserveState: true,
            replace: true
        });
    };

    const handleVisibilityFilter = (visible: string) => {
        const visibleValue = visible === 'all' ? null : visible === 'true';
        router.get('/manage/staff', {
            tab: activeTab,
            search,
            visible: visibleValue,
            per_page: perPage
        }, {
            preserveState: true,
            replace: true
        });
    };

    const handlePerPageChange = (newPerPage: string) => {
        router.get('/manage/staff', {
            tab: activeTab,
            search,
            visible: visibleFilter,
            per_page: parseInt(newPerPage)
        }, {
            preserveState: true,
            replace: true
        });
    };

    const handleStaffEdit = (staffMember: Staff) => {
        router.visit(`/manage/staff/${staffMember.id}/edit`);
    };

    const handleStaffDelete = (staffMember: Staff) => {
        const staffName = resolveStaffText(staffMember.name) || '此職員';
        if (confirm(`確定要刪除職員 ${staffName} 嗎？`)) {
            router.delete(`/manage/staff/${staffMember.id}`);
        }
    };

    const handleTeacherEdit = (teacher: Teacher) => {
        router.visit(`/manage/teachers/${teacher.id}/edit`);
    };

    const handleTeacherDelete = (teacher: Teacher) => {
        const displayName = teacher.name['zh-TW'] || teacher.name['en'] || '此教師';
        if (confirm(`確定要刪除教師 ${displayName} 嗎？`)) {
            router.delete(`/manage/teachers/${teacher.id}`);
        }
    };

    return (
        <ManageLayout role="admin">
            <Head title="職員與教師管理" />

            <section className="space-y-6">
                <ManagePageHeader
                    title="職員與教師管理"
                    description="集中管理職員與教師的基本資料、聯絡方式與顯示狀態"
                    actions={
                        <Button
                            className="rounded-full"
                            onClick={() =>
                                activeTab === 'staff'
                                    ? router.visit('/manage/staff/create')
                                    : router.visit('/manage/teachers/create')
                            }
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            {activeTab === 'staff' ? '新增職員' : '新增教師'}
                        </Button>
                    }
                />

                <Card className="border border-slate-200 bg-white shadow-sm">
                    <CardContent className="space-y-6">
                        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <TabsList className="grid w-full max-w-md grid-cols-2">
                                    <TabsTrigger value="staff">職員管理</TabsTrigger>
                                    <TabsTrigger value="teachers">教師管理</TabsTrigger>
                                </TabsList>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex items-center gap-2"
                                    onClick={() => handleSearch(search)}
                                >
                                    <Search className="h-4 w-4" />
                                    搜尋
                                </Button>
                            </div>

                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                                    <div className="md:col-span-2">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                            <Input
                                                placeholder={`搜尋${activeTab === 'staff' ? '職員' : '教師'}...`}
                                                value={search}
                                                onChange={(event) => setSearch(event.target.value)}
                                                onKeyDown={(event) => {
                                                    if (event.key === 'Enter') {
                                                        handleSearch(search);
                                                    }
                                                }}
                                                className="pl-10"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <Select
                                            value={visibleFilter === null || visibleFilter === undefined ? 'all' : visibleFilter.toString()}
                                            onChange={(event) => handleVisibilityFilter(event.target.value)}
                                        >
                                            <option value="all">全部</option>
                                            <option value="true">顯示中</option>
                                            <option value="false">已隱藏</option>
                                        </Select>
                                    </div>

                                    <div>
                                        <Select value={perPage.toString()} onChange={(event) => handlePerPageChange(event.target.value)}>
                                            {perPageOptions.map((option) => (
                                                <option key={option} value={option.toString()}>
                                                    每頁 {option} 筆
                                                </option>
                                            ))}
                                        </Select>
                                    </div>
                                </div>
                            </div>

                            <TabsContent value="staff" className="mt-6">
                                <div className="space-y-4">
                                    <div>
                                        <h2 className="text-lg font-semibold text-slate-900">職員列表</h2>
                                        <p className="text-sm text-slate-600">
                                            管理系所職員資料，包含姓名、職稱與聯絡方式
                                        </p>
                                    </div>

                                    <StaffTable
                                        staff={staff.active}
                                        onEdit={handleStaffEdit}
                                        onDelete={handleStaffDelete}
                                    />
                                </div>
                            </TabsContent>

                            <TabsContent value="teachers" className="mt-6">
                                <div className="space-y-4">
                                    <div>
                                        <h2 className="text-lg font-semibold text-slate-900">教師列表</h2>
                                        <p className="text-sm text-slate-600">
                                            管理系所教師資料，包含基本資訊、專長領域、聯絡方式等
                                        </p>
                                    </div>

                                    <TeacherTable
                                        teachers={teachers.data}
                                        onEdit={handleTeacherEdit}
                                        onDelete={handleTeacherDelete}
                                    />

                                    {teachers.meta && (
                                        <Pagination
                                            meta={teachers.meta}
                                            onPerPageChange={(perPageValue) =>
                                                router.get('/manage/staff', {
                                                    ...filters,
                                                    per_page: perPageValue,
                                                    tab: activeTab,
                                                })
                                            }
                                            perPageOptions={perPageOptions}
                                            className="mt-6"
                                        />
                                    )}
                                </div>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </section>
        </ManageLayout>
    );
}
