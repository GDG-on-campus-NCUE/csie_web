import React from 'react';
import { Head, router } from '@inertiajs/react';
import ManageLayout from '@/layouts/manage/manage-layout';
import StaffForm from '@/components/manage/staff/StaffForm';
import { LocalizedContent, Staff } from '@/types/staff';
import staff from '@/routes/manage/staff';

interface Props {
    staff: Staff;
}

const resolveStaffName = (
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

export default function Edit({ staff: staffData }: Props) {
    const handleSubmit = (data: any) => {
        router.put(staff.update.url(staffData.id), data);
    };

    return (
        <ManageLayout>
            <Head title="編輯職員" />

            <div className="bg-white">
                <div className="px-4 py-6 sm:px-6 lg:px-8">
                    <div className="sm:flex sm:items-center">
                        <div className="sm:flex-auto">
                            <h1 className="text-2xl font-semibold leading-6 text-gray-900">
                                編輯職員
                            </h1>
                            <p className="mt-2 text-sm text-gray-700">
                                編輯職員 {resolveStaffName(staffData.name)} 的資料
                            </p>
                        </div>
                    </div>

                    <div className="mt-6">
                        <StaffForm
                            staff={staffData}
                            onSubmit={handleSubmit}
                            submitLabel="更新職員"
                        />
                    </div>
                </div>
            </div>
        </ManageLayout>
    );
}
