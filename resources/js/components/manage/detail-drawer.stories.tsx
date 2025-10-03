import type { Meta, StoryObj } from '@storybook/react';
import { DetailDrawer } from './detail-drawer';
import { useState } from 'react';
import { Calendar, User, Tag, Clock, FileText, Image as ImageIcon } from 'lucide-react';

/**
 * DetailDrawer 是一個側邊抽屜元件,用於顯示詳細資訊而不離開當前頁面。
 *
 * ## 功能特點
 * - 📱 響應式側邊滑出
 * - ⌨️ ESC 鍵關閉
 * - 📏 5 種尺寸選項 (sm/default/lg/xl/full)
 * - 🎯 4 個滑出方向 (left/right/top/bottom)
 * - 🎨 底部操作區
 * - ⚡ 平滑動畫 (<200ms)
 * - ♿ 無障礙支援
 */
const meta = {
  title: 'Manage/DetailDrawer',
  component: DetailDrawer,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: '側邊抽屜元件,用於快速檢視或編輯內容而不離開當前頁面。支援多種尺寸與方向。',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    open: {
      control: 'boolean',
      description: '抽屜開啟狀態',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    onOpenChange: {
      action: 'onOpenChange',
      description: '狀態改變回調',
      table: {
        type: { summary: '(open: boolean) => void' },
      },
    },
    title: {
      control: 'text',
      description: '抽屜標題',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: '-' },
      },
    },
    description: {
      control: 'text',
      description: '抽屜描述',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: '-' },
      },
    },
    size: {
      control: 'select',
      options: ['sm', 'default', 'lg', 'xl', 'full'],
      description: '抽屜尺寸',
      table: {
        type: { summary: 'sm | default | lg | xl | full' },
        defaultValue: { summary: 'default' },
      },
    },
    side: {
      control: 'select',
      options: ['left', 'right', 'top', 'bottom'],
      description: '滑出方向',
      table: {
        type: { summary: 'left | right | top | bottom' },
        defaultValue: { summary: 'right' },
      },
    },
  },
} satisfies Meta<typeof DetailDrawer>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 基本範例 - 預設設定
 */
export const Default: Story = {
  render: (args) => {
    const [open, setOpen] = useState(false);

    return (
      <div>
        <button
          onClick={() => setOpen(true)}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
        >
          開啟抽屜
        </button>

        <DetailDrawer
          {...args}
          open={open}
          onOpenChange={setOpen}
          title="文章詳細資訊"
          description="檢視文章的完整資訊"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                標題
              </label>
              <p className="text-gray-900">React 18 新特性完整解析</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                內容摘要
              </label>
              <p className="text-gray-600">
                深入介紹 React 18 的並發渲染、自動批次處理、Suspense 等新功能。
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                發布日期
              </label>
              <p className="text-gray-900">2024-03-15</p>
            </div>
          </div>
        </DetailDrawer>
      </div>
    );
  },
};

/**
 * 小尺寸 - 適合快速檢視
 */
export const SmallSize: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <div>
        <button
          onClick={() => setOpen(true)}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
        >
          開啟小抽屜
        </button>

        <DetailDrawer
          open={open}
          onOpenChange={setOpen}
          title="快速資訊"
          description="簡要檢視內容"
          size="sm"
        >
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>2024-03-15</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <User className="h-4 w-4" />
              <span>張小明</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Tag className="h-4 w-4" />
              <span>技術文章</span>
            </div>
          </div>
        </DetailDrawer>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: '小尺寸抽屜適合顯示簡短資訊,例如快速預覽或摘要。',
      },
    },
  },
};

/**
 * 大尺寸 - 適合詳細內容
 */
export const LargeSize: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <div>
        <button
          onClick={() => setOpen(true)}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
        >
          開啟大抽屜
        </button>

        <DetailDrawer
          open={open}
          onOpenChange={setOpen}
          title="文章編輯"
          description="編輯文章的完整內容"
          size="lg"
        >
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                標題
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                defaultValue="React 18 新特性完整解析"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                分類
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                <option>技術文章</option>
                <option>教學文件</option>
                <option>產品公告</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                內容
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                rows={8}
                defaultValue="深入介紹 React 18 的並發渲染、自動批次處理、Suspense 等新功能..."
              />
            </div>
          </div>
        </DetailDrawer>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: '大尺寸抽屜適合顯示或編輯詳細內容,例如表單或完整文章。',
      },
    },
  },
};

