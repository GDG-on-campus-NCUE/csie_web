import { Badge } from '@/components/ui/badge';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { ClassroomListItem } from './types';

interface ClassroomCardHeaderProps {
    classroom: ClassroomListItem;
}

export function ClassroomCardHeader({ classroom }: ClassroomCardHeaderProps) {
    return (
        <CardHeader className="space-y-3">
            <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                    <CardTitle className="text-lg font-semibold text-slate-900">
                        {classroom.name}
                    </CardTitle>
                    {classroom.name_en && (
                        <p className="text-sm text-slate-500">{classroom.name_en}</p>
                    )}
                    {classroom.code && (
                        <p className="text-xs text-slate-500">代碼：{classroom.code}</p>
                    )}
                </div>
                <Badge variant={classroom.visible ? 'default' : 'secondary'}>
                    {classroom.visible ? '顯示中' : '已隱藏'}
                </Badge>
            </div>

            {classroom.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {classroom.tags.map((tag) => (
                        <Badge
                            key={tag}
                            variant="outline"
                            className="rounded-full px-3 py-1 text-xs"
                        >
                            #{tag}
                        </Badge>
                    ))}
                </div>
            )}
        </CardHeader>
    );
}
