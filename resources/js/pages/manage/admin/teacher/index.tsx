import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import ManageLayout from '@/layouts/manage/manage-layout';
import { Teacher } from '@/types/staff';
import TeacherTable from '@/components/manage/teacher/TeacherTable';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface Props {
    teachers: {
        data: Teacher[];
        meta: any;
    };
    filters?: {
        search?: string;
        visible?: boolean | null;
        per_page?: number;
    };
}

export default function Index({ teachers, filters }: Props) {
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
            <Head title="教師管理" />

            <div className="bg-white">
                <div className="px-4 py-6 sm:px-6 lg:px-8">
                    <div className="sm:flex sm:items-center sm:justify-between">
                        <div className="sm:flex-auto">
                            <h1 className="text-2xl font-semibold leading-6 text-gray-900">
                                教師管理
                            </h1>
                            <p className="mt-2 text-sm text-gray-700">
                                管理系所教師資料，包含基本資訊、專長領域、聯絡方式等
                            </p>
                        </div>
                        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
                            <Button onClick={() => router.visit('/manage/teachers/create')}>
                                <Plus className="mr-2 h-4 w-4" />
                                新增教師
                            </Button>
                        </div>
                    </div>

                    <div className="mt-6">
                        <TeacherTable
                            teachers={teachers.data}
                            onEdit={handleTeacherEdit}
                            onDelete={handleTeacherDelete}
                        />
                    </div>
                </div>
            </div>
        </ManageLayout>
    );
}
