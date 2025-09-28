import type { FormEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Filter } from 'lucide-react';

interface StaffOption {
    id: number;
    name: { 'zh-TW'?: string; en?: string } | string;
    position?: { 'zh-TW'?: string; en?: string } | string | null;
}

export interface ClassroomFilterState {
    search: string;
    staff: string;
    visible: string;
    per_page: string;
}

interface ClassroomFilterBarProps {
    filterState: ClassroomFilterState;
    staff: StaffOption[];
    perPageOptions: number[];
    onChange: (key: keyof ClassroomFilterState, value: string) => void;
    onSubmit: (event: FormEvent<HTMLFormElement>) => void;
    onReset: () => void;
}

const resolveLocalizedText = (
    value: StaffOption['name'] | StaffOption['position'],
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

export function ClassroomFilterBar({ filterState, staff, perPageOptions, onChange, onSubmit, onReset }: ClassroomFilterBarProps) {
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
                        <label className="text-sm font-medium text-slate-700" htmlFor="classroom-filter-search">
                            關鍵字
                        </label>
                        <Input
                            id="classroom-filter-search"
                            value={filterState.search}
                            onChange={(event) => onChange('search', event.target.value)}
                            placeholder="搜尋教室名稱或代碼"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700" htmlFor="classroom-filter-staff">
                            負責職員
                        </label>
                        <Select
                            id="classroom-filter-staff"
                            value={filterState.staff}
                            onChange={(event) => onChange('staff', event.target.value)}
                        >
                            <option value="">全部職員</option>
                            {staff.map((member) => (
                                <option key={member.id} value={member.id}>
                                    {resolveLocalizedText(member.name, `職員 #${member.id}`)}
                                    {member.position && `／${resolveLocalizedText(member.position)}`}
                                </option>
                            ))}
                        </Select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700" htmlFor="classroom-filter-visible">
                            顯示狀態
                        </label>
                        <Select
                            id="classroom-filter-visible"
                            value={filterState.visible}
                            onChange={(event) => onChange('visible', event.target.value)}
                        >
                            <option value="">全部</option>
                            <option value="1">前台顯示</option>
                            <option value="0">隱藏</option>
                        </Select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700" htmlFor="classroom-filter-per-page">
                            每頁數量
                        </label>
                        <Select
                            id="classroom-filter-per-page"
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

export default ClassroomFilterBar;
