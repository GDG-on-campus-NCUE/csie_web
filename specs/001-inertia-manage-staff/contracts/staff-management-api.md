# API Contract: Staff Management

**Feature**: 001-inertia-manage-staff  
**Date**: 2025-09-22

## Endpoints Overview

### GET /manage/staff
**Purpose**: 顯示職員管理主頁面，包含職員和教師列表  
**Controller**: `StaffController@index`  
**Response**: Inertia page `manage/admin/staff/index`

**Query Parameters**:
```typescript
{
  tab?: 'staff' | 'teachers';     // 預設 'staff'
  search?: string;                // 搜尋關鍵字
  visible?: boolean;              // 篩選是否顯示
  per_page?: number;              // 每頁筆數，預設 15
  page?: number;                  // 頁碼
}
```

**Response Props**:
```typescript
{
  initialTab: 'staff' | 'teachers';
  staff: {
    data: Staff[];
    meta: PaginationMeta;
  };
  teachers: {
    data: Teacher[];  
    meta: PaginationMeta;
  };
  filters: {
    search: string;
    visible: boolean | null;
    per_page: number;
  };
  translations: {
    manage: Record<string, string>;
  };
}
```

### GET /manage/staff/create
**Purpose**: 顯示新增職員表單  
**Controller**: `StaffController@create`  
**Response**: Inertia page `manage/admin/staff/create`

**Response Props**:
```typescript
{
  translations: {
    manage: Record<string, string>;
  };
}
```

### POST /manage/staff
**Purpose**: 建立新職員記錄  
**Controller**: `StaffController@store`  
**Request**: `StoreStaffRequest`

**Request Body**:
```typescript
{
  name: {
    'zh-TW': string;
    en?: string;
  };
  position: {
    'zh-TW': string;  
    en?: string;
  };
  email: string;
  phone?: string;
  office?: string;
  bio?: {
    'zh-TW'?: string;
    en?: string;
  };
  avatar?: File;
  visible: boolean;
  sort_order: number;
}
```

**Success Response**: Redirect to `/manage/staff` with success message  
**Error Response**: Validation errors returned to form

### GET /manage/staff/{id}/edit
**Purpose**: 顯示編輯職員表單  
**Controller**: `StaffController@edit`  
**Response**: Inertia page `manage/admin/staff/edit`

**Response Props**:
```typescript
{
  staff: Staff;
  translations: {
    manage: Record<string, string>;
  };
}
```

### PUT /manage/staff/{id}
**Purpose**: 更新職員記錄  
**Controller**: `StaffController@update`  
**Request**: `UpdateStaffRequest`

**Request Body**: 同 POST /manage/staff  
**Success Response**: Redirect to `/manage/staff` with success message  
**Error Response**: Validation errors returned to form

### DELETE /manage/staff/{id}
**Purpose**: 刪除職員記錄  
**Controller**: `StaffController@destroy`  
**Success Response**: Redirect to `/manage/staff` with success message

---

## Teacher Management Endpoints

### GET /manage/teachers/create
**Purpose**: 顯示新增教師表單  
**Controller**: `TeacherController@create`  
**Response**: Inertia page `manage/admin/teachers/create`

**Response Props**:
```typescript
{
  users: User[];
  labs: Lab[];
  translations: {
    manage: Record<string, string>;
  };
}
```

### POST /manage/teachers
**Purpose**: 建立新教師記錄  
**Controller**: `TeacherController@store`  
**Request**: `StoreTeacherRequest`

**Request Body**:
```typescript
{
  name: {
    'zh-TW': string;
    en?: string;
  };
  title: {
    'zh-TW': string;
    en?: string;
  };
  email: string;
  phone?: string;
  office?: string;
  bio?: {
    'zh-TW'?: string;
    en?: string;
  };
  specialties?: Array<{
    'zh-TW': string;
    en?: string;
  }>;
  education?: Array<{
    'zh-TW': string;
    en?: string;
  }>;
  avatar?: File;
  website?: string;
  user_id?: number;
  lab_id?: number;
  visible: boolean;
  sort_order: number;
}
```

### GET /manage/teachers/{id}
**Purpose**: 顯示教師詳細資訊  
**Controller**: `TeacherController@show`  
**Response**: Inertia page `manage/admin/teachers/show`

**Response Props**:
```typescript
{
  teacher: Teacher & {
    user?: User;
    lab?: Lab;
    publications?: Publication[];
    projects?: Project[];
  };
  translations: {
    manage: Record<string, string>;
  };
}
```

### GET /manage/teachers/{id}/edit
**Purpose**: 顯示編輯教師表單  
**Controller**: `TeacherController@edit`  
**Response**: Inertia page `manage/admin/teachers/edit`

**Response Props**:
```typescript
{
  teacher: Teacher;
  users: User[];
  labs: Lab[];
  translations: {
    manage: Record<string, string>;
  };
}
```

### PUT /manage/teachers/{id}
**Purpose**: 更新教師記錄  
**Controller**: `TeacherController@update`  
**Request**: `UpdateTeacherRequest`

**Request Body**: 同 POST /manage/teachers  
**Success Response**: Redirect to `/manage/staff` or teacher detail page

### DELETE /manage/teachers/{id}
**Purpose**: 刪除教師記錄  
**Controller**: `TeacherController@destroy`  
**Success Response**: Redirect to `/manage/staff` with success message

---

## Error Handling

### Validation Errors
```typescript
{
  errors: {
    [field: string]: string[];
  };
  message: string;
}
```

### Authorization Errors
- 未授權使用者將被重導向至登入頁面
- 權限不足時顯示 403 錯誤頁面

### Server Errors
- 500 錯誤顯示通用錯誤頁面
- 404 錯誤重導向至管理首頁

## Rate Limiting
- 表單提交：每分鐘最多 10 次請求
- 列表查詢：每分鐘最多 60 次請求

## Security Considerations
- 所有請求需要 CSRF token
- 檔案上傳需要驗證檔案類型和大小
- 多語言內容需要 XSS 防護
- 圖片上傳需要檔案類型驗證（jpg, png, gif 等）
