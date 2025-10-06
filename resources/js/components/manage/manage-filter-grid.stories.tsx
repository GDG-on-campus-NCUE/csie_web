import type { Meta, StoryObj } from '@storybook/react';
import { Filter, RefreshCcw, Download, Plus } from 'lucide-react';
import ManageFilterGrid, { ManageFilterField, ManageFilterActions } from './manage-filter-grid';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

const meta = {
    title: 'Manage/ManageFilterGrid',
    component: ManageFilterGrid,
    tags: ['autodocs'],
    parameters: {
        layout: 'padded',
        docs: {
            description: {
                component:
                    'ManageFilterGrid 提供 12 欄網格系統，確保管理頁面篩選器布局統一。支援響應式設計，手機全寬、平板和桌面依預設大小分配欄位。',
            },
        },
    },
} satisfies Meta<typeof ManageFilterGrid>;

export default meta;
type Story = StoryObj<typeof ManageFilterGrid>;

/**
 * 標準篩選器布局：搜尋框 + 兩個下拉選單 + 操作按鈕
 */
export const Standard: Story = {
    render: () => (
        <ManageFilterGrid>
            <ManageFilterField size="third">
                <Input placeholder="搜尋標題或關鍵字..." className="h-10" />
            </ManageFilterField>

            <ManageFilterField size="quarter">
                <Select className="h-10">
                    <option value="">全部狀態</option>
                    <option value="published">已發布</option>
                    <option value="draft">草稿</option>
                    <option value="archived">已封存</option>
                </Select>
            </ManageFilterField>

            <ManageFilterField size="quarter">
                <Select className="h-10">
                    <option value="">全部標籤</option>
                    <option value="news">最新消息</option>
                    <option value="event">活動</option>
                    <option value="award">獲獎</option>
                </Select>
            </ManageFilterField>

            <ManageFilterActions
                primary={
                    <Button className="w-full bg-[#3B82F6] hover:bg-[#2563EB] text-white">
                        <Filter className="mr-2 h-4 w-4" />
                        套用篩選
                    </Button>
                }
                secondary={
                    <Button variant="outline" className="w-full">
                        <RefreshCcw className="mr-2 h-4 w-4" />
                        重設
                    </Button>
                }
            />
        </ManageFilterGrid>
    ),
};

/**
 * 複雜篩選器：包含日期選擇器和更多欄位
 */
export const WithDateRange: Story = {
    render: () => (
        <ManageFilterGrid>
            <ManageFilterField size="third">
                <Input placeholder="搜尋附件名稱或備註..." className="h-10" />
            </ManageFilterField>

            <ManageFilterField size="quarter">
                <Select className="h-10">
                    <option value="">全部類型</option>
                    <option value="image">圖片</option>
                    <option value="document">文件</option>
                    <option value="video">影片</option>
                </Select>
            </ManageFilterField>

            <ManageFilterField size="quarter">
                <Select className="h-10">
                    <option value="">全部標籤</option>
                    <option value="public">公開</option>
                    <option value="internal">內部</option>
                </Select>
            </ManageFilterField>

            <ManageFilterField size="quarter">
                <Input type="date" className="h-10" placeholder="起始日期" />
            </ManageFilterField>

            <ManageFilterField size="quarter">
                <Input type="date" className="h-10" placeholder="結束日期" />
            </ManageFilterField>

            <ManageFilterActions
                fullWidth
                primary={
                    <Button className="w-full bg-[#3B82F6] hover:bg-[#2563EB] text-white">
                        <Filter className="mr-2 h-4 w-4" />
                        套用條件
                    </Button>
                }
                secondary={
                    <>
                        <Button variant="outline" className="w-full">
                            <RefreshCcw className="mr-2 h-4 w-4" />
                            重設
                        </Button>
                        <Button className="w-full bg-[#1E293B] hover:bg-[#0F172A] text-white">
                            <Download className="mr-2 h-4 w-4" />
                            匯出
                        </Button>
                    </>
                }
            />
        </ManageFilterGrid>
    ),
};

/**
 * 簡化版：只有搜尋和新增按鈕
 */
export const Simple: Story = {
    render: () => (
        <ManageFilterGrid>
            <ManageFilterField size="two-thirds">
                <Input placeholder="搜尋使用者姓名或 Email..." className="h-10" />
            </ManageFilterField>

            <ManageFilterActions
                primary={
                    <Button className="w-full bg-[#10B981] hover:bg-[#059669] text-white">
                        <Plus className="mr-2 h-4 w-4" />
                        新增使用者
                    </Button>
                }
            />
        </ManageFilterGrid>
    ),
};

/**
 * 展示不同欄位大小組合
 */
export const FieldSizes: Story = {
    render: () => (
        <div className="space-y-4">
            <ManageFilterGrid>
                <ManageFilterField size="full">
                    <div className="h-10 rounded bg-blue-100 flex items-center justify-center text-sm font-medium">
                        Full (12 欄 - 100%)
                    </div>
                </ManageFilterField>
            </ManageFilterGrid>

            <ManageFilterGrid>
                <ManageFilterField size="half">
                    <div className="h-10 rounded bg-green-100 flex items-center justify-center text-sm font-medium">
                        Half (6 欄 - 50%)
                    </div>
                </ManageFilterField>
                <ManageFilterField size="half">
                    <div className="h-10 rounded bg-green-100 flex items-center justify-center text-sm font-medium">
                        Half (6 欄 - 50%)
                    </div>
                </ManageFilterField>
            </ManageFilterGrid>

            <ManageFilterGrid>
                <ManageFilterField size="third">
                    <div className="h-10 rounded bg-amber-100 flex items-center justify-center text-sm font-medium">
                        Third (4 欄)
                    </div>
                </ManageFilterField>
                <ManageFilterField size="third">
                    <div className="h-10 rounded bg-amber-100 flex items-center justify-center text-sm font-medium">
                        Third (4 欄)
                    </div>
                </ManageFilterField>
                <ManageFilterField size="third">
                    <div className="h-10 rounded bg-amber-100 flex items-center justify-center text-sm font-medium">
                        Third (4 欄)
                    </div>
                </ManageFilterField>
            </ManageFilterGrid>

            <ManageFilterGrid>
                <ManageFilterField size="quarter">
                    <div className="h-10 rounded bg-rose-100 flex items-center justify-center text-sm font-medium">
                        Quarter (3 欄)
                    </div>
                </ManageFilterField>
                <ManageFilterField size="quarter">
                    <div className="h-10 rounded bg-rose-100 flex items-center justify-center text-sm font-medium">
                        Quarter (3 欄)
                    </div>
                </ManageFilterField>
                <ManageFilterField size="quarter">
                    <div className="h-10 rounded bg-rose-100 flex items-center justify-center text-sm font-medium">
                        Quarter (3 欄)
                    </div>
                </ManageFilterField>
                <ManageFilterField size="quarter">
                    <div className="h-10 rounded bg-rose-100 flex items-center justify-center text-sm font-medium">
                        Quarter (3 欄)
                    </div>
                </ManageFilterField>
            </ManageFilterGrid>

            <ManageFilterGrid>
                <ManageFilterField size="two-thirds">
                    <div className="h-10 rounded bg-purple-100 flex items-center justify-center text-sm font-medium">
                        Two-thirds (8 欄 - 66.67%)
                    </div>
                </ManageFilterField>
                <ManageFilterField size="third">
                    <div className="h-10 rounded bg-purple-100 flex items-center justify-center text-sm font-medium">
                        Third (4 欄 - 33.33%)
                    </div>
                </ManageFilterField>
            </ManageFilterGrid>
        </div>
    ),
};
