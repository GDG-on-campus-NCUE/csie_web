<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Authentication Language Lines
    |--------------------------------------------------------------------------
    |
    | The following language lines are used during authentication for various
    | messages that we need to display to the user. You are free to modify
    | these language lines according to your application's requirements.
    |
    */

    'failed' => '登入資訊與記錄不符。',
    'password' => '提供的密碼不正確。',
    'throttle' => '登入嘗試次數過多，請於 :seconds 秒後再試。',
    'verification_link_sent' => '新的驗證連結已發送至您註冊時提供的電子郵件地址。',

    'layout' => [
        'headline' => '資工系資訊系統入口',
        'subheadline' => '整合公告、課程與研究資訊的一站式平台。',
        'language_label' => '語言',
        'quote_label' => '今日金句',
        'footer' => '國立彰化師範大學 · 資訊工程學系',
    ],

    'fields' => [
        'name' => [
            'label' => '姓名',
            'placeholder' => '請輸入您的姓名',
        ],
        'email' => [
            'label' => '電子郵件',
            'placeholder' => '請輸入電子郵件',
        ],
        'password' => [
            'label' => '密碼',
            'placeholder' => '請輸入密碼',
            'toggle_show' => '顯示密碼',
            'toggle_hide' => '隱藏密碼',
        ],
        'password_confirmation' => [
            'label' => '確認密碼',
            'placeholder' => '請再次輸入密碼',
        ],
        'new_password' => [
            'label' => '新密碼',
            'placeholder' => '請輸入新的密碼',
        ],
        'new_password_confirmation' => [
            'label' => '確認新密碼',
            'placeholder' => '請再次輸入新的密碼',
        ],
    ],

    'actions' => [
        'remember_me' => '記住我',
        'back_to_login_prefix' => '或者，',
        'back_to_login_link' => '返回登入頁面',
        'resend_verification' => '重新發送驗證郵件',
        'logout' => '登出',
    ],

    'footer' => [
        'home' => '回首頁',
        'contact' => '聯絡我們',
        'privacy' => '隱私政策',
    ],

    'pages' => [
        'login' => [
            'title' => '登入系統',
            'description' => '請輸入您的帳號密碼以登入系統',
            'submit' => '登入',
            'forgot_password' => '忘記密碼？',
            'register_prompt' => '還沒有帳號？',
            'register_link' => '註冊新帳號',
        ],
        'register' => [
            'title' => '註冊新帳號',
            'description' => '請填寫以下資訊來建立您的帳號',
            'submit' => '建立帳號',
            'login_prompt' => '已經有帳號了？',
            'login_link' => '立即登入',
        ],
        'forgot_password' => [
            'title' => '忘記密碼',
            'description' => '輸入電子郵件以接收重設密碼信',
            'submit' => '寄送密碼重設連結',
        ],
        'reset_password' => [
            'title' => '重設密碼',
            'description' => '請輸入新的密碼以完成重設',
            'submit' => '更新密碼',
        ],
        'confirm_password' => [
            'title' => '確認密碼',
            'description' => '請重新輸入您的密碼以繼續',
            'submit' => '確認密碼',
        ],
        'verify_email' => [
            'title' => '驗證電子郵件',
            'description' => '請透過點擊我們剛寄給您的驗證連結來完成設定',
            'submit' => '重新發送驗證郵件',
        ],
    ],

];
