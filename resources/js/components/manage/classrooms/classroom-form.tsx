import { FormEvent } from 'react';
import type { InertiaFormProps } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { type AssignableOption } from '@/components/manage/shared/assignable-multi-select';
import { ClassroomFormData } from './types';
import { ClassroomBasicInfoForm } from './classroom-basic-info-form';
import { ClassroomStaffAssignmentForm } from './classroom-staff-assignment-form';
import { ClassroomDisplaySettingsForm } from './classroom-display-settings-form';

export interface TagSelectorOption {
    value: string;
    label: string;
}

interface ClassroomFormProps {
    form: InertiaFormProps<ClassroomFormData>;
    onSubmit: (event: FormEvent<HTMLFormElement>) => void;
    submitLabel: string;
    staffOptions: AssignableOption[];
    tagOptions: TagSelectorOption[];
}

export default function ClassroomForm({ form, onSubmit, submitLabel, staffOptions, tagOptions }: ClassroomFormProps) {
    const { processing } = form;

    return (
        <form onSubmit={onSubmit} className="space-y-6">
            <ClassroomBasicInfoForm form={form} tagOptions={tagOptions} />
            <ClassroomStaffAssignmentForm form={form} staffOptions={staffOptions} />
            <ClassroomDisplaySettingsForm form={form} />

            <div className="flex justify-end space-x-3">
                <Button type="button" variant="outline" onClick={() => window.history.back()}>
                    取消
                </Button>
                <Button type="submit" disabled={processing}>
                    {processing ? '處理中…' : submitLabel}
                </Button>
            </div>
        </form>
    );
}
