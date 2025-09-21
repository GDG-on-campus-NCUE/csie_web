導覽列（主菜單）

- 簡介
    - 系所簡介
    - 教育目標
    - 法規彙編
    - 交通資訊
    - 設備介紹
    - 系所 LOGO
- 系所成員
    - 師資陣容
    - 行政人員
- 學術研究
    - 實驗室
    - 研究計畫
    - 研究論文
- 課程修業
    - 學士班
    - 碩士班
    - 人工智慧應用服務碩士在職專班
    - 雙聯學制
- 招生專區
    - 學士班
    - 碩士班
    - 人工智慧應用服務在職碩士班
    - 碩士先修生
- 公告
    - 全部資訊
    - 一般資訊
    - 大學部招生
    - 研究所招生
    - 演講及活動資訊
    - 獲獎資訊
    - 獎助學金
    - 徵人資訊
- 聯絡我們

---

## 技術總覽

- 技術棧
    - 後端: Laravel 11 / PHP 8.4，使用 Eloquent Models、Policies、FormRequests、API Resources
    - 前端: React + TypeScript + Inertia.js（以 Inertia 做 SSR-like page rendering，props 由後端注入）
    - 樣式: Tailwind CSS（全站白底為主、乾淨簡約風格，避免過多自訂 CSS）
    - 測試: PHPUnit（後端）、Jest + React Testing Library（前端）

- 設計原則
    - 介面風格以白底（#FFFFFF）為主，文字與圖像留白充足，元件簡潔。
    - 前端元件小而專（single responsibility），頁面組合由簡單元件構成。
    - 後端只負責資料與授權，UI 邏輯留在前端（或 Page container）。
    - 盡量不要引入大型前端 i18n 套件；採用小型 helper 或極簡 i18n loader（放在專案根的 `/lang` 目錄）。

---

## 資料模型 (Model) 與建議關聯

註：請提供目前 `app/Models` 的實際檔案清單以便精細化關聯與欄位建議。下面為依導覽列預期的 Model 清單建議：

- User (現有)
- Role (若存在)
- Member 或 Staff / Teacher（教職員）
- Lab（實驗室）
- ResearchProject（研究計畫）
- Publication（研究論文）
- Course（課程）
- Admission（招生資訊 / 類別）
- Announcement（公告）
- Post / PostCategory（若現有公告系統以 Post 呈現）
- ContactMessage（聯絡我們表單）

關聯範例：
- Member hasMany Publication
- Lab hasMany Member
- ResearchProject belongsToMany Member (協作成員)
- Announcement belongsTo User (author)

每個 Model 建議加入：fillable / casts / resource / factory（若用測試）

---

## 後端路由、Controller 與資料流

- 路由分類：`routes/web.php`（前台）、`routes/manage.php`（角色管理介面）、`routes/auth.php`
- 建議 route 命名與 controller 對應（每個 Controller method 都應有 PHPUnit 測試）：
    - AboutController@index => /about
    - AboutController@traffic => /about/traffic
    - MemberController@index => /members
    - MemberController@show => /members/{id}
    - ResearchController@labs => /research/labs
    - ResearchController@projects => /research/projects
    - CourseController@index => /courses
    - AdmissionController@index => /admissions
    - AnnouncementController@index => /announcements
    - AnnouncementController@show => /announcements/{id}
    - ContactController@submit => POST /contact

- Controller 輸出：
    - 使用 Inertia::render('pages/About/Index', $props)
    - $props 應為簡潔陣列：例如 ['data' => AnnouncementResource::collection($announcements), 'translations' => $translations, 'meta' => $meta]
    - 翻譯片段（translations）只注入該頁面需要的翻譯，減少 payload

---

## 國際化 (i18n) 規範

- 後端語言檔：使用 Laravel 的 `resources/lang/{locale}`（保留給後端錯誤訊息與 validation）
- 前端語言檔位置（建議）：`/lang/{locale}/{component}.json`（專案根目錄下的 `lang` 資料夾，用於純前端文字資源）
    - 範例檔案：
        - /lang/zh_TW/ui.json
        - /lang/en/ui.json
        - /lang/zh_TW/about.json
        - /lang/en/about.json
        - /lang/zh_TW/members.json
        - /lang/en/members.json

- 載入流程：
    1. Controller 確認當前 locale（App::getLocale() 或 session），載入對應 resources/js/lang/{locale}/{page}.json
    2. 在 Inertia::share 或該頁面的 props 中注入 translations，例如：
         - 'translations' => ['ui' => $uiTranslations, 'about' => $aboutTranslations]
    3. 前端 page/component 使用簡單 helper getT('about.title') 取值（優先從 props.translations 找，不存在回退到 ui）

- 翻譯維護規則：
    - 每個頁面或組件只管理自己的 json
    - keys 簡潔，避免放大量 HTML（將 HTML 組合放在 React component）

---

## 前端結構與資料獲取

- 目录 (resources/js)
    - pages/ (Inertia pages)
    - components/ui/ (最小化、可重用)
    - components/page/ (組成頁面的複合元件)

- 資料流
    - 後端 Controller 查詢資料 -> 轉換為 Resource / DTO -> Inertia::render('Page', $props)
    - 前端以 props 為資料來源。若需要 client-only fetch，放在 useEffect 並有 loading 標示

- 渲染細節
    - Page 組件只做資料分發與小量邏輯，UI 元件純 display
    - 所有表單使用 unobtrusive validation（後端再次驗證）

---

## 測試規範

- 後端
    - 每個 Controller method 對應一個 Feature test（tests/Feature）。
    - 測試要覆蓋：正常流程、未授權、輸入驗證錯誤、空結果
    - 範例：tests/Feature/AnnouncementControllerTest.php

- 前端
    - 每個主要 Page 與 UI 元件帶 Jest + RTL tests（resources/js/__tests__）
