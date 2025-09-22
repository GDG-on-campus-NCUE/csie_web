import React from 'react';
import { Head, router } from '@inertiajs/react';
import ManageLayout from '@/layouts/manage/manage-layout';
import TeacherForm from '@/components/manage/teacher/TeacherForm';
import { Teacher, TeacherFormData, User, Lab } from '@/types/staff';

interface Props {
    teacher: Teacher;
    users?: User[];
    labs?: Lab[];
}

export default function Edit({ teacher: teacherData, users, labs }: Props) {
    const handleSubmit = (data: TeacherFormData) => {
        router.put(`/manage/teachers/${teacherData.id}`, data as any);
    };

    const getDisplayName = () => {
        return teacherData.name['zh-TW'] || teacherData.name['en'] || '此教師';
    };

    return (
        <ManageLayout>
            <Head title="編輯教師" />

            <div className="bg-white">
                <div className="px-4 py-6 sm:px-6 lg:px-8">
                    <div className="sm:flex sm:items-center">
                        <div className="sm:flex-auto">
                            <h1 className="text-2xl font-semibold leading-6 text-gray-900">
                                編輯教師
                            </h1>
                            <p className="mt-2 text-sm text-gray-700">
                                編輯教師 {getDisplayName()} 的資料
                            </p>
                        </div>
                    </div>

                    <div className="mt-6">
                        <TeacherForm
                            teacher={teacherData}
                            onSubmit={handleSubmit}
                            submitLabel="更新教師"
                        />
                    </div>
                </div>
            </div>
        </ManageLayout>
    );
}
