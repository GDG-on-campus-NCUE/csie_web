import type { Meta, StoryObj } from '@storybook/react';
import { DataCard } from './data-card';
import { FileText, Calendar, User, Eye, MessageSquare, Image as ImageIcon } from 'lucide-react';

/**
 * DataCard 是一個多功能的資料展示卡片元件,適用於展示文章、專案、出版品等內容。
 *
 * ## 功能特點
 * - 🏷️ 狀態徽章 (success/warning/danger)
 * - 📝 標題與描述
 * - 📊 後設資料列表 (日期、作者、瀏覽數等)
 * - 🎨 特色圖片 (16:9 比例)
 * - 🔗 點擊連結
 * - ⚡ Hover 效果
 * - 🎯 操作按鈕區
 * - 📱 響應式設計
 */
const meta = {
  title: 'Manage/DataCard',
  component: DataCard,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: '資料卡片元件,用於展示各類內容項目。支援圖片、狀態、後設資料等多種配置。',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: 'text',
      description: '卡片標題',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: '-' },
      },
    },
    description: {
      control: 'text',
      description: '卡片描述',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: '-' },
      },
    },
    status: {
      control: 'select',
      options: ['success', 'warning', 'danger'],
      description: '狀態徽章樣式',
      table: {
        type: { summary: 'success | warning | danger' },
        defaultValue: { summary: '-' },
      },
    },
    statusLabel: {
      control: 'text',
      description: '狀態徽章文字',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: '-' },
      },
    },
    metadata: {
      control: 'object',
      description: '後設資料陣列 (icon + label)',
      table: {
        type: { summary: 'Array<{ icon: ReactNode; label: string }>' },
        defaultValue: { summary: '[]' },
      },
    },
    featuredImage: {
      control: 'text',
      description: '特色圖片 URL',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: '-' },
      },
    },
    href: {
      control: 'text',
      description: '點擊連結 URL',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: '-' },
      },
    },
  },
} satisfies Meta<typeof DataCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 基本範例 - 僅顯示標題和描述
 */
export const Default: Story = {
  args: {
    title: '網站架構優化與效能提升',
    description: '本文探討現代網站架構設計,包含前端優化、後端擴展性、資料庫效能調校等主題。',
  },
};

/**
 * 帶狀態徽章 - 顯示內容狀態
 */
export const WithStatus: Story = {
  args: {
    title: 'React 18 新特性完整解析',
    description: '深入介紹 React 18 的並發渲染、自動批次處理、Suspense 等新功能。',
    status: 'success',
    statusLabel: '已發布',
  },
};

/**
 * 帶後設資料 - 顯示發布日期、作者、統計資訊
 */
export const WithMetadata: Story = {
  args: {
    title: 'TypeScript 進階型別實戰',
    description: '從基礎到進階,完整涵蓋 TypeScript 型別系統的各種應用場景。',
    status: 'success',
    statusLabel: '已發布',
    metadata: [
      { icon: <Calendar className="h-4 w-4" />, label: '2024-03-15' },
      { icon: <User className="h-4 w-4" />, label: '張小明' },
      { icon: <Eye className="h-4 w-4" />, label: '1,234 次瀏覽' },
      { icon: <MessageSquare className="h-4 w-4" />, label: '23 則留言' },
    ],
  },
};

/**
 * 帶特色圖片 - 16:9 比例圖片
 */
export const WithFeaturedImage: Story = {
  args: {
    title: '前端效能監控實戰指南',
    description: '介紹如何使用 Web Vitals、Lighthouse 等工具監控並改善網站效能。',
    status: 'success',
    statusLabel: '已發布',
    featuredImage: 'https://picsum.photos/seed/performance/800/450',
    metadata: [
      { icon: <Calendar className="h-4 w-4" />, label: '2024-03-20' },
      { icon: <User className="h-4 w-4" />, label: '李小華' },
      { icon: <Eye className="h-4 w-4" />, label: '856 次瀏覽' },
    ],
  },
};

/**
 * 帶連結 - 點擊卡片導航
 */
export const WithLink: Story = {
  args: {
    title: 'CSS Grid 完整佈局指南',
    description: '掌握 CSS Grid 的核心概念,打造響應式網格佈局。',
    status: 'success',
    statusLabel: '已發布',
    featuredImage: 'https://picsum.photos/seed/css-grid/800/450',
    href: '/posts/123',
    metadata: [
      { icon: <Calendar className="h-4 w-4" />, label: '2024-03-18' },
      { icon: <User className="h-4 w-4" />, label: '王大明' },
    ],
  },
};

/**
 * 草稿狀態 - 使用 warning 狀態
 */
export const DraftStatus: Story = {
  args: {
    title: 'Next.js 14 App Router 遷移實戰',
    description: '從 Pages Router 遷移到 App Router 的完整指南與注意事項。',
    status: 'warning',
    statusLabel: '草稿',
    metadata: [
      { icon: <Calendar className="h-4 w-4" />, label: '2024-03-25' },
      { icon: <User className="h-4 w-4" />, label: '陳小美' },
    ],
  },
};

