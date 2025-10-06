# Manage 舊樣式追蹤清單

> 目的：盤點仍沿用舊版語意色彩或按鈕樣式（例如 `variant="tonal"`、`variant="secondary"`）的元件，協助後續逐一換成設計規範中建議的自訂色票樣式。

## Button

- [ ] `resources/js/components/ui/button.tsx` — `buttonVariants` 仍保留 `tonal` 變體，後續需評估是否移除或改寫為新語意色票。
- [ ] `resources/js/pages/manage/teacher/posts/post-form.tsx` — 發佈按鈕使用 `variant="secondary"`，需替換為語意色票並同步按鈕群組配色。
- [ ] `resources/js/pages/manage/posts/create.tsx` — 公告預覽按鈕使用 `variant="secondary"`，需改用語意色票搭配 `className`。

## Badge

- [ ] `resources/js/pages/manage/teacher/labs/index.tsx` — 篩選器數量與隱藏狀態使用 `variant="secondary"`，後續需改為語意色票（例如 `bg-neutral-100` 自行定義）。
- [ ] `resources/js/pages/manage/teacher/posts/show.tsx` — 類別標籤沿用 `variant="secondary"`。
- [ ] `resources/js/pages/manage/admin/posts/show.tsx` — 公告狀態標籤採 `variant="secondary"`。
- [ ] `resources/js/pages/manage/admin/users/index.tsx` — 場域與配額 Badge 仍為 `variant="secondary"`。

> 更新節奏：完成調整後請勾選上列項目，並於 PR 描述連結此清單，確保所有舊樣式都被逐一替換。
