import type { InertiaFormProps } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AssignableMultiSelect, { type AssignableOption } from '@/components/manage/shared/assignable-multi-select';
import { ClassroomFormData } from './types';

interface ClassroomStaffAssignmentFormProps {
    form: InertiaFormProps<ClassroomFormData>;
    staffOptions: AssignableOption[];
}

export function ClassroomStaffAssignmentForm({ form, staffOptions }: ClassroomStaffAssignmentFormProps) {
    const { data, setData, errors } = form;

    return (
        <Card className="shadow-sm">
            <CardHeader>
                <CardTitle>職員連動</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-sm text-neutral-600">
                    教室可指派多位職員負責維護或管理，這些資訊會同步顯示在教室詳情中，並可供前台查詢。
                </p>
                <AssignableMultiSelect
                    options={staffOptions}
                    selectedIds={data.staff_ids}
                    onChange={(ids: number[]) => setData('staff_ids', ids)}
                    helperText="可選擇多位職員，提交後會立即同步至資料庫。"
                    emptyLabel="目前沒有職員資料，請先建立職員資訊。"
                    searchPlaceholder="搜尋職員姓名或職稱"
                    errorMessage={Array.isArray(errors.staff_ids) ? errors.staff_ids.join('\n') : errors.staff_ids}
                />
            </CardContent>
        </Card>
    );
}
