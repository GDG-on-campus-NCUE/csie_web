import React from 'react';
import { Head, router } from '@inertiajs/react';
import ManageLayout from '@/layouts/manage/manage-layout';
import TeacherForm from '@/components/manage/staff/TeacherForm';
import { TeacherEditProps } from '@/types/staff';

export default function Edit({ teacher, users, labs, translations }: TeacherEditProps) {
    const handleSubmit = (data: any) => {
        router.put(`/manage/teachers/${teacher.id}`, data);
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
                                編輯教師成員資料
                            </p>
                        </div>
                    </div>

                    <div className="mt-6">
                        <TeacherForm
                            teacher={teacher}
                            onSubmit={handleSubmit}
                            submitLabel="更新教師"
                            users={users}
                        />
                    </div>
                </div>
            </div>
        </ManageLayout>
    );
}