/**
 * 待審核狀態 - 使用 warning 狀態
 */
export const PendingStatus: Story = {
  args: {
    title: 'GraphQL 與 REST API 比較分析',
    description: '深入比較 GraphQL 與 REST API 的優缺點,幫助選擇適合的解決方案。',
    status: 'warning',
    statusLabel: '待審核',
    featuredImage: 'https://picsum.photos/seed/graphql/800/450',
    metadata: [
      { icon: <Calendar className="h-4 w-4" />, label: '2024-03-22' },
      { icon: <User className="h-4 w-4" />, label: '林小強' },
    ],
  },
};

/**
 * 已封存狀態 - 使用 danger 狀態
 */
export const ArchivedStatus: Story = {
  args: {
    title: 'jQuery 時代的前端開發',
    description: '回顧 jQuery 時代的前端開發模式與歷史演進。',
    status: 'danger',
    statusLabel: '已封存',
    metadata: [
      { icon: <Calendar className="h-4 w-4" />, label: '2020-01-10' },
      { icon: <User className="h-4 w-4" />, label: '老前輩' },
      { icon: <Eye className="h-4 w-4" />, label: '5,678 次瀏覽' },
    ],
  },
};

/**
 * 帶操作按鈕 - 自訂 actions 區塊
 */
export const WithActions: Story = {
  args: {
    title: 'Docker 容器化部署實戰',
    description: '從基礎到進階,完整的 Docker 容器化部署指南。',
    status: 'success',
    statusLabel: '已發布',
    featuredImage: 'https://picsum.photos/seed/docker/800/450',
    metadata: [
      { icon: <Calendar className="h-4 w-4" />, label: '2024-03-21' },
      { icon: <User className="h-4 w-4" />, label: '運維工程師' },
    ],
    children: (
      <div className="flex gap-2 mt-4">
        <button className="px-3 py-1.5 text-sm bg-primary text-white rounded-lg hover:bg-primary/90">
          編輯
        </button>
        <button className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
          檢視
        </button>
        <button className="px-3 py-1.5 text-sm text-red-600 border border-red-300 rounded-lg hover:bg-red-50">
          刪除
        </button>
      </div>
    ),
  },
};

/**
 * 帶底部內容 - 使用 footer 區塊
 */
export const WithFooter: Story = {
  args: {
    title: 'Tailwind CSS 最佳實踐',
    description: '分享 Tailwind CSS 在大型專案中的應用經驗與優化技巧。',
    status: 'success',
    statusLabel: '已發布',
    featuredImage: 'https://picsum.photos/seed/tailwind/800/450',
    metadata: [
      { icon: <Calendar className="h-4 w-4" />, label: '2024-03-19' },
      { icon: <User className="h-4 w-4" />, label: 'UI 設計師' },
    ],
    footer: (
      <div className="pt-4 mt-4 border-t border-gray-200 flex items-center justify-between text-sm text-gray-600">
        <span>最後更新: 2024-03-20</span>
        <span className="text-primary">3 個分類標籤</span>
      </div>
    ),
  },
};

/**
 * 無圖片 - 純文字卡片
 */
export const NoImage: Story = {
  args: {
    title: 'JavaScript 設計模式精解',
    description: '詳細介紹常見的 JavaScript 設計模式,包含單例、工廠、觀察者等模式的實作與應用。本文適合有一定基礎的前端開發者閱讀。',
    status: 'success',
    statusLabel: '已發布',
    metadata: [
      { icon: <Calendar className="h-4 w-4" />, label: '2024-03-17' },
      { icon: <User className="h-4 w-4" />, label: '資深工程師' },
      { icon: <Eye className="h-4 w-4" />, label: '2,345 次瀏覽' },
      { icon: <MessageSquare className="h-4 w-4" />, label: '45 則留言' },
    ],
  },
};

/**
 * 完整範例 - 所有功能組合
 */
export const Complete: Story = {
  args: {
    title: 'Web 安全性完整指南',
    description: '全面涵蓋 XSS、CSRF、SQL Injection 等常見攻擊手法與防護措施。',
    status: 'success',
    statusLabel: '已發布',
    featuredImage: 'https://picsum.photos/seed/security/800/450',
    href: '/posts/456',
    metadata: [
      { icon: <Calendar className="h-4 w-4" />, label: '2024-03-23' },
      { icon: <User className="h-4 w-4" />, label: '資安專家' },
      { icon: <Eye className="h-4 w-4" />, label: '3,456 次瀏覽' },
      { icon: <MessageSquare className="h-4 w-4" />, label: '67 則留言' },
    ],
    children: (
      <div className="flex gap-2 mt-4">
        <button className="px-3 py-1.5 text-sm bg-primary text-white rounded-lg hover:bg-primary/90">
          編輯
        </button>
        <button className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
          檢視詳情
        </button>
      </div>
    ),
    footer: (
      <div className="pt-4 mt-4 border-t border-gray-200 flex items-center justify-between text-sm">
        <span className="text-gray-600">最後更新: 2024-03-24</span>
        <div className="flex gap-2">
          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">安全性</span>
          <span className="px-2 py-1 bg-green-100 text-green-700 rounded">教學</span>
        </div>
      </div>
    ),
  },
};

