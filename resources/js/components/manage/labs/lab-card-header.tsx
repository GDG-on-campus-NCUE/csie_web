import { Badge } from '@/components/ui/badge';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { LabListItem } from './types';

interface LabCardHeaderProps {
    lab: LabListItem;
}

export function LabCardHeader({ lab }: LabCardHeaderProps) {
    return (
        <CardHeader className="space-y-2">
            <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                    <CardTitle className="text-lg font-semibold text-slate-900">
                        {lab.name}
                    </CardTitle>
                    {lab.name_en && (
                        <p className="text-sm text-slate-500">{lab.name_en}</p>
                    )}
                    {lab.code && (
                        <p className="text-xs text-slate-500">代碼：{lab.code}</p>
                    )}
                </div>
                <Badge variant={lab.visible ? 'default' : 'secondary'}>
                    {lab.visible ? '顯示中' : '已隱藏'}
                </Badge>
            </div>
        </CardHeader>
    );
}
