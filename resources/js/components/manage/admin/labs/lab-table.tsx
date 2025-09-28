import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink, Pencil, Trash2, GraduationCap, Globe2, Mail, Phone } from 'lucide-react';

interface LabTeacher {
    id: number;
    name: { 'zh-TW'?: string; en?: string } | string;
    title?: { 'zh-TW'?: string; en?: string } | string | null;
}

export interface LabListItem {
    id: number;
    code?: string | null;
    name: string;
    name_en?: string | null;
    email?: string | null;
    phone?: string | null;
    website_url?: string | null;
    description?: string | null;
    description_en?: string | null;
    tags: string[];
    visible: boolean;
    sort_order: number;
    updated_at?: string | null;
    cover_image_url?: string | null;
    teachers: LabTeacher[];
}

interface LabTableProps {
    labs: LabListItem[];
    onEdit: (lab: LabListItem) => void;
    onDelete: (lab: LabListItem) => void;
}

const resolveLocalizedText = (
    value: LabTeacher['name'] | LabTeacher['title'],
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

const fallbackInitials = (name: string): string => {
    if (!name) {
        return 'LAB';
    }

    const trimmed = name.replace(/\s+/g, '');
    return trimmed.slice(0, 2).toUpperCase();
};

/**
 * 以卡片方式呈現實驗室資源，突顯標籤與聯絡資訊。
 */
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
            {labs.map((lab) => {
                const primaryTeacher = lab.teachers[0];
                const moreTeachers = lab.teachers.slice(1);

                return (
                    <Card
                        key={lab.id}
                        className="flex h-full flex-col border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                    >
                        <div className="relative h-36 w-full overflow-hidden rounded-t-xl bg-slate-100">
                            {lab.cover_image_url ? (
                                <img src={lab.cover_image_url} alt={lab.name} className="h-full w-full object-cover" />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center text-lg font-semibold text-slate-400">
                                    {fallbackInitials(lab.name)}
                                </div>
                            )}
                            <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                                {lab.tags.map((tag) => (
                                    <Badge key={tag} variant="outline" className="rounded-full bg-white/90 px-3 py-1 text-xs">
                                        #{tag}
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        <CardHeader className="space-y-2">
                            <div className="flex items-start justify-between gap-3">
                                <div className="space-y-1">
                                    <CardTitle className="text-lg font-semibold text-slate-900">{lab.name}</CardTitle>
                                    {lab.name_en && <p className="text-sm text-slate-500">{lab.name_en}</p>}
                                    {lab.code && <p className="text-xs text-slate-500">代碼：{lab.code}</p>}
                                </div>
                                <Badge variant={lab.visible ? 'default' : 'secondary'}>
                                    {lab.visible ? '顯示中' : '已隱藏'}
                                </Badge>
                            </div>
                        </CardHeader>

                        <CardContent className="flex-1 space-y-4 text-sm text-slate-700">
                            {lab.description && (
                                <p className="line-clamp-3 text-xs text-slate-500">{lab.description}</p>
                            )}

                            <div className="space-y-2 text-xs text-slate-500">
                                {lab.website_url && (
                                    <a
                                        href={lab.website_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-blue-600 hover:underline"
                                    >
                                        <Globe2 className="h-4 w-4" /> 官方網站
                                        <ExternalLink className="h-3 w-3" />
                                    </a>
                                )}
                                {lab.email && (
                                    <div className="flex items-center gap-2">
                                        <Mail className="h-4 w-4 text-slate-400" />
                                        <span>{lab.email}</span>
                                    </div>
                                )}
                                {lab.phone && (
                                    <div className="flex items-center gap-2">
                                        <Phone className="h-4 w-4 text-slate-400" />
                                        <span>{lab.phone}</span>
                                    </div>
                                )}
                                {!lab.email && !lab.phone && !lab.website_url && (
                                    <span className="text-slate-400">尚未提供聯絡資訊</span>
                                )}
                            </div>
                        </CardContent>

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
                                    <Button variant="outline" size="sm" onClick={() => onEdit(lab)}>
                                        <Pencil className="mr-1 h-4 w-4" /> 編輯
                                    </Button>
                                    <Button variant="destructive" size="sm" onClick={() => onDelete(lab)}>
                                        <Trash2 className="mr-1 h-4 w-4" /> 刪除
                                    </Button>
                                </div>
                            </div>
                        </CardFooter>
                    </Card>
                );
            })}
        </div>
    );
}

export default LabTable;
