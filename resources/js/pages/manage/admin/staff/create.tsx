import React from 'react';
import { Head, router } from '@inertiajs/react';
import ManageLayout from '@/layouts/manage/manage-layout';
import StaffForm from '@/components/manage/staff/StaffForm';
import staff from '@/routes/manage/staff';

export default function Create() {
    const handleSubmit = (data: any) => {
        router.post(staff.store.url(), data);
    };

    return (
        <ManageLayout>
            <Head title="新增職員" />

            <div className="bg-white">
                <div className="px-4 py-6 sm:px-6 lg:px-8">
                    <div className="sm:flex sm:items-center">
                        <div className="sm:flex-auto">
                            <h1 className="text-2xl font-semibold leading-6 text-gray-900">
                                新增職員
                            </h1>
                            <p className="mt-2 text-sm text-gray-700">
                                新增一名新的職員成員
                            </p>
                        </div>
                    </div>

                    <div className="mt-6">
                        <StaffForm
                            onSubmit={handleSubmit}
                            submitLabel="新增職員"
                        />
                    </div>
                </div>
            </div>
        </ManageLayout>
    );
}
