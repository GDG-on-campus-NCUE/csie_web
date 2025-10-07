import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '@/components/ui/button';
import DataCard from './data-card';
import ResponsiveDataView from './responsive-data-view';
import TableEmpty from './table-empty';
import TableLoading from './table-loading';

const mockRows = Array.from({ length: 4 }).map((_, index) => (
    <tr key={`row-${index}`} className="border-b border-neutral-100">
        <td className="py-4 text-sm font-medium text-neutral-900">公告 {index + 1}</td>
        <td className="py-4 text-sm text-neutral-600">張小明</td>
        <td className="py-4 text-sm text-neutral-600">2024-12-10</td>
        <td className="py-4 text-sm text-neutral-600 text-right">
            <Button size="sm" variant="outline">
                編輯
            </Button>
        </td>
    </tr>
));

const mockCards = (
    <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, index) => (
            <DataCard
                key={`card-${index}`}
                title={`公告 ${index + 1}`}
                description="說明文字提供使用者快速了解內容摘要。"
                status={{ label: '已發布', tone: 'success' }}
                metadata={[
                    { label: '建立者', value: '張小明' },
                    { label: '更新時間', value: '2024/12/10' },
                ]}
                actions={<Button size="sm">查看</Button>}
                mobileActions={
                    <Button className="bg-[#3B82F6] hover:bg-[#2563EB] text-white" size="sm">
                        編輯公告
                    </Button>
                }
            />
        ))}
    </div>
);

const meta = {
    title: 'Manage/ResponsiveDataView',
    component: ResponsiveDataView,
    tags: ['autodocs'],
    parameters: {
        layout: 'padded',
        docs: {
            description: {
                component:
                    'ResponsiveDataView 會依據斷點在表格與卡片之間切換,適用於各類列表型資料。',
            },
        },
    },
    argTypes: {
        mode: {
            control: 'radio',
            options: ['auto', 'table', 'card'],
            description: '控制呈現模式,預設自動切換。',
        },
        breakpoint: {
            control: 'select',
            options: ['sm', 'md', 'lg', 'xl'],
            description: '設定自動切換的斷點。',
        },
        isLoading: {
            control: 'boolean',
        },
        isEmpty: {
            control: 'boolean',
        },
    },
} satisfies Meta<typeof ResponsiveDataView>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        mode: 'auto',
        breakpoint: 'md',
        card: () => mockCards,
        table: () => (
            <table className="w-full table-auto text-left">
                <thead>
                    <tr className="border-b border-neutral-200 bg-neutral-50/70 text-sm text-neutral-600">
                        <th className="py-3 font-medium">標題</th>
                        <th className="py-3 font-medium">建立者</th>
                        <th className="py-3 font-medium">更新時間</th>
                        <th className="py-3 text-right font-medium">操作</th>
                    </tr>
                </thead>
                <tbody>{mockRows}</tbody>
            </table>
        ),
    },
    render: (args) => <ResponsiveDataView {...args} />,
};

export const Loading: Story = {
    args: {
        mode: 'auto',
        isLoading: true,
        table: () => null,
        card: () => null,
        loadingFallback: <TableLoading rows={3} columns={4} className="p-6" />,
    },
    render: (args) => <ResponsiveDataView {...args} />,
};

export const EmptyState: Story = {
    args: {
        mode: 'auto',
        isEmpty: true,
        table: () => null,
        card: () => null,
        emptyState: <TableEmpty title="目前沒有公告" description="建立第一則公告以通知成員。" />,
    },
    render: (args) => <ResponsiveDataView {...args} />,
};

export const WithStickyActions: Story = {
    args: {
        mode: 'card',
        card: () => mockCards,
        table: () => null,
        stickyActions: (
            <>
                <Button className="bg-[#1E293B] hover:bg-[#0F172A] text-white" size="sm">
                    匯出已選項目
                </Button>
                <Button variant="outline" size="sm">
                    取消選取
                </Button>
            </>
        ),
    },
    render: (args) => <ResponsiveDataView {...args} />,
};
