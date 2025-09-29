import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CardFooter } from '@/components/ui/card';
import { Pencil, Trash2, Users } from 'lucide-react';
import { ClassroomListItem } from './types';
import { resolveLocalizedText } from './utils';

interface ClassroomCardFooterProps {
    classroom: ClassroomListItem;
    onEdit: () => void;
    onDelete: () => void;
}

export function ClassroomCardFooter({ classroom, onEdit, onDelete }: ClassroomCardFooterProps) {
    return (
        <CardFooter className="flex flex-col gap-4 border-t border-slate-100 bg-slate-50/70 p-4">
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                    <Users className="h-3.5 w-3.5" />
                    負責職員
                </div>
                {classroom.staff.length === 0 ? (
                    <span className="text-sm text-slate-400">尚未指派職員</span>
                ) : (
                    <div className="flex flex-wrap gap-2">
                        {classroom.staff.map((member) => (
                            <Badge
                                key={member.id}
                                variant="secondary"
                                className="rounded-full px-3 py-1 text-xs"
                            >
                                {resolveLocalizedText(member.name, `職員 #${member.id}`)}
                                {member.position && (
                                    <span className="ml-1 text-[10px] text-slate-500">
                                        {resolveLocalizedText(member.position)}
                                    </span>
                                )}
                            </Badge>
                        ))}
                    </div>
                )}
            </div>

            <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-slate-400">
                    排序權重：{classroom.sort_order}
                </span>
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
