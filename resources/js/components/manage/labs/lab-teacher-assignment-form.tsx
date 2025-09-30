import type { InertiaFormProps } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AssignableMultiSelect, { type AssignableOption } from '@/components/manage/shared/assignable-multi-select';
import { LabFormData } from './types';

interface LabTeacherAssignmentFormProps {
    form: InertiaFormProps<LabFormData>;
    teacherOptions: AssignableOption[];
}

export function LabTeacherAssignmentForm({ form, teacherOptions }: LabTeacherAssignmentFormProps) {
    const { data, setData, errors } = form;

    return (
        <Card className="shadow-sm">
            <CardHeader>
                <CardTitle>成員連動</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-sm text-neutral-600">
                    指定與此研究室關聯的教職成員，系統會同步更新多對多關聯以供前台顯示。
                </p>
                <AssignableMultiSelect
                    options={teacherOptions}
                    selectedIds={data.teacher_ids}
                    onChange={(ids: number[]) => setData('teacher_ids', ids)}
                    helperText="勾選後會立即更新表單資料，提交前仍可隨時調整。"
                    emptyLabel="目前沒有可選成員，請先建立使用者並賦予角色。"
                    searchPlaceholder="搜尋姓名或關鍵字"
                    errorMessage={Array.isArray(errors.teacher_ids) ? errors.teacher_ids.join('\n') : errors.teacher_ids}
                />
            </CardContent>
        </Card>
    );
}