/**
 * 網格佈局 - 3 欄響應式
 */
export const GridLayout: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <DataCard
        title="React Hooks 深入解析"
        description="詳細說明 useState、useEffect、useContext 等常用 Hooks。"
        status="success"
        statusLabel="已發布"
        featuredImage="https://picsum.photos/seed/hooks/800/450"
        metadata={[
          { icon: <Calendar className="h-4 w-4" />, label: '2024-03-15' },
          { icon: <Eye className="h-4 w-4" />, label: '1,234' },
        ]}
      />
      <DataCard
        title="Vue 3 組合式 API"
        description="介紹 Vue 3 的 Composition API 與 Reactivity 系統。"
        status="warning"
        statusLabel="草稿"
        featuredImage="https://picsum.photos/seed/vue3/800/450"
        metadata={[
          { icon: <Calendar className="h-4 w-4" />, label: '2024-03-16' },
          { icon: <Eye className="h-4 w-4" />, label: '856' },
        ]}
      />
      <DataCard
        title="Angular Signals 新特性"
        description="探索 Angular 16 引入的 Signals 響應式系統。"
        status="success"
        statusLabel="已發布"
        featuredImage="https://picsum.photos/seed/angular/800/450"
        metadata={[
          { icon: <Calendar className="h-4 w-4" />, label: '2024-03-17' },
          { icon: <Eye className="h-4 w-4" />, label: '678' },
        ]}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: '展示卡片在響應式網格佈局中的效果。',
      },
    },
  },
};

/**
 * 無障礙測試 - 鍵盤導航與螢幕閱讀器
 */
export const Accessibility: Story = {
  args: {
    title: 'Web 無障礙設計指南',
    description: '介紹 WCAG 2.1 標準與無障礙網頁設計實務。',
    status: 'success',
    statusLabel: '已發布',
    featuredImage: 'https://picsum.photos/seed/a11y/800/450',
    href: '/posts/789',
    metadata: [
      { icon: <Calendar className="h-4 w-4" />, label: '2024-03-24' },
      { icon: <User className="h-4 w-4" />, label: '無障礙專家' },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: '測試卡片的無障礙性。點擊卡片應該可以導航,所有資訊應該對螢幕閱讀器友好。',
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
 * 長文字處理 - 測試文字溢出
 */
export const LongText: Story = {
  args: {
    title: '這是一個非常非常非常非常非常非常非常非常非常非常長的標題文字測試',
    description:
      '這是一段非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常長的描述文字,用於測試元件如何處理超長文字內容。通常會使用 line-clamp 來限制顯示行數,避免卡片高度過高影響整體佈局。這樣的處理方式可以保持介面的整潔與一致性。',
    status: 'success',
    statusLabel: '已發布',
    metadata: [
      { icon: <Calendar className="h-4 w-4" />, label: '2024年03月25日 下午 03:45:30' },
      { icon: <User className="h-4 w-4" />, label: '這是一個非常長的作者名稱測試' },
      { icon: <Eye className="h-4 w-4" />, label: '999,999,999 次瀏覽' },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: '測試元件如何處理超長文字。標題和描述應該適當截斷,後設資料應該正確換行。',
      },
    },
  },
};

/**
 * 空狀態 - 無後設資料
 */
export const EmptyMetadata: Story = {
  args: {
    title: '最新文章標題',
    description: '這是一篇剛建立的文章,還沒有任何統計資料。',
    status: 'warning',
    statusLabel: '草稿',
  },
  parameters: {
    docs: {
      description: {
        story: '展示沒有後設資料時的顯示效果。',
      },
    },
  },
};

/**
 * 互動式範例 - 可以編輯所有屬性
 */
export const Interactive: Story = {
  args: {
    title: '互動式範例',
    description: '在右側的 Controls 面板調整屬性,看看效果如何變化。',
    status: 'success',
    statusLabel: '已發布',
    featuredImage: 'https://picsum.photos/seed/interactive/800/450',
    href: '/example',
    metadata: [
      { icon: <Calendar className="h-4 w-4" />, label: '2024-03-25' },
      { icon: <User className="h-4 w-4" />, label: '測試使用者' },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: '這是一個完全互動的範例。你可以在右側的 Controls 面板中調整所有屬性,即時查看效果。',
      },
    },
  },
};
