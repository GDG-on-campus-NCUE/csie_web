import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Users, Clock } from 'lucide-react';
import { DataCard } from '../data-card';
import { Button } from '@/components/ui/button';

// Mock Inertia Link
jest.mock('@inertiajs/react', () => ({
    Link: ({ href, children, ...props }: any) => (
        <a href={href} {...props}>
            {children}
        </a>
    ),
}));

describe('DataCard', () => {
    describe('基本功能', () => {
        it('應該正確渲染標題', () => {
            render(<DataCard title="測試標題" />);
            expect(screen.getByText('測試標題')).toBeInTheDocument();
        });

        it('應該顯示描述文字', () => {
            render(
                <DataCard
                    title="測試標題"
                    description="這是描述文字"
                />
            );
            expect(screen.getByText('這是描述文字')).toBeInTheDocument();
        });

        it('描述文字應該有行數限制', () => {
            const { container } = render(
                <DataCard
                    title="測試"
                    description="很長的描述文字"
                />
            );

            const description = container.querySelector('.line-clamp-2');
            expect(description).toBeInTheDocument();
        });
    });

    describe('狀態徽章', () => {
        it('應該顯示狀態徽章', () => {
            render(
                <DataCard
                    title="測試"
                    status={{
                        label: '已發布',
                        variant: 'default',
                    }}
                />
            );
            expect(screen.getByText('已發布')).toBeInTheDocument();
        });

        it('應該支援不同的徽章樣式', () => {
            const { rerender } = render(
                <DataCard
                    title="測試"
                    status={{
                        label: '草稿',
                        variant: 'outline',
                    }}
                />
            );
            expect(screen.getByText('草稿')).toBeInTheDocument();

            rerender(
                <DataCard
                    title="測試"
                    status={{
                        label: '已封存',
                        variant: 'secondary',
                    }}
                />
            );
            expect(screen.getByText('已封存')).toBeInTheDocument();
        });

        it('應該支援自訂顏色', () => {
            render(
                <DataCard
                    title="測試"
                    status={{
                        label: '特殊狀態',
                        color: 'text-purple-600',
                    }}
                />
            );

            const badge = screen.getByText('特殊狀態');
            expect(badge).toHaveClass('text-purple-600');
        });
    });

    describe('後設資料', () => {
        it('應該顯示後設資料列表', () => {
            render(
                <DataCard
                    title="測試"
                    metadata={[
                        { label: '作者', value: '王小明' },
                        { label: '瀏覽數', value: 1234 },
                    ]}
                />
            );

            expect(screen.getByText('作者:')).toBeInTheDocument();
            expect(screen.getByText('王小明')).toBeInTheDocument();
            expect(screen.getByText('瀏覽數:')).toBeInTheDocument();
            expect(screen.getByText('1234')).toBeInTheDocument();
        });

        it('應該支援圖示', () => {
            const { container } = render(
                <DataCard
                    title="測試"
                    metadata={[
                        {
                            label: '作者',
                            value: '王小明',
                            icon: <Users className="h-3 w-3" data-testid="user-icon" />,
                        },
                    ]}
                />
            );

            expect(screen.getByTestId('user-icon')).toBeInTheDocument();
        });

        it('空陣列時不應顯示後設資料區域', () => {
            const { container } = render(
                <DataCard
                    title="測試"
                    metadata={[]}
                />
            );

            // 檢查沒有後設資料容器
            const metadataContainer = container.querySelector('.flex.flex-wrap.gap-4');
            expect(metadataContainer).not.toBeInTheDocument();
        });
    });

    describe('操作按鈕', () => {
        it('應該渲染操作按鈕', () => {
            render(
                <DataCard
                    title="測試"
                    actions={
                        <>
                            <Button size="sm">編輯</Button>
                            <Button size="sm" variant="ghost">刪除</Button>
                        </>
                    }
                />
            );

            expect(screen.getByText('編輯')).toBeInTheDocument();
            expect(screen.getByText('刪除')).toBeInTheDocument();
        });

        it('按鈕應該可以點擊', async () => {
            const user = userEvent.setup();
            const handleClick = jest.fn();

            render(
                <DataCard
                    title="測試"
                    actions={
                        <Button size="sm" onClick={handleClick}>
                            編輯
                        </Button>
                    }
                />
            );

            await user.click(screen.getByText('編輯'));
            expect(handleClick).toHaveBeenCalledTimes(1);
        });
    });

    describe('特色圖片', () => {
        it('應該顯示特色圖片', () => {
            render(
                <DataCard
                    title="測試"
                    image="https://example.com/image.jpg"
                />
            );

            const img = screen.getByRole('img');
            expect(img).toHaveAttribute('src', 'https://example.com/image.jpg');
            expect(img).toHaveAttribute('alt', '測試');
        });

        it('圖片應該有正確的長寬比', () => {
            const { container } = render(
                <DataCard
                    title="測試"
                    image="https://example.com/image.jpg"
                />
            );

            const imageContainer = container.querySelector('.aspect-video');
            expect(imageContainer).toBeInTheDocument();
        });

        it('無圖片時不應顯示圖片區域', () => {
            const { container } = render(
                <DataCard title="測試" />
            );

            const imageContainer = container.querySelector('.aspect-video');
            expect(imageContainer).not.toBeInTheDocument();
        });
    });

    describe('連結功能', () => {
        it('有 href 時應該包裹在 Link 中', () => {
            render(
                <DataCard
                    title="測試"
                    href="/manage/posts/123"
                />
            );

            const link = screen.getByRole('link');
            expect(link).toHaveAttribute('href', '/manage/posts/123');
        });

        it('無 href 時不應該有 Link', () => {
            const { container } = render(
                <DataCard title="測試" />
            );

            const link = container.querySelector('a');
            expect(link).not.toBeInTheDocument();
        });

        it('有 href 時應該有 hover 樣式', () => {
            const { container } = render(
                <DataCard
                    title="測試"
                    href="/test"
                />
            );

            const card = container.querySelector('.cursor-pointer');
            expect(card).toBeInTheDocument();
        });
    });

    describe('底部內容', () => {
        it('應該渲染 footer 內容', () => {
            render(
                <DataCard
                    title="測試"
                    footer={
                        <div data-testid="custom-footer">
                            自訂底部內容
                        </div>
                    }
                />
            );

            expect(screen.getByTestId('custom-footer')).toBeInTheDocument();
            expect(screen.getByText('自訂底部內容')).toBeInTheDocument();
        });
    });

    describe('樣式與佈局', () => {
        it('應該支援自訂 className', () => {
            const { container } = render(
                <DataCard
                    title="測試"
                    className="custom-class"
                />
            );

            const card = container.querySelector('.custom-class');
            expect(card).toBeInTheDocument();
        });

        it('應該包含基本卡片樣式', () => {
            const { container } = render(
                <DataCard title="測試" />
            );

            const card = container.querySelector('.border');
            expect(card).toBeInTheDocument();
        });

        it('hover 時應該有視覺回饋', () => {
            const { container } = render(
                <DataCard
                    title="測試"
                    href="/test"
                />
            );

            const card = container.querySelector('.hover\\:border-blue-300');
            expect(card).toBeInTheDocument();
        });
    });

    describe('完整情境', () => {
        it('應該正確渲染完整的卡片', () => {
            render(
                <DataCard
                    title="112學年度系友回娘家活動"
                    description="歡迎所有系友回到母系,共敘情誼,交流近況。"
                    status={{
                        label: '已發布',
                        variant: 'default',
                    }}
                    metadata={[
                        { label: '作者', value: '王小明' },
                        { label: '發布時間', value: '2024-10-01' },
                        { label: '瀏覽數', value: 1234 },
                    ]}
                    image="https://example.com/event.jpg"
                    href="/manage/posts/123"
                    actions={
                        <>
                            <Button size="sm">編輯</Button>
                            <Button size="sm" variant="ghost">刪除</Button>
                        </>
                    }
                />
            );

            // 檢查所有元素都存在
            expect(screen.getByText('112學年度系友回娘家活動')).toBeInTheDocument();
            expect(screen.getByText(/歡迎所有系友/)).toBeInTheDocument();
            expect(screen.getByText('已發布')).toBeInTheDocument();
            expect(screen.getByText('作者:')).toBeInTheDocument();
            expect(screen.getByText('王小明')).toBeInTheDocument();
            expect(screen.getByRole('img')).toBeInTheDocument();
            expect(screen.getByRole('link')).toBeInTheDocument();
            expect(screen.getByText('編輯')).toBeInTheDocument();
            expect(screen.getByText('刪除')).toBeInTheDocument();
        });
    });

    describe('響應式設計', () => {
        it('應該支援 Grid 佈局', () => {
            const { container } = render(
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <DataCard title="卡片 1" />
                    <DataCard title="卡片 2" />
                    <DataCard title="卡片 3" />
                </div>
            );

            expect(screen.getByText('卡片 1')).toBeInTheDocument();
            expect(screen.getByText('卡片 2')).toBeInTheDocument();
            expect(screen.getByText('卡片 3')).toBeInTheDocument();
        });
    });

    describe('無障礙性', () => {
        it('圖片應該有 alt 文字', () => {
            render(
                <DataCard
                    title="測試活動"
                    image="https://example.com/image.jpg"
                />
            );

            const img = screen.getByRole('img');
            expect(img).toHaveAttribute('alt', '測試活動');
        });

        it('連結應該可被鍵盤訪問', () => {
            render(
                <DataCard
                    title="測試"
                    href="/test"
                />
            );

            const link = screen.getByRole('link');
            expect(link).toBeInTheDocument();
        });
    });
});
