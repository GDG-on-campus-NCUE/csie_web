import type { Meta, StoryObj } from '@storybook/react';
import { Calendar, Eye, MessageSquare, User } from 'lucide-react';

import { Button } from '@/components/ui/button';

import DataCard from './data-card';

const meta = {
    title: 'Manage/DataCard',
    component: DataCard,
    tags: ['autodocs'],
    parameters: {
        layout: 'padded',
        docs: {
            description: {
                component:
                    'DataCard 是行動版列表的標準卡片,支援狀態徽章、後設資料、操作列與行動版專用按鈕。',
            },
        },
    },
    argTypes: {
        status: {
            control: 'object',
            description: '狀態徽章 (label, tone, badgeColor)',
        },
        metadata: {
            control: 'object',
            description: '後設資料陣列 (label, value, icon)',
        },
        actions: {
            control: false,
        },
        mobileActions: {
            control: false,
        },
    },
} satisfies Meta<typeof DataCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        title: '112 學年度系友回娘家活動',
        description: '邀請歷屆系友回系上敘舊,同步分享最新的研究與學生成果。',
        status: { label: '已發布', tone: 'success' },
        metadata: [
            { label: '建立者', value: '王小明', icon: <User className="h-4 w-4" /> },
            { label: '發布日期', value: '2024-11-10', icon: <Calendar className="h-4 w-4" /> },
            { label: '瀏覽數', value: '2,456', icon: <Eye className="h-4 w-4" /> },
        ],
        actions: (
            <>
                <Button size="sm">編輯</Button>
                <Button size="sm" variant="outline">
                    預覽
                </Button>
            </>
        ),
        mobileActions: (
            <Button size="sm" className="bg-[#3B82F6] hover:bg-[#2563EB] text-white">
                行動操作
            </Button>
        ),
    },
};

export const WithChildren: Story = {
    args: {
        title: '人工智慧專題競賽',
        status: { label: '評選中', tone: 'warning' },
        children: (
            <ul className="list-disc space-y-1 pl-5 text-sm text-neutral-700">
                <li>共有 24 組隊伍進入決賽。</li>
                <li>評審委員需於 12/20 前完成打分。</li>
            </ul>
        ),
        metadata: [
            { label: '聯絡人', value: '李小華', icon: <MessageSquare className="h-4 w-4" /> },
            { label: '最後更新', value: '2024-12-05', icon: <Calendar className="h-4 w-4" /> },
        ],
    },
};

export const WithImage: Story = {
    args: {
        title: '研究成果展覽',
        description: '展示系上最新研究成果,包含論文、海報與互動展示。',
        image: 'https://picsum.photos/seed/manage-card/800/450',
        status: { label: '報名中', tone: 'info' },
        metadata: [
            { label: '場地', value: '科學館一樓大廳' },
            { label: '更新時間', value: '2024-12-01' },
        ],
        actions: (
            <>
                <Button size="sm">查看報名</Button>
                <Button size="sm" variant="outline">
                    複製連結
                </Button>
            </>
        ),
    },
};

export const CustomBadge: Story = {
    args: {
        title: '招生問答直播',
        description: '直播將於下週五舉行,敬請招生團隊提前準備 FAQ。',
        status: { label: '直播預告', badgeColor: 'bg-purple-100 text-purple-700 border-purple-200' },
        metadata: [
            { label: '主持人', value: '陳佳穎' },
            { label: '直播時間', value: '2024-12-18 19:30' },
        ],
    },
};
