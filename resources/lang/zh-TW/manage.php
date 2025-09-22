<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Management Interface Language Lines (Traditional Chinese)
    |--------------------------------------------------------------------------
    |
    | The following language lines are used for the management interface.
    | These translations are used for admin panel labels, messages, and forms.
    |
    */

    // Common terms
    'id' => 'ID',
    'name' => '名稱',
    'email' => '電子郵件',
    'phone' => '電話',
    'created_at' => '建立時間',
    'updated_at' => '更新時間',
    'actions' => '操作',
    'edit' => '編輯',
    'delete' => '刪除',
    'create' => '新增',
    'update' => '更新',
    'save' => '儲存',
    'cancel' => '取消',
    'confirm' => '確認',
    'back' => '返回',
    'search' => '搜尋',
    'filter' => '篩選',
    'sort_order' => '排序',
    'visible' => '顯示狀態',
    'status' => '狀態',
    'photo' => '照片',
    'avatar' => '頭像',
    'bio' => '簡介',

    // Staff management
    'staff' => [
        'title' => '職員管理',
        'list' => '職員列表',
        'create' => '新增職員',
        'edit' => '編輯職員',
        'delete' => '刪除職員',
        'name' => '姓名',
        'name_zh_tw' => '中文姓名',
        'name_en' => '英文姓名',
        'position' => '職位',
        'position_zh_tw' => '中文職位',
        'position_en' => '英文職位',
        'email' => '電子郵件',
        'phone' => '電話',
        'photo' => '照片',
        'photo_url' => '照片網址',
        'bio' => '簡介',
        'bio_zh_tw' => '中文簡介',
        'bio_en' => '英文簡介',
        'sort_order' => '排序',
        'visible' => '是否顯示',
        'avatar_url' => '頭像網址',
    ],

    // Teacher management
    'teacher' => [
        'title' => '教師管理',
        'list' => '教師列表',
        'create' => '新增教師',
        'edit' => '編輯教師',
        'delete' => '刪除教師',
        'user' => '使用者帳號',
        'name' => '姓名',
        'name_zh_tw' => '中文姓名',
        'name_en' => '英文姓名',
        'title' => '職稱',
        'title_zh_tw' => '中文職稱',
        'title_en' => '英文職稱',
        'email' => '電子郵件',
        'phone' => '電話',
        'office' => '辦公室',
        'job_title' => '工作職稱',
        'photo' => '照片',
        'photo_url' => '照片網址',
        'bio' => '簡介',
        'bio_zh_tw' => '中文簡介',
        'bio_en' => '英文簡介',
        'expertise' => '專長領域',
        'expertise_zh_tw' => '中文專長',
        'expertise_en' => '英文專長',
        'education' => '學歷',
        'education_zh_tw' => '中文學歷',
        'education_en' => '英文學歷',
        'sort_order' => '排序',
        'visible' => '是否顯示',
        'avatar_url' => '頭像網址',
    ],

    // Form validation messages
    'validation' => [
        'required' => ':attribute 為必填欄位。',
        'email' => ':attribute 必須是有效的電子郵件地址。',
        'unique' => ':attribute 已經被使用。',
        'max' => [
            'string' => ':attribute 不能超過 :max 個字元。',
        ],
        'min' => [
            'numeric' => ':attribute 必須至少為 :min。',
        ],
        'url' => ':attribute 必須是有效的網址。',
        'array' => ':attribute 必須是陣列格式。',
        'exists' => '選取的 :attribute 無效。',
        'boolean' => ':attribute 必須是 true 或 false。',
        'integer' => ':attribute 必須是整數。',
    ],

    // Success messages
    'success' => [
        'created' => ':item 已成功建立。',
        'updated' => ':item 已成功更新。',
        'deleted' => ':item 已成功刪除。',
    ],

    // Error messages
    'error' => [
        'not_found' => '找不到指定的 :item。',
        'unauthorized' => '您沒有權限執行此操作。',
        'validation_failed' => '表單驗證失敗，請檢查輸入內容。',
        'delete_failed' => '刪除 :item 失敗。',
        'create_failed' => '建立 :item 失敗。',
        'update_failed' => '更新 :item 失敗。',
    ],
];
