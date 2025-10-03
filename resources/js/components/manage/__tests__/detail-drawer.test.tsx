import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DetailDrawer } from '../detail-drawer';
import { Button } from '@/components/ui/button';

describe('DetailDrawer', () => {
    describe('基本功能', () => {
        it('開啟時應該顯示內容', () => {
            render(
                <DetailDrawer
                    open={true}
                    onOpenChange={() => {}}
                    title="測試標題"
                >
                    <div>抽屜內容</div>
                </DetailDrawer>
            );

            expect(screen.getByText('測試標題')).toBeInTheDocument();
            expect(screen.getByText('抽屜內容')).toBeInTheDocument();
        });

        it('關閉時不應該顯示內容', () => {
            render(
                <DetailDrawer
                    open={false}
                    onOpenChange={() => {}}
                    title="測試標題"
                >
                    <div>抽屜內容</div>
                </DetailDrawer>
            );

            expect(screen.queryByText('抽屜內容')).not.toBeInTheDocument();
        });

        it('應該顯示描述文字', () => {
            render(
                <DetailDrawer
                    open={true}
                    onOpenChange={() => {}}
                    title="測試標題"
                    description="這是描述文字"
                >
                    <div>內容</div>
                </DetailDrawer>
            );

            expect(screen.getByText('這是描述文字')).toBeInTheDocument();
        });
    });

    describe('狀態控制', () => {
        it('點擊關閉按鈕應該觸發 onOpenChange', async () => {
            const user = userEvent.setup();
            const handleOpenChange = jest.fn();

            render(
                <DetailDrawer
                    open={true}
                    onOpenChange={handleOpenChange}
                    title="測試"
                >
                    <div>內容</div>
                </DetailDrawer>
            );

            // 找到關閉按鈕並點擊
            const closeButton = screen.getByRole('button', { name: /關閉/i });
            await user.click(closeButton);

            expect(handleOpenChange).toHaveBeenCalledWith(false);
        });

        it('ESC 鍵應該關閉抽屜', async () => {
            const handleOpenChange = jest.fn();

            render(
                <DetailDrawer
                    open={true}
                    onOpenChange={handleOpenChange}
                    title="測試"
                >
                    <div>內容</div>
                </DetailDrawer>
            );

            // 模擬按下 ESC 鍵
            fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });

            await waitFor(() => {
                expect(handleOpenChange).toHaveBeenCalledWith(false);
            });
        });

        it('抽屜關閉時不應該監聽 ESC 鍵', () => {
            const handleOpenChange = jest.fn();

            render(
                <DetailDrawer
                    open={false}
                    onOpenChange={handleOpenChange}
                    title="測試"
                >
                    <div>內容</div>
                </DetailDrawer>
            );

            fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });

            expect(handleOpenChange).not.toHaveBeenCalled();
        });
    });

    describe('尺寸選項', () => {
        it('應該支援 sm 尺寸', () => {
            const { container } = render(
                <DetailDrawer
                    open={true}
                    onOpenChange={() => {}}
                    title="測試"
                    size="sm"
                >
                    <div>內容</div>
                </DetailDrawer>
            );

            const content = container.querySelector('.max-w-sm');
            expect(content).toBeInTheDocument();
        });

        it('應該支援 default 尺寸', () => {
            const { container } = render(
                <DetailDrawer
                    open={true}
                    onOpenChange={() => {}}
                    title="測試"
                    size="default"
                >
                    <div>內容</div>
                </DetailDrawer>
            );

            const content = container.querySelector('.max-w-md');
            expect(content).toBeInTheDocument();
        });

        it('應該支援 lg 尺寸', () => {
            const { container } = render(
                <DetailDrawer
                    open={true}
                    onOpenChange={() => {}}
                    title="測試"
                    size="lg"
                >
                    <div>內容</div>
                </DetailDrawer>
            );

            const content = container.querySelector('.max-w-2xl');
            expect(content).toBeInTheDocument();
        });

        it('應該支援 xl 尺寸', () => {
            const { container } = render(
                <DetailDrawer
                    open={true}
                    onOpenChange={() => {}}
                    title="測試"
                    size="xl"
                >
                    <div>內容</div>
                </DetailDrawer>
            );

            const content = container.querySelector('.max-w-4xl');
            expect(content).toBeInTheDocument();
        });

        it('應該支援 full 尺寸', () => {
            const { container } = render(
                <DetailDrawer
                    open={true}
                    onOpenChange={() => {}}
                    title="測試"
                    size="full"
                >
                    <div>內容</div>
                </DetailDrawer>
            );

            const content = container.querySelector('.max-w-full');
            expect(content).toBeInTheDocument();
        });

        it('預設應該使用 lg 尺寸', () => {
            const { container } = render(
                <DetailDrawer
                    open={true}
                    onOpenChange={() => {}}
                    title="測試"
                >
                    <div>內容</div>
                </DetailDrawer>
            );

            const content = container.querySelector('.max-w-2xl');
            expect(content).toBeInTheDocument();
        });
    });

    describe('滑出方向', () => {
        it('應該支援從右側滑出 (預設)', () => {
            render(
                <DetailDrawer
                    open={true}
                    onOpenChange={() => {}}
                    title="測試"
                >
                    <div>內容</div>
                </DetailDrawer>
            );

            // Sheet 元件預設從右側滑出
            expect(screen.getByText('測試')).toBeInTheDocument();
        });

        it('應該支援設定 side 屬性', () => {
            render(
                <DetailDrawer
                    open={true}
                    onOpenChange={() => {}}
                    title="測試"
                    side="left"
                >
                    <div>內容</div>
                </DetailDrawer>
            );

            expect(screen.getByText('測試')).toBeInTheDocument();
        });
    });

    describe('底部操作區', () => {
        it('應該渲染 footer 內容', () => {
            render(
                <DetailDrawer
                    open={true}
                    onOpenChange={() => {}}
                    title="測試"
                    footer={
                        <div data-testid="custom-footer">
                            <Button>儲存</Button>
                            <Button variant="outline">取消</Button>
                        </div>
                    }
                >
                    <div>內容</div>
                </DetailDrawer>
            );

            expect(screen.getByTestId('custom-footer')).toBeInTheDocument();
            expect(screen.getByText('儲存')).toBeInTheDocument();
            expect(screen.getByText('取消')).toBeInTheDocument();
        });

        it('無 footer 時不應顯示底部區域', () => {
            const { container } = render(
                <DetailDrawer
                    open={true}
                    onOpenChange={() => {}}
                    title="測試"
                >
                    <div>內容</div>
                </DetailDrawer>
            );

            // 檢查沒有 Separator (footer 前的分隔線)
            const separators = container.querySelectorAll('[role="separator"]');
            expect(separators.length).toBe(0);
        });

        it('footer 按鈕應該可以點擊', async () => {
            const user = userEvent.setup();
            const handleSave = jest.fn();
            const handleCancel = jest.fn();

            render(
                <DetailDrawer
                    open={true}
                    onOpenChange={() => {}}
                    title="測試"
                    footer={
                        <>
                            <Button onClick={handleSave}>儲存</Button>
                            <Button onClick={handleCancel}>取消</Button>
                        </>
                    }
                >
                    <div>內容</div>
                </DetailDrawer>
            );

            await user.click(screen.getByText('儲存'));
            expect(handleSave).toHaveBeenCalledTimes(1);

            await user.click(screen.getByText('取消'));
            expect(handleCancel).toHaveBeenCalledTimes(1);
        });
    });

    describe('樣式與佈局', () => {
        it('應該支援自訂 className', () => {
            const { container } = render(
                <DetailDrawer
                    open={true}
                    onOpenChange={() => {}}
                    title="測試"
                    className="custom-class"
                >
                    <div>內容</div>
                </DetailDrawer>
            );

            const element = container.querySelector('.custom-class');
            expect(element).toBeInTheDocument();
        });

        it('header 應該有正確的背景色', () => {
            const { container } = render(
                <DetailDrawer
                    open={true}
                    onOpenChange={() => {}}
                    title="測試"
                >
                    <div>內容</div>
                </DetailDrawer>
            );

            const header = container.querySelector('.bg-neutral-50\\/50');
            expect(header).toBeInTheDocument();
        });

        it('內容區域應該可滾動', () => {
            const { container } = render(
                <DetailDrawer
                    open={true}
                    onOpenChange={() => {}}
                    title="測試"
                >
                    <div>內容</div>
                </DetailDrawer>
            );

            const content = container.querySelector('.overflow-y-auto');
            expect(content).toBeInTheDocument();
        });
    });

    describe('無障礙性', () => {
        it('應該有正確的 ARIA 標籤', () => {
            render(
                <DetailDrawer
                    open={true}
                    onOpenChange={() => {}}
                    title="公告詳細資訊"
                    description="檢視與編輯公告內容"
                >
                    <div>內容</div>
                </DetailDrawer>
            );

            expect(screen.getByText('公告詳細資訊')).toBeInTheDocument();
            expect(screen.getByText('檢視與編輯公告內容')).toBeInTheDocument();
        });

        it('關閉按鈕應該有 sr-only 文字', () => {
            render(
                <DetailDrawer
                    open={true}
                    onOpenChange={() => {}}
                    title="測試"
                >
                    <div>內容</div>
                </DetailDrawer>
            );

            const srText = screen.getByText('關閉');
            expect(srText).toHaveClass('sr-only');
        });
    });

    describe('整合情境', () => {
        it('應該支援完整的編輯流程', async () => {
            const user = userEvent.setup();
            const handleOpenChange = jest.fn();
            const handleSave = jest.fn();

            render(
                <DetailDrawer
                    open={true}
                    onOpenChange={handleOpenChange}
                    title="編輯公告"
                    description="修改公告內容"
                    size="lg"
                    footer={
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => handleOpenChange(false)}>
                                取消
                            </Button>
                            <Button onClick={handleSave}>
                                儲存變更
                            </Button>
                        </div>
                    }
                >
                    <div>
                        <input data-testid="title-input" placeholder="標題" />
                        <textarea data-testid="content-input" placeholder="內容" />
                    </div>
                </DetailDrawer>
            );

            // 輸入內容
            const titleInput = screen.getByTestId('title-input');
            await user.type(titleInput, '新公告標題');

            const contentInput = screen.getByTestId('content-input');
            await user.type(contentInput, '公告內容');

            // 點擊儲存
            await user.click(screen.getByText('儲存變更'));
            expect(handleSave).toHaveBeenCalled();

            // 點擊取消
            await user.click(screen.getByText('取消'));
            expect(handleOpenChange).toHaveBeenCalledWith(false);
        });
    });

    describe('效能與記憶體', () => {
        it('組件卸載時應該清除事件監聽器', () => {
            const { unmount } = render(
                <DetailDrawer
                    open={true}
                    onOpenChange={() => {}}
                    title="測試"
                >
                    <div>內容</div>
                </DetailDrawer>
            );

            const spy = jest.spyOn(document, 'removeEventListener');
            unmount();

            expect(spy).toHaveBeenCalledWith('keydown', expect.any(Function));
            spy.mockRestore();
        });
    });
});
