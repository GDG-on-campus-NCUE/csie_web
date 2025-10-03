import { render, screen } from '@testing-library/react';
import { Megaphone, Users } from 'lucide-react';
import { StatCard } from '../stat-card';

// Mock Inertia Link
jest.mock('@inertiajs/react', () => ({
    Link: ({ href, children, ...props }: any) => (
        <a href={href} {...props}>
            {children}
        </a>
    ),
}));

describe('StatCard', () => {
    describe('基本功能', () => {
        it('應該正確渲染標題和數值', () => {
            render(<StatCard title="公告總數" value={128} />);

            expect(screen.getByText('公告總數')).toBeInTheDocument();
            expect(screen.getByText('128')).toBeInTheDocument();
        });

        it('應該支援字串類型的數值', () => {
            render(<StatCard title="完成率" value="75" suffix="%" />);

            expect(screen.getByText('75')).toBeInTheDocument();
            expect(screen.getByText('%')).toBeInTheDocument();
        });

        it('應該顯示描述文字', () => {
            render(
                <StatCard
                    title="使用者數"
                    value={1234}
                    description="目前註冊使用者總數"
                />
            );

            expect(screen.getByText('目前註冊使用者總數')).toBeInTheDocument();
        });

        it('應該顯示圖示', () => {
            const { container } = render(
                <StatCard
                    title="公告總數"
                    value={128}
                    icon={Megaphone}
                />
            );

            // 檢查 SVG 元素是否存在
            const svgElement = container.querySelector('svg');
            expect(svgElement).toBeInTheDocument();
        });
    });

    describe('趨勢指標', () => {
        it('應該顯示上升趨勢 (正 delta)', () => {
            render(
                <StatCard
                    title="已發布"
                    value={95}
                    trend="up"
                    delta={12}
                    deltaLabel="vs 上週"
                />
            );

            expect(screen.getByText('+12')).toBeInTheDocument();
            expect(screen.getByText('vs 上週')).toBeInTheDocument();
        });

        it('應該顯示下降趨勢 (負 delta)', () => {
            render(
                <StatCard
                    title="待處理"
                    value={23}
                    trend="down"
                    delta={-5}
                    deltaLabel="vs 上週"
                />
            );

            expect(screen.getByText('-5')).toBeInTheDocument();
        });

        it('應該顯示持平趨勢', () => {
            render(
                <StatCard
                    title="封存"
                    value={10}
                    trend="flat"
                    delta={0}
                    deltaLabel="vs 上週"
                />
            );

            expect(screen.getByText('0')).toBeInTheDocument();
        });

        it('當 delta 為 undefined 時不應顯示趨勢', () => {
            const { container } = render(
                <StatCard
                    title="總數"
                    value={100}
                    deltaLabel="vs 上週"
                />
            );

            expect(screen.queryByText('vs 上週')).not.toBeInTheDocument();
        });
    });

    describe('連結功能', () => {
        it('應該支援 href 屬性使卡片可點擊', () => {
            render(
                <StatCard
                    title="使用者數"
                    value={1234}
                    href="/manage/admin/users"
                />
            );

            const link = screen.getByRole('link');
            expect(link).toHaveAttribute('href', '/manage/admin/users');
        });

        it('沒有 href 時不應該渲染 Link', () => {
            const { container } = render(
                <StatCard
                    title="總數"
                    value={100}
                />
            );

            const link = container.querySelector('a');
            expect(link).not.toBeInTheDocument();
        });
    });

    describe('自訂內容', () => {
        it('應該支援 children 渲染自訂內容', () => {
            render(
                <StatCard
                    title="儲存空間"
                    value="75"
                    suffix="%"
                >
                    <div data-testid="custom-content">
                        <div>7.5 GB / 10 GB</div>
                    </div>
                </StatCard>
            );

            expect(screen.getByTestId('custom-content')).toBeInTheDocument();
            expect(screen.getByText('7.5 GB / 10 GB')).toBeInTheDocument();
        });
    });

    describe('CSS 類別', () => {
        it('應該支援自訂 className', () => {
            const { container } = render(
                <StatCard
                    title="測試"
                    value={100}
                    className="custom-class"
                />
            );

            const card = container.querySelector('.custom-class');
            expect(card).toBeInTheDocument();
        });

        it('應該包含基本的樣式類別', () => {
            const { container } = render(
                <StatCard
                    title="測試"
                    value={100}
                />
            );

            const card = container.querySelector('.border');
            expect(card).toBeInTheDocument();
        });
    });

    describe('無障礙性', () => {
        it('所有文字內容應該可被螢幕閱讀器讀取', () => {
            render(
                <StatCard
                    title="公告總數"
                    value={128}
                    description="系統中的公告數量"
                    trend="up"
                    delta={12}
                    deltaLabel="vs 上週"
                />
            );

            // 所有重要文字都應該在 document 中
            expect(screen.getByText('公告總數')).toBeInTheDocument();
            expect(screen.getByText('128')).toBeInTheDocument();
            expect(screen.getByText('系統中的公告數量')).toBeInTheDocument();
            expect(screen.getByText('+12')).toBeInTheDocument();
            expect(screen.getByText('vs 上週')).toBeInTheDocument();
        });
    });

    describe('邊界情況', () => {
        it('應該處理 delta 為 0 的情況', () => {
            render(
                <StatCard
                    title="測試"
                    value={100}
                    trend="flat"
                    delta={0}
                    deltaLabel="無變化"
                />
            );

            expect(screen.getByText('0')).toBeInTheDocument();
            expect(screen.getByText('無變化')).toBeInTheDocument();
        });

        it('應該處理空字串數值', () => {
            render(
                <StatCard
                    title="測試"
                    value=""
                />
            );

            // 應該不會崩潰
            expect(screen.getByText('測試')).toBeInTheDocument();
        });

        it('應該處理很長的標題', () => {
            const longTitle = '這是一個非常非常長的標題用來測試文字溢出處理';
            render(
                <StatCard
                    title={longTitle}
                    value={100}
                />
            );

            expect(screen.getByText(longTitle)).toBeInTheDocument();
        });
    });
});
