import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import ManageLayout from '@/layouts/manage/manage-layout';
import { ManagePageHeader } from '@/components/manage/manage-page-header';
import { Teacher } from '@/types/staff';
import TeacherTable from '@/components/manage/teacher/TeacherTable';
import { Card, CardContent } from '@/components/ui/card';
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
        <ManageLayout role="admin">
            <Head title="教師管理" />

            <section className="space-y-6">
                <ManagePageHeader
                    title="教師管理"
                    description="管理系所教師資料，包含基本資訊、專長領域與聯絡方式"
                    actions={
                        <Button className="rounded-full" onClick={() => router.visit('/manage/teachers/create')}>
                            <Plus className="mr-2 h-4 w-4" />
                            新增教師
                        </Button>
                    }
                />

                <Card className="border border-slate-200 bg-white shadow-sm">
                    <CardContent className="p-0">
                        <TeacherTable
                            teachers={teachers.data}
                            onEdit={handleTeacherEdit}
                            onDelete={handleTeacherDelete}
                        />
                    </CardContent>
                </Card>
            </section>
        </ManageLayout>
    );
}
