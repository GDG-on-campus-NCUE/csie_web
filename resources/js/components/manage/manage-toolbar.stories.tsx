import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '@/components/ui/button';
import ManageToolbar from './manage-toolbar';

const meta = {
    title: 'Manage/ManageToolbar',
    component: ManageToolbar,
    tags: ['autodocs'],
    parameters: {
        layout: 'padded',
        docs: {
            description: {
                component:
                    'ManageToolbar 是後台頁面常用的操作列容器,可依螢幕寬度自動切換排列方式,並提供主要/次要操作區塊。',
            },
        },
    },
    argTypes: {
        orientation: {
            control: 'radio',
            options: ['horizontal', 'vertical'],
            description: '桌機排列方向,行動版會自動改為直向堆疊。',
        },
        breakpoint: {
            control: 'select',
            options: ['sm', 'md', 'lg', 'xl'],
            description: '決定在何種斷點以上恢復桌機排列。',
        },
        wrap: {
            control: 'boolean',
            description: '是否允許內容在桌機斷點自動換行。',
        },
    },
} satisfies Meta<typeof ManageToolbar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        orientation: 'horizontal',
        primary: (
            <>
                <Button className="bg-[#10B981] hover:bg-[#059669] text-white">新增公告</Button>
                <Button variant="outline">管理篩選器</Button>
            </>
        ),
        secondary: (
            <>
                <Button variant="ghost">匯出 CSV</Button>
                <Button className="bg-[#EF4444] hover:bg-[#DC2626] text-white">批次刪除</Button>
            </>
        ),
    },
    render: (args) => <ManageToolbar {...args} />,
};

export const WithInlineFilters: Story = {
    args: {
        orientation: 'horizontal',
        wrap: true,
        primary: (
            <>
                <Button className="bg-[#3B82F6] hover:bg-[#2563EB] text-white">套用條件</Button>
                <Button variant="outline">重設</Button>
            </>
        ),
        secondary: (
            <Button variant="ghost">進階設定</Button>
        ),
        children: (
            <div className="grid gap-3 md:grid-cols-3">
                <label className="flex flex-col gap-1 text-sm text-neutral-700">
                    公告狀態
                    <select className="h-10 rounded-lg border border-neutral-200 px-3">
                        <option>全部</option>
                        <option>已發布</option>
                        <option>草稿</option>
                    </select>
                </label>
                <label className="flex flex-col gap-1 text-sm text-neutral-700">
                    類型
                    <select className="h-10 rounded-lg border border-neutral-200 px-3">
                        <option>全部</option>
                        <option>演講活動</option>
                        <option>招生資訊</option>
                    </select>
                </label>
                <label className="flex flex-col gap-1 text-sm text-neutral-700">
                    建立者
                    <input className="h-10 rounded-lg border border-neutral-200 px-3" placeholder="輸入姓名" />
                </label>
            </div>
        ),
    },
    render: (args) => <ManageToolbar {...args} />,
};

export const Vertical: Story = {
    args: {
        orientation: 'vertical',
        primary: (
            <>
                <Button className="bg-[#10B981] hover:bg-[#059669] text-white">新增教師</Button>
                <Button variant="outline">批次上傳</Button>
            </>
        ),
        secondary: (
            <Button variant="ghost">檢視操作紀錄</Button>
        ),
        children: (
            <p className="text-sm text-neutral-600">
                當工具列需要說明文字或額外操作提示時,可切換為垂直排列,讓項目依序向下堆疊。
            </p>
        ),
    },
    render: (args) => <ManageToolbar {...args} />,
};
