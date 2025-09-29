import { CardContent } from '@/components/ui/card';
import { MapPin } from 'lucide-react';
import { ClassroomListItem } from './types';
import { formatCapacity, formatLocation } from './utils';

interface ClassroomCardContentProps {
    classroom: ClassroomListItem;
}

export function ClassroomCardContent({ classroom }: ClassroomCardContentProps) {
    return (
        <CardContent className="flex-1 space-y-4 text-sm text-slate-700">
            <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 text-slate-400" />
                <div>
                    <p className="font-medium">{formatLocation(classroom.location)}</p>
                    <p className="text-xs text-slate-500">{formatCapacity(classroom.capacity)}</p>
                </div>
            </div>

            {classroom.equipment_summary && (
                <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
                    <span className="font-medium text-slate-700">主要設備：</span>
                    {classroom.equipment_summary}
                </div>
            )}

            {classroom.description && (
                <p className="line-clamp-3 text-xs text-slate-500">{classroom.description}</p>
            )}
        </CardContent>
    );
}
