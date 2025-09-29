import { Button } from '@/components/ui/button';
import { CardFooter } from '@/components/ui/card';
import { Pencil, Trash2, GraduationCap } from 'lucide-react';
import { LabListItem } from './types';
import { resolveLocalizedText } from './utils';

interface LabCardFooterProps {
    lab: LabListItem;
    onEdit: () => void;
    onDelete: () => void;
}

export function LabCardFooter({ lab, onEdit, onDelete }: LabCardFooterProps) {
    const primaryTeacher = lab.teachers[0];
    const moreTeachers = lab.teachers.slice(1);

    return (
        <CardFooter className="flex flex-col gap-4 border-t border-slate-100 bg-slate-50/70 p-4">
            <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                    <GraduationCap className="h-3.5 w-3.5" />
                    研究團隊
                </div>
                {lab.teachers.length === 0 ? (
                    <span className="text-sm text-slate-400">尚未指派教師</span>
                ) : (
                    <div className="space-y-1 text-sm text-slate-700">
                        <div>
                            {resolveLocalizedText(primaryTeacher?.name, '未命名教師')}
                            {primaryTeacher?.title && (
                                <span className="ml-1 text-xs text-slate-500">
                                    {resolveLocalizedText(primaryTeacher.title)}
                                </span>
                            )}
                        </div>
                        {moreTeachers.length > 0 && (
                            <div className="text-xs text-slate-500">
                                其他：
                                {moreTeachers
                                    .map((teacher) =>
                                        resolveLocalizedText(teacher.name, `教師 #${teacher.id}`)
                                    )
                                    .join('、')}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-slate-400">排序權重：{lab.sort_order}</span>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={onEdit}>
                        <Pencil className="mr-1 h-4 w-4" /> 編輯
                    </Button>
                    <Button variant="destructive" size="sm" onClick={onDelete}>
                        <Trash2 className="mr-1 h-4 w-4" /> 刪除
                    </Button>
                </div>
            </div>
        </CardFooter>
    );
}
