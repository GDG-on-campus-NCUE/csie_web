import { FormEvent } from 'react';
import { Filter } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import type { ContactFilterState, ContactStatusOption } from './contact-types';

interface ContactFilterFormProps {
    state: ContactFilterState;
    statusOptions: ContactStatusOption[];
    perPageOptions: number[];
    onChange: (key: keyof ContactFilterState, value: string) => void;
    onSubmit: (event?: FormEvent<HTMLFormElement>) => void;
    onReset: () => void;
    hasActiveFilters: boolean;
}

/**
 * 聯絡訊息篩選表單元件
 * - 與頁面邏輯分離，便於日後維護或共用
 * - 傳入的狀態、每頁筆數等皆以 props 控制，維持單向資料流
 */
export function ContactFilterForm({
    state,
    statusOptions,
    perPageOptions,
    onChange,
    onSubmit,
    onReset,
    hasActiveFilters,
}: ContactFilterFormProps) {
    return (
        <Card className="border border-slate-200 bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-4">
                <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                    <Filter className="h-4 w-4" />
                    聯絡訊息篩選
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form
                    className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4"
                    onSubmit={(event) => onSubmit(event)}
                >
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="contact-search">搜尋關鍵字</Label>
                        <Input
                            id="contact-search"
                            value={state.search}
                            placeholder="輸入姓名、Email 或主旨"
                            onChange={(event) => onChange('search', event.target.value)}
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="contact-status">處理狀態</Label>
                        <Select
                            id="contact-status"
                            value={state.status}
                            onChange={(event) => onChange('status', event.target.value)}
                        >
                            <option value="">全部狀態</option>
                            {statusOptions.map((option) => (
                                <option key={option.value || 'all'} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </Select>
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="contact-per-page">每頁顯示</Label>
                        <Select
                            id="contact-per-page"
                            value={state.per_page}
                            onChange={(event) => onChange('per_page', event.target.value)}
                        >
                            {perPageOptions.map((option) => (
                                <option key={option} value={option}>
                                    每頁 {option} 筆
                                </option>
                            ))}
                        </Select>
                    </div>

                    <div className="flex items-end gap-2">
                        <Button type="submit" className="w-full">
                            套用篩選
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full"
                            disabled={!hasActiveFilters}
                            onClick={onReset}
                        >
                            清除條件
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
