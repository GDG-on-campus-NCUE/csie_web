import { ClassroomListItem } from './types';
import { ClassroomCard } from './classroom-card';

interface ClassroomTableProps {
    classrooms: ClassroomListItem[];
    onEdit: (classroom: ClassroomListItem) => void;
    onDelete: (classroom: ClassroomListItem) => void;
}

export function ClassroomTable({ classrooms, onEdit, onDelete }: ClassroomTableProps) {
    if (classrooms.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white py-12 text-center">
                <p className="text-base font-medium text-slate-700">目前沒有教室資料</p>
                <p className="text-sm text-slate-500">請點選右上角新增按鈕建立教室。</p>
            </div>
        );
    }

    return (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {classrooms.map((classroom) => (
                <ClassroomCard
                    key={classroom.id}
                    classroom={classroom}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
            ))}
        </div>
    );
}

export default ClassroomTable;
