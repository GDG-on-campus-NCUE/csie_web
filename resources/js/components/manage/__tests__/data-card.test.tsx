import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
const UsersIcon = () => <span data-testid="user-icon" />;
const CalendarIcon = () => <span data-testid="calendar-icon" />;

import { Button } from '@/components/ui/button';

import { DataCard } from '../data-card';

jest.mock('@inertiajs/react', () => ({
    Link: ({ href, children, ...props }: any) => (
        <a href={href} {...props}>
            {children}
        </a>
    ),
}));

describe('DataCard', () => {
    it('應該顯示標題與描述', () => {
        render(<DataCard title="測試標題" description="簡短描述" />);
        expect(screen.getByText('測試標題')).toBeInTheDocument();
        expect(screen.getByText('簡短描述')).toBeInTheDocument();
    });

    it('支援主內容插槽', () => {
        render(
            <DataCard title="測試標題">
                <p>額外的主內容</p>
            </DataCard>
        );

        expect(screen.getByText('額外的主內容')).toBeInTheDocument();
    });

    it('顯示狀態徽章與 tone 樣式', () => {
        render(<DataCard title="公告" status={{ label: '已發布', tone: 'success' }} />);
        const badge = screen.getByText('已發布');
        expect(badge).toBeInTheDocument();
        expect(badge.className).toContain('bg-emerald-50');
    });

    it('支援自訂徽章樣式', () => {
        render(<DataCard title="公告" status={{ label: '草稿', badgeColor: 'bg-purple-100 text-purple-700 border-purple-200' }} />);
        const badge = screen.getByText('草稿');
        expect(badge.className).toContain('bg-purple-100');
    });

    it('顯示後設資料與圖示', () => {
        render(
            <DataCard
                title="公告"
                metadata={[
                    { label: '作者', value: '王小明', icon: <UsersIcon /> },
                    { label: '更新時間', value: '2024-12-12', icon: <CalendarIcon /> },
                ]}
            />
        );

        expect(screen.getByText('作者:')).toBeInTheDocument();
        expect(screen.getByText('王小明')).toBeInTheDocument();
        expect(screen.getByTestId('user-icon')).toBeInTheDocument();
        expect(screen.getByText('更新時間:')).toBeInTheDocument();
    });

    it('渲染桌機與手機操作按鈕', async () => {
        const user = userEvent.setup();
        const handleClick = jest.fn();

        render(
            <DataCard
                title="公告"
                actions={
                    <Button size="sm" onClick={handleClick}>
                        編輯
                    </Button>
                }
            />
        );

        const button = screen.getAllByText('編輯')[0];
        await user.click(button);
        expect(handleClick).toHaveBeenCalled();
    });

    it('支援行動版專用操作列', () => {
        render(
            <DataCard
                title="公告"
                mobileActions={<Button size="sm">行動操作</Button>}
            />
        );

        expect(screen.getByText('行動操作')).toBeInTheDocument();
    });

    it('可包裹為連結', () => {
        render(<DataCard title="公告" href="/manage/posts/1" />);
        expect(screen.getByRole('link')).toHaveAttribute('href', '/manage/posts/1');
    });

    it('顯示圖片與替代文字', () => {
        render(<DataCard title="活動" image="https://example.com/image.jpg" />);
        const image = screen.getByRole('img');
        expect(image).toHaveAttribute('src', 'https://example.com/image.jpg');
        expect(image).toHaveAttribute('alt', '活動');
    });

    it('顯示底部補充資訊', () => {
        render(
            <DataCard
                title="公告"
                footer={<span>最後更新於 2024/12/12</span>}
            />
        );

        expect(screen.getByText('最後更新於 2024/12/12')).toBeInTheDocument();
    });
});
