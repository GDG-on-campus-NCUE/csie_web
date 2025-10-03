# Admin Dashboard Revamp Plan 管理頁改版規劃

## Objectives 目標
- 提升管理者操作效率，減少完成常用任務的步驟｜Improve admin task efficiency and shorten task flows.
- 打造清楚且一致的資訊架構，避免使用者視覺負擔｜Create a clear, consistent information architecture to reduce cognitive load.
- 支援中英雙語體驗並維持佈局穩定｜Support bilingual (ZH/EN) experience without breaking the layout.
- 最小化橫向捲動需求，於狹窄螢幕時改用卡片呈現｜Minimize horizontal scrolling; fall back to cards on narrow viewports.

## Current Pain Points 現況問題
- 門檻高的操作流程與分散的捷徑｜Key actions scattered; workflow feels long.
- 使用者清單需橫向捲動才能看到完整資訊｜User table forces horizontal scroll to view all fields.
- Button 顏色與層級不清楚，缺乏狀態區分｜Button colors lack hierarchy clarity.
- 中英文切換時元素易換行、排版鬆散｜Language switch causes wrapping and misalignment.

## Information Architecture 資訊架構
- **Global header 全域列**：標題、系統摘要、語言切換器、主要 CTA。
- **Overview Summary 概況卡**：六個核心指標（總公告、草稿、排程、使用者、儲存空間、近期活動），於桌機為三欄格，平板以下切換為兩欄或單欄卡片。
- **Quick Actions 快速操作**：聚焦 4-5 個最高頻任務（新增公告、檢視公告、邀請教師、匯入名單、上傳附件）。
- **User Management 使用者管理**：
  - 桌機：可調整欄寬的 responsive 表格，欄位依優先順序（名稱、角色、狀態、最近登入、Email、Space）。
  - 平板以下：改以卡片顯示，每張卡提供主要資訊與更多操作展開區。
- **Activity Feed 最新動態**：保持於頁面下半部，提供過濾與搜尋功能。

## Layout & Responsive Strategy 佈局策略
- 使用 12 欄 Grid：桌機 3 欄卡片、平板 2 欄、手機 1 欄。
- 重點區塊（Summary、Quick Actions、User 管理）相互對齊，避免視覺分散。
- User 表格於 1024px 以下切換至卡片式 layout；行動版提供分頁或 infinite scroll。
- 保持主要操作按鈕在可視範圍內，使用 sticky action bar。

## Bilingual Toggle 中英切換
- Header 右上角放置語言切換 Switch（ZH / EN）。
- 採用固定寬度的 label 與縮寫（ZH, EN）防止切換時寬度改變。
- 內文使用中英對應字串與 i18n namespace，確保翻譯一致。
- 檢查所有按鈕與欄位名稱的字串長度，必要時使用 Tooltip 顯示完整文字。

## Button Color System 按鈕色彩規範
- **Primary 主色**：深海軍藍 #121C3F（Hover #1B2754，Disabled 40% opacity）。
- **Secondary 次色**：柔和粉藍 #E5EBFF（Hover #D7E1FF，字色 #30407A）。
- **Positive 成功**：薄荷綠 #62D2A2｜**Negative 警示**：珊瑚紅 #FF6F61。
- 建議搭配 8px 圓角與 1.5 倍字體高度的 padding，維持一致視覺。

## Key UX Enhancements 核心體驗升級
- 優先將「新增公告」與「快速操作」集中在首屏。
- 引導式空狀態：提供 CTA 與設定提示。
- 一致的 icon + label 對齊方式，使用 16px icon。
- 表格支援批次動作與彈性篩選，篩選條件靜態顯示在上方 bar。

## Implementation Roadmap 執行計畫
1. 設計階段：建立新版 wireframe（桌機／平板／手機），定義色彩與字型 token。
2. 元件更新：開發可切換的語言切換器、卡片式表格、統一的 CTA Button 元件。
3. 版面重構：套用 Grid layout，測試各斷點行為，解決橫向捲動。
4. 內容整合：接入 i18n 字串，調整中英長度，撰寫空狀態文案。
5. 測試與驗證：可用性測試、A/B 測試（若可）、確定指標追蹤（點擊率、完成率）。

## Acceptance Criteria 驗收指標
- Desktop 與 Tablet 瀏覽無需橫向捲動即可完成常見任務。
- 中英切換無版面跳動，所有主要區塊的高度差小於 8px。
- Primary/Secondary/Status Buttons 色彩符合規範並通過 WCAG AA 對比。
- 行動版卡片在 375px 寬度下可完整呈現關鍵資訊，操作按鈕可單手觸及。
