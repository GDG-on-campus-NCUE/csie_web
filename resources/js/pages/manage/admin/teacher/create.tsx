import React from 'react';
import { Head, router } from '@inertiajs/react';
import ManageLayout from '@/layouts/manage/manage-layout';
import TeacherForm from '@/components/manage/teacher/TeacherForm';
import { TeacherFormData, User, Lab } from '@/types/staff';

interface Props {
    users?: User[];
    labs?: Lab[];
}

export default function Create({ users, labs }: Props) {
    const handleSubmit = (data: TeacherFormData) => {
        router.post('/manage/teachers', data as any);
    };

    return (
        <ManageLayout>
            <Head title="新增教師" />

            <div className="bg-white">
                <div className="px-4 py-6 sm:px-6 lg:px-8">
                    <div className="sm:flex sm:items-center">
                        <div className="sm:flex-auto">
                            <h1 className="text-2xl font-semibold leading-6 text-gray-900">
                                新增教師
                            </h1>
                            <p className="mt-2 text-sm text-gray-700">
                                新增一名新的教師成員
                            </p>
                        </div>
                    </div>

                    <div className="mt-6">
                        <TeacherForm
                            onSubmit={handleSubmit}
                            submitLabel="新增教師"
                        />
                    </div>
                </div>
            </div>
        </ManageLayout>
    );
}
