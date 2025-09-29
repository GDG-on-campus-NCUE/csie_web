import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ClassroomListItem } from './types';
import { ClassroomCardHeader } from './classroom-card-header';
import { ClassroomCardContent } from './classroom-card-content';
import { ClassroomCardFooter } from './classroom-card-footer';

interface ClassroomCardProps {
    classroom: ClassroomListItem;
    onEdit: (classroom: ClassroomListItem) => void;
    onDelete: (classroom: ClassroomListItem) => void;
}

export function ClassroomCard({ classroom, onEdit, onDelete }: ClassroomCardProps) {
    return (
        <Card className="flex h-full flex-col border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
            <ClassroomCardHeader classroom={classroom} />
            <ClassroomCardContent classroom={classroom} />
            <ClassroomCardFooter
                classroom={classroom}
                onEdit={() => onEdit(classroom)}
                onDelete={() => onDelete(classroom)}
            />
        </Card>
    );
}
