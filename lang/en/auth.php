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

    'failed' => 'These credentials do not match our records.',
    'password' => 'The provided password is incorrect.',
    'throttle' => 'Too many login attempts. Please try again in :seconds seconds.',
    'verification_link_sent' => 'A new verification link has been sent to the email address you provided during registration.',

    'layout' => [
        'headline' => 'CSIE Digital Portal',
        'subheadline' => 'A unified gateway for announcements, courses, and research updates.',
        'language_label' => 'Language',
        'quote_label' => 'Daily Inspiration',
        'footer' => 'National Changhua University of Education · Department of CSIE',
    ],

    'fields' => [
        'name' => [
            'label' => 'Name',
            'placeholder' => 'Enter your name',
        ],
        'email' => [
            'label' => 'Email',
            'placeholder' => 'Enter your email',
        ],
        'password' => [
            'label' => 'Password',
            'placeholder' => 'Enter your password',
            'toggle_show' => 'Show password',
            'toggle_hide' => 'Hide password',
        ],
        'password_confirmation' => [
            'label' => 'Confirm Password',
            'placeholder' => 'Re-enter your password',
        ],
        'new_password' => [
            'label' => 'New Password',
            'placeholder' => 'Enter a new password',
        ],
        'new_password_confirmation' => [
            'label' => 'Confirm New Password',
            'placeholder' => 'Re-enter the new password',
        ],
    ],

    'actions' => [
        'remember_me' => 'Remember me',
        'back_to_login_prefix' => 'Or,',
        'back_to_login_link' => 'return to login',
        'resend_verification' => 'Resend verification email',
        'logout' => 'Log out',
    ],

    'footer' => [
        'home' => 'Back to home',
        'contact' => 'Contact us',
        'privacy' => 'Privacy policy',
    ],

    'pages' => [
        'login' => [
            'title' => 'Sign in',
            'description' => 'Enter your account credentials to access the system.',
            'submit' => 'Login',
            'forgot_password' => 'Forgot password?',
            'register_prompt' => "Don't have an account?",
            'register_link' => 'Create one now',
        ],
        'register' => [
            'title' => 'Create an account',
            'description' => 'Provide the information below to start your journey with CSIE.',
            'submit' => 'Create account',
            'login_prompt' => 'Already registered?',
            'login_link' => 'Sign in',
        ],
        'forgot_password' => [
            'title' => 'Reset access',
            'description' => 'Enter your email to receive password reset instructions.',
            'submit' => 'Send reset link',
        ],
        'reset_password' => [
            'title' => 'Set a new password',
            'description' => 'Choose a strong password to secure your account.',
            'submit' => 'Update password',
        ],
        'confirm_password' => [
            'title' => 'Confirm your password',
            'description' => 'Please verify your password before continuing.',
            'submit' => 'Confirm password',
        ],
        'verify_email' => [
            'title' => 'Verify your email',
            'description' => 'Click the verification link we just sent to your inbox.',
            'submit' => 'Resend verification email',
        ],
    ],

];
