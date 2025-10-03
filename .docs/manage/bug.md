# Manage UI regressions

## 摘要
- 管理頁面頂部重複出現預設的「系統總覽」區塊，實際頁面資訊被擠到下方。
- 濾器與操作按鈕仍為深藍色主色調，不符合最新亮色設計且可讀性差。
- 側邊欄樣式與頁面快速導覽不一致，active 狀態對比不足，維護兩份導航資料易漂移。

## 根因
- `ManageLayout` 僅辨識最外層節點是否為 `ManagePage`，遇到 fragment 或額外包裹時會回落到預設內容並再包一層。
- `button` 元件 default 變體仍使用 #1d3bb8，且管理頁面未更新為新色票。
- 側邊欄與快速導覽各自呼叫 `buildSidebarNavGroups`，並且 sidebar active 樣式偏暗。

## 修復計畫
1. 實作 `extractManagePage` 將 fragment 攤平，`ManageLayout` 只包覆第一個 `ManagePage`，並把其他 children 保留原順序渲染。
2. `ManageLayout` 統一計算導航群組後透過 props 傳給 sidebar 與 quick-nav，避免重複。
3. 新增柔和 variant（例如 `subtle`、`accent`）或調整 primary token，並更新管理頁濾器/操作按鈕用色。
4. 調整側邊欄 active 樣式與群組標籤文字色，提升與 quick-nav 的一致性與對比。
5. 修改後執行 `npm run lint` 與必要測試，手動巡覽 `/manage` 路由確認標題、麵包屑與按鈕狀態。

## 風險與注意
- `extractManagePage` 需確保保留 children 原本順序與事件，避免破壞二次渲染。
- 按鈕色票調整需檢查前台共用按鈕是否受到影響。
- sidebar 樣式在 light/dark 模式皆要保持足夠對比。