/**
 * 超大尺寸 - 適合複雜表單
 */
export const ExtraLargeSize: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <div>
        <button
          onClick={() => setOpen(true)}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
        >
          開啟超大抽屜
        </button>

        <DetailDrawer
          open={open}
          onOpenChange={setOpen}
          title="專案管理"
          description="管理專案的所有設定與內容"
          size="xl"
        >
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">基本資訊</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  專案名稱
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  defaultValue="網站重構專案"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  負責人
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  defaultValue="張小明"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  開始日期
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  defaultValue="2024-03-01"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">進階設定</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  狀態
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  <option>進行中</option>
                  <option>已完成</option>
                  <option>已暫停</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  優先級
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  <option>高</option>
                  <option>中</option>
                  <option>低</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  預算
                </label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  defaultValue="100000"
                />
              </div>
            </div>
          </div>
        </DetailDrawer>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: '超大尺寸抽屜適合複雜的多欄位表單或詳細的資料展示。',
      },
    },
  },
};

/**
 * 全螢幕 - 適合完整編輯器
 */
export const FullScreenSize: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <div>
        <button
          onClick={() => setOpen(true)}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
        >
          開啟全螢幕編輯器
        </button>

        <DetailDrawer
          open={open}
          onOpenChange={setOpen}
          title="文章編輯器"
          description="使用完整螢幕空間編輯內容"
          size="full"
        >
          <div className="h-full flex flex-col space-y-4">
            <div>
              <input
                type="text"
                className="w-full px-4 py-3 text-2xl font-bold border-b border-gray-200 focus:outline-none focus:border-primary"
                placeholder="文章標題..."
                defaultValue="React 18 新特性完整解析"
              />
            </div>

            <div className="flex-1">
              <textarea
                className="w-full h-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:border-primary"
                placeholder="開始撰寫內容..."
                defaultValue="# React 18 新特性

React 18 帶來了許多令人興奮的新功能...

## 並發渲染
並發渲染是 React 18 的核心特性...

## 自動批次處理
自動批次處理可以提升效能..."
              />
            </div>
          </div>
        </DetailDrawer>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: '全螢幕模式適合需要大量空間的編輯器或詳細檢視。',
      },
    },
  },
};

/**
 * 帶底部操作區 - 儲存與取消按鈕
 */
export const WithFooter: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <div>
        <button
          onClick={() => setOpen(true)}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
        >
          編輯文章
        </button>

        <DetailDrawer
          open={open}
          onOpenChange={setOpen}
          title="編輯文章"
          description="修改文章內容並儲存"
          footer={
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={() => {
                  // 儲存邏輯
                  alert('已儲存!');
                  setOpen(false);
                }}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
              >
                儲存變更
              </button>
            </div>
          }
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                標題
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                defaultValue="React 18 新特性完整解析"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                內容
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                rows={8}
                defaultValue="深入介紹 React 18 的新功能..."
              />
            </div>
          </div>
        </DetailDrawer>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: '帶底部操作區的抽屜,適合需要確認或取消操作的場景。',
      },
    },
  },
};

/**
 * 從左側滑出
 */
export const LeftSide: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <div>
        <button
          onClick={() => setOpen(true)}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
        >
          從左側開啟
        </button>

        <DetailDrawer
          open={open}
          onOpenChange={setOpen}
          title="導航選單"
          description="快速存取常用功能"
          side="left"
        >
          <nav className="space-y-2">
            <a href="#" className="block px-3 py-2 rounded-lg hover:bg-gray-100">
              📊 儀表板
            </a>
            <a href="#" className="block px-3 py-2 rounded-lg hover:bg-gray-100">
              📝 文章管理
            </a>
            <a href="#" className="block px-3 py-2 rounded-lg hover:bg-gray-100">
              👥 使用者管理
            </a>
            <a href="#" className="block px-3 py-2 rounded-lg hover:bg-gray-100">
              ⚙️ 系統設定
            </a>
          </nav>
        </DetailDrawer>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: '從左側滑出的抽屜,適合導航選單或側邊欄。',
      },
    },
  },
};

