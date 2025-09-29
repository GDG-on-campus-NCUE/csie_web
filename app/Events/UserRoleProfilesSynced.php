<?php

namespace App\Events;

use App\Models\User;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class UserRoleProfilesSynced
{
    use Dispatchable;
    use SerializesModels;

    /**
     * 建構事件時保存目標使用者。
     */
    public function __construct(public User $user)
    {
    }
}
