import type { Meta, StoryObj } from '@storybook/react';
import { StatCard } from '../stat-card';
import { Megaphone, Users, FileText, CalendarClock, Server } from 'lucide-react';

const meta: Meta<typeof StatCard> = {
    title: 'Manage/StatCard',
    component: StatCard,
    parameters: {
        layout: 'padded',
        docs: {
            description: {
                component: '統計卡片元件,用於顯示儀表板統計資料,支援圖示、趨勢指標與連結。符合 plan.md 第 7.1 節的共用元件規範。',
            },
        },
    },
    tags: ['autodocs'],
    argTypes: {
        title: {
            description: '卡片標題',
            control: 'text',
        },
        value: {
            description: '主要數值',
            control: 'text',
        },
        description: {
            description: '說明文字',
            control: 'text',
        },
        trend: {
            description: '趨勢方向',
            control: 'select',
            options: ['up', 'down', 'flat'],
        },
        delta: {
            description: '變化量',
            control: 'number',
        },
        deltaLabel: {
            description: '變化標籤',
            control: 'text',
        },
        href: {
            description: '連結網址',
            control: 'text',
        },
        suffix: {
            description: '後綴符號',
            control: 'text',
        },
    },
};

export default meta;
type Story = StoryObj<typeof StatCard>;

// 基本統計卡片
export const Default: Story = {
    args: {
        title: '公告總數',
        value: 128,
        icon: Megaphone,
        description: '目前系統中的公告數量',
    },
};

// 帶趨勢指標 (上升)
export const WithUpTrend: Story = {
    args: {
        title: '已發布',
        value: 95,
        icon: FileText,
        trend: 'up',
        delta: 12,
        deltaLabel: 'vs 上週',
    },
};

// 帶趨勢指標 (下降)
export const WithDownTrend: Story = {
    args: {
        title: '待審核',
        value: 23,
        icon: CalendarClock,
        trend: 'down',
        delta: -5,
        deltaLabel: 'vs 上週',
    },
};

// 持平趨勢
export const FlatTrend: Story = {
    args: {
        title: '封存',
        value: 10,
        icon: FileText,
        trend: 'flat',
        delta: 0,
        deltaLabel: 'vs 上週',
    },
};

// 帶連結
export const WithLink: Story = {
    args: {
        title: '使用者數',
        value: 1234,
        icon: Users,
        href: '/manage/admin/users',
        trend: 'up',
        delta: 23,
        deltaLabel: 'vs 上個月',
    },
};

// 百分比顯示
export const Percentage: Story = {
    args: {
        title: '完成率',
        value: '75',
        suffix: '%',
        icon: FileText,
    },
};

// 自訂內容 (儲存空間)
export const WithCustomContent: Story = {
    args: {
        title: '儲存空間',
        value: '75',
        suffix: '%',
        icon: Server,
        children: (
            <div className="space-y-2">
                <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100">
                    <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all"
                        style={{ width: '75%' }}
                    />
                </div>
                <p className="text-xs font-medium text-neutral-600">7.5 GB / 10 GB</p>
            </div>
        ),
    },
};

// 無圖示
export const WithoutIcon: Story = {
    args: {
        title: '總計',
        value: 999,
        description: '全系統統計',
    },
};

// Grid 佈局示例
export const GridLayout: Story = {
    render: () => (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            <StatCard title="公告總數" value={128} icon={Megaphone} />
            <StatCard
                title="已發布"
                value={95}
                icon={FileText}
                trend="up"
                delta={12}
                deltaLabel="vs 上週"
            />
            <StatCard
                title="草稿"
                value={23}
                icon={FileText}
                trend="down"
                delta={-3}
                deltaLabel="vs 上週"
            />
            <StatCard
                title="使用者數"
                value={1234}
                icon={Users}
                trend="up"
                delta={56}
                deltaLabel="vs 上月"
            />
            <StatCard
                title="儲存空間"
                value="75"
                suffix="%"
                icon={Server}
            />
        </div>
    ),
};

// 響應式測試
export const ResponsiveGrid: Story = {
    parameters: {
        viewport: {
            defaultViewport: 'mobile1',
        },
    },
    render: () => (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard title="公告" value={128} icon={Megaphone} />
            <StatCard title="使用者" value={1234} icon={Users} />
            <StatCard title="檔案" value={567} icon={FileText} />
        </div>
    ),
};

// 長文字測試
export const LongText: Story = {
    args: {
        title: '這是一個非常非常長的標題用來測試文字溢出處理',
        value: 123456789,
        description: '這是一段很長的描述文字,用來測試在卡片中的顯示效果和換行行為',
        icon: Megaphone,
    },
};

// 無障礙測試
export const Accessibility: Story = {
    args: {
        title: '公告總數',
        value: 128,
        icon: Megaphone,
        description: '系統中所有公告的總數量,包含已發布和草稿',
        trend: 'up',
        delta: 12,
        deltaLabel: '相較於上週增加',
    },
    parameters: {
        a11y: {
            config: {
                rules: [
                    {
                        id: 'color-contrast',
                        enabled: true,
                    },
                ],
            },
        },
    },
};
