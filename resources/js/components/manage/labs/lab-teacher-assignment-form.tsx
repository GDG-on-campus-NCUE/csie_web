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
                <CardTitle>師資連動</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-sm text-neutral-600">
                    為了呈現實驗室與教師的對應關係，可於此選擇一位或多位教師成員；後續將同步儲存於多對多關聯。
                </p>
                <AssignableMultiSelect
                    options={teacherOptions}
                    selectedIds={data.teacher_ids}
                    onChange={(ids: number[]) => setData('teacher_ids', ids)}
                    helperText="勾選後會立即更新表單資料，提交前仍可隨時調整。"
                    emptyLabel="目前沒有教師資料，請先至師資管理建立教師。"
                    searchPlaceholder="搜尋教師姓名或職稱"
                    errorMessage={Array.isArray(errors.teacher_ids) ? errors.teacher_ids.join('\n') : errors.teacher_ids}
                />
            </CardContent>
        </Card>
    );
}
