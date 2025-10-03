#!/bin/bash

# Manage Page 升級專案 - 依賴安裝腳本
# 此腳本會安裝所有測試和 Storybook 相關的依賴套件

echo "🚀 開始安裝 Manage Page 升級專案依賴..."
echo ""

# 檢查是否在正確的目錄
if [ ! -f "package.json" ]; then
    echo "❌ 錯誤: 找不到 package.json"
    echo "請在專案根目錄執行此腳本"
    exit 1
fi

echo "📦 安裝測試相關套件..."
npm install --save-dev \
    @testing-library/react \
    @testing-library/user-event \
    @testing-library/jest-dom \
    jest \
    jest-environment-jsdom \
    ts-jest \
    @types/jest

echo ""
echo "📚 安裝 Storybook 相關套件..."
npm install --save-dev \
    @storybook/react \
    @storybook/react-vite \
    @storybook/addon-essentials \
    @storybook/addon-a11y \
    @storybook/addon-interactions \
    @storybook/test \
    storybook

echo ""
echo "✅ 所有依賴安裝完成!"
echo ""
echo "📝 接下來可以執行:"
echo "  • npm test                    - 執行測試"
echo "  • npm run test:watch          - 監看模式執行測試"
echo "  • npm run test:coverage       - 執行測試並產生覆蓋率報告"
echo "  • npm run storybook           - 啟動 Storybook"
echo "  • npm run build-storybook     - 建置 Storybook 靜態檔案"
echo ""
echo "📖 詳細資訊請參考 .docs/manage/TESTING_GUIDE.md"
