import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import ManageLayout from '@/layouts/manage/manage-layout';
import { LocalizedContent, Staff, Teacher } from '@/types/staff';
import StaffTable from '@/components/manage/staff/StaffTable';
import TeacherTable from '@/components/manage/staff/TeacherTable';
import Pagination from '@/components/ui/pagination';
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
        <ManageLayout>
            <Head title="職員與教師管理" />

            <div className="bg-white">
                <div className="px-4 py-6 sm:px-6 lg:px-8">
                    <div className="sm:flex sm:items-center sm:justify-between">
                        <div className="sm:flex-auto">
                            <h1 className="text-2xl font-semibold leading-6 text-gray-900">
                                職員與教師管理
                            </h1>
                            <p className="mt-2 text-sm text-gray-700">
                                管理系所職員和教師資料
                            </p>
                        </div>
                    </div>

                    <div className="mt-6">
                        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                            <div className="flex items-center justify-between mb-6">
                                <TabsList className="grid w-full max-w-md grid-cols-2">
                                    <TabsTrigger value="staff">職員管理</TabsTrigger>
                                    <TabsTrigger value="teachers">教師管理</TabsTrigger>
                                </TabsList>

                                <div className="flex space-x-2">
                                    {activeTab === 'staff' && (
                                        <Button onClick={() => router.visit('/manage/staff/create')}>
                                            <Plus className="mr-2 h-4 w-4" />
                                            新增職員
                                        </Button>
                                    )}
                                    {activeTab === 'teachers' && (
                                        <Button onClick={() => router.visit('/manage/teachers/create')}>
                                            <Plus className="mr-2 h-4 w-4" />
                                            新增教師
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {/* 搜索和篩選控制項 */}
                            <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    {/* 搜索欄 */}
                                    <div className="md:col-span-2">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                            <Input
                                                placeholder={`搜尋${activeTab === 'staff' ? '職員' : '教師'}...`}
                                                value={search}
                                                onChange={(e) => setSearch(e.target.value)}
                                                onKeyPress={(e) => {
                                                    if (e.key === 'Enter') {
                                                        handleSearch(search);
                                                    }
                                                }}
                                                className="pl-10"
                                            />
                                        </div>
                                    </div>

                                    {/* 顯示狀態篩選 */}
                                    <div>
                                        <Select
                                            value={visibleFilter === null || visibleFilter === undefined ? 'all' : visibleFilter.toString()}
                                            onChange={(e) => handleVisibilityFilter(e.target.value)}
                                        >
                                            <option value="all">全部</option>
                                            <option value="true">顯示中</option>
                                            <option value="false">已隱藏</option>
                                        </Select>
                                    </div>

                                    {/* 每頁顯示數量 */}
                                    <div>
                                        <Select
                                            value={perPage.toString()}
                                            onChange={(e) => handlePerPageChange(e.target.value)}
                                        >
                                            {perPageOptions.map((option) => (
                                                <option key={option} value={option.toString()}>
                                                    每頁 {option} 筆
                                                </option>
                                            ))}
                                        </Select>
                                    </div>
                                </div>

                                {/* 搜索按鈕 */}
                                <div className="mt-4 flex justify-end">
                                    <Button
                                        onClick={() => handleSearch(search)}
                                        variant="outline"
                                        size="sm"
                                    >
                                        <Search className="mr-2 h-4 w-4" />
                                        搜尋
                                    </Button>
                                </div>
                            </div>

                            <TabsContent value="staff" className="mt-6">
                                <div className="space-y-4">
                                    <div>
                                        <h2 className="text-lg font-medium text-gray-900">
                                            職員列表
                                        </h2>
                                        <p className="text-sm text-gray-600">
                                            管理系所職員資料，包含姓名、職位、聯絡方式等資訊
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
                                        <h2 className="text-lg font-medium text-gray-900">
                                            教師列表
                                        </h2>
                                        <p className="text-sm text-gray-600">
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
                                            onPerPageChange={(perPage) =>
                                                router.get('/manage/staff', {
                                                    ...filters,
                                                    per_page: perPage,
                                                    tab: activeTab
                                                })
                                            }
                                            perPageOptions={perPageOptions}
                                            className="mt-6"
                                        />
                                    )}
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </div>
        </ManageLayout>
    );
}
