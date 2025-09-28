import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Pencil, Trash2, MapPin, Users } from 'lucide-react';

interface ClassroomStaff {
    id: number;
    name: { 'zh-TW'?: string; en?: string } | string;
    position?: { 'zh-TW'?: string; en?: string } | string | null;
}

export interface ClassroomListItem {
    id: number;
    code?: string | null;
    name: string;
    name_en?: string | null;
    location?: string | null;
    capacity?: number | null;
    equipment_summary?: string | null;
    description?: string | null;
    description_en?: string | null;
    tags: string[];
    visible: boolean;
    sort_order: number;
    updated_at?: string | null;
    staff: ClassroomStaff[];
}

interface ClassroomTableProps {
    classrooms: ClassroomListItem[];
    onEdit: (classroom: ClassroomListItem) => void;
    onDelete: (classroom: ClassroomListItem) => void;
}

const resolveLocalizedText = (
    value: ClassroomStaff['name'] | ClassroomStaff['position'],
    fallback = ''
): string => {
    if (!value) {
        return fallback;
    }

    if (typeof value === 'string') {
        return value;
    }

    return value['zh-TW'] ?? value.en ?? fallback;
};

const formatCapacity = (value?: number | null): string => {
    if (value === null || value === undefined) {
        return '未設定容量';
    }

    if (Number.isNaN(value)) {
        return '未設定容量';
    }

    return `可容納 ${value} 人`;
};

const formatLocation = (location?: string | null): string => {
    if (!location) {
        return '尚未提供地點資訊';
    }

    return location;
};

/**
 * 以卡片呈現教室資源，參考公告管理的視覺語彙並顯示標籤。
 */
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
                <Card
                    key={classroom.id}
                    className="flex h-full flex-col border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                    <CardHeader className="space-y-3">
                        <div className="flex items-start justify-between gap-3">
                            <div className="space-y-1">
                                <CardTitle className="text-lg font-semibold text-slate-900">{classroom.name}</CardTitle>
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
                                    <Badge key={tag} variant="outline" className="rounded-full px-3 py-1 text-xs">
                                        #{tag}
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </CardHeader>

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
                                        <Badge key={member.id} variant="secondary" className="rounded-full px-3 py-1 text-xs">
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
                                <Button variant="outline" size="sm" onClick={() => onEdit(classroom)}>
                                    <Pencil className="mr-1 h-4 w-4" /> 編輯
                                </Button>
                                <Button variant="destructive" size="sm" onClick={() => onDelete(classroom)}>
                                    <Trash2 className="mr-1 h-4 w-4" /> 刪除
                                </Button>
                            </div>
                        </div>
                    </CardFooter>
                </Card>
            ))}
        </div>
    );
}

export default ClassroomTable;
