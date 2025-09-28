import type { FormEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Filter } from 'lucide-react';

interface TeacherOption {
    id: number;
    name: { 'zh-TW'?: string; en?: string } | string;
    title?: { 'zh-TW'?: string; en?: string } | string | null;
}

export interface LabFilterState {
    search: string;
    teacher: string;
    visible: string;
    per_page: string;
}

interface LabFilterBarProps {
    filterState: LabFilterState;
    teachers: TeacherOption[];
    perPageOptions: number[];
    onChange: (key: keyof LabFilterState, value: string) => void;
    onSubmit: (event: FormEvent<HTMLFormElement>) => void;
    onReset: () => void;
}

const resolveLocalizedText = (
    value: TeacherOption['name'] | TeacherOption['title'],
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

/**
 * 實驗室列表專用篩選器，整合關鍵字、教師、狀態與每頁數量控制。
 */
export function LabFilterBar({ filterState, teachers, perPageOptions, onChange, onSubmit, onReset }: LabFilterBarProps) {
    return (
        <Card className="border border-slate-200 bg-white shadow-sm">
            <CardHeader className="border-b border-slate-100 pb-4">
                <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                    <Filter className="h-5 w-5" />
                    篩選條件
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={onSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
                    <div className="xl:col-span-2 space-y-1">
                        <label className="text-sm font-medium text-slate-700" htmlFor="lab-filter-search">
                            關鍵字
                        </label>
                        <Input
                            id="lab-filter-search"
                            value={filterState.search}
                            onChange={(event) => onChange('search', event.target.value)}
                            placeholder="搜尋名稱、代碼或聯絡資訊"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700" htmlFor="lab-filter-teacher">
                            指派教師
                        </label>
                        <Select
                            id="lab-filter-teacher"
                            value={filterState.teacher}
                            onChange={(event) => onChange('teacher', event.target.value)}
                        >
                            <option value="">全部教師</option>
                            {teachers.map((teacher) => (
                                <option key={teacher.id} value={teacher.id}>
                                    {resolveLocalizedText(teacher.name, `教師 #${teacher.id}`)}
                                    {teacher.title && `／${resolveLocalizedText(teacher.title)}`}
                                </option>
                            ))}
                        </Select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700" htmlFor="lab-filter-visible">
                            顯示狀態
                        </label>
                        <Select
                            id="lab-filter-visible"
                            value={filterState.visible}
                            onChange={(event) => onChange('visible', event.target.value)}
                        >
                            <option value="">全部</option>
                            <option value="1">前台顯示</option>
                            <option value="0">隱藏</option>
                        </Select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700" htmlFor="lab-filter-per-page">
                            每頁數量
                        </label>
                        <Select
                            id="lab-filter-per-page"
                            value={filterState.per_page}
                            onChange={(event) => onChange('per_page', event.target.value)}
                        >
                            {perPageOptions.map((option) => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </Select>
                    </div>

                    <div className="flex items-end gap-2">
                        <Button type="submit" className="w-full md:w-auto">
                            套用篩選
                        </Button>
                        <Button type="button" variant="outline" className="w-full md:w-auto" onClick={onReset}>
                            清除條件
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}

export default LabFilterBar;
