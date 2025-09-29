import { type FormEvent } from 'react';
import type { InertiaFormProps } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { type AssignableOption } from '@/components/manage/shared/assignable-multi-select';
import { LabFormData } from './types';
import { LabBasicInfoForm } from './lab-basic-info-form';
import { LabTeacherAssignmentForm } from './lab-teacher-assignment-form';
import { LabDisplaySettingsForm } from './lab-display-settings-form';

export interface TagSelectorOption {
    value: string;
    label: string;
}

interface LabFormProps {
    form: InertiaFormProps<LabFormData>;
    onSubmit: (event: FormEvent<HTMLFormElement>) => void;
    submitLabel: string;
    existingCoverUrl?: string | null;
    teacherOptions: AssignableOption[];
    tagOptions: TagSelectorOption[];
}

export default function LabForm({
    form,
    onSubmit,
    submitLabel,
    existingCoverUrl,
    teacherOptions,
    tagOptions
}: LabFormProps) {
    const { processing } = form;

    return (
        <form onSubmit={onSubmit} className="space-y-6">
            <LabBasicInfoForm
                form={form}
                existingCoverUrl={existingCoverUrl}
                tagOptions={tagOptions}
            />
            <LabTeacherAssignmentForm form={form} teacherOptions={teacherOptions} />
            <LabDisplaySettingsForm form={form} />

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
