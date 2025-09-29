import { Card } from '@/components/ui/card';
import { LabListItem } from './types';
import { LabCardCover } from './lab-card-cover';
import { LabCardHeader } from './lab-card-header';
import { LabCardContent } from './lab-card-content';
import { LabCardFooter } from './lab-card-footer';

interface LabCardProps {
    lab: LabListItem;
    onEdit: (lab: LabListItem) => void;
    onDelete: (lab: LabListItem) => void;
}

export function LabCard({ lab, onEdit, onDelete }: LabCardProps) {
    return (
        <Card className="flex h-full flex-col border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
            <LabCardCover lab={lab} />
            <LabCardHeader lab={lab} />
            <LabCardContent lab={lab} />
            <LabCardFooter
                lab={lab}
                onEdit={() => onEdit(lab)}
                onDelete={() => onDelete(lab)}
            />
        </Card>
    );
}
