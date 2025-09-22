# Data Model: 師資與職員管理頁面

**Feature**: 001-inertia-manage-staff  
**Date**: 2025-09-22

## Entity Analysis

### 核心實體

#### Staff (職員)
**用途**: 系所行政人員資料管理  
**主要屬性**:
- `id`: 主鍵
- `name`: 姓名（多語言 JSON: {zh-TW: string, en: string}）
- `position`: 職位（多語言 JSON）
- `email`: 電子郵件
- `phone`: 聯絡電話
- `office`: 辦公室位置
- `bio`: 簡介（多語言 JSON）
- `avatar`: 大頭照路徑
- `visible`: 是否顯示於前台（boolean）
- `sort_order`: 排序順序（integer）
- `created_at`, `updated_at`: 時間戳記

**驗證規則**:
- `name.zh-TW` 必填，最大長度 100
- `name.en` 可選，最大長度 100  
- `email` 必填且唯一，符合 email 格式
- `phone` 可選，符合電話號碼格式
- `position` 必填（多語言）
- `visible` 預設 true
- `sort_order` 預設 0

#### Teacher (教師)
**用途**: 系所教學人員資料管理  
**主要屬性**:
- `id`: 主鍵
- `user_id`: 關聯使用者（外鍵，可null）
- `name`: 姓名（多語言 JSON）
- `title`: 職稱（多語言 JSON: 教授/副教授/助理教授等）
- `email`: 電子郵件
- `phone`: 聯絡電話
- `office`: 辦公室位置
- `bio`: 個人簡介（多語言 JSON）
- `specialties`: 專長領域（多語言 JSON 陣列）
- `education`: 學歷背景（多語言 JSON 陣列）
- `avatar`: 大頭照路徑
- `website`: 個人網站 URL
- `lab_id`: 所屬實驗室（外鍵，可null）
- `visible`: 是否顯示於前台（boolean）
- `sort_order`: 排序順序（integer）
- `created_at`, `updated_at`: 時間戳記

**驗證規則**:
- `name.zh-TW` 必填，最大長度 100
- `title.zh-TW` 必填
- `email` 必填且唯一，符合 email 格式
- `bio` 可選（多語言）
- `specialties` 可選（多語言陣列）
- `website` 可選，符合 URL 格式
- `visible` 預設 true

#### User (使用者)
**用途**: 系統使用者帳號，與 Teacher 可能有關聯  
**相關屬性**:
- `id`: 主鍵
- `name`: 使用者名稱
- `email`: 登入 email
- `role`: 使用者角色（admin/teacher/user）

#### Lab (實驗室)  
**用途**: 實驗室資訊，與 Teacher 有關聯  
**相關屬性**:
- `id`: 主鍵
- `name`: 實驗室名稱（多語言 JSON）
- `description`: 實驗室描述（多語言 JSON）

### 關聯關係

#### Staff 關聯
- **無直接關聯**: Staff 是獨立實體，主要用於前台展示

#### Teacher 關聯  
- **Teacher belongsTo User**: `teacher.user_id → user.id`（可選關聯）
- **Teacher belongsTo Lab**: `teacher.lab_id → lab.id`（可選關聯）
- **Teacher hasMany Publications**: 透過 pivot table 實現多對多關聯
- **Teacher hasMany Projects**: 透過 pivot table 實現多對多關聯

### 資料轉換

#### API Resources

**StaffResource**:
```php
[
    'id' => $this->id,
    'name' => $this->name, // JSON object
    'position' => $this->position, // JSON object  
    'email' => $this->email,
    'phone' => $this->phone,
    'office' => $this->office,
    'bio' => $this->bio, // JSON object
    'avatar' => $this->avatar,
    'visible' => $this->visible,
    'sort_order' => $this->sort_order,
]
```

**TeacherResource**:
```php
[
    'id' => $this->id,
    'name' => $this->name, // JSON object
    'title' => $this->title, // JSON object
    'email' => $this->email,
    'phone' => $this->phone,
    'office' => $this->office,
    'bio' => $this->bio, // JSON object
    'specialties' => $this->specialties, // JSON array
    'education' => $this->education, // JSON array
    'avatar' => $this->avatar,
    'website' => $this->website,
    'visible' => $this->visible,
    'sort_order' => $this->sort_order,
    'user' => new UserResource($this->whenLoaded('user')),
    'lab' => new LabResource($this->whenLoaded('lab')),
]
```

### 前端 TypeScript 介面

#### Staff Interface
```typescript
interface Staff {
  id: number;
  name: LocalizedContent;
  position: LocalizedContent;
  email: string;
  phone?: string;
  office?: string;
  bio?: LocalizedContent;
  avatar?: string;
  visible: boolean;
  sort_order: number;
}

interface LocalizedContent {
  'zh-TW': string;
  en?: string;
}
```

#### Teacher Interface  
```typescript
interface Teacher {
  id: number;
  name: LocalizedContent;
  title: LocalizedContent;
  email: string;
  phone?: string;
  office?: string;
  bio?: LocalizedContent;
  specialties?: LocalizedContent[];
  education?: LocalizedContent[];
  avatar?: string;
  website?: string;
  visible: boolean;
  sort_order: number;
  user?: User;
  lab?: Lab;
}
```

### 狀態管理

#### 列表頁面狀態
```typescript
interface StaffManagementState {
  currentTab: 'staff' | 'teachers';
  staffList: Staff[];
  teacherList: Teacher[];
  loading: boolean;
  filters: {
    search: string;
    visible: boolean | null;
    perPage: number;
  };
  pagination: PaginationMeta;
}
```

#### 表單狀態
```typescript
interface StaffFormState {
  data: Partial<Staff>;
  errors: Record<string, string>;
  processing: boolean;
}

interface TeacherFormState {
  data: Partial<Teacher>;
  errors: Record<string, string>;
  processing: boolean;
  availableUsers: User[];
  availableLabs: Lab[];
}
```

## 資料流設計

### 控制器到前端的資料流
1. **StaffController** → **StaffResource** → **Inertia props** → **React components**
2. **TeacherController** → **TeacherResource** → **Inertia props** → **React components**

### 表單提交流程
1. **React form** → **Inertia.post/put** → **FormRequest validation** → **Model** → **Database**
2. 驗證失敗時自動返回錯誤訊息至前端
3. 成功時重導向至列表頁面並顯示成功訊息

## 多語言處理

### 資料庫儲存
- 所有使用者可見文字以 JSON 格式儲存
- 標準格式：`{"zh-TW": "繁體中文內容", "en": "English content"}`
- 前端顯示時根據當前 locale 選擇對應語言

### 表單編輯
- 提供 Tab 切換介面讓使用者編輯不同語言版本
- 至少要求填寫 zh-TW 版本，en 版本為可選
- 前端驗證確保必填語言版本不為空

這個資料模型設計完全符合憲法要求，使用多語言 JSON 儲存，遵循 Laravel Eloquent 最佳實踐，並提供完整的 TypeScript 型別定義以確保前後端資料一致性。
