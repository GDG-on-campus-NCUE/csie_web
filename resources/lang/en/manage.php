<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Management Interface Language Lines (English)
    |--------------------------------------------------------------------------
    |
    | The following language lines are used for the management interface.
    | These translations are used for admin panel labels, messages, and forms.
    |
    */

    // Common terms
    'id' => 'ID',
    'name' => 'Name',
    'email' => 'Email',
    'phone' => 'Phone',
    'created_at' => 'Created At',
    'updated_at' => 'Updated At',
    'actions' => 'Actions',
    'edit' => 'Edit',
    'delete' => 'Delete',
    'create' => 'Create',
    'update' => 'Update',
    'save' => 'Save',
    'cancel' => 'Cancel',
    'confirm' => 'Confirm',
    'back' => 'Back',
    'search' => 'Search',
    'filter' => 'Filter',
    'sort_order' => 'Sort Order',
    'visible' => 'Visible',
    'status' => 'Status',
    'photo' => 'Photo',
    'avatar' => 'Avatar',
    'bio' => 'Biography',

    // Staff management
    'staff' => [
        'title' => 'Staff Management',
        'list' => 'Staff List',
        'create' => 'Create Staff',
        'edit' => 'Edit Staff',
        'delete' => 'Delete Staff',
        'name' => 'Name',
        'name_zh_tw' => 'Chinese Name',
        'name_en' => 'English Name',
        'position' => 'Position',
        'position_zh_tw' => 'Chinese Position',
        'position_en' => 'English Position',
        'email' => 'Email',
        'phone' => 'Phone',
        'photo' => 'Photo',
        'photo_url' => 'Photo URL',
        'bio' => 'Biography',
        'bio_zh_tw' => 'Chinese Biography',
        'bio_en' => 'English Biography',
        'sort_order' => 'Sort Order',
        'visible' => 'Visible',
        'avatar_url' => 'Avatar URL',
    ],

    // Teacher management
    'teacher' => [
        'title' => 'Teacher Management',
        'list' => 'Teacher List',
        'create' => 'Create Teacher',
        'edit' => 'Edit Teacher',
        'delete' => 'Delete Teacher',
        'user' => 'User Account',
        'name' => 'Name',
        'name_zh_tw' => 'Chinese Name',
        'name_en' => 'English Name',
        'title' => 'Title',
        'title_zh_tw' => 'Chinese Title',
        'title_en' => 'English Title',
        'email' => 'Email',
        'phone' => 'Phone',
        'office' => 'Office',
        'job_title' => 'Job Title',
        'photo' => 'Photo',
        'photo_url' => 'Photo URL',
        'bio' => 'Biography',
        'bio_zh_tw' => 'Chinese Biography',
        'bio_en' => 'English Biography',
        'expertise' => 'Expertise',
        'expertise_zh_tw' => 'Chinese Expertise',
        'expertise_en' => 'English Expertise',
        'education' => 'Education',
        'education_zh_tw' => 'Chinese Education',
        'education_en' => 'English Education',
        'sort_order' => 'Sort Order',
        'visible' => 'Visible',
        'avatar_url' => 'Avatar URL',
    ],

    // Form validation messages
    'validation' => [
        'required' => 'The :attribute field is required.',
        'email' => 'The :attribute must be a valid email address.',
        'unique' => 'The :attribute has already been taken.',
        'max' => [
            'string' => 'The :attribute may not be greater than :max characters.',
        ],
        'min' => [
            'numeric' => 'The :attribute must be at least :min.',
        ],
        'url' => 'The :attribute must be a valid URL.',
        'array' => 'The :attribute must be an array.',
        'exists' => 'The selected :attribute is invalid.',
        'boolean' => 'The :attribute field must be true or false.',
        'integer' => 'The :attribute must be an integer.',
    ],

    // Success messages
    'success' => [
        'created' => ':item has been successfully created.',
        'updated' => ':item has been successfully updated.',
        'deleted' => ':item has been successfully deleted.',
    ],

    // Error messages
    'error' => [
        'not_found' => 'The specified :item was not found.',
        'unauthorized' => 'You are not authorized to perform this action.',
        'validation_failed' => 'Form validation failed. Please check your input.',
        'delete_failed' => 'Failed to delete :item.',
        'create_failed' => 'Failed to create :item.',
        'update_failed' => 'Failed to update :item.',
    ],
];