/**
 * 複雜內容 - 帶標籤頁
 */
export const ComplexContent: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('basic');

    return (
      <div>
        <button
          onClick={() => setOpen(true)}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
        >
          檢視文章詳情
        </button>

        <DetailDrawer
          open={open}
          onOpenChange={setOpen}
          title="文章完整資訊"
          description="檢視文章的所有細節"
          size="lg"
          footer={
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">
                最後更新: 2024-03-25 15:30
              </span>
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
              >
                關閉
              </button>
            </div>
          }
        >
          {/* 標籤頁導航 */}
          <div className="flex gap-1 border-b border-gray-200 mb-6">
            <button
              onClick={() => setActiveTab('basic')}
              className={`px-4 py-2 font-medium ${
                activeTab === 'basic'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              基本資訊
            </button>
            <button
              onClick={() => setActiveTab('content')}
              className={`px-4 py-2 font-medium ${
                activeTab === 'content'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              內容
            </button>
            <button
              onClick={() => setActiveTab('meta')}
              className={`px-4 py-2 font-medium ${
                activeTab === 'meta'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              後設資料
            </button>
          </div>

          {/* 標籤頁內容 */}
          {activeTab === 'basic' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">標題</label>
                <p className="text-gray-900">React 18 新特性完整解析</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">分類</label>
                <p className="text-gray-900">技術文章</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">狀態</label>
                <span className="inline-flex px-2 py-1 text-sm bg-green-100 text-green-700 rounded">
                  已發布
                </span>
              </div>
            </div>
          )}

          {activeTab === 'content' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">內容摘要</label>
                <p className="text-gray-600">
                  深入介紹 React 18 的並發渲染、自動批次處理、Suspense 等新功能。
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">字數</label>
                <p className="text-gray-900">約 3,500 字</p>
              </div>
            </div>
          )}

          {activeTab === 'meta' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">發布日期</label>
                <p className="text-gray-900">2024-03-15</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">作者</label>
                <p className="text-gray-900">張小明</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">瀏覽次數</label>
                <p className="text-gray-900">1,234 次</p>
              </div>
            </div>
          )}
        </DetailDrawer>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: '複雜內容展示,包含多個標籤頁切換不同資訊區塊。',
      },
    },
  },
};

/**
 * 無障礙測試
 */
export const Accessibility: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <div>
        <button
          onClick={() => setOpen(true)}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
        >
          測試無障礙性
        </button>

        <DetailDrawer
          open={open}
          onOpenChange={setOpen}
          title="無障礙檢查清單"
          description="確保抽屜符合 WCAG 2.1 AA 標準"
        >
          <ul className="space-y-3">
            <li className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              <span>ESC 鍵可以關閉抽屜</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              <span>焦點會自動移至抽屜內容</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              <span>關閉後焦點返回觸發元素</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              <span>螢幕閱讀器可以讀取標題與描述</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              <span>背景遮罩點擊可關閉</span>
            </li>
          </ul>
        </DetailDrawer>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: '測試抽屜的無障礙性功能。嘗試使用鍵盤操作,確認所有功能都可以正常運作。',
      },
    },
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

/**
 * 互動式範例
 */
export const Interactive: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <div>
        <button
          onClick={() => setOpen(true)}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
        >
          開啟互動式範例
        </button>

        <DetailDrawer
          open={open}
          onOpenChange={setOpen}
          title="互動式範例"
          description="在右側 Controls 面板調整屬性"
          size="default"
        >
          <div className="space-y-4">
            <p className="text-gray-600">
              這是一個完全互動的範例。你可以在右側的 Controls 面板中調整所有屬性:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>調整 size 查看不同尺寸效果</li>
              <li>調整 side 查看不同滑出方向</li>
              <li>修改 title 和 description</li>
              <li>嘗試使用 ESC 鍵關閉</li>
              <li>點擊背景遮罩關閉</li>
            </ul>
          </div>
        </DetailDrawer>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: '完全互動的範例,可以調整所有屬性查看效果。',
      },
    },
  },
};
