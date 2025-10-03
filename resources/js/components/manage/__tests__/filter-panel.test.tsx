import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FilterPanel } from '../filter-panel';

describe('FilterPanel', () => {
    describe('基本功能', () => {
        it('應該正確渲染標題', () => {
            render(
                <FilterPanel title="篩選條件">
                    <div>篩選內容</div>
                </FilterPanel>
            );

            expect(screen.getByText('篩選條件')).toBeInTheDocument();
        });

        it('應該使用預設標題', () => {
            render(
                <FilterPanel>
                    <div>篩選內容</div>
                </FilterPanel>
            );

            expect(screen.getByText('篩選條件')).toBeInTheDocument();
        });

        it('應該渲染 children 內容', () => {
            render(
                <FilterPanel title="測試">
                    <div data-testid="filter-content">篩選欄位</div>
                </FilterPanel>
            );

            expect(screen.getByTestId('filter-content')).toBeInTheDocument();
        });
    });

    describe('展開/收合功能', () => {
        it('預設應該展開', () => {
            render(
                <FilterPanel title="測試" defaultOpen={true}>
                    <div>篩選內容</div>
                </FilterPanel>
            );

            expect(screen.getByText('篩選內容')).toBeVisible();
        });

        it('可以設定預設收合', () => {
            render(
                <FilterPanel title="測試" defaultOpen={false}>
                    <div>篩選內容</div>
                </FilterPanel>
            );

            // 內容應該不可見 (在 DOM 中但被 CollapsibleContent 隱藏)
            expect(screen.queryByText('篩選內容')).not.toBeVisible();
        });

        it('點擊標題應該切換展開/收合狀態', async () => {
            const user = userEvent.setup();

            render(
                <FilterPanel title="測試" defaultOpen={true} collapsible={true}>
                    <div>篩選內容</div>
                </FilterPanel>
            );

            // 初始狀態: 展開
            expect(screen.getByText('篩選內容')).toBeVisible();

            // 點擊標題區域收合
            const trigger = screen.getByRole('button', { hidden: true });
            await user.click(trigger);

            // 應該收合 (測試按鈕圖示變化)
            expect(screen.queryByText('收合篩選')).not.toBeInTheDocument();
        });

        it('不可收合模式應該總是顯示內容', () => {
            render(
                <FilterPanel title="測試" collapsible={false}>
                    <div>篩選內容</div>
                </FilterPanel>
            );

            expect(screen.getByText('篩選內容')).toBeVisible();
            // 不應該有收合按鈕
            expect(screen.queryByRole('button', { name: /收合|展開/ })).not.toBeInTheDocument();
        });
    });

    describe('按鈕功能', () => {
        it('應該顯示套用按鈕並觸發回調', async () => {
            const user = userEvent.setup();
            const handleApply = jest.fn();

            render(
                <FilterPanel
                    title="測試"
                    onApply={handleApply}
                    applyLabel="套用篩選"
                >
                    <div>篩選內容</div>
                </FilterPanel>
            );

            const applyButton = screen.getByText('套用篩選');
            expect(applyButton).toBeInTheDocument();

            await user.click(applyButton);
            expect(handleApply).toHaveBeenCalledTimes(1);
        });

        it('應該顯示重設按鈕並觸發回調', async () => {
            const user = userEvent.setup();
            const handleReset = jest.fn();

            render(
                <FilterPanel
                    title="測試"
                    onReset={handleReset}
                    resetLabel="清除條件"
                >
                    <div>篩選內容</div>
                </FilterPanel>
            );

            const resetButton = screen.getByText('清除條件');
            expect(resetButton).toBeInTheDocument();

            await user.click(resetButton);
            expect(handleReset).toHaveBeenCalledTimes(1);
        });

        it('未提供回調時不應顯示按鈕', () => {
            render(
                <FilterPanel title="測試">
                    <div>篩選內容</div>
                </FilterPanel>
            );

            expect(screen.queryByRole('button', { name: /套用|重設/ })).not.toBeInTheDocument();
        });

        it('應該使用預設的按鈕標籤', () => {
            render(
                <FilterPanel
                    title="測試"
                    onApply={() => {}}
                    onReset={() => {}}
                >
                    <div>篩選內容</div>
                </FilterPanel>
            );

            expect(screen.getByText('套用')).toBeInTheDocument();
            expect(screen.getByText('重設')).toBeInTheDocument();
        });
    });

    describe('樣式與佈局', () => {
        it('應該支援自訂 className', () => {
            const { container } = render(
                <FilterPanel title="測試" className="custom-class">
                    <div>內容</div>
                </FilterPanel>
            );

            const element = container.querySelector('.custom-class');
            expect(element).toBeInTheDocument();
        });

        it('應該包含基本卡片樣式', () => {
            const { container } = render(
                <FilterPanel title="測試">
                    <div>內容</div>
                </FilterPanel>
            );

            const card = container.querySelector('.border');
            expect(card).toBeInTheDocument();
        });

        it('按鈕區域應該有適當的間距', () => {
            render(
                <FilterPanel
                    title="測試"
                    onApply={() => {}}
                    onReset={() => {}}
                >
                    <input placeholder="搜尋" />
                </FilterPanel>
            );

            // 檢查按鈕容器存在
            const applyButton = screen.getByText('套用');
            expect(applyButton.closest('.flex')).toBeInTheDocument();
        });
    });

    describe('無障礙性', () => {
        it('篩選圖示應該有視覺提示', () => {
            const { container } = render(
                <FilterPanel title="篩選條件">
                    <div>內容</div>
                </FilterPanel>
            );

            // 檢查 Filter 圖示是否存在
            const svg = container.querySelector('svg');
            expect(svg).toBeInTheDocument();
        });

        it('收合按鈕應該有 sr-only 文字', () => {
            render(
                <FilterPanel title="測試" collapsible={true}>
                    <div>內容</div>
                </FilterPanel>
            );

            // 檢查是否有螢幕閱讀器文字
            const srText = screen.getByText(/收合篩選|展開篩選/);
            expect(srText).toHaveClass('sr-only');
        });
    });

    describe('整合情境', () => {
        it('應該支援完整的篩選流程', async () => {
            const user = userEvent.setup();
            const handleApply = jest.fn();
            const handleReset = jest.fn();

            render(
                <FilterPanel
                    title="公告篩選"
                    onApply={handleApply}
                    onReset={handleReset}
                    defaultOpen={true}
                >
                    <input data-testid="keyword" placeholder="搜尋" />
                    <select data-testid="status">
                        <option value="">全部</option>
                        <option value="published">已發布</option>
                    </select>
                </FilterPanel>
            );

            // 輸入搜尋關鍵字
            const keywordInput = screen.getByTestId('keyword');
            await user.type(keywordInput, '測試關鍵字');

            // 選擇狀態
            const statusSelect = screen.getByTestId('status');
            await user.selectOptions(statusSelect, 'published');

            // 點擊套用
            const applyButton = screen.getByText('套用');
            await user.click(applyButton);
            expect(handleApply).toHaveBeenCalled();

            // 點擊重設
            const resetButton = screen.getByText('重設');
            await user.click(resetButton);
            expect(handleReset).toHaveBeenCalled();
        });
    });

    describe('響應式設計', () => {
        it('篩選欄位應該支援 Grid 佈局', () => {
            render(
                <FilterPanel title="測試">
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <input data-testid="field1" />
                        <input data-testid="field2" />
                        <input data-testid="field3" />
                    </div>
                </FilterPanel>
            );

            expect(screen.getByTestId('field1')).toBeInTheDocument();
            expect(screen.getByTestId('field2')).toBeInTheDocument();
            expect(screen.getByTestId('field3')).toBeInTheDocument();
        });
    });
});
