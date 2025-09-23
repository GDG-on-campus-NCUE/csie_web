# Auth Page 規範

這份文件說明專案中所有與驗證（Auth）相關的頁面設計與實作規範，依循 `ARCHITECTURE.md` 的技術與設計原則（React + TypeScript + Inertia.js、Tailwind CSS、簡潔白底風格）。目標是提供一致、可測試且美觀的登入／註冊／忘記密碼等頁面。

## 支援頁面
- Login (/auth/login)
- Register (/auth/register)
- Forgot Password (/auth/forgot-password)
- Reset Password (/auth/reset-password)
- Verify Email (/auth/verify-email)
- Confirm Password (/auth/confirm-password)

## 頁面佈局
- 使用單一共用 `AuthLayout`（resources/js/layouts/auth/*）
  - 左側或上方為品牌與簡短說明（選擇性顯示 hero 圖片或插畫）
  - 右側為卡片式表單，卡片使用 `card-elevated` 或 `glass-surface` 樣式
  - 保持足夠留白，字體使用全站字體設定（auth 頁可選擇使用 `font-serif` 作為標題）

## 視覺/樣式規則
- 背景以淺白或極淡漸層為主，避免使用強烈背景圖。
- 表單卡片建議寬度：min(22rem, 100%)，在桌面上置中顯示。
- 標題：使用 site heading style（大而粗的襯線字），例如 h1=5xl、extrabold。副標題使用 1xl~2xl。
- 按鈕：Primary 按鈕使用 `--color-primary`，圓角使用 `--radius-md`。
- 錯誤提示：紅色（`--destructive`）文字 + 簡短描述，放置在對應輸入下方。

## 組件清單（Resources）
- `AuthLayout`（共用版面）
- `AuthCard`（包表單的卡片）
- `Input`（帶 label、error、hint）
- `PasswordInput`（含顯示/隱藏密碼）
- `Button`（primary/secondary/ghost）
- `OAuthButtons`（第三方登入按鈕，若需要）
- `AuthFooter`（連結：回首頁、聯絡我們、隱私政策）

## 路由與 Controller
- routes/auth.php 應定義必要 route 並對應 controller。
- Controller 範例：
  - AuthController@loginForm => GET /auth/login
  - AuthController@login => POST /auth/login
  - RegisterController@show => GET /auth/register
  - RegisterController@store => POST /auth/register
  - ForgotPasswordController@show => GET /auth/forgot-password
  - ForgotPasswordController@send => POST /auth/forgot-password

- Controller 應回傳 Inertia::render('auth/Login', $props)
  - $props 範例：{ csrf: csrf_token(), translations: { auth: { title: '登入' } } }

## 前端 Page 結構（React + TypeScript）
- resources/js/pages/auth/login.tsx
  - 使用 `AuthLayout`，內含 `AuthCard` 與 `Form` 組件
  - 透過 Inertia 提交表單（useForm from @inertiajs/react）
  - 將伺服器端 validation errors 綁定到對應輸入元件
  - 範例 props 接收：
    - errors: Record<string, string>
    - status: string | null
    - translations: Record<string, any>

## 表單欄位與驗證
- Login
  - email: required, email
  - password: required, min:8
  - remember: boolean
- Register
  - name: required, max:255
  - email: required, email, unique
  - password: required, min:8, confirmed
- Forgot Password
  - email: required, email
- Reset Password
  - token: required
  - email: required, email
  - password: required, min:8, confirmed

前端也應做簡單驗證（例如 required、email 格式），但「最終驗證」必在後端完成。驗證錯誤以 field-specific messages 回傳（遵循 Laravel 的 validation 格式），前端將在對應欄位下方顯示。

## i18n（翻譯）
- 使用專案建議的 i18n 流程：Controller 注入必要的 translations，前端以簡單 helper 取用。
- 範例 keys（可放在 /lang/zh_TW/auth.json）:
  - title: "登入"
  - subtitle: "歡迎回來，請使用帳號登入。"
  - email: "電子信箱"
  - password: "密碼"
  - remember: "保持登入"
  - forgot: "忘記密碼？"
  - submit: "登入"

## Accessibility（可及性）
- 所有輸入必備 label 且與 input 綁定（for / id）。
- 錯誤提示使用 `aria-describedby` 指向錯誤文字。
- 按鈕需有明確文字（不要只有 icon）。

## 測試建議
- 後端（PHPUnit）:
  - login 正常流程
  - login 驗證失敗（空欄、格式錯誤）
  - register 與 unique constraint
  - forgot password 路徑與郵件發送（使用通知偽造）
- 前端（Jest + RTL）:
  - Login page snapshot
  - 表單送出時，顯示 loading 與 disabled 按鈕
  - 當 server 返回 errors 時，對應錯誤出現在頁面

## 範例：Login Page Props（示範）
```ts
// Inertia props from controller
{
  csrf: '...',
  errors: {
    email: '電子信箱格式錯誤'
  },
  status: null,
  translations: {
    auth: {
      title: '登入',
      subtitle: '歡迎回來，請使用帳號登入。',
      submit: '登入'
    }
  }
}
```

---

如需我也可同時把 resources/js/pages/auth 下現有的頁面套用這個版面並產生一致的 UI 組件（例如 `AuthCard`、`Input`），或替你把現有不美觀的 auth 頁面重構成此規範的樣板頁面。請告訴我你想要我繼續自動套用到哪些頁面（例如 login / register / forgot-password）。
