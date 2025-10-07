import type { Meta, StoryObj } from '@storybook/react';
import { FilterPanel } from './filter-panel';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { useState } from 'react';

const meta: Meta<typeof FilterPanel> = {
    title: 'Manage/FilterPanel',
    component: FilterPanel,
    parameters: {
        layout: 'padded',
        docs: {
            description: {
                component: '篩選面板元件,提供統一的篩選介面,支援展開/收合、套用與重設功能。符合 plan.md 第 7.1 節的共用元件規範。',
            },
        },
    },
    tags: ['autodocs'],
    argTypes: {
        title: {
            description: '面板標題',
            control: 'text',
        },
        collapsible: {
            description: '是否可收合',
            control: 'boolean',
        },
        defaultOpen: {
            description: '預設展開狀態',
            control: 'boolean',
        },
        applyLabel: {
            description: '套用按鈕文字',
            control: 'text',
        },
        resetLabel: {
            description: '重設按鈕文字',
            control: 'text',
        },
    },
};

export default meta;
type Story = StoryObj<typeof FilterPanel>;

// 基本篩選面板
export const Default: Story = {
    args: {
        title: '篩選條件',
        onApply: () => console.log('Apply filters'),
        onReset: () => console.log('Reset filters'),
        children: (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                    <label className="text-sm font-medium">關鍵字</label>
                    <Input placeholder="搜尋..." />
                </div>
                <div>
                    <label className="text-sm font-medium">狀態</label>
                    <Input placeholder="選擇狀態" />
                </div>
                <div>
                    <label className="text-sm font-medium">分類</label>
                    <Input placeholder="選擇分類" />
                </div>
            </div>
        ),
    },
};

// 可收合版本
export const Collapsible: Story = {
    args: {
        title: '進階篩選',
        collapsible: true,
        defaultOpen: true,
        onApply: () => console.log('Apply'),
        onReset: () => console.log('Reset'),
        children: (
            <div className="space-y-3">
                <Input placeholder="搜尋關鍵字..." />
                <Input placeholder="選擇狀態" />
            </div>
        ),
    },
};

// 預設收合
export const DefaultClosed: Story = {
    args: {
        title: '篩選條件',
        collapsible: true,
        defaultOpen: false,
        onApply: () => console.log('Apply'),
        onReset: () => console.log('Reset'),
        children: (
            <div className="space-y-3">
                <Input placeholder="搜尋..." />
            </div>
        ),
    },
};

// 不可收合版本
export const NonCollapsible: Story = {
    args: {
        title: '固定篩選條件',
        collapsible: false,
        onApply: () => console.log('Apply'),
        onReset: () => console.log('Reset'),
        children: (
            <div className="grid gap-4 sm:grid-cols-3">
                <Input placeholder="關鍵字" />
                <Input placeholder="狀態" />
                <Input placeholder="日期" />
            </div>
        ),
    },
};

// 無按鈕版本
export const WithoutButtons: Story = {
    args: {
        title: '僅顯示篩選欄位',
        children: (
            <div className="space-y-3">
                <Input placeholder="搜尋..." />
                <Input placeholder="選擇類型" />
            </div>
        ),
    },
};

// 自訂按鈕文字
export const CustomButtonLabels: Story = {
    args: {
        title: '自訂按鈕',
        applyLabel: '搜尋',
        resetLabel: '清除',
        onApply: () => console.log('Search'),
        onReset: () => console.log('Clear'),
        children: (
            <Input placeholder="輸入搜尋條件..." />
        ),
    },
};

// 複雜篩選表單
export const ComplexForm: Story = {
    args: {
        title: '公告篩選',
        collapsible: true,
        onApply: () => console.log('Apply filters'),
        onReset: () => console.log('Reset filters'),
        children: (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-neutral-700">關鍵字</label>
                    <Input placeholder="搜尋標題或內容..." />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-neutral-700">狀態</label>
                    <Input placeholder="選擇狀態" />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-neutral-700">分類</label>
                    <Input placeholder="選擇分類" />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-neutral-700">標籤</label>
                    <Input placeholder="選擇標籤" />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-neutral-700">發布日期 (從)</label>
                    <Input type="date" />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-neutral-700">發布日期 (到)</label>
                    <Input type="date" />
                </div>
            </div>
        ),
    },
};

// 互動式示例
export const Interactive: Story = {
    render: () => {
        const [filters, setFilters] = useState({
            keyword: '',
            status: '',
        });

        const handleApply = () => {
            console.log('Applied filters:', filters);
            alert(`篩選條件:\n關鍵字: ${filters.keyword}\n狀態: ${filters.status}`);
        };

        const handleReset = () => {
            setFilters({ keyword: '', status: '' });
            console.log('Filters reset');
        };

        return (
            <FilterPanel
                title="互動式篩選"
                onApply={handleApply}
                onReset={handleReset}
            >
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">關鍵字</label>
                        <Input
                            placeholder="搜尋..."
                            value={filters.keyword}
                            onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">狀態</label>
                        <Input
                            placeholder="選擇狀態"
                            value={filters.status}
                            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                        />
                    </div>
                </div>
                <div className="mt-3 rounded-lg bg-neutral-50 p-3 text-xs text-neutral-600">
                    <strong>目前篩選:</strong>
                    <br />
                    關鍵字: {filters.keyword || '(未設定)'}
                    <br />
                    狀態: {filters.status || '(未設定)'}
                </div>
            </FilterPanel>
        );
    },
};

// 響應式測試
export const ResponsiveLayout: Story = {
    parameters: {
        viewport: {
            defaultViewport: 'mobile1',
        },
    },
    args: {
        title: '行動版篩選',
        collapsible: true,
        defaultOpen: false,
        onApply: () => console.log('Apply'),
        onReset: () => console.log('Reset'),
        children: (
            <div className="space-y-3">
                <Input placeholder="搜尋..." />
                <Input placeholder="狀態" />
                <Input placeholder="分類" />
            </div>
        ),
    },
};

// 無障礙測試
export const Accessibility: Story = {
    args: {
        title: '無障礙篩選面板',
        collapsible: true,
        onApply: () => console.log('Apply'),
        onReset: () => console.log('Reset'),
        children: (
            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <label htmlFor="search-input" className="text-sm font-medium">
                        搜尋關鍵字
                    </label>
                    <Input
                        id="search-input"
                        placeholder="輸入關鍵字..."
                        aria-label="搜尋關鍵字"
                    />
                </div>
                <div className="space-y-2">
                    <label htmlFor="status-select" className="text-sm font-medium">
                        篩選狀態
                    </label>
                    <Input
                        id="status-select"
                        placeholder="選擇狀態"
                        aria-label="選擇篩選狀態"
                    />
                </div>
            </div>
        ),
    },
    parameters: {
        a11y: {
            config: {
                rules: [
                    {
                        id: 'color-contrast',
                        enabled: true,
                    },
                    {
                        id: 'label',
                        enabled: true,
                    },
                ],
            },
        },
    },
};
