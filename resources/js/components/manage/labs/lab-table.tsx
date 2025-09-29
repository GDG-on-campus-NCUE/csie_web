import { LabListItem } from './types';
import { LabCard } from './lab-card';

interface LabTableProps {
    labs: LabListItem[];
    onEdit: (lab: LabListItem) => void;
    onDelete: (lab: LabListItem) => void;
}

export function LabTable({ labs, onEdit, onDelete }: LabTableProps) {
    if (labs.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white py-12 text-center">
                <p className="text-base font-medium text-slate-700">目前沒有實驗室資料</p>
                <p className="text-sm text-slate-500">請點選右上角新增按鈕建立新的實驗室。</p>
            </div>
        );
    }

    return (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {labs.map((lab) => (
                <LabCard
                    key={lab.id}
                    lab={lab}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
            ))}
        </div>
    );
}

export default LabTable;
